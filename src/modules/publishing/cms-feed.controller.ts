import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CmsFeedService } from './cms-feed.service';
import { CmsFragmentsDto, BlogPostFeedItem } from './dto/cms-feed.dto';

/**
 * CMS Feed Controller
 * Exposes `/cms/feed` endpoint for AnySync plugin
 * AnySync uses this to pull blog posts and sync to Framer CMS
 */

@ApiTags('cms')
@Controller('cms')
export class CmsFeedController {
  private readonly logger = new Logger(CmsFeedController.name);

  constructor(private readonly cmsFeedService: CmsFeedService) {}

  /**
   * GET /cms/feed
   * Returns blog posts in AnySync-compatible JSON format
   * Used by Framer CMS via AnySync plugin for automated content sync
   */
  @Get('feed')
  @ApiOperation({
    summary: 'Get blog posts for AnySync/Framer CMS integration',
    description:
      'Returns published and draft blog posts in JSON format. Compatible with AnySync Framer plugin. Use flat=true for direct array response.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of posts to return (default: 50)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Pagination offset (default: 0)',
  })
  @ApiQuery({
    name: 'flat',
    required: false,
    type: Boolean,
    description:
      'Return flat array without wrapper (for AnySync compatibility)',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog posts feed',
    schema: {
      example: {
        posts: [
          {
            id: 'post-001',
            title: 'Blog Post Title',
            slug: 'blog-post-title',
            content: 'Full HTML content...',
            excerpt: 'Short excerpt...',
            featured_image: 'https://...',
            keywords: 'seo, keywords',
            status: 'published',
            seo_score: 85,
            engagement_score: 92,
            published_at: '2025-12-22T10:00:00Z',
            created_at: '2025-12-20T10:00:00Z',
            updated_at: '2025-12-22T10:00:00Z',
            platform: 'blog',
          },
        ],
        total: 1,
        limit: 50,
        offset: 0,
        last_sync: '2025-12-22T15:30:00Z',
      },
    },
  })
  async getCmsFeed(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('flat') flat?: string,
  ): Promise<CmsFragmentsDto | BlogPostFeedItem[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    const isFlat = flat === 'true';

    this.logger.log(
      `CMS feed requested: limit=${parsedLimit}, offset=${parsedOffset}, flat=${isFlat}`,
    );

    const feed = await this.cmsFeedService.getBlogPostsFeed(
      parsedLimit,
      parsedOffset,
    );

    // Return flat array for AnySync compatibility
    if (isFlat) {
      return feed.posts;
    }

    return feed;
  }

  /**
   * GET /cms/health
   * Quick health check for AnySync to verify endpoint is working
   */
  @Get('health')
  @ApiOperation({
    summary: 'Health check for CMS feed endpoint',
  })
  @ApiResponse({
    status: 200,
    description: 'Endpoint is healthy',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2025-12-22T15:30:00Z',
        endpoint: '/cms/feed',
      },
    },
  })
  healthCheck(): object {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      endpoint: '/cms/feed',
      message: 'CMS Feed endpoint is ready for AnySync integration',
    };
  }
}
