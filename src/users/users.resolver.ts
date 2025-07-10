import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User, CreateUserInput, UpdateUserInput, Rol } from '../graphql/graphql.types';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Resolver GraphQL para operaciones de gestión de usuarios.
 * 
 * @description Expone operaciones CRUD de usuarios con control de acceso basado en roles:
 * - Solo Admin y Gerente pueden crear usuarios administrativamente
 * - Solo Admin y Gerente pueden ver lista completa de usuarios
 * - Usuarios autenticados pueden ver detalles individuales
 * - Solo Admin puede eliminar usuarios permanentemente
 * - Admin y Gerente pueden activar/desactivar usuarios
 * - Consulta de roles disponible públicamente
 * 
 * @class UsersResolver
 * @resolver
 * @since 1.0.0
 */
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crea un nuevo usuario de forma administrativa.
   * 
   * @description Permite a administradores y gerentes crear usuarios con roles específicos.
   * Para registro público de usuarios, usar la mutación register del AuthResolver.
   * 
   * @param {CreateUserInput} createUserInput - Datos del usuario a crear
   * @returns {Promise<User>} Usuario creado con información completa
   * 
   * @throws {ConflictException} Cuando el email ya existe
   * @throws {ForbiddenException} Cuando el usuario no tiene permisos de Admin o Gerente
   * 
   * @since 1.0.0
   */
  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Gerente')
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ) {
    return this.usersService.create(createUserInput);
  }

  /**
   * Obtiene la lista completa de usuarios del sistema.
   * 
   * @description Retorna todos los usuarios ordenados por fecha de creación.
   * Restringido a usuarios con rol de Admin o Gerente.
   * 
   * @returns {Promise<User[]>} Array de todos los usuarios con información de roles
   * 
   * @throws {ForbiddenException} Cuando el usuario no tiene permisos de Admin o Gerente
   * 
   * @since 1.0.0
   */
  @Query(() => [User], { name: 'users' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Gerente')
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Obtiene los detalles de un usuario específico por ID.
   * 
   * @description Cualquier usuario autenticado puede consultar detalles de otros usuarios.
   * 
   * @param {string} id - ID único del usuario
   * @returns {Promise<User>} Usuario solicitado con información del rol
   * 
   * @throws {NotFoundException} Cuando el usuario no existe
   * @throws {UnauthorizedException} Cuando no está autenticado
   * 
   * @since 1.0.0
   */
  @Query(() => User, { name: 'user' })
  @UseGuards(JwtAuthGuard)
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Actualiza los datos de un usuario existente.
   * 
   * @description Permite modificar información del usuario incluyendo email, nombre,
   * organización, rol y contraseña. Restringido a Admin y Gerente.
   * 
   * @param {string} id - ID del usuario a actualizar
   * @param {UpdateUserInput} updateUserInput - Datos a actualizar
   * @returns {Promise<User>} Usuario actualizado
   * 
   * @throws {NotFoundException} Cuando el usuario no existe
   * @throws {ConflictException} Cuando el email ya está en uso
   * @throws {ForbiddenException} Cuando no tiene permisos
   * 
   * @since 1.0.0
   */
  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Gerente')
  updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    return this.usersService.update(id, updateUserInput);
  }

  /**
   * Elimina permanentemente un usuario del sistema.
   * 
   * @description Operación irreversible que elimina físicamente el registro.
   * Restringido exclusivamente a usuarios con rol de Admin.
   * 
   * @param {string} id - ID del usuario a eliminar
   * @returns {Promise<boolean>} true si la eliminación fue exitosa
   * 
   * @throws {NotFoundException} Cuando el usuario no existe
   * @throws {ForbiddenException} Cuando no tiene rol de Admin
   * 
   * @since 1.0.0
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  removeUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.remove(id);
  }

  /**
   * Desactiva un usuario impidiendo su acceso al sistema.
   * 
   * @description Desactivación lógica que preserva los datos del usuario
   * pero impide su autenticación. Reversible mediante activateUser.
   * 
   * @param {string} id - ID del usuario a desactivar
   * @returns {Promise<User>} Usuario desactivado
   * 
   * @throws {NotFoundException} Cuando el usuario no existe
   * @throws {ForbiddenException} Cuando no tiene permisos de Admin o Gerente
   * 
   * @since 1.0.0
   */
  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Gerente')
  deactivateUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.deactivate(id);
  }

  /**
   * Reactiva un usuario previamente desactivado.
   * 
   * @param {string} id - ID del usuario a activar
   * @returns {Promise<User>} Usuario reactivado
   * 
   * @throws {NotFoundException} Cuando el usuario no existe
   * @throws {ForbiddenException} Cuando no tiene permisos de Admin o Gerente
   * 
   * @since 1.0.0
   */
  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Gerente')
  activateUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.activate(id);
  }

  /**
   * Obtiene todos los roles disponibles en el sistema.
   * 
   * @description Consulta pública para obtener lista de roles disponibles.
   * Necesario para formularios de registro y creación de usuarios.
   * 
   * @returns {Promise<Rol[]>} Array de roles ordenados alfabéticamente
   * 
   * @since 1.0.0
   */
  @Query(() => [Rol], { name: 'roles' })
  getRoles() {
    return this.usersService.getRoles();
  }
} 