import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { CalendarModule } from '../calendar/calendar.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [ScheduleModule.forRoot(), CalendarModule, AnalyticsModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
