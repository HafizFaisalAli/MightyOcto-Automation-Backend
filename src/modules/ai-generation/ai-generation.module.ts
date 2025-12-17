import { Module } from '@nestjs/common';
import { AiGenerationService } from './ai-generation.service';
import { ERPNextModule } from '../erpnext/erpnext.module';
import { EnvironmentConfig } from '../../config/environment.config';

@Module({
  imports: [ERPNextModule],
  providers: [AiGenerationService, EnvironmentConfig],
  exports: [AiGenerationService],
})
export class AiGenerationModule {}
