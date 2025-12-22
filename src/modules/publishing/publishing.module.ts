import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PublishingService } from './publishing.service';
import { CmsFeedService } from './cms-feed.service';
import { CmsFeedController } from './cms-feed.controller';
import { ERPNextModule } from '../erpnext/erpnext.module';
import { EnvironmentConfig } from '../../config/environment.config';

@Module({
  imports: [HttpModule, ERPNextModule],
  providers: [PublishingService, CmsFeedService, EnvironmentConfig],
  controllers: [CmsFeedController],
  exports: [PublishingService, CmsFeedService],
})
export class PublishingModule {}
