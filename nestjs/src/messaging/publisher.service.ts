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
}
