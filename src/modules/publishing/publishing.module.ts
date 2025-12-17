import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PublishingService } from './publishing.service';
import { ERPNextModule } from '../erpnext/erpnext.module';
import { EnvironmentConfig } from '../../config/environment.config';

@Module({
  imports: [HttpModule, ERPNextModule],
  providers: [PublishingService, EnvironmentConfig],
  exports: [PublishingService],
})
export class PublishingModule {}
