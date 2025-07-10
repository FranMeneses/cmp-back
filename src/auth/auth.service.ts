import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { LoginInput, AuthResponse, CreateUserInput } from '../graphql/graphql.types';

/**
 * Servicio principal de autenticación que maneja login, registro y validación de usuarios.
 * 
 * @description Proporciona métodos para:
 * - Validar credenciales de usuario (email/password)
 * - Generar tokens JWT para autenticación
 * - Registrar nuevos usuarios con autenticación automática
 * - Validar tokens JWT en requests subsecuentes
 * 
 * @class AuthService
 * @injectable
 *  
 * @since 1.0.0
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida las credenciales de un usuario mediante email y contraseña.
   * 
   * @description Verifica que el usuario exista, esté activo y que la contraseña sea correcta.
   * Utiliza bcrypt para comparar el hash de la contraseña almacenada.
   * 
   * @param {string} email - Email del usuario a validar
   * @param {string} password - Contraseña en texto plano a verificar
   * 
   * @returns {Promise<any>} Datos del usuario sin la contraseña si es válido, null si no es válido
   * 
   * @throws {UnauthorizedException} Cuando el usuario está desactivado
   * 
   * @since 1.0.0
   */
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

  /**
   * Autentica un usuario y genera un token JWT de acceso.
   * 
   * @description Realiza el proceso completo de login:
   * 1. Valida las credenciales del usuario
   * 2. Actualiza la fecha de último login
   * 3. Genera un token JWT con información del usuario y roles
   * 4. Retorna el token junto con los datos del usuario
   * 
   * @param {LoginInput} loginInput - Objeto con email y password del usuario
   * 
   * @returns {Promise<AuthResponse>} Respuesta con token de acceso y datos completos del usuario
   * 
   * @throws {UnauthorizedException} Cuando las credenciales son incorrectas o el usuario está inactivo
   * 
   * @since 1.0.0
   */
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

  /**
   * Valida un token JWT y retorna la información del usuario.
   * 
   * @description Verifica que el payload del JWT sea válido y que el usuario
   * exista y esté activo en la base de datos. Este método es utilizado por
   * la estrategia JWT de Passport para validar tokens en cada request.
   * 
   * @param {any} payload - Payload decodificado del token JWT que contiene email, sub (id), rol, etc.
   * 
   * @returns {Promise<any>} Información básica del usuario para inyectar en el contexto de la request
   * 
   * @throws {UnauthorizedException} Cuando el usuario no existe o está desactivado
   * 
   * @since 1.0.0
   */
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

  /**
   * Registra un nuevo usuario en el sistema y lo autentica automáticamente.
   * 
   * @description Crea un nuevo usuario en la base de datos y genera inmediatamente
   * un token de acceso para el usuario recién registrado. El rol se asigna
   * automáticamente según la lógica definida en el UsersService.
   * 
   * @param {CreateUserInput} registerInput - Datos del nuevo usuario (email, password, full_name, etc.)
   * 
   * @returns {Promise<AuthResponse>} Respuesta con token de acceso y datos del usuario registrado
   * 
   * @throws {BadRequestException} Cuando el email ya existe o los datos son inválidos
   * @throws {InternalServerErrorException} Si hay problemas con la creación del usuario
   * 
   * @since 1.0.0
   */
  async register(registerInput: CreateUserInput): Promise<AuthResponse> {
    // Crear el usuario sin especificar rol (se asignará automáticamente)
    const userInput = {
      ...registerInput,
      id_rol: undefined, // Forzar que sea undefined para usar lógica automática
    };
    
    const user = await this.usersService.create(userInput);
    
    // Autenticar automáticamente al usuario recién registrado
    const payload = { 
      email: user.email, 
      sub: user.id_usuario,
      rol: user.rol.nombre,
      id_rol: user.id_rol
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }
} 