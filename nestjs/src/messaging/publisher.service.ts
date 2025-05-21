import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class PublisherService {
  constructor(private readonly amqp: AmqpConnection) {}

  async publishBoardCreated(boardId: string) {
    return this.amqp.publish(
      'main_exchange', // exchange
      'board.created', // routingKey
      { boardId }, // payload
    );
  }

  async publishBoardRenamed(boardId: string, newName: string) {
    return this.amqp.publish(
      'main_exchange', // exchange
      'board.renamed', // routingKey
      { boardId, newName }, // payload
    );
  }

  async publishBoardDeleted(boardId: string) {
    return this.amqp.publish(
      'main_exchange', // exchange
      'board.deleted', // routingKey
      { boardId }, // payload
    );
  }
}
