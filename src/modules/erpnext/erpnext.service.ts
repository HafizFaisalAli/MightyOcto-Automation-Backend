import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EnvironmentConfig } from '../../config/environment.config';
import { firstValueFrom } from 'rxjs';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

/**
 * ERPNext Integration Service
 *
 * Features:
 * - Connect to ERPNext API
 * - Sync content calendar
 * - Create/Update blog posts with status tracking (Scheduled → Draft → SEO Optimized → Published)
 * - Manage leads and support tickets
 * - Track performance metrics
 */

@Injectable()
export class ERPNextService {
  private readonly logger = new Logger(ERPNextService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly envConfig: EnvironmentConfig,
  ) {}

  /**
   * Ensure ERPNext credentials are configured
   */
  private ensureConfigured(): void {
    if (!this.envConfig.erpnextBaseUrl) {
      throw new Error('ERPNEXT_BASE_URL is not configured');
    }
    if (!this.envConfig.erpnextApiKey) {
      throw new Error('ERPNEXT_API_KEY is not configured');
    }
    if (!this.envConfig.erpnextApiSecret) {
      throw new Error('ERPNEXT_API_SECRET is not configured');
    }
  }

  /**
   * Create a new document in ERPNext
   */
  async createDocument(doctype: string, data: any): Promise<any> {
    this.ensureConfigured();
    const url = `${this.envConfig.erpnextBaseUrl}/api/resource/${doctype}`;

    const response = await firstValueFrom(
      this.httpService.post(url, data, {
        headers: this.getAuthHeaders(),
      }),
    );

    this.logger.log(
      `Document created: ${doctype} - ${(response.data as any).data.name}`,
    );
    return (response.data as any).data as Record<string, any>;
  }

  /**
   * Update existing document in ERPNext
   */
  async updateDocument(
    doctype: string,
    docname: string,
    data: any,
  ): Promise<any> {
    this.ensureConfigured();
    const url = `${this.envConfig.erpnextBaseUrl}/api/resource/${doctype}/${docname}`;

    const response = await firstValueFrom(
      this.httpService.put(url, data, {
        headers: this.getAuthHeaders(),
      }),
    );

    this.logger.log(`Document updated: ${doctype} - ${docname}`);
    return (response.data as any).data as Record<string, any>;
  }

  /**
   * Get document from ERPNext
   */
  async getDocument(doctype: string, docname: string): Promise<any> {
    this.ensureConfigured();
    const url = `${this.envConfig.erpnextBaseUrl}/api/resource/${doctype}/${docname}`;

    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: this.getAuthHeaders(),
      }),
    );

    return (response.data as any).data as Record<string, any>;
  }

  /**
   * Get list of documents with filters
   */
  async getDocumentList(
    doctype: string,
    filters?: any,
    fields?: string[],
  ): Promise<any[]> {
    this.ensureConfigured();
    const url = `${this.envConfig.erpnextBaseUrl}/api/resource/${doctype}`;

    const params: Record<string, string> = {};
    if (filters) {
      params['filters'] = JSON.stringify(filters);
    }
    if (fields) {
      params['fields'] = JSON.stringify(fields);
    }

    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: this.getAuthHeaders(),
        params: params as any,
      }),
    );

    return (response.data as any).data as any[];
  }

  /**
   * Get authentication headers for ERPNext API
   */
  private getAuthHeaders(): Record<string, string> {
    const apiKey = this.envConfig.erpnextApiKey;
    const apiSecret = this.envConfig.erpnextApiSecret;
    const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString(
      'base64',
    );

    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authorization}`,
    };
  }
}
