import { MAIN_CATEGORIES_REGISTRY } from './categoryRegistry.ts';
import { MainCategoryDefinition } from './categoryTypes.ts';
import { CALCULATORS } from '../calculators.ts';
import { CalculatorMeta, CategoryId } from '../../types.ts';

export function getAllCategories(): MainCategoryDefinition[] {
  return MAIN_CATEGORIES_REGISTRY.filter((c) => c.isActive && c.isVisible);
}

export function getCategoryById(id: CategoryId | string): MainCategoryDefinition | undefined {
  return MAIN_CATEGORIES_REGISTRY.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): MainCategoryDefinition | undefined {
  return MAIN_CATEGORIES_REGISTRY.find((c) => c.slug === slug);
}

export function getCategoryTools(categoryId: CategoryId | string): CalculatorMeta[] {
  return CALCULATORS.filter((calc) => calc.category === categoryId);
}

export function getCategoryToolCount(categoryId: CategoryId | string): number {
  return getCategoryTools(categoryId).length;
}

export function getSubcategories(categoryId: CategoryId | string): string[] {
  const cat = getCategoryById(categoryId);
  return cat?.subcategories || [];
}

export function getParentCategory(_categoryId: CategoryId | string): MainCategoryDefinition | undefined {
  return undefined; // Flat 20-category main architecture with optional subcategories
}

export function getRelatedCategories(categoryId: CategoryId | string): MainCategoryDefinition[] {
  const all = getAllCategories();
  return all.filter((c) => c.id !== categoryId).slice(0, 4);
}

export function getToolPrimaryCategory(toolId: string): MainCategoryDefinition | undefined {
  const calc = CALCULATORS.find((c) => c.id === toolId);
  if (!calc) return undefined;
  return getCategoryById(calc.category);
}

export function getToolSecondaryTags(toolId: string): string[] {
  const calc = CALCULATORS.find((c) => c.id === toolId);
  if (!calc) return [];
  return calc.tags || [];
}

export function searchCategories(query: string): MainCategoryDefinition[] {
  const q = query.toLowerCase().trim();
  if (!q) return getAllCategories();
  return MAIN_CATEGORIES_REGISTRY.filter(
    (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  );
}

export function filterToolsByCategory(categoryId: CategoryId | string, searchQuery: string = ''): CalculatorMeta[] {
  const tools = getCategoryTools(categoryId);
  const q = searchQuery.toLowerCase().trim();
  if (!q) return tools;
  return tools.filter(
    (t) => t.name.toLowerCase().includes(q) || t.shortDesc.toLowerCase().includes(q)
  );
}
