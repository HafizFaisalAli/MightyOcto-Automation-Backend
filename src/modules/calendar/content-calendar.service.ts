import { Injectable, Logger } from '@nestjs/common';
import { ERPNextService } from '../erpnext/erpnext.service';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/**
 * Content Calendar Service
 *
 * Features (Phase 3 - Deliverable 1):
 * - Auto-generate monthly schedule based on keyword opportunities
 * - Analyze historical performance to identify top-performing topics
 * - Store in ERPNext with status tracking (Scheduled → Draft → SEO Optimized → Published)
 * - Create publishing timeline optimized for engagement
 */

interface ContentItem {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  publishDate: Date;
  platform: 'blog' | 'linkedin' | 'facebook' | 'instagram';
  status: 'scheduled' | 'draft' | 'seo_optimized' | 'published';
  seoScore?: number;
}

@Injectable()
export class ContentCalendarService {
  private readonly logger = new Logger(ContentCalendarService.name);

  constructor(private readonly erpnextService: ERPNextService) {}

  /**
   * Generate monthly content calendar based on keyword opportunities and historical performance
   */
  async generateMonthlyCalendar(
    month: number,
    year: number,
  ): Promise<ContentItem[]> {
    this.logger.log(`Generating content calendar for ${month}/${year}`);

    // Step 1: Get high-performing keywords from historical data
    const topKeywords = await this.getTopKeywordsFromHistory();

    // Step 2: Generate content ideas based on keywords
    const contentIdeas = this.generateContentIdeas(topKeywords);

    // Step 3: Create publishing schedule
    const calendar = this.createPublishingSchedule(contentIdeas, month, year);

    // Step 4: Save calendar to ERPNext
    await this.saveCalendarToERPNext(calendar, month, year);

    return calendar;
  }

  /**
   * Get top-performing keywords from previous months (6-month rolling window)
   */
  private async getTopKeywordsFromHistory(): Promise<string[]> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const recentPosts = await this.erpnextService.getDocumentList(
        'Blog Post',
        {
          published_on: ['>=', sixMonthsAgo.toISOString().split('T')[0]],
        },
      );

      // Extract and rank keywords by engagement
      const keywordMap = new Map<string, number>();

      recentPosts.forEach((post: any) => {
        if (
          post.content_keywords &&
          typeof post.content_keywords === 'string'
        ) {
          const keywords = (post.content_keywords as string)
            .split(',')
            .map((k: string) => k.trim());
          const engagement = (post.engagement_score as number) || 1;

          keywords.forEach((keyword: string) => {
            keywordMap.set(
              keyword,
              (keywordMap.get(keyword) || 0) + engagement,
            );
          });
        }
      });

      // Return top 20 keywords
      return Array.from(keywordMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([keyword]) => keyword);
    } catch {
      this.logger.warn('Could not fetch history, using default keywords');
      return this.getDefaultKeywords();
    }
  }

  /**
   * Default keywords if no history exists
   */
  private getDefaultKeywords(): string[] {
    return [
      'sales automation',
      'lead generation',
      'AI content marketing',
      'SEO optimization',
      'social media automation',
    ];
  }

  /**
   * Generate content ideas for each keyword
   */
  private generateContentIdeas(keywords: string[]): any[] {
    const ideas: any[] = [];
    const contentTypes = [
      'How-to Guide',
      'Case Study',
      'Tips & Tricks',
      'Industry News',
      'Best Practices',
    ];

    keywords.forEach((keyword, index) => {
      ideas.push({
        keyword,
        title: `${contentTypes[index % contentTypes.length]}: ${keyword}`,
        description: `Comprehensive guide about ${keyword}`,
        platforms: ['blog', 'linkedin'],
        contentType: contentTypes[index % contentTypes.length],
      });
    });

    return ideas;
  }

  /**
   * Create publishing schedule with optimal dates
   */
  private createPublishingSchedule(
    ideas: any[],
    month: number,
    year: number,
  ): ContentItem[] {
    const calendar: ContentItem[] = [];
    const publishingDays = this.getOptimalPublishingDays(month, year);

    ideas.forEach((idea, index) => {
      const publishDate = new Date(
        year,
        month - 1,
        publishingDays[index % publishingDays.length],
      );

      const platforms = (idea.platforms as string[]) || ['blog'];
      platforms.forEach((platform: string) => {
        calendar.push({
          id: uuidv4(),
          title: (idea.title as string) || '',
          description: (idea.description as string) || '',
          keywords: [(idea.keyword as string) || ''],
          publishDate,
          platform: platform as 'blog' | 'linkedin' | 'facebook' | 'instagram',
          status: 'scheduled',
        });
      });
    });

    return calendar;
  }

  /**
   * Get optimal publishing days (Tuesday, Wednesday, Thursday for best engagement)
   */
  private getOptimalPublishingDays(month: number, year: number): number[] {
    const days: number[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();

      // Tuesday (2), Wednesday (3), Thursday (4)
      if (dayOfWeek >= 2 && dayOfWeek <= 4) {
        days.push(day);
      }
    }

    return days;
  }

  /**
   * Save calendar to ERPNext as single source of truth
   */
  private async saveCalendarToERPNext(
    calendar: ContentItem[],
    month: number,
    year: number,
  ): Promise<void> {
    const calendarData = {
      doctype: 'Content Calendar',
      name: `${year}-${String(month).padStart(2, '0')}`,
      month,
      year,
      total_items: calendar.length,
      content_items: calendar.map((item) => ({
        title: item.title,
        keyword: item.keywords.join(','),
        platform: item.platform,
        scheduled_date: item.publishDate,
        status: item.status,
      })),
    };

    await this.erpnextService.createDocument('Content Calendar', calendarData);
    this.logger.log(`Calendar saved to ERPNext for ${month}/${year}`);
  }
}
