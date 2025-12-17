import { ApiProperty } from '@nestjs/swagger';

/**
 * Webhook DTOs
 */

export class FramerFormSubmissionDto {
  @ApiProperty({ enum: ['contact_form', 'bug_report', 'feature_request'] })
  type: 'contact_form' | 'bug_report' | 'feature_request';

  @ApiProperty()
  data: {
    name?: string;
    email: string;
    phone?: string;
    company?: string;
    message?: string;
    title?: string;
    description?: string;
    priority?: 'Low' | 'Medium' | 'High';
  };

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  formId: string;
}

export class WebhookResponseDto {
  @ApiProperty({ enum: ['success', 'error'] })
  status: 'success' | 'error';

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  recordId?: string;

  @ApiProperty({ required: false })
  recordType?: string;
}
