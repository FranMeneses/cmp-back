import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput, UpdateUserInput } from '../graphql/graphql.types';
import * as bcrypt from 'bcryptjs';
import { User, Rol } from '../graphql/graphql.types';
import { EmailValidationService } from '../auth/email-validation.service';

/**
 * Servicio principal para la gestión completa de usuarios en el sistema.
 * 
 * @description Maneja todas las operaciones relacionadas con usuarios:
 * - Creación con validación de email y asignación automática de roles
 * - Búsqueda y consulta de usuarios por diferentes criterios
 * - Actualización segura de datos con validaciones
 * - Eliminación física y desactivación lógica
 * - Gestión de contraseñas con hash bcrypt (12 rounds)
 * - Administración de roles y permisos
 * - Actualización de timestamps de login
 * 
 * @class UsersService
 * @injectable
 * @since 1.0.0
 */
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailValidationService: EmailValidationService,
  ) {}

  /**
   * Crea un nuevo usuario en el sistema con validaciones completas.
   * 
   * @description Proceso completo de creación:
   * 1. Verifica que el email no esté en uso
   * 2. Valida el email mediante servicio externo
   * 3. Asigna rol automáticamente (primer usuario = Admin, resto = Usuario básico)
   * 4. Genera hash seguro de la contraseña
   * 5. Crea el registro en base de datos
   * 
   * @param {CreateUserInput} createUserDto - Datos del usuario a crear
   * @returns {Promise<User>} Usuario creado con información del rol
   * 
   * @throws {ConflictException} Cuando el email ya está registrado
   * @throws {BadRequestException} Cuando el email no es válido o no existe
   * @throws {NotFoundException} Cuando el rol especificado no existe
   * 
   * @since 1.0.0
   */
  async create(createUserDto: CreateUserInput): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Validar que el email sea real usando Azure Logic Apps
    const isEmailValid = await this.emailValidationService.validateEmail(createUserDto.email);
    
    if (!isEmailValid) {
      throw new BadRequestException('El email proporcionado no es válido o no existe');
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

  /**
   * Obtiene todos los usuarios del sistema ordenados por fecha de creación.
   * 
   * @description Retorna lista completa de usuarios con información de roles,
   * ordenados del más reciente al más antiguo.
   * 
   * @returns {Promise<User[]>} Array de usuarios con información de roles
   * 
   * @since 1.0.0
   */
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

  /**
   * Busca un usuario específico por su ID.
   * 
   * @param {string} id - ID único del usuario
   * @returns {Promise<User>} Usuario encontrado con información del rol
   * 
   * @throws {NotFoundException} Cuando el usuario no existe
   * 
   * @since 1.0.0
   */
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

  /**
   * Busca un usuario por su dirección de email.
   * 
   * @description Este método incluye el password_hash y es utilizado principalmente
   * por el sistema de autenticación para validar credenciales.
   * 
   * @param {string} email - Dirección de email del usuario
   * @returns {Promise<any>} Usuario completo incluyendo password_hash y rol, o null si no existe
   * 
   * @since 1.0.0
   */
  async findByEmail(email: string): Promise<any> {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        rol: true,
      },
    });

    return user;
  }

  /**
   * Actualiza los datos de un usuario existente con validaciones.
   * 
   * @description Proceso de actualización segura:
   * 1. Verifica que el usuario exista
   * 2. Valida unicidad del email si se está cambiando
   * 3. Verifica existencia del rol si se está modificando
   * 4. Genera hash de nueva contraseña si se proporciona
   * 5. Actualiza timestamp de modificación
   * 
   * @param {string} id - ID del usuario a actualizar
   * @param {UpdateUserInput} updateUserDto - Datos a actualizar
   * @returns {Promise<User>} Usuario actualizado
   * 
   * @throws {NotFoundException} Cuando el usuario o rol no existe
   * @throws {ConflictException} Cuando el nuevo email ya está en uso
   * 
   * @since 1.0.0
   */
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

  /**
   * Elimina permanentemente un usuario del sistema.
   * 
   * @description Realiza eliminación física del registro en la base de datos.
   * Esta operación es irreversible.
   * 
   * @param {string} id - ID del usuario a eliminar
   * @returns {Promise<boolean>} true si la eliminación fue exitosa
   * 
   * @throws {NotFoundException} Cuando el usuario no existe
   * 
   * @since 1.0.0
   */
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

  /**
   * Desactiva un usuario sin eliminarlo del sistema.
   * 
   * @description Realiza desactivación lógica marcando is_active como false.
   * El usuario no podrá autenticarse pero sus datos se conservan.
   * 
   * @param {string} id - ID del usuario a desactivar
   * @returns {Promise<User>} Usuario desactivado
   * 
   * @since 1.0.0
   */
  async deactivate(id: string): Promise<User> {
    return this.update(id, { is_active: false });
  }

  /**
   * Reactiva un usuario previamente desactivado.
   * 
   * @param {string} id - ID del usuario a activar
   * @returns {Promise<User>} Usuario activado
   * 
   * @since 1.0.0
   */
  async activate(id: string): Promise<User> {
    return this.update(id, { is_active: true });
  }

  /**
   * Actualiza la fecha de último login de un usuario.
   * 
   * @description Método utilizado por el sistema de autenticación para
   * registrar cuándo fue la última vez que el usuario se conectó.
   * 
   * @param {string} id - ID del usuario
   * 
   * @since 1.0.0
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: { last_login: new Date() },
    });
  }

  /**
   * Obtiene todos los roles disponibles en el sistema.
   * 
   * @description Retorna lista de roles ordenados alfabéticamente para
   * ser utilizados en formularios de creación y edición de usuarios.
   * 
   * @returns {Promise<Rol[]>} Array de roles ordenados por nombre
   * 
   * @since 1.0.0
   */
  async getRoles(): Promise<Rol[]> {
    const roles = await this.prisma.rol.findMany({
      orderBy: { nombre: 'asc' },
    });

    return roles;
  }

  /**
   * Mapea un usuario de Prisma al formato GraphQL.
   * 
   * @description Transforma el objeto de base de datos al tipo GraphQL
   * excluyendo información sensible como password_hash.
   * 
   * @param {any} user - Usuario de Prisma con relaciones incluidas
   * @returns {User} Usuario en formato GraphQL
   * 
   * @private
   * @since 1.0.0
   */
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