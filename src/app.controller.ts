import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EnvironmentConfig } from './config/environment.config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly envConfig: EnvironmentConfig,
  ) {}

  @Get()
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
  healthCheck(): object {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('config')
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
}
