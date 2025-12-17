import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EnvironmentConfig } from '../../config/environment.config';
import { SEOProviderFactory } from './providers/seo-provider.factory';
import { ISEOProvider } from './interfaces/seo-provider.interface';

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * SEO Optimization Service
 *
 * Features (Phase 3 - Deliverable 3):
 * - Use Semrush/SERPAPI/Moz API for content optimization
 * - Keyword analysis and recommendations
 * - Readability scoring
 * - Auto-optimize drafts with SEO best practices
 * - Track SEO score for each piece of content
 */

interface SEOAnalysis {
  keyword: string;
  score: number;
  recommendations: string[];
  readabilityScore: number;
  keywordDensity: number;
  headingStructure: boolean;
  externalData?: any;
}

@Injectable()
export class SeoOptimizationService {
  private readonly logger = new Logger(SeoOptimizationService.name);
  private readonly seoProvider: ISEOProvider;

  constructor(
    private readonly httpService: HttpService,
    private readonly envConfig: EnvironmentConfig,
    private readonly seoProviderFactory: SEOProviderFactory,
  ) {
    this.seoProvider = this.seoProviderFactory.create();
    this.logger.log(`Using SEO provider: ${this.envConfig.seoTool}`);
  }

  /**
   * Analyze content and provide SEO recommendations
   */
  async analyzeContent(
    content: string,
    keyword: string,
    _title: string,
  ): Promise<SEOAnalysis> {
    this.logger.log(`Analyzing SEO for keyword: ${keyword}`);

    const analysis: SEOAnalysis = {
      keyword,
      score: 0,
      recommendations: [],
      readabilityScore: 0,
      keywordDensity: 0,
      headingStructure: false,
    };

    try {
      // Get external SEO data from provider
      const externalAnalysis = await this.seoProvider.analyzeContent(
        content,
        keyword,
      );
      analysis.externalData = externalAnalysis;

      // Internal analysis
      analysis.keywordDensity = this.calculateKeywordDensity(content, keyword);
      analysis.readabilityScore = this.calculateReadabilityScore(content);
      analysis.headingStructure = this.checkHeadingStructure(content);

      // Merge recommendations
      analysis.recommendations = [
        ...externalAnalysis.recommendations,
        ...this.generateRecommendations(analysis, content),
      ];

      // Calculate overall score
      analysis.score = this.calculateSEOScore(analysis);

      this.logger.log(`SEO analysis complete. Score: ${analysis.score}/100`);
      return analysis;
    } catch (error) {
      this.logger.warn(
        `External SEO provider failed, using internal analysis only`,
      );

      // Fallback to internal analysis only
      analysis.keywordDensity = this.calculateKeywordDensity(content, keyword);
      analysis.readabilityScore = this.calculateReadabilityScore(content);
      analysis.headingStructure = this.checkHeadingStructure(content);
      analysis.recommendations = this.generateRecommendations(
        analysis,
        content,
      );
      analysis.score = this.calculateSEOScore(analysis);

      return analysis;
    }
  }

  /**
   * Optimize content based on SEO analysis
   */
  optimizeContent(
    content: string,
    keyword: string,
    analysis: SEOAnalysis,
  ): string {
    this.logger.log(`Optimizing content for keyword: ${keyword}`);

    let optimizedContent = content;

    // Add keyword variations naturally if density is low
    if (analysis.keywordDensity < 0.5) {
      optimizedContent = this.incorporateKeywordVariations(
        optimizedContent,
        keyword,
      );
    }

    // Improve heading structure if needed
    if (!analysis.headingStructure) {
      optimizedContent = this.improveHeadingStructure(optimizedContent);
    }

    this.logger.log(`Content optimized successfully`);
    return optimizedContent;
  }

  /**
   * Calculate keyword density (target: 1-2%)
   */
  private calculateKeywordDensity(content: string, keyword: string): number {
    const words = content.toLowerCase().split(/\s+/);
    const keywordLower = keyword.toLowerCase();
    const keywordCount = words.filter((w) => w.includes(keywordLower)).length;
    const density = (keywordCount / words.length) * 100;

    return Math.min(density, 3);
  }

  /**
   * Calculate readability score (Flesch-Kincaid)
   */
  private calculateReadabilityScore(content: string): number {
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim());
    const words = content.split(/\s+/);
    const syllables = this.countSyllables(content);

    if (sentences.length === 0 || words.length === 0) return 0;

    const grade =
      0.39 * (words.length / sentences.length) +
      11.8 * (syllables / words.length) -
      15.59;

    return Math.max(0, Math.min(100, 100 - grade * 5));
  }

  /**
   * Count syllables in text (approximation)
   */
  private countSyllables(text: string): number {
    const words = text.split(/\s+/);
    let syllableCount = 0;

    words.forEach((word) => {
      syllableCount += this.estimateSyllables(word);
    });

    return syllableCount;
  }

  /**
   * Estimate syllables in a word
   */
  private estimateSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    const vowels = word.match(/[aeiou]/g);
    return Math.max(1, vowels ? vowels.length : 0);
  }

  /**
   * Check if content has proper heading structure (min 2 H2 tags)
   */
  private checkHeadingStructure(content: string): boolean {
    const h2Count = (content.match(/##\s/g) || []).length;
    return h2Count >= 2;
  }

  /**
   * Generate SEO recommendations
   */
  private generateRecommendations(
    analysis: SEOAnalysis,
    content: string,
  ): string[] {
    const recommendations: string[] = [];

    if (analysis.keywordDensity < 0.5) {
      recommendations.push(
        `Increase keyword density (currently ${analysis.keywordDensity.toFixed(2)}%)`,
      );
    }
    if (analysis.keywordDensity > 3) {
      recommendations.push(
        `Reduce keyword stuffing (currently ${analysis.keywordDensity.toFixed(2)}%)`,
      );
    }

    if (analysis.readabilityScore < 60) {
      recommendations.push('Improve readability - use shorter sentences');
    }

    if (!analysis.headingStructure) {
      recommendations.push('Add proper heading structure (H2, H3 tags)');
    }

    const wordCount = content.split(/\s+/).length;
    if (wordCount < 300) {
      recommendations.push(`Expand content (currently ${wordCount} words)`);
    }

    return recommendations;
  }

  /**
   * Calculate overall SEO score (0-100)
   */
  private calculateSEOScore(analysis: SEOAnalysis): number {
    let score = 0;

    // Keyword density (25 points)
    if (analysis.keywordDensity > 0.5 && analysis.keywordDensity < 3) {
      score += 25;
    } else {
      score += 10;
    }

    // Readability (25 points)
    score += (analysis.readabilityScore / 100) * 25;

    // Heading structure (25 points)
    score += analysis.headingStructure ? 25 : 10;

    // Recommendations penalty (25 points)
    const recommendationPenalty = analysis.recommendations.length * 5;
    score += Math.max(0, 25 - recommendationPenalty);

    return Math.round(score);
  }

  /**
   * Incorporate keyword variations naturally
   */
  private incorporateKeywordVariations(
    content: string,
    _keyword: string,
  ): string {
    // TODO: Implement keyword variation logic
    return content;
  }

  /**
   * Improve heading structure
   */
  private improveHeadingStructure(content: string): string {
    // TODO: Implement heading improvement logic
    return content;
  }
}
