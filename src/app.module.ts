import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentConfig } from './config/environment.config';

// Phase 3 Modules
import { ERPNextModule } from './modules/erpnext/erpnext.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { AiGenerationModule } from './modules/ai-generation/ai-generation.module';
import { SeoOptimizationModule } from './modules/seo-optimization/seo-optimization.module';
import { PublishingModule } from './modules/publishing/publishing.module';
import { WebhookModule } from './modules/webhooks/webhook.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(), // Enable cron jobs
    HttpModule,
    // Phase 3 Automation Modules
    ERPNextModule,
    CalendarModule,
    AiGenerationModule,
    SeoOptimizationModule,
    PublishingModule,
    WebhookModule,
    AnalyticsModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService, EnvironmentConfig],
  exports: [EnvironmentConfig],
})
export class AppModule {}
