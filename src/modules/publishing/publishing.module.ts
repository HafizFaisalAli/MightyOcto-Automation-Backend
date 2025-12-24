import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PublishingService } from './publishing.service';
import { CmsFeedService } from './cms-feed.service';
import { CmsFeedController } from './cms-feed.controller';
import { PublishingController } from './publishing.controller';
import { ERPNextModule } from '../erpnext/erpnext.module';
import { EnvironmentConfig } from '../../config/environment.config';
import { LinkedInAuthController } from './linkedin-auth.controller';
import { LinkedInTokenService } from './linkedin-token.service';

@Module({
  imports: [HttpModule, ERPNextModule],
  providers: [
    PublishingService,
    CmsFeedService,
    EnvironmentConfig,
    LinkedInTokenService,
  ],
  controllers: [
    CmsFeedController,
    PublishingController,
    LinkedInAuthController,
  ],
  exports: [PublishingService, CmsFeedService],
})
export class PublishingModule {}
