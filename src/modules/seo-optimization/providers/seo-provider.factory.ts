import { Injectable, Logger } from '@nestjs/common';
import { EnvironmentConfig } from '../../../config/environment.config';
import { ISEOProvider } from '../interfaces/seo-provider.interface';
import { SERPAPIProvider } from './serpapi.provider';

/**
 * SEO Provider Factory
 * Phase 3: SERPAPI only - single provider strategy
 */
@Injectable()
export class SEOProviderFactory {
  private readonly logger = new Logger(SEOProviderFactory.name);
  constructor(private readonly envConfig: EnvironmentConfig) {}

  create(): ISEOProvider {
    // Phase 3 uses SERPAPI exclusively
    const key = this.envConfig.serpapiApiKey;
    if (!key) {
      this.logger.warn(
        'SERPAPI_API_KEY not set. SEO provider will run in MOCK mode until a real key is provided.',
      );
    }
    return new SERPAPIProvider(key || 'mock-key');
  }
}
