import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublishingService } from './publishing.service';
import {
  PublishBlogDto,
  PublishLinkedInDto,
  PublishFacebookDto,
  PublishInstagramDto,
  PublishResponseDto,
} from './dto/publishing.dto';

@ApiTags('publishing')
@Controller('publish')
export class PublishingController {
  private readonly logger = new Logger(PublishingController.name);

  constructor(private readonly publishingService: PublishingService) {}

  @Post('blog')
  @ApiOperation({ summary: 'Publish blog post (Framer CMS / mock)' })
  publishBlog(@Body() dto: PublishBlogDto): Promise<PublishResponseDto> {
    this.logger.log(`API publish/blog called: ${dto.title}`);
    return this.publishingService.publishToBlog(dto);
  }

  @Post('linkedin')
  @ApiOperation({ summary: 'Publish a post to LinkedIn company page' })
  publishLinkedIn(
    @Body() dto: PublishLinkedInDto,
  ): Promise<PublishResponseDto> {
    this.logger.log(`API publish/linkedin called`);
    return this.publishingService.publishToLinkedIn(dto);
  }

  @Post('facebook')
  @ApiOperation({ summary: 'Publish a post to Facebook page' })
  publishFacebook(
    @Body() dto: PublishFacebookDto,
  ): Promise<PublishResponseDto> {
    this.logger.log(`API publish/facebook called`);
    return this.publishingService.publishToFacebook(dto);
  }

  @Post('instagram')
  @ApiOperation({ summary: 'Publish a post to Instagram (mock / placeholder)' })
  publishInstagram(
    @Body() dto: PublishInstagramDto,
  ): Promise<PublishResponseDto> {
    this.logger.log(`API publish/instagram called`);
    return this.publishingService.publishToInstagram(dto);
  }
}
