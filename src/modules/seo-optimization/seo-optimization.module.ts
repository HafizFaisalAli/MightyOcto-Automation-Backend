import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SeoOptimizationService } from './seo-optimization.service';
import { SEOProviderFactory } from './providers/seo-provider.factory';
import { EnvironmentConfig } from '../../config/environment.config';

@Module({
  imports: [HttpModule],
  providers: [SeoOptimizationService, SEOProviderFactory, EnvironmentConfig],
  exports: [SeoOptimizationService],
})
export class SeoOptimizationModule {}
