import { promises as fs } from 'fs';
import { join } from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EnvironmentConfig } from '../../config/environment.config';
import { ERPNextService } from '../erpnext/erpnext.service';
import {
  PublishBlogDto,
  PublishLinkedInDto,
  PublishFacebookDto,
  PublishInstagramDto,
  PublishResponseDto,
} from './dto/publishing.dto';

/**
 * Publishing Service
 *
 * Features (Phase 3 - Deliverable 4):
 * - Publish blog posts to Framer CMS via API
 * - Post to LinkedIn, Facebook, Instagram APIs
 * - Google Business Profile updates (optional)
 * - Automated scheduling and posting
 * - Status tracking in ERPNext
 */

@Injectable()
export class PublishingService {
  private readonly logger = new Logger(PublishingService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly envConfig: EnvironmentConfig,
    private readonly erpnextService: ERPNextService,
  ) {}

  /**
   * Publish blog post to Framer CMS
   */
  async publishToBlog(dto: PublishBlogDto): Promise<PublishResponseDto> {
    this.logger.log(`Publishing to Framer CMS: ${dto.title}`);

    const baseUrl = this.envConfig.framerBaseUrl;
    const apiKey = this.envConfig.framerApiKey;

    // If Framer API credentials are not available, fall back to mock (AnySync recommended)
    if (!baseUrl || !apiKey) {
      this.logger.warn(
        'Framer API credentials missing — falling back to mock response',
      );
      const mockPostId = `blog-${Date.now()}`;
      const mockUrl = `${baseUrl || 'https://framer.site'}/blog/${dto.slug || 'post'}`;
      this.updatePublishStatus('blog', mockPostId, 'published', mockUrl);
      return {
        success: true,
        platform: 'framer',
        postId: mockPostId,
        postUrl: mockUrl,
        message:
          'Blog post published successfully (MOCK). Use AnySync for production Framer sync.',
        publishedAt: new Date(),
      };
    }

    try {
      const payload = {
        title: dto.title,
        content: dto.content,
        slug: dto.slug,
        author: dto.author,
        tags: dto.tags,
        featured_image: dto.featured_image,
        meta_description: dto.meta_description,
      };

      // Attempt to POST to Framer CMS endpoint (best-effort; Framer may require marketplace plugin)
      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/cms/collections/blog-posts`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const postId = String(response.data?.id || `blog-${Date.now()}`);

      // Build post URL from Framer base and slug/id (avoid reading arbitrary response shape)
      const postUrl = `${baseUrl}/blog/${dto.slug || postId}`;

      this.updatePublishStatus('blog', String(postId), 'published', postUrl);

      return {
        success: true,
        platform: 'framer',
        postId: String(postId),
        postUrl,
        message: 'Blog post published successfully',
        publishedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to publish blog: ${(error as Error).message}`);
      // Fallback to mock on error
      const mockPostId = `blog-${Date.now()}`;
      const mockUrl = `${baseUrl}/blog/${dto.slug || 'post'}`;
      this.updatePublishStatus('blog', mockPostId, 'failed', mockUrl);
      return {
        success: false,
        platform: 'framer',
        postId: mockPostId,
        postUrl: mockUrl,
        message: `Failed to publish to Framer: ${(error as Error).message}`,
        publishedAt: new Date(),
      };
    }
  }

  /**
   * Publish to LinkedIn company page
   */
  async publishToLinkedIn(
    dto: PublishLinkedInDto,
  ): Promise<PublishResponseDto> {
    this.logger.log(`Publishing to LinkedIn: ${dto.text.substring(0, 50)}...`);

    let token =
      this.envConfig.linkedinAccessToken || this.envConfig.linkedinClientSecret;

    // Try to read persisted token file if env token not provided
    if (!token) {
      try {
        const content = await fs.readFile(
          join(process.cwd(), 'linkedin_token.json'),
          {
            encoding: 'utf8',
          },
        );
        const stored = JSON.parse(content) as Record<string, any> | null;
        if (stored && stored.access_token) {
          token = String(stored.access_token);
        }
      } catch {
        // ignore - no token file present
      }
    }
    const orgId = this.envConfig.linkedinBusinessAccountId;

    if (!token || !orgId) {
      this.logger.warn(
        'LinkedIn credentials missing — falling back to mock response',
      );
      const mockPostId = `li-${Date.now()}`;
      const mockUrl = `https://linkedin.com/feed/update/${mockPostId}`;
      this.updatePublishStatus('linkedin', mockPostId, 'published', mockUrl);
      return {
        success: true,
        platform: 'linkedin',
        postId: mockPostId,
        postUrl: mockUrl,
        message: 'LinkedIn post published successfully (MOCK)',
        publishedAt: new Date(),
      };
    }

    try {
      const payload = {
        author: `urn:li:organization:${orgId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: dto.text },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility':
            dto.visibility || 'PUBLIC',
        },
      };

      const response = await firstValueFrom(
        this.httpService.post('https://api.linkedin.com/v2/ugcPosts', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const postId = response.data && (response.data.id || `li-${Date.now()}`);
      const postUrl = `https://linkedin.com/feed/update/${postId}`;
      this.updatePublishStatus(
        'linkedin',
        String(postId),
        'published',
        postUrl,
      );

      return {
        success: true,
        platform: 'linkedin',
        postId: String(postId),
        postUrl,
        message: 'LinkedIn post published successfully',
        publishedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`LinkedIn publish failed: ${(error as Error).message}`);
      // Fallback to mock response on error
      const mockPostId = `li-${Date.now()}`;
      const mockUrl = `https://linkedin.com/feed/update/${mockPostId}`;
      this.updatePublishStatus('linkedin', mockPostId, 'failed', mockUrl);
      return {
        success: false,
        platform: 'linkedin',
        postId: mockPostId,
        postUrl: mockUrl,
        message: `LinkedIn publish failed: ${(error as Error).message}`,
        publishedAt: new Date(),
      };
    }
  }

  /**
   * Publish to Facebook page
   */
  async publishToFacebook(
    dto: PublishFacebookDto,
  ): Promise<PublishResponseDto> {
    this.logger.log(
      `Publishing to Facebook: ${dto.message.substring(0, 50)}...`,
    );

    const token = this.envConfig.facebookPageToken;
    const pageId = this.envConfig.facebookPageId;

    if (!token || !pageId) {
      this.logger.warn(
        'Facebook credentials missing — falling back to mock response',
      );
      const mockPostId = `fb-${Date.now()}`;
      const mockUrl = `https://facebook.com/${pageId || 'page'}/posts/${mockPostId}`;
      this.updatePublishStatus('facebook', mockPostId, 'published', mockUrl);
      return {
        success: true,
        platform: 'facebook',
        postId: mockPostId,
        postUrl: mockUrl,
        message: 'Facebook post published successfully (MOCK)',
        publishedAt: new Date(),
      };
    }

    try {
      const payload: Record<string, unknown> = { message: dto.message };
      if (dto.link) payload['link'] = dto.link;
      if (dto.scheduledPublishTime)
        payload['scheduled_publish_time'] = dto.scheduledPublishTime;

      const response = await firstValueFrom(
        this.httpService.post(
          `https://graph.facebook.com/v18.0/${pageId}/feed`,
          payload,
          {
            params: { access_token: token },
          },
        ),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const postId = response.data && (response.data.id || `fb-${Date.now()}`);
      const postUrl = `https://facebook.com/${pageId}/posts/${postId}`;
      this.updatePublishStatus(
        'facebook',
        String(postId),
        'published',
        postUrl,
      );

      return {
        success: true,
        platform: 'facebook',
        postId: String(postId),
        postUrl,
        message: 'Facebook post published successfully',
        publishedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Facebook publish failed: ${(error as Error).message}`);
      const mockPostId = `fb-${Date.now()}`;
      const mockUrl = `https://facebook.com/${pageId}/posts/${mockPostId}`;
      this.updatePublishStatus('facebook', mockPostId, 'failed', mockUrl);
      return {
        success: false,
        platform: 'facebook',
        postId: mockPostId,
        postUrl: mockUrl,
        message: `Facebook publish failed: ${(error as Error).message}`,
        publishedAt: new Date(),
      };
    }
  }

  /**
   * Publish to Instagram business account
   */
  publishToInstagram(dto: PublishInstagramDto): Promise<PublishResponseDto> {
    this.logger.log(
      `Publishing to Instagram: ${dto.caption.substring(0, 50)}...`,
    );

    try {
      // TODO: Implement real Instagram Graph API call (2-step process)
      // Step 1: Create media container
      // Step 2: Publish container

      const mockPostId = `ig-${Date.now()}`;
      const mockUrl = `https://instagram.com/p/${mockPostId}`;

      this.updatePublishStatus('instagram', mockPostId, 'published', mockUrl);

      return Promise.resolve({
        success: true,
        platform: 'instagram',
        postId: mockPostId,
        postUrl: mockUrl,
        message: 'Instagram post published successfully (MOCK)',
        publishedAt: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Instagram publish failed: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Update publish status in ERPNext
   * @remarks Currently a no-op mock; will implement when ERPNext credentials available
   */
  private updatePublishStatus(
    platform: string,
    postId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _status?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _url?: string,
  ): void {
    try {
      // This would update the Blog Post or Social Post DocType in ERPNext
      this.logger.log(
        `Updating ${platform} publish status in ERPNext: ${postId}`,
      );
      // TODO: Implement real ERPNext update when CRUD is ready
      // await this.erpnextService.updateDocument('Blog Post', postId, {
      //   [`${platform}_status`]: _status,
      //   [`${platform}_post_id`]: postId,
      //   [`${platform}_url`]: _url,
      //   [`${platform}_published_at`]: new Date().toISOString(),
      // });
    } catch (error) {
      this.logger.warn(`Failed to update ERPNext: ${(error as Error).message}`);
    }
  }
}
