import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentConfig {
  constructor(private configService: ConfigService) {}

  // Application
  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get appName(): string {
    return this.configService.get<string>('APP_NAME', 'MightyOcto-Phase3');
  }

  // ERPNext Configuration
  get erpnextApiKey(): string | undefined {
    return this.configService.get<string>('ERPNEXT_API_KEY');
  }

  get erpnextApiSecret(): string | undefined {
    return this.configService.get<string>('ERPNEXT_API_SECRET');
  }

  get erpnextBaseUrl(): string | undefined {
    return this.configService.get<string>('ERPNEXT_BASE_URL');
  }

  // Claude API Configuration
  get claudeApiKey(): string | undefined {
    return this.configService.get<string>('CLAUDE_API_KEY');
  }

  get llmModel(): string {
    return this.configService.get<string>(
      'LLM_MODEL',
      'claude-3-sonnet-20240229',
    );
  }

  // SEO Tool Configuration
  get seoTool(): string {
    return this.configService.get<string>('SEO_TOOL', 'semrush');
  }

  get semrushApiKey(): string | undefined {
    return this.configService.get<string>('SEMRUSH_API_KEY');
  }

  get serpapiApiKey(): string | undefined {
    return this.configService.get<string>('SERPAPI_API_KEY');
  }

  get mozApiKey(): string | undefined {
    return this.configService.get<string>('MOZ_API_KEY');
  }

  // Social Media Configuration
  get linkedinClientId(): string | undefined {
    return this.configService.get<string>('LINKEDIN_CLIENT_ID');
  }

  get linkedinClientSecret(): string | undefined {
    return this.configService.get<string>('LINKEDIN_CLIENT_SECRET');
  }

  get linkedinBusinessAccountId(): string | undefined {
    return this.configService.get<string>('LINKEDIN_BUSINESS_ACCOUNT_ID');
  }

  get facebookPageToken(): string | undefined {
    return this.configService.get<string>('FACEBOOK_PAGE_ACCESS_TOKEN');
  }

  get facebookPageId(): string | undefined {
    return this.configService.get<string>('FACEBOOK_PAGE_ID');
  }

  get instagramBusinessAccountId(): string | undefined {
    return this.configService.get<string>('INSTAGRAM_BUSINESS_ACCOUNT_ID');
  }

  // Framer CMS Configuration
  get framerApiKey(): string | undefined {
    return this.configService.get<string>('FRAMER_API_KEY');
  }

  get framerBaseUrl(): string | undefined {
    return this.configService.get<string>('FRAMER_BASE_URL');
  }

  // Redis Configuration
  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  get redisPassword(): string {
    return this.configService.get<string>('REDIS_PASSWORD', '');
  }

  // Webhook Configuration
  get webhookSecret(): string | undefined {
    return this.configService.get<string>('WEBHOOK_SECRET');
  }

  get framerWebhookUrl(): string | undefined {
    return this.configService.get<string>('FRAMER_WEBHOOK_URL');
  }

  // Google Business Profile (optional)
  get googleBusinessApiKey(): string | undefined {
    return this.configService.get<string>('GOOGLE_BUSINESS_API_KEY');
  }

  // Logging
  get logLevel(): string {
    return this.configService.get<string>('LOG_LEVEL', 'debug');
  }
}
