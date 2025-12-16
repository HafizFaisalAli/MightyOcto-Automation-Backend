import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContentCalendarService } from '../calendar/content-calendar.service';
import { PerformanceAnalyticsService } from '../analytics/performance-analytics.service';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * Scheduler Service
 *
 * Features:
 * - Monthly content calendar generation (1st of each month)
 * - Weekly performance analysis (every Sunday)
 * - Daily publishing tasks
 * - Automated performance tracking
 */

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly calendarService: ContentCalendarService,
    private readonly analyticsService: PerformanceAnalyticsService,
  ) {}

  /**
   * Generate monthly content calendar on the 1st of each month at 9 AM
   */
  @Cron('0 9 1 * *')
  async generateMonthlyCalendar() {
    this.logger.log('Starting monthly calendar generation');

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
      await this.calendarService.generateMonthlyCalendar(month, year);
      this.logger.log(`Monthly calendar generated for ${month}/${year}`);
    } catch (error) {
      this.logger.error(
        `Failed to generate calendar: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Run performance analysis every Sunday at 11 PM
   */
  @Cron('0 23 * * 0')
  async weeklyPerformanceAnalysis() {
    this.logger.log('Starting weekly performance analysis');

    try {
      const topContent = await this.analyticsService.getTopPerformingContent();
      this.logger.log(
        `Found ${topContent.length} top-performing posts this week`,
      );
    } catch (error) {
      this.logger.error(
        `Performance analysis failed: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Generate monthly recommendations on the last day of each month
   */
  @Cron('0 22 28-31 * *')
  async monthlyRecommendations() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Only run on last day of month
    if (tomorrow.getDate() !== 1) return;

    this.logger.log('Generating monthly recommendations');

    try {
      const recommendations =
        await this.analyticsService.generateMonthlyRecommendations();
      this.logger.log(
        `Generated ${recommendations.recommendations?.length || 0} recommendations`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate recommendations: ${(error as Error).message}`,
      );
    }
  }
}
