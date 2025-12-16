import { Injectable, Logger } from '@nestjs/common';
import { ERPNextService } from '../erpnext/erpnext.service';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/**
 * Performance Analytics Service
 *
 * Features (Phase 3 - Deliverable 6):
 * - Track engagement metrics per post (views, clicks, shares, comments, conversion rate)
 * - Identify top-performing content themes, formats, and posting times
 * - Self-improving engine that analyzes performance and adjusts future calendars
 * - Monthly performance review (automatic)
 * - Historical trend analysis (6-month rolling window)
 * - Content score calculation (engagement + lead quality)
 */

interface PerformanceMetrics {
  postId: string;
  views: number;
  clicks: number;
  shares: number;
  comments: number;
  conversionRate: number;
  engagementScore: number;
}

@Injectable()
export class PerformanceAnalyticsService {
  private readonly logger = new Logger(PerformanceAnalyticsService.name);

  constructor(private readonly erpnextService: ERPNextService) {}

  /**
   * Track engagement metrics for a post
   */
  async trackEngagement(
    postId: string,
    metrics: Partial<PerformanceMetrics>,
  ): Promise<void> {
    this.logger.log(`Tracking engagement for post: ${postId}`);

    const engagementScore = this.calculateEngagementScore(metrics);

    await this.erpnextService.updateDocument('Blog Post', postId, {
      views: metrics.views || 0,
      clicks: metrics.clicks || 0,
      shares: metrics.shares || 0,
      comments: metrics.comments || 0,
      conversion_rate: metrics.conversionRate || 0,
      engagement_score: engagementScore,
      last_tracked: new Date().toISOString(),
    });
  }

  /**
   * Calculate engagement score (0-100)
   */
  private calculateEngagementScore(
    metrics: Partial<PerformanceMetrics>,
  ): number {
    const views = metrics.views || 0;
    const clicks = metrics.clicks || 0;
    const shares = metrics.shares || 0;
    const comments = metrics.comments || 0;
    const conversionRate = metrics.conversionRate || 0;

    // Weighted scoring
    const clickRate = views > 0 ? (clicks / views) * 100 : 0;
    const shareRate = views > 0 ? (shares / views) * 100 : 0;
    const commentRate = views > 0 ? (comments / views) * 100 : 0;

    const score =
      clickRate * 0.3 +
      shareRate * 0.3 +
      commentRate * 0.2 +
      conversionRate * 100 * 0.2;

    return Math.min(100, Math.round(score));
  }

  /**
   * Identify top-performing content (6-month rolling window)
   */
  async getTopPerformingContent(): Promise<any[]> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const posts = await this.erpnextService.getDocumentList('Blog Post', {
      published_on: ['>=', sixMonthsAgo.toISOString().split('T')[0]],
    });

    // Sort by engagement score
    return posts
      .sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0))
      .slice(0, 10);
  }

  /**
   * Analyze trends and generate recommendations for next month
   */
  async generateMonthlyRecommendations(): Promise<any> {
    this.logger.log(`Generating monthly performance recommendations`);

    const topContent = await this.getTopPerformingContent();

    // Extract insights
    const topKeywords = this.extractTopKeywords(topContent);
    const bestPostingTimes = this.analyzeBestPostingTimes(topContent);
    const topPlatforms = this.identifyTopPlatforms(topContent);

    const recommendations = {
      topKeywords,
      bestPostingTimes,
      topPlatforms,
      suggestedTopics: topKeywords.slice(0, 5),
      recommendedFrequency: this.calculateOptimalFrequency(topContent),
    };

    // Save to ERPNext
    await this.erpnextService.createDocument('Performance Report', {
      report_date: new Date().toISOString(),
      recommendations: JSON.stringify(recommendations),
      top_content: JSON.stringify(topContent.slice(0, 5)),
    });

    return recommendations;
  }

  /**
   * Extract top-performing keywords
   */
  private extractTopKeywords(posts: any[]): string[] {
    const keywordMap = new Map<string, number>();

    posts.forEach((post) => {
      if (post.content_keywords) {
        const keywords = (post.content_keywords as string)
          .split(',')
          .map((k: string) => k.trim());
        keywords.forEach((keyword: string) => {
          const score = post.engagement_score || 0;
          keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + score);
        });
      }
    });

    return Array.from(keywordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword]) => keyword);
  }

  /**
   * Analyze best posting times
   */
  private analyzeBestPostingTimes(posts: any[]): any[] {
    const timeMap = new Map<string, number[]>();

    posts.forEach((post) => {
      if (post.published_on) {
        const hour = new Date(post.published_on).getHours();
        const timeSlot = `${hour}:00`;
        const scores = timeMap.get(timeSlot) || [];
        scores.push(post.engagement_score || 0);
        timeMap.set(timeSlot, scores);
      }
    });

    return Array.from(timeMap.entries())
      .map(([time, scores]) => ({
        time,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 3);
  }

  /**
   * Identify top-performing platforms
   */
  private identifyTopPlatforms(posts: any[]): any[] {
    const platformMap = new Map<string, number[]>();

    posts.forEach((post) => {
      if (post.platform) {
        const scores = platformMap.get(post.platform) || [];
        scores.push(post.engagement_score || 0);
        platformMap.set(post.platform, scores);
      }
    });

    return Array.from(platformMap.entries())
      .map(([platform, scores]) => ({
        platform,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        totalPosts: scores.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }

  /**
   * Calculate optimal posting frequency
   */
  private calculateOptimalFrequency(posts: any[]): string {
    const totalEngagement = posts.reduce(
      (sum: number, p) => sum + ((p.engagement_score as number) || 0),
      0,
    );
    const avgEngagement = totalEngagement / posts.length;

    if (avgEngagement > 70) return '3-4 posts per week';
    if (avgEngagement > 50) return '2-3 posts per week';
    return '1-2 posts per week';
  }
}
