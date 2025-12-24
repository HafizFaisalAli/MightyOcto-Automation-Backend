import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { ERPNextModule } from '../erpnext/erpnext.module';
import { WebhookSignatureService } from './services/webhook-signature.service';
import { EnvironmentConfig } from '../../config/environment.config';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [ERPNextModule, AnalyticsModule],
  controllers: [WebhookController],
  providers: [WebhookSignatureService, EnvironmentConfig],
})
export class WebhookModule {}
