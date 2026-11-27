import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';

export interface SocialPostItem {
  id: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'LinkedIn' | 'Twitter/X' | 'Facebook';
  date: string;
  topic: string;
  contentType: 'Reel / Video' | 'Carousel' | 'Image' | 'Story' | 'Article';
  status: 'Idea' | 'Drafting' | 'Scheduled' | 'Published';
}

export interface SocialMediaInput {
  calendarName: string;
  posts: SocialPostItem[];
}

export interface SocialMediaResult {
  calendarName: string;
  totalPosts: number;
  publishedCount: number;
  scheduledCount: number;
  draftingCount: number;
  ideaCount: number;
  platformBreakdown: Record<string, number>;
}

export const DEFAULT_SOCIAL_POSTS: SocialPostItem[] = [
  { id: '1', platform: 'Instagram', date: '2025-12-01', topic: 'Product Launch Teaser Reel', contentType: 'Reel / Video', status: 'Scheduled' },
  { id: '2', platform: 'TikTok', date: '2025-12-02', topic: 'Behind the Scenes Making Of', contentType: 'Reel / Video', status: 'Drafting' },
  { id: '3', platform: 'LinkedIn', date: '2025-12-03', topic: 'Industry Growth Insights Carousel', contentType: 'Carousel', status: 'Idea' }
];

export function validateSocialMediaInput(input: SocialMediaInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.calendarName || input.calendarName.trim() === '') {
    errors.push({ field: 'calendarName', code: 'REQUIRED_FIELD_MISSING', message: 'Calendar name is required.' });
  }
  return errors;
}

export function calculateSocialMedia(input: SocialMediaInput): SocialMediaResult {
  const posts = input.posts || DEFAULT_SOCIAL_POSTS;
  let publishedCount = 0;
  let scheduledCount = 0;
  let draftingCount = 0;
  let ideaCount = 0;
  const platformBreakdown: Record<string, number> = {};

  for (const post of posts) {
    if (post.status === 'Published') publishedCount++;
    else if (post.status === 'Scheduled') scheduledCount++;
    else if (post.status === 'Drafting') draftingCount++;
    else if (post.status === 'Idea') ideaCount++;

    const plat = post.platform || 'Instagram';
    platformBreakdown[plat] = (platformBreakdown[plat] || 0) + 1;
  }

  return {
    calendarName: input.calendarName || 'Content Calendar',
    totalPosts: posts.length,
    publishedCount,
    scheduledCount,
    draftingCount,
    ideaCount,
    platformBreakdown
  };
}

export const SOCIAL_MEDIA_CONTENT_CALENDAR_CONTRACT: CalculationContract<any, any> = {
  id: 'social-media-content-calendar',
  name: 'Social Media Content Calendar',
  category: 'planners',
  validate: validateSocialMediaInput,
  calculate: calculateSocialMedia
} as CalculationContract<any, any>;
