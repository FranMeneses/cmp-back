import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { Notification, CreateNotificationInput, NotificationResponse } from '../graphql/graphql.types';

@Resolver(() => Notification)
@UseGuards(JwtAuthGuard)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => [Notification])
  async myNotifications(@Context() context: any): Promise<Notification[]> {
    const userId = context.req.user.id_usuario;
    return this.notificationsService.findByUserId(userId);
  }

  @Query(() => Number)
  async unreadNotificationsCount(@Context() context: any): Promise<number> {
    const userId = context.req.user.id_usuario;
    return this.notificationsService.getUnreadCount(userId);
  }

  @Mutation(() => NotificationResponse)
  async markNotificationAsRead(
    @Args('notificationId') notificationId: string,
    @Context() context: any,
  ): Promise<NotificationResponse> {
    const userId = context.req.user.id_usuario;
    await this.notificationsService.markAsRead(notificationId, userId);
    return {
      success: true,
      message: 'Notificación marcada como leída',
    };
  }

  @Mutation(() => Notification)
  async createNotification(
    @Args('input') createNotificationInput: CreateNotificationInput,
  ): Promise<Notification> {
    return this.notificationsService.createNotification(createNotificationInput);
  }
} 