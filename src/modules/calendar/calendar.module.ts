import { Module } from '@nestjs/common';
import { ContentCalendarService } from './content-calendar.service';
import { ERPNextModule } from '../erpnext/erpnext.module';

@Module({
  imports: [ERPNextModule],
  providers: [ContentCalendarService],
  exports: [ContentCalendarService],
})
export class CalendarModule {}
