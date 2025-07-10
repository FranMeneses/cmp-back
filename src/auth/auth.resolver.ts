import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { 
  LoginInput, 
  AuthResponse, 
  CreateUserInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  PasswordResetResponse,
  TokenValidationResponse
} from '../graphql/graphql.types';

/**
 * Resolver GraphQL para operaciones de autenticación y gestión de contraseñas.
 * 
 * @description Expone mutaciones y queries relacionadas con:
 * - Registro y login de usuarios
 * - Solicitud de reseteo de contraseña
 * - Validación de tokens de reseteo
 * - Cambio de contraseña con token
 * 
 * @class AuthResolver
 * @resolver
 * 
 * @since 1.0.0
 */
@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema.
   * 
   * @description Crea una cuenta nueva y retorna inmediatamente un token de acceso
   * para que el usuario quede autenticado tras el registro.
   * 
   * @param {CreateUserInput} registerInput - Datos del usuario a registrar
   * @returns {Promise<AuthResponse>} Token de acceso y datos del usuario registrado
   * 
   * @throws {BadRequestException} Cuando el email ya existe
   * @throws {ValidationError} Cuando los datos no cumplen las validaciones
   * 
   * @since 1.0.0
   */
  @Mutation(() => AuthResponse)
  async register(@Args('registerInput') registerInput: CreateUserInput): Promise<AuthResponse> {
    return this.authService.register(registerInput);
  }

  /**
   * Autentica un usuario existente mediante email y contraseña.
   * 
   * @description Valida las credenciales y genera un token JWT válido por 24 horas.
   * Actualiza la fecha de último login del usuario.
   * 
   * @param {LoginInput} loginInput - Credenciales de login (email y password)
   * @returns {Promise<AuthResponse>} Token de acceso y datos completos del usuario
   * 
   * @throws {UnauthorizedException} Cuando las credenciales son incorrectas
   * @throws {UnauthorizedException} Cuando el usuario está desactivado
   * 
   * @since 1.0.0
   */
  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  /**
   * Solicita el reseteo de contraseña para un usuario.
   * 
   * @description Genera un token de reseteo válido por 1 hora y envía un email
   * al usuario con las instrucciones para cambiar su contraseña.
   * 
   * @param {RequestPasswordResetInput} input - Email del usuario y URL del frontend
   * @returns {Promise<PasswordResetResponse>} Confirmación del envío del email
   * 
   * @throws {NotFoundException} Cuando el usuario no existe
   * @throws {BadRequestException} Cuando el usuario está desactivado
   * @throws {BadRequestException} Si hay error en el envío del email
   * 
   * @since 1.0.0
   */
  @Mutation(() => PasswordResetResponse)
  async requestPasswordReset(
    @Args('input') input: RequestPasswordResetInput
  ): Promise<PasswordResetResponse> {
    return this.passwordResetService.requestPasswordReset(input.email, input.frontendUrl);
  }

  /**
   * Cambia la contraseña de un usuario usando un token de reseteo.
   * 
   * @description Valida el token de reseteo y actualiza la contraseña del usuario.
   * El token se marca como usado después del cambio exitoso.
   * 
   * @param {ResetPasswordInput} input - Token de reseteo y nueva contraseña
   * @returns {Promise<PasswordResetResponse>} Confirmación del cambio de contraseña
   * 
   * @throws {BadRequestException} Cuando el token es inválido, expirado o ya usado
   * @throws {BadRequestException} Cuando el usuario está desactivado
   * 
   * @since 1.0.0
   */
  @Mutation(() => PasswordResetResponse)
  async resetPassword(
    @Args('input') input: ResetPasswordInput
  ): Promise<PasswordResetResponse> {
    return this.passwordResetService.resetPassword(input.token, input.newPassword);
  }

  /**
   * Valida si un token de reseteo de contraseña es válido.
   * 
   * @description Verifica que el token exista, no haya expirado, no haya sido usado
   * y que el usuario asociado esté activo.
   * 
   * @param {string} token - Token de reseteo a validar
   * @returns {Promise<TokenValidationResponse>} Estado de validez del token
   * 
   * @since 1.0.0
   */
  @Query(() => TokenValidationResponse)
  async validateResetToken(
    @Args('token') token: string
  ): Promise<TokenValidationResponse> {
    return this.passwordResetService.validateResetToken(token);
  }
} 