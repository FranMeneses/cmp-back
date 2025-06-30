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

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Mutation(() => AuthResponse)
  async register(@Args('registerInput') registerInput: CreateUserInput): Promise<AuthResponse> {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => PasswordResetResponse)
  async requestPasswordReset(
    @Args('input') input: RequestPasswordResetInput
  ): Promise<PasswordResetResponse> {
    return this.passwordResetService.requestPasswordReset(input.email, input.frontendUrl);
  }

  @Mutation(() => PasswordResetResponse)
  async resetPassword(
    @Args('input') input: ResetPasswordInput
  ): Promise<PasswordResetResponse> {
    return this.passwordResetService.resetPassword(input.token, input.newPassword);
  }

  @Query(() => TokenValidationResponse)
  async validateResetToken(
    @Args('token') token: string
  ): Promise<TokenValidationResponse> {
    return this.passwordResetService.validateResetToken(token);
  }
} 