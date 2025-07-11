import { Resolver, Query, Args, ID, Int } from '@nestjs/graphql';
import { HistoryService } from './history.service';
import { History } from '../graphql/graphql.types';

/**
 * Resolver GraphQL para consultas del historial de tareas completadas.
 * 
 * @description Proporciona la API GraphQL para acceso de solo lectura al historial del sistema:
 * - Consulta completa de registros históricos con todas las relaciones
 * - Búsqueda individual por ID de registro de historial
 * - Filtros especializados por proceso, valle, faena y beneficiario
 * - Datos enriquecidos con información de procesos empresariales
 * - Acceso a metadatos SAP preservados para auditoría
 * - Integración transparente con documentos históricos via HistoryService
 * - Operaciones públicas sin restricciones de roles (datos históricos de solo consulta)
 * - Formato de respuesta optimizado para reportes y análisis
 * - Soporte para construcción de dashboards y métricas históricas
 * 
 * @class HistoryResolver
 * @since 1.0.0
 */
@Resolver(() => History)
export class HistoryResolver {
  constructor(private readonly historyService: HistoryService) {}

  /**
   * Obtiene todos los registros de historial del sistema.
   * 
   * @description Consulta completa que retorna el historial ordenado por fecha
   * descendente, incluyendo todas las relaciones (proceso, valle, faena,
   * beneficiario) y documentos históricos asociados.
   * 
   * @returns Array de registros de historial con relaciones completas
   * 
   * @since 1.0.0
   */
  @Query(() => [History])
  async histories(): Promise<History[]> {
    return this.historyService.findAll();
  }

  /**
   * Busca un registro de historial específico por su ID.
   * 
   * @description Consulta individual que incluye todas las relaciones
   * y documentos históricos del registro especificado.
   * 
   * @param id - ID único del registro de historial
   * @returns Registro de historial con relaciones o null si no existe
   * 
   * @since 1.0.0
   */
  @Query(() => History, { nullable: true })
  async history(@Args('id', { type: () => ID }) id: string): Promise<History | null> {
    return this.historyService.findOne(id);
  }

  /**
   * Obtiene todos los registros de historial de un proceso específico.
   * 
   * @description Filtra el historial por proceso empresarial, útil para
   * análisis de rendimiento y métricas por tipo de proceso.
   * 
   * @param processId - ID del proceso empresarial
   * @returns Array de registros de historial del proceso especificado
   * 
   * @since 1.0.0
   */
  @Query(() => [History])
  async historiesByProcess(@Args('processId', { type: () => Int }) processId: number): Promise<History[]> {
    return this.historyService.findByProcess(processId);
  }

  /**
   * Obtiene todos los registros de historial de un valle específico.
   * 
   * @description Filtra el historial por valle geográfico, útil para
   * reportes regionales y análisis de distribución territorial.
   * 
   * @param valleyId - ID del valle
   * @returns Array de registros de historial del valle especificado
   * 
   * @since 1.0.0
   */
  @Query(() => [History])
  async historiesByValley(@Args('valleyId', { type: () => Int }) valleyId: number): Promise<History[]> {
    return this.historyService.findByValley(valleyId);
  }

  /**
   * Obtiene todos los registros de historial de una faena específica.
   * 
   * @description Filtra el historial por faena operacional, útil para
   * análisis de productividad y rendimiento por centro de operaciones.
   * 
   * @param faenaId - ID de la faena
   * @returns Array de registros de historial de la faena especificada
   * 
   * @since 1.0.0
   */
  @Query(() => [History])
  async historiesByFaena(@Args('faenaId', { type: () => Int }) faenaId: number): Promise<History[]> {
    return this.historyService.findByFaena(faenaId);
  }

  /**
   * Obtiene todos los registros de historial de un beneficiario específico.
   * 
   * @description Filtra el historial por beneficiario, útil para
   * seguimiento de relaciones comerciales y análisis de desempeño
   * por proveedor o contratista.
   * 
   * @param beneficiaryId - ID del beneficiario
   * @returns Array de registros de historial del beneficiario especificado
   * 
   * @since 1.0.0
   */
  @Query(() => [History])
  async historiesByBeneficiary(@Args('beneficiaryId', { type: () => ID }) beneficiaryId: string): Promise<History[]> {
    return this.historyService.findByBeneficiary(beneficiaryId);
  }
} 