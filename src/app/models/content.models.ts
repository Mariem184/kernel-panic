export type ContentStatus = 'draft' | 'published';

export interface LocalizedText {
  ar: string;
  en: string;
}

export interface PagedResult<T> {
  totalCount: number;
  skip?: number | null;
  limit?: number | null;
  items: T[];
}

/* ───────────── News ───────────── */

export interface NewsItem {
  id: number;
  title: LocalizedText;
  titleAr: string;
  titleEn: string;
  slug: string;
  excerpt: LocalizedText;
  excerptAr: string;
  excerptEn: string;
  mainImageUrl: string;
  category: LocalizedText;
  categoryAr: string;
  categoryEn: string;
  authorName: LocalizedText;
  authorNameAr: string;
  authorNameEn: string;
  readingTimeMinutes: number;
  publishedAt: string;
  status: ContentStatus;
  isFeatured: boolean;
  createdAt: string;
}

export interface NewsDetail extends NewsItem {
  contentHtml: LocalizedText;
  contentArHtml: string;
  contentEnHtml: string;
  externalUrl: string | null;
  authorId: number | null;
  updatedAt: string;
}

/** Body for POST /news (every string must be sent, "" is fine). */
export interface NewsCreatePayload {
  titleAr: string;
  titleEn: string;
  slug: string;
  contentArHtml: string;
  contentEnHtml: string;
  excerptAr: string;
  excerptEn: string;
  mainImageUrl: string;
  categoryAr: string;
  categoryEn: string;
  authorNameAr: string;
  authorNameEn: string;
  readingTimeMinutes: number;
  externalUrl: string;
  publishedAt?: string;
  status: ContentStatus;
  isFeatured: boolean;
}

/** Body for PUT /news/{id}: same shape, the server only applies non-null fields. */
export type NewsUpdatePayload = Partial<NewsCreatePayload>;

/* ───────────── Projects ───────────── */

export interface KeyFeature {
  icon: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

/** A team member as listed on ONE project — embedded, not a reference to a shared
 *  directory. Each project has its own independent list. */
export interface ProjectTeamMember {
  nameAr: string;
  nameEn: string;
  avatarUrl: string;
  jobTitleAr: string;
  jobTitleEn: string;
}

export interface ExecutionStep {
  order: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface ProjectResult {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface TeamMember {
  id: number;
  name: LocalizedText;
  nameAr: string;
  nameEn: string;
  avatarUrl: string;
  jobTitle: LocalizedText;
  isActive: boolean;
}

export interface TeamMemberCreatePayload {
  nameAr: string;
  nameEn: string;
  avatarUrl: string;
  jobTitleAr: string;
  jobTitleEn: string;
}

export interface ProjectItem {
  id: number;
  name: LocalizedText;
  nameAr: string;
  nameEn: string;
  slug: string;
  shortDescription: LocalizedText;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  categories: string[];
  mainImageUrl: string;
  technologies: string[];
  type: LocalizedText;
  typeAr: string;
  typeEn: string;
  role: LocalizedText;
  roleAr: string;
  roleEn: string;
  client: LocalizedText;
  clientAr: string;
  clientEn: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends ProjectItem {
  detailedDescription: LocalizedText;
  detailedDescriptionAr: string;
  detailedDescriptionEn: string;
  additionalImageUrls: string[];
  teamMembers: ProjectTeamMember[];
  frontendTech: string[];
  backendTech: string[];
  duration: LocalizedText;
  durationAr: string;
  durationEn: string;
  sourceCodeUrl: string | null;
  videoUrl: string | null;
  painPointsAr: string[];
  painPointsEn: string[];
  keyFeatures: KeyFeature[];
  executionSteps: ExecutionStep[];
  results: ProjectResult[];
}

export interface ProjectCreatePayload {
  nameAr: string;
  nameEn: string;
  slug: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  detailedDescriptionAr: string;
  detailedDescriptionEn: string;
  categories: string[];
  mainImageUrl: string;
  additionalImageUrls: string[];
  teamMembers: ProjectTeamMember[];
  technologies: string[];
  typeAr: string;
  typeEn: string;
  roleAr: string;
  roleEn: string;
  frontendTech: string[];
  backendTech: string[];
  durationAr: string;
  durationEn: string;
  clientAr: string;
  clientEn: string;
  sourceCodeUrl: string;
  videoUrl: string;
  painPointsAr: string[];
  painPointsEn: string[];
  keyFeatures: KeyFeature[];
  executionSteps: ExecutionStep[];
  results: ProjectResult[];
  status: ContentStatus;
}

export type ProjectUpdatePayload = Partial<ProjectCreatePayload>;
