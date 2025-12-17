import { Module } from '@nestjs/common';
import { ContentCalendarService } from './content-calendar.service';
import { ERPNextModule } from '../erpnext/erpnext.module';
import { EnvironmentConfig } from '../../config/environment.config';

@Module({
  imports: [ERPNextModule],
  providers: [ContentCalendarService, EnvironmentConfig],
  exports: [ContentCalendarService],
})
export class CalendarModule {}
