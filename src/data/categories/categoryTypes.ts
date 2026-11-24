import { CategoryId } from '../../types.ts';

export interface MainCategoryDefinition {
  id: CategoryId;
  slug: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  displayOrder: number;
  parentCategoryId?: CategoryId;
  subcategories?: string[];
  secondaryTags?: string[];
  isActive: boolean;
  isVisible: boolean;
}
