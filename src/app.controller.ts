import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { EnvironmentConfig } from './config/environment.config';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly envConfig: EnvironmentConfig,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get API status and module configuration' })
  getHello(): object {
    return {
      message: 'MightyOcto Phase 3 - Content Marketing Automation',
      version: '1.0.0',
      environment: this.envConfig.nodeEnv,
      port: this.envConfig.port,
      status: 'running',
      modules: {
        erpnext: !!this.envConfig.erpnextBaseUrl,
        claude: !!this.envConfig.claudeApiKey,
        seo: this.envConfig.seoTool,
        redis: `${this.envConfig.redisHost}:${this.envConfig.redisPort}`,
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  healthCheck(): object {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('config')
  @ApiOperation({ summary: 'Get application configuration (non-sensitive)' })
  getConfig(): object {
    return {
      appName: this.envConfig.appName,
      environment: this.envConfig.nodeEnv,
      seoTool: this.envConfig.seoTool,
      llmModel: this.envConfig.llmModel,
      redisHost: this.envConfig.redisHost,
      note: 'Sensitive credentials are hidden',
    };
  }

  @Get('phase3/status')
  @ApiOperation({ summary: 'Phase 3 readiness status and missing keys' })
  getPhase3Status(): object {
    const status = {
      required: {
        SERPAPI_API_KEY: !!this.envConfig.serpapiApiKey,
        FRAMER_API_KEY: !!this.envConfig.framerApiKey,
        FRAMER_BASE_URL: !!this.envConfig.framerBaseUrl,
        INSTAGRAM_BUSINESS_ACCOUNT_ID:
          !!this.envConfig.instagramBusinessAccountId,
        ERPNEXT_API_KEY: !!this.envConfig.erpnextApiKey,
        ERPNEXT_API_SECRET: !!this.envConfig.erpnextApiSecret,
        ERPNEXT_BASE_URL: !!this.envConfig.erpnextBaseUrl,
      },
      optional: {
        WEBHOOK_SECRET: !!this.envConfig.webhookSecret,
        LINKEDIN_CLIENT_ID: !!this.envConfig.linkedinClientId,
        LINKEDIN_CLIENT_SECRET: !!this.envConfig.linkedinClientSecret,
        LINKEDIN_BUSINESS_ACCOUNT_ID:
          !!this.envConfig.linkedinBusinessAccountId,
        FACEBOOK_PAGE_ACCESS_TOKEN: !!this.envConfig.facebookPageToken,
        FACEBOOK_PAGE_ID: !!this.envConfig.facebookPageId,
      },
    } as const;

    const missing = [
      !status.required.SERPAPI_API_KEY && 'SERPAPI_API_KEY',
      !status.required.FRAMER_API_KEY && 'FRAMER_API_KEY',
      !status.required.FRAMER_BASE_URL && 'FRAMER_BASE_URL',
      !status.required.INSTAGRAM_BUSINESS_ACCOUNT_ID &&
        'INSTAGRAM_BUSINESS_ACCOUNT_ID',
      !status.required.ERPNEXT_API_KEY && 'ERPNEXT_API_KEY',
      !status.required.ERPNEXT_API_SECRET && 'ERPNEXT_API_SECRET',
      !status.required.ERPNEXT_BASE_URL && 'ERPNEXT_BASE_URL',
    ].filter(Boolean);

    return {
      phase: 'Phase 3',
      ready: missing.length === 0,
      missing,
      status,
      timestamp: new Date().toISOString(),
    };
  }
}
