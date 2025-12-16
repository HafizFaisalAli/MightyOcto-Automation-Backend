import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PublishingService } from './publishing.service';
import { ERPNextModule } from '../erpnext/erpnext.module';

@Module({
  imports: [HttpModule, ERPNextModule],
  providers: [PublishingService],
  exports: [PublishingService],
})
export class PublishingModule {}
