import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskGroupsModule } from './task-groups/task-groups.module';
import { BoardsModule } from './boards/boards.module';
import { UsersModule } from './users/users.module';
import { HealthController } from './health-check';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    MessagingModule,
    TasksModule,
    TaskGroupsModule,
    BoardsModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'task-management',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
