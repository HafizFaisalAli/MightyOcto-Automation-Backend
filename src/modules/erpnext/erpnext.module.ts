import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ERPNextService } from './erpnext.service';
import { EnvironmentConfig } from '../../config/environment.config';

@Global()
@Module({
  imports: [HttpModule],
  providers: [ERPNextService, EnvironmentConfig],
  exports: [ERPNextService],
})
export class ERPNextModule {}
