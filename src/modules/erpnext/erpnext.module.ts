import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ERPNextService } from './erpnext.service';

@Module({
  imports: [HttpModule],
  providers: [ERPNextService],
  exports: [ERPNextService],
})
export class ERPNextModule {}
