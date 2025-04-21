import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private mapToDatabase(taskDto: CreateTaskDto | UpdateTaskDto) {
    return {
      id_valle: taskDto.valleyId,
      id_faena: taskDto.facilityId,
      nombre: taskDto.name,
      descripcion: taskDto.description,
      estado: taskDto.status,
    };
  }

  private mapFromDatabase(task: any) {
    return {
      id: task.id_tarea,
      valleyId: task.id_valle,
      facilityId: task.id_faena,
      name: task.nombre,
      description: task.descripcion,
      status: task.estado,
      valley: task.valle,
      facility: task.faena,
      statusInfo: task.tarea_estado,
      info: task.info_tarea,
      subtasks: task.subtareas,
      documents: task.documentos,
    };
  }

  async create(createTaskDto: CreateTaskDto) {
    const task = await this.prisma.tarea.create({
      data: this.mapToDatabase(createTaskDto),
    });
    return this.mapFromDatabase(task);
  }

  async findAll(query: any) {
    const tasks = await this.prisma.tarea.findMany({
      where: query,
      include: {
        valle: true,
        faena: true,
        tarea_estado: true,
        info_tarea: true,
        subtareas: true,
        documentos: true,
      },
    });
    return tasks.map(task => this.mapFromDatabase(task));
  }

  async findOne(id: string) {
    const task = await this.prisma.tarea.findUnique({
      where: { id_tarea: id },
      include: {
        valle: true,
        faena: true,
        tarea_estado: true,
        info_tarea: true,
        subtareas: true,
        documentos: true,
      },
    });
    return task ? this.mapFromDatabase(task) : null;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.tarea.update({
      where: { id_tarea: id },
      data: this.mapToDatabase(updateTaskDto),
    });
    return this.mapFromDatabase(task);
  }

  async remove(id: string) {
    const task = await this.prisma.tarea.delete({
      where: { id_tarea: id },
    });
    return this.mapFromDatabase(task);
  }
} 