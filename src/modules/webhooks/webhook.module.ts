import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { ERPNextModule } from '../erpnext/erpnext.module';
import { WebhookSignatureService } from './services/webhook-signature.service';
import { EnvironmentConfig } from '../../config/environment.config';

@Module({
  imports: [ERPNextModule],
  controllers: [WebhookController],
  providers: [WebhookSignatureService, EnvironmentConfig],
})
export class WebhookModule {}
