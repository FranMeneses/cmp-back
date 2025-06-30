import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User, CreateUserInput, UpdateUserInput, Rol } from '../graphql/graphql.types';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Gerente') // Solo Admin y Gerente pueden crear usuarios administrativamente
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Gerente') // Solo Admin y Gerente pueden ver todos los usuarios
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(JwtAuthGuard)
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Gerente') // Solo Admin y Gerente pueden actualizar usuarios
  updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    return this.usersService.update(id, updateUserInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin') // Solo Admin puede eliminar usuarios
  removeUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.remove(id);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Gerente') // Solo Admin y Gerente pueden desactivar usuarios
  deactivateUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.deactivate(id);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Gerente') // Solo Admin y Gerente pueden activar usuarios
  activateUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.activate(id);
  }

  @Query(() => [Rol], { name: 'roles' })
  getRoles() {
    // Los roles son públicos para permitir la creación del primer usuario
    return this.usersService.getRoles();
  }
} 