import { Injectable, Logger } from '@nestjs/common';
import { Anthropic } from '@anthropic-ai/sdk';
import { EnvironmentConfig } from '../../config/environment.config';
import { ERPNextService } from '../erpnext/erpnext.service';

/**
 * AI Content Generation Service
 *
 * Features (Phase 3 - Deliverable 2):
 * - Generate first drafts using Claude API
 * - Create platform-specific posts (LinkedIn, Facebook, Instagram, Threads)
 * - Optimize content for each platform's audience and format
 * - Save drafts to ERPNext with proper status tracking
 */

interface ContentPrompt {
  keyword: string;
  platform: 'blog' | 'linkedin' | 'facebook' | 'instagram';
  title: string;
  contentType: string;
}

@Injectable()
export class AiGenerationService {
  private readonly logger = new Logger(AiGenerationService.name);
  private client: Anthropic;

  constructor(
    private readonly envConfig: EnvironmentConfig,
    private readonly erpnextService: ERPNextService,
  ) {
    // Initialize Claude API client
    const apiKey = this.envConfig.claudeApiKey;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  /**
   * Generate AI content for a specific topic and platform
   */
  async generateContent(prompt: ContentPrompt): Promise<string> {
    this.logger.log(
      `Generating ${prompt.platform} content for: ${prompt.title}`,
    );

    const systemPrompt = this.buildSystemPrompt(
      prompt.platform,
      prompt.contentType,
    );
    const userPrompt = this.buildUserPrompt(prompt);

    const message = await this.client.messages.create({
      model: this.envConfig.llmModel,
      max_tokens: this.getMaxTokens(prompt.platform),
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    this.logger.log(`Content generated successfully for: ${prompt.title}`);
    return content.text;
  }

  /**
   * Generate platform-specific variants from blog content
   * Creates LinkedIn, Facebook, and Instagram posts from base content
   */
  async generatePlatformVariants(
    baseContent: string,
    keyword: string,
  ): Promise<Map<string, string>> {
    this.logger.log(`Generating platform variants for keyword: ${keyword}`);

    const variants = new Map<string, string>();

    // LinkedIn Post (Professional, longer format)
    variants.set('linkedin', await this.generateLinkedInVariant(baseContent));

    // Facebook Post (Engaging, moderate length)
    variants.set('facebook', await this.generateFacebookVariant(baseContent));

    // Instagram Caption (Short, hashtag-heavy)
    variants.set('instagram', await this.generateInstagramVariant(baseContent));

    return variants;
  }

  /**
   * Generate LinkedIn-specific content (professional tone, industry insights)
   */
  private async generateLinkedInVariant(baseContent: string): Promise<string> {
    const message = await this.client.messages.create({
      model: this.envConfig.llmModel,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Convert this content into a professional LinkedIn post. 
          Include a compelling hook, valuable insights, and relevant hashtags.
          Keep it under 1300 characters.
          
          Content: ${baseContent.substring(0, 1000)}...`,
        },
      ],
    });

    const content = message.content[0];
    return content.type === 'text' ? content.text : baseContent;
  }

  /**
   * Generate Facebook-specific content (engaging, conversational with emojis)
   */
  private async generateFacebookVariant(baseContent: string): Promise<string> {
    const message = await this.client.messages.create({
      model: this.envConfig.llmModel,
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `Convert this into an engaging Facebook post. 
          Use emojis, make it conversational, and ask a question to encourage engagement.
          Keep it under 800 characters.
          
          Content: ${baseContent.substring(0, 800)}...`,
        },
      ],
    });

    const content = message.content[0];
    return content.type === 'text' ? content.text : baseContent;
  }

  /**
   * Generate Instagram-specific content (short, visual, hashtag-rich)
   */
  private async generateInstagramVariant(baseContent: string): Promise<string> {
    const message = await this.client.messages.create({
      model: this.envConfig.llmModel,
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Convert this into a short Instagram caption. 
          Max 150 characters for hook, then add relevant hashtags and emojis.
          
          Content: ${baseContent.substring(0, 500)}...`,
        },
      ],
    });

    const content = message.content[0];
    return content.type === 'text' ? content.text : baseContent;
  }

  /**
   * Build system prompt based on platform and content type
   */
  private buildSystemPrompt(platform: string, contentType: string): string {
    return `You are an expert content writer specializing in ${contentType} for ${platform}.

Your writing should be:
- Clear, engaging, and value-focused
- SEO-optimized with natural keyword placement
- Platform-appropriate in tone and length
- Actionable with clear takeaways
- Professional yet conversational

Adapt your style to the platform while maintaining brand voice consistency.`;
  }

  /**
   * Build user prompt with content details
   */
  private buildUserPrompt(prompt: ContentPrompt): string {
    return `Write a ${prompt.contentType.toLowerCase()} for ${prompt.platform} about "${prompt.keyword}".

Title: ${prompt.title}
Target keyword: ${prompt.keyword}
Platform: ${prompt.platform}

Create original, engaging content optimized for this platform.`;
  }

  /**
   * Get max tokens based on platform (blog longest, Instagram shortest)
   */
  private getMaxTokens(platform: string): number {
    const tokens: Record<string, number> = {
      blog: 2000,
      linkedin: 800,
      facebook: 600,
      instagram: 300,
    };
    return tokens[platform] || 800;
  }

  /**
   * Save generated content to ERPNext as draft
   */
  async saveContentToDraft(
    title: string,
    content: string,
    keyword: string,
    platform: string,
  ): Promise<void> {
    await this.erpnextService.createDocument('Blog Post', {
      title,
      content,
      content_keywords: keyword,
      platform,
      status: 'Draft',
      docstatus: 0,
      created_on: new Date().toISOString(),
    });

    this.logger.log(`Content saved as draft: ${title}`);
  }
}
