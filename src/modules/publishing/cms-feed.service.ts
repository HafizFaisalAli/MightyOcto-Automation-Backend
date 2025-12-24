import { Injectable, Logger } from '@nestjs/common';
import { ERPNextService } from '../erpnext/erpnext.service';
import { BlogPostFeedItem, CmsFragmentsDto } from './dto/cms-feed.dto';

/**
 * CMS Feed Service
 * Exposes blog posts in AnySync-compatible JSON format
 * Used by Framer CMS via AnySync plugin for automated content sync
 */

@Injectable()
export class CmsFeedService {
  private readonly logger = new Logger(CmsFeedService.name);

  constructor(private readonly erpnextService: ERPNextService) {}

  /**
   * Get blog posts for AnySync feed
   * Returns published + SEO-optimized posts ready for Framer CMS
   */
  async getBlogPostsFeed(limit = 50, offset = 0): Promise<CmsFragmentsDto> {
    this.logger.log(`Fetching CMS feed: limit=${limit}, offset=${offset}`);

    try {
      // Try to fetch from ERPNext if credentials available
      const posts = await this.fetchFromERPNext(limit, offset);

      // Return ERPNext data even if empty (prevents falling back to mock when ERPNext is reachable)
      return {
        posts: posts.map((p) => this.transformToFeedItem(p)),
        total: posts.length,
        limit,
        offset,
        last_sync: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.warn(
        `ERPNext fetch failed: ${(error as Error).message}, using mock data`,
      );
    }

    // Fallback to mock data for testing (when ERPNext creds not available)
    return this.getMockFeed(limit, offset);
  }

  /**
   * Get mock feed for testing (when ERPNext not connected)
   */
  private getMockFeed(limit: number, offset: number): CmsFragmentsDto {
    const mockPosts: BlogPostFeedItem[] = [
      {
        id: 'post-001',
        title: 'Sales Automation 101: How to Scale Your Pipeline',
        slug: 'sales-automation-101',
        content:
          'Sales automation transforms your team from manual to automated. Learn how to implement it step-by-step.',
        excerpt: 'A complete guide to sales automation basics.',
        featured_image: 'https://example.com/image1.jpg',
        keywords: 'sales automation, lead generation, pipeline',
        status: 'published',
        seo_score: 85,
        engagement_score: 92,
        published_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        created_at: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        platform: 'blog',
      },
      {
        id: 'post-002',
        title: 'Top 5 SEO Tips for B2B Content',
        slug: 'top-5-seo-tips-b2b',
        content:
          'SEO is critical for B2B success. Here are the top 5 strategies that drive traffic and conversions.',
        excerpt: 'Essential SEO tactics for B2B companies.',
        featured_image: 'https://example.com/image2.jpg',
        keywords: 'SEO, B2B, content marketing',
        status: 'published',
        seo_score: 78,
        engagement_score: 76,
        published_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        created_at: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        platform: 'blog',
      },
      {
        id: 'post-003',
        title: 'Faisal Ali The Growth Marketer',
        slug: 'faisal-ali-growth-marketer',
        content:
          'Email remains the highest ROI channel. Learn the psychology and mechanics of sequences that work.',
        excerpt: 'Build email sequences that drive revenue.',
        featured_image: 'https://example.com/image3.jpg',
        keywords: 'email marketing, automation, conversions',
        status: 'draft',
        seo_score: 72,
        engagement_score: 0,
        published_at: undefined,
        created_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updated_at: new Date().toISOString(),
        platform: 'blog',
      },
      {
        id: 'post-004',
        title: 'Faisal Ali The Growth Marketer',
        slug: '4-faisal-ali-growth-marketer',
        content:
          'Email remains the highest ROI channel. Learn the psychology and mechanics of sequences that work.',
        excerpt: 'Build email sequences that drive revenue.',
        featured_image: 'https://example.com/image3.jpg',
        keywords: 'email marketing, automation, conversions',
        status: 'draft',
        seo_score: 72,
        engagement_score: 0,
        published_at: undefined,
        created_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updated_at: new Date().toISOString(),
        platform: 'blog',
      },
    ];

    return {
      posts: mockPosts.slice(offset, offset + limit),
      total: mockPosts.length,
      limit,
      offset,
      last_sync: new Date().toISOString(),
    };
  }

  /**
   * Fetch posts from ERPNext
   */
  private async fetchFromERPNext(
    limit: number,
    offset: number,
  ): Promise<Record<string, unknown>[]> {
    try {
      const posts = await this.erpnextService.getDocumentList(
        'Blog Post',
        {
          status: ['in', ['Published', 'Draft']],
        },
        [
          'name',
          'title',
          'slug',
          'content',
          'excerpt',
          'featured_image',
          'content_keywords',
          'status',
          'seo_score',
          'engagement_score',
          'published_on',
          'creation',
          'modified',
          'platform',
        ],
      );

      // Apply pagination
      return posts.slice(offset, offset + limit) as Record<string, unknown>[];
    } catch (error) {
      this.logger.error(
        `Failed to fetch from ERPNext: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Transform ERPNext Blog Post to AnySync-compatible item
   */
  private transformToFeedItem(post: Record<string, unknown>): BlogPostFeedItem {
    const title = (post.title as string) || '';

    return {
      id: (post.name as string) || '',
      title,
      slug: (post.slug as string) || this.generateSlug(title),
      content: (post.content as string) || '',
      excerpt: (post.excerpt as string) || '',
      featured_image: (post.featured_image as string) || undefined,
      keywords: (post.content_keywords as string) || '',
      status: ((post.status as string)?.toLowerCase() || 'draft') as
        | 'draft'
        | 'published'
        | 'scheduled',
      seo_score: (post.seo_score as number) || 0,
      engagement_score: (post.engagement_score as number) || 0,
      published_at: post.published_on
        ? new Date(post.published_on as string).toISOString()
        : undefined,
      created_at: post.creation
        ? new Date(post.creation as string).toISOString()
        : new Date().toISOString(),
      updated_at: post.modified
        ? new Date(post.modified as string).toISOString()
        : new Date().toISOString(),
      platform: (post.platform as string) || 'blog',
    };
  }

  /**
   * Generate slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
