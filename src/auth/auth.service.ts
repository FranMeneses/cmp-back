import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { LoginInput, AuthResponse } from '../graphql/graphql.types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (isPasswordValid) {
      const { password_hash, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const user = await this.validateUser(loginInput.email, loginInput.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.usersService.updateLastLogin(user.id_usuario);

    const payload = { 
      email: user.email, 
      sub: user.id_usuario,
      rol: user.rol.nombre,
      id_rol: user.id_rol
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
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
      },
    };
  }

  async validateJwt(payload: any): Promise<any> {
    const user = await this.usersService.findByEmail(payload.email);
    
    if (!user || !user.is_active) {
      throw new UnauthorizedException();
    }

    return {
      id_usuario: user.id_usuario,
      email: user.email,
      full_name: user.full_name,
      id_rol: user.id_rol,
      rol: user.rol,
    };
  }
} 