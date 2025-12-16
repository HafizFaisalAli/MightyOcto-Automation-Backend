import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ERPNextService } from '../erpnext/erpnext.service';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * Webhook Controller
 *
 * Features (Phase 3 - Deliverable 5):
 * - Capture Framer form submissions (contact forms, bug reports)
 * - Create Lead/Support Ticket records in ERPNext via webhook
 * - Handle various webhook types
 */

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly erpnextService: ERPNextService) {}

  /**
   * Handle Framer form submissions
   */
  @Post('framer')
  async handleFramerWebhook(@Body() payload: any): Promise<{ status: string }> {
    this.logger.log(`Received Framer webhook: ${payload.type}`);

    try {
      if (payload.type === 'contact_form') {
        await this.createLead(payload.data);
      } else if (payload.type === 'bug_report') {
        await this.createSupportTicket(payload.data);
      }

      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Lead record in ERPNext
   */
  private async createLead(data: any): Promise<void> {
    await this.erpnextService.createDocument('Lead', {
      lead_name: data.name,
      email_id: data.email,
      mobile_no: data.phone,
      company_name: data.company,
      source: 'Website Form',
      status: 'Open',
      notes: data.message,
    });

    this.logger.log(`Lead created: ${data.email}`);
  }

  /**
   * Create Support Ticket in ERPNext
   */
  private async createSupportTicket(data: any): Promise<void> {
    await this.erpnextService.createDocument('Support Ticket', {
      subject: data.title,
      description: data.description,
      raised_by: data.email,
      priority: data.priority || 'Medium',
      status: 'Open',
    });

    this.logger.log(`Support ticket created: ${data.title}`);
  }
}
