import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PublisherService } from './publisher.service';
import { ConsumerService } from './consumer.service';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [{ name: 'main_exchange', type: 'direct' }],
      uri: 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: { wait: true, timeout: 3000 },
      channels: {
        // prefetch(1) – one unconfirmed message per consumer
        default: { prefetchCount: 1 },
      },
      enableControllerDiscovery: true,
    }),
  ],
  providers: [PublisherService, ConsumerService],
  exports: [PublisherService],
})
export class MessagingModule {}
