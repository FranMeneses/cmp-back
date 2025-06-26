import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput, UpdateUserInput } from '../graphql/graphql.types';
import * as bcrypt from 'bcryptjs';
import { User, Rol } from '../graphql/graphql.types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserInput): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Determinar el rol del nuevo usuario
    let roleId = createUserDto.id_rol;
    
    // Si no se especifica rol, verificar si es el primer usuario
    if (!roleId) {
      const userCount = await this.prisma.usuario.count();
      
      // Si es el primer usuario, hacerlo Admin (rol 1)
      // Si no, hacerlo Usuario básico (rol 11)
      roleId = userCount === 0 ? 1 : 11;
    } else {
      // Si se especifica un rol, verificar que el usuario actual tenga permisos
      // Por ahora solo validamos que el rol exista
      const rol = await this.prisma.rol.findUnique({
        where: { id_rol: roleId },
      });

      if (!rol) {
        throw new NotFoundException('Rol no encontrado');
      }
    }

    // Verificar que el rol existe
    const rol = await this.prisma.rol.findUnique({
      where: { id_rol: roleId },
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Crear usuario
    const user = await this.prisma.usuario.create({
      data: {
        email: createUserDto.email,
        password_hash: hashedPassword,
        full_name: createUserDto.full_name,
        id_rol: roleId,
        organization: createUserDto.organization,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        rol: true,
      },
    });

    return this.mapToGraphQLUser(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.usuario.findMany({
      include: {
        rol: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return users.map(user => this.mapToGraphQLUser(user));
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: {
        rol: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.mapToGraphQLUser(user);
  }

  async findByEmail(email: string): Promise<any> {
    // Este método incluye el password_hash para autenticación
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        rol: true,
      },
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserInput): Promise<User> {
    // Verificar si el usuario existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se está actualizando el email, verificar que no esté en uso
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailInUse = await this.prisma.usuario.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailInUse) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Si se está actualizando el rol, verificar que exista
    if (updateUserDto.id_rol) {
      const rol = await this.prisma.rol.findUnique({
        where: { id_rol: updateUserDto.id_rol },
      });

      if (!rol) {
        throw new NotFoundException('Rol no encontrado');
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {
      ...updateUserDto,
      updated_at: new Date(),
    };

    // Si hay nueva contraseña, hashearla
    if (updateUserDto.password) {
      const saltRounds = 12;
      updateData.password_hash = await bcrypt.hash(updateUserDto.password, saltRounds);
      delete updateData.password;
    }

    const user = await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: updateData,
      include: {
        rol: true,
      },
    });

    return this.mapToGraphQLUser(user);
  }

  async remove(id: string): Promise<boolean> {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.usuario.delete({
      where: { id_usuario: id },
    });

    return true;
  }

  async deactivate(id: string): Promise<User> {
    return this.update(id, { is_active: false });
  }

  async activate(id: string): Promise<User> {
    return this.update(id, { is_active: true });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: { last_login: new Date() },
    });
  }

  async getRoles(): Promise<Rol[]> {
    const roles = await this.prisma.rol.findMany({
      orderBy: { nombre: 'asc' },
    });

    return roles;
  }

  private mapToGraphQLUser(user: any): User {
    return {
      id_usuario: user.id_usuario,
      email: user.email,
      full_name: user.full_name,
      id_rol: user.id_rol,
      organization: user.organization,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
      rol: user.rol,
    };
  }
} 