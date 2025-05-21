import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ConsumerService {
  private readonly logger = new Logger(ConsumerService.name);

  @RabbitSubscribe({
    exchange: 'main_exchange',
    routingKey: 'board.created',
    queue: 'boards.events',
    queueOptions: { durable: true },
  })
  public handleBoardCreated(msg: { boardId: string }) {
    this.logger.log(`Created ${msg.boardId}`);
    this.logger.log(`Processing completed for ${msg.boardId}`);
  }

  @RabbitSubscribe({
    exchange: 'main_exchange',
    routingKey: 'board.renamed',
    queue: 'boards.events',
  })
  public handleBoardRenamed(msg: { boardId: string; newName: string }) {
    this.logger.log(`→ Renamed: ${msg.boardId} → ${msg.newName}`);
    this.logger.log(`Processing completed for ${msg.boardId}`);
  }

  @RabbitSubscribe({
    exchange: 'main_exchange',
    routingKey: 'board.deleted',
    queue: 'boards.events',
  })
  public handleBoardDeleted(msg: { boardId: string }) {
    this.logger.log(`→ Deleted: ${msg.boardId}`);
    this.logger.log(`Processing completed for ${msg.boardId}`);
  }
}
