import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { ERPNextService } from '../erpnext/erpnext.service';
import { WebhookSignatureService } from './services/webhook-signature.service';
import { FramerFormSubmissionDto, WebhookResponseDto } from './dto/webhook.dto';
import { PerformanceAnalyticsService } from '../analytics/performance-analytics.service';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * Webhook Controller
 *
 * Features (Phase 3 - Deliverable 5):
 * - Capture Framer form submissions (contact forms, bug reports)
 * - Create Lead/Support Ticket records in ERPNext via webhook
 * - Handle various webhook types
 * - Verify webhook signatures for security
 */

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly erpnextService: ERPNextService,
    private readonly signatureService: WebhookSignatureService,
    private readonly analyticsService: PerformanceAnalyticsService,
  ) {}

  /**
   * Handle Framer form submissions
   */
  @Post('framer')
  @ApiOperation({
    summary: 'Handle Framer form submissions and create ERPNext records',
  })
  @ApiHeader({
    name: 'x-webhook-signature',
    required: false,
    description: 'HMAC signature for webhook verification',
  })
  @ApiHeader({
    name: 'x-webhook-timestamp',
    required: false,
    description: 'Webhook timestamp for replay prevention',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid webhook signature' })
  async handleFramerWebhook(
    @Body() payload: FramerFormSubmissionDto,
    @Headers('x-webhook-signature') signature?: string,
    @Headers('x-webhook-timestamp') timestamp?: string,
  ): Promise<WebhookResponseDto> {
    this.logger.log(`Received Framer webhook: ${payload.type}`);

    try {
      // Verify webhook signature if provided
      if (signature) {
        this.signatureService.verify(payload, signature, timestamp);
      }

      let recordId: string;
      let recordType: string;

      if (payload.type === 'contact_form') {
        recordId = await this.createLead(payload.data);
        recordType = 'Lead';
      } else if (payload.type === 'bug_report') {
        recordId = await this.createSupportTicket(payload.data, 'Bug');
        recordType = 'Support Ticket';
      } else if (payload.type === 'feature_request') {
        recordId = await this.createSupportTicket(
          payload.data,
          'Feature Request',
        );
        recordType = 'Support Ticket';
      } else {
        throw new Error(`Unknown webhook type: ${String(payload.type)}`);
      }

      return {
        status: 'success',
        message: `${recordType} created successfully`,
        recordId,
        recordType,
      };
    } catch (error) {
      this.logger.error(
        `Webhook processing failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Analytics webhook for tracking engagement
   */
  @Post('analytics')
  @ApiOperation({ summary: 'Track post engagement metrics' })
  @ApiResponse({ status: 200, description: 'Engagement tracked' })
  async handleAnalytics(
    @Body()
    payload: {
      postId: string;
      metrics: {
        views?: number;
        clicks?: number;
        shares?: number;
        comments?: number;
        conversionRate?: number;
      };
    },
    @Headers('x-webhook-signature') signature?: string,
    @Headers('x-webhook-timestamp') timestamp?: string,
  ): Promise<WebhookResponseDto> {
    this.logger.log(`Received analytics webhook for ${payload.postId}`);

    try {
      if (signature) {
        this.signatureService.verify(payload, signature, timestamp);
      }

      await this.analyticsService.trackEngagement(
        payload.postId,
        payload.metrics || {},
      );

      return { status: 'success', message: 'Engagement tracked' };
    } catch (error) {
      this.logger.error(
        `Analytics webhook failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create Lead record in ERPNext
   */
  private async createLead(data: Record<string, unknown>): Promise<string> {
    const lead = await this.erpnextService.createDocument('Lead', {
      lead_name: (data.name as string) || 'Unknown',
      email_id: data.email as string,
      mobile_no: (data.phone as string) || '',
      company_name: (data.company as string) || '',
      source: 'Website Form',
      status: 'Open',
      notes: (data.message as string) || '',
    });

    this.logger.log(`Lead created: ${data.email as string}`);
    return (lead.name as string) || '';
  }

  /**
   * Create Support Ticket in ERPNext
   */
  private async createSupportTicket(
    data: Record<string, unknown>,
    type: string,
  ): Promise<string> {
    const ticket = await this.erpnextService.createDocument('Support Ticket', {
      subject: (data.title as string) || type,
      description:
        (data.description as string) || (data.message as string) || '',
      raised_by: data.email as string,
      priority: (data.priority as string) || 'Medium',
      status: 'Open',
      ticket_type: type,
    });

    this.logger.log(
      `Support ticket created: ${(data.title as string) || type}`,
    );
    return (ticket.name as string) || '';
  }
}
