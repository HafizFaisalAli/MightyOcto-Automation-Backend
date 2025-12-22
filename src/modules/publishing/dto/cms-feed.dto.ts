/**
 * CMS Feed DTOs for AnySync integration
 * AnySync pulls this data and syncs to Framer CMS
 */

export class BlogPostFeedItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  keywords?: string;
  status: 'draft' | 'published' | 'scheduled';
  seo_score?: number;
  engagement_score?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  platform?: string;
}

export class CmsFragmentsDto {
  posts: BlogPostFeedItem[];
  total: number;
  limit: number;
  offset: number;
  last_sync: string;
}
