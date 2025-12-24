import { Controller, Post, Body, Logger, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EnvironmentConfig } from '../../config/environment.config';
import { LinkedInTokenService } from './linkedin-token.service';

class ExchangeDto {
  code: string;
  redirect_uri?: string;
}

@ApiTags('auth')
@Controller('auth')
export class LinkedInAuthController {
  private readonly logger = new Logger(LinkedInAuthController.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly envConfig: EnvironmentConfig,
    private readonly tokenService: LinkedInTokenService,
  ) {}

  @Post('linkedin/exchange')
  @ApiOperation({ summary: 'Exchange LinkedIn auth code for access token' })
  async exchangeCode(@Body() body: ExchangeDto): Promise<any> {
    const clientId = this.envConfig.linkedinClientId;
    const clientSecret = this.envConfig.linkedinClientSecret;
    const code = body.code;
    const redirectUri = body.redirect_uri;

    if (!clientId || !clientSecret || !code) {
      return { error: 'Missing clientId/clientSecret/code' };
    }

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      if (redirectUri) params.append('redirect_uri', redirectUri);
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);

      const response = await firstValueFrom(
        this.httpService.post(
          'https://www.linkedin.com/oauth/v2/accessToken',
          params.toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      );

      // Persist token locally for convenience
      try {
        await this.tokenService.saveToken(response.data as Record<string, any>);
      } catch {
        // ignore persistence errors but return token data
      }

      // Return token details so user can add to Vercel env if desired
      return response.data;
    } catch (error) {
      this.logger.error(
        `LinkedIn token exchange failed: ${(error as Error).message}`,
      );
      return { error: (error as Error).message };
    }
  }

  @Get('linkedin/url')
  @ApiOperation({ summary: 'Get LinkedIn OAuth authorization URL' })
  getAuthUrl(
    @Query('redirect_uri') redirect_uri?: string,
    @Query('state') state?: string,
  ) {
    const clientId = this.envConfig.linkedinClientId;
    const redirect = redirect_uri || 'https://localhost/callback';
    const scopes = ['r_liteprofile', 'r_emailaddress', 'w_member_social'];

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId || '',
      redirect_uri: redirect,
      scope: scopes.join(' '),
    });

    if (state) params.append('state', state);

    const url = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    return { url };
  }

  @Post('linkedin/save')
  @ApiOperation({ summary: 'Save LinkedIn token (dev helper)' })
  async saveToken(@Body() body: Record<string, any>): Promise<any> {
    if (!body || !body.access_token) {
      return { error: 'Missing access_token in body' };
    }

    try {
      await this.tokenService.saveToken(body);
      return { success: true };
    } catch (err) {
      this.logger.error(`Failed to save token: ${String(err)}`);
      return { error: String(err) };
    }
  }

  @Get('linkedin/token')
  @ApiOperation({ summary: 'Get persisted LinkedIn token (dev helper)' })
  async getToken(): Promise<any> {
    try {
      const t = await this.tokenService.getToken();
      return { token: t };
    } catch (err) {
      this.logger.error(`Failed to read token: ${String(err)}`);
      return { token: null };
    }
  }
}
