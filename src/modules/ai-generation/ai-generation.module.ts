import { Module } from '@nestjs/common';
import { AiGenerationService } from './ai-generation.service';
import { ERPNextModule } from '../erpnext/erpnext.module';

@Module({
  imports: [ERPNextModule],
  providers: [AiGenerationService],
  exports: [AiGenerationService],
})
export class AiGenerationModule {}
