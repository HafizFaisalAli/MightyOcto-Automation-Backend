import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SeoOptimizationService } from './seo-optimization.service';

@Module({
  imports: [HttpModule],
  providers: [SeoOptimizationService],
  exports: [SeoOptimizationService],
})
export class SeoOptimizationModule {}
