import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTOs for Publishing Service
 */

export class PublishBlogDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  slug?: string;

  @ApiPropertyOptional()
  author?: string;

  @ApiPropertyOptional({ type: [String] })
  tags?: string[];

  @ApiPropertyOptional()
  featured_image?: string;

  @ApiPropertyOptional()
  meta_description?: string;

  @ApiPropertyOptional()
  publishedDate?: Date;
}

export class PublishSocialDto {
  @ApiProperty()
  content: string;

  @ApiProperty({ enum: ['linkedin', 'facebook', 'instagram'] })
  platform: 'linkedin' | 'facebook' | 'instagram';

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  hashtags?: string[];

  @ApiPropertyOptional()
  scheduledTime?: Date;
}

export class PublishLinkedInDto {
  @ApiProperty()
  text: string;

  @ApiPropertyOptional({ enum: ['PUBLIC', 'CONNECTIONS'] })
  visibility?: 'PUBLIC' | 'CONNECTIONS';

  @ApiPropertyOptional({ type: [String] })
  imageUrls?: string[];

  @ApiPropertyOptional()
  articleUrl?: string;
}

export class PublishFacebookDto {
  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  link?: string;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  scheduledPublishTime?: number;
}

export class PublishInstagramDto {
  @ApiProperty()
  caption: string;

  @ApiProperty()
  imageUrl: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional({ type: [String] })
  userTags?: string[];
}

export class PublishResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  platform: string;

  @ApiPropertyOptional()
  postId?: string;

  @ApiPropertyOptional()
  postUrl?: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  publishedAt: Date;
}
