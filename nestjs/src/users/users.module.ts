import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { UserNotificationPreferences } from './user-notification-preferences.entity';
import { NotificationLog } from './notification-log.entity';
import { EmailService } from './email.service';
import { WebhookService } from './webhook.service';
import { NotificationsService } from './notifications.service';
import { Task } from '../tasks/task.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      signOptions: {},
    }),
    TypeOrmModule.forFeature([User, UserNotificationPreferences, NotificationLog, Task])],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, JwtRefreshStrategy, JwtAuthGuard, JwtRefreshGuard, EmailService, WebhookService, NotificationsService],
  exports: [JwtStrategy, PassportModule, NotificationsService], // export to use in other modules
})
export class UsersModule {}
