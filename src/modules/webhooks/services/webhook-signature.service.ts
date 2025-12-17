import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import { EnvironmentConfig } from '../../../config/environment.config';

/**
 * Webhook Signature Verification Service
 * Validates incoming webhook signatures to prevent unauthorized requests
 */
@Injectable()
export class WebhookSignatureService {
  private readonly logger = new Logger(WebhookSignatureService.name);

  constructor(private readonly envConfig: EnvironmentConfig) {}

  /**
   * Verify webhook signature using HMAC-SHA256
   */
  verifySignature(
    payload: any,
    receivedSignature: string,
    secret?: string,
  ): boolean {
    try {
      const webhookSecret = secret || this.envConfig.webhookSecret;

      if (!webhookSecret) {
        this.logger.warn('No webhook secret configured, skipping verification');
        return true; // Allow in development if no secret set
      }

      const payloadString =
        typeof payload === 'string' ? payload : JSON.stringify(payload);

      const expectedSignature = createHmac('sha256', webhookSecret)
        .update(payloadString)
        .digest('hex');

      // Remove signature prefix if present (e.g., "sha256=")
      const cleanSignature = receivedSignature.replace(/^sha256=/, '');

      const isValid = expectedSignature === cleanSignature;

      if (!isValid) {
        this.logger.warn('Webhook signature verification failed');
      }

      return isValid;
    } catch (error) {
      this.logger.error(
        `Signature verification error: ${(error as Error).message}`,
      );
      return false;
    }
  }

  /**
   * Verify timestamp to prevent replay attacks
   */
  verifyTimestamp(timestamp: string, maxAgeSeconds: number = 300): boolean {
    try {
      const webhookTime = new Date(timestamp).getTime();
      const currentTime = Date.now();
      const age = (currentTime - webhookTime) / 1000;

      if (age > maxAgeSeconds) {
        this.logger.warn(
          `Webhook timestamp too old: ${age}s (max: ${maxAgeSeconds}s)`,
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Timestamp verification error: ${(error as Error).message}`,
      );
      return false;
    }
  }

  /**
   * Combined verification (signature + timestamp)
   */
  verify(
    payload: any,
    signature: string,
    timestamp?: string,
    secret?: string,
  ): void {
    // Verify signature
    if (!this.verifySignature(payload, signature, secret)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // Verify timestamp if provided
    if (timestamp && !this.verifyTimestamp(timestamp)) {
      throw new UnauthorizedException('Webhook timestamp expired');
    }
  }
}
