import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { ERPNextModule } from '../erpnext/erpnext.module';

@Module({
  imports: [ERPNextModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
