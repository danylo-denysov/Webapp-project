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
    this.logger.log(`Message received about new board ${msg.boardId}`);
    this.logger.log(`Processing completed for ${msg.boardId}`);
  }
}
