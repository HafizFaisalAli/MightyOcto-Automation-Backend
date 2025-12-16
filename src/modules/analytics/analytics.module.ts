import { Module } from '@nestjs/common';
import { PerformanceAnalyticsService } from './performance-analytics.service';
import { ERPNextModule } from '../erpnext/erpnext.module';

@Module({
  imports: [ERPNextModule],
  providers: [PerformanceAnalyticsService],
  exports: [PerformanceAnalyticsService],
})
export class AnalyticsModule {}
