import { NewsDetail, NewsItem, ProjectDetail, ProjectItem, ProjectTeamMember } from '../models/content.models';

/** Minimal-but-valid JWT (unsigned) whose `exp` is `secondsFromNow` away. */
export function fakeJwt(secondsFromNow: number): string {
  const enc = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc({ exp: Math.floor(Date.now() / 1000) + secondsFromNow })}.sig`;
}

export function mkNews(id: number, title: string, status: 'published' | 'draft' = 'published'): NewsItem {
  const l = (ar: string, en: string) => ({ ar, en });
  return {
    id, slug: title.toLowerCase().replace(/\s+/g, '-'),
    title: l(title + ' AR', title), titleAr: title + ' AR', titleEn: title,
    excerpt: l('', 'Excerpt of ' + title), excerptAr: '', excerptEn: 'Excerpt of ' + title,
    mainImageUrl: '', category: l('', 'Security'), categoryAr: '', categoryEn: 'Security',
    authorName: l('', ''), authorNameAr: '', authorNameEn: '',
    readingTimeMinutes: 5, publishedAt: '2026-09-13T20:57:12', status, isFeatured: false,
    createdAt: '2026-09-13T20:57:12'
  };
}

export function mkNewsDetail(id: number, title: string): NewsDetail {
  return {
    ...mkNews(id, title),
    contentHtml: { ar: '', en: '<p>Body</p>' }, contentArHtml: '', contentEnHtml: '<p>Body</p>',
    externalUrl: null, authorId: 1, updatedAt: '2026-09-13T20:57:12'
  };
}

export function mkProject(id: number, name: string, status: 'published' | 'draft' = 'published'): ProjectItem {
  const l = (ar: string, en: string) => ({ ar, en });
  return {
    id, slug: name.toLowerCase().replace(/\s+/g, '-'),
    name: l(name + ' AR', name), nameAr: name + ' AR', nameEn: name,
    shortDescription: l('', 'About ' + name), shortDescriptionAr: '', shortDescriptionEn: 'About ' + name,
    categories: ['web'], mainImageUrl: '', technologies: ['Angular', '.NET'],
    type: l('', 'Web App'), typeAr: '', typeEn: 'Web App',
    role: l('', ''), roleAr: '', roleEn: '', client: l('', 'ACME'), clientAr: '', clientEn: 'ACME',
    status, createdAt: '2026-09-13T20:57:12', updatedAt: '2026-09-13T20:57:12'
  };
}

export function mkTeam(name: string): ProjectTeamMember {
  return { nameAr: name, nameEn: name, avatarUrl: '', jobTitleAr: '', jobTitleEn: '' };
}

export function mkProjectDetail(id: number, name: string, teamCount = 0): ProjectDetail {
  return {
    ...mkProject(id, name),
    detailedDescription: { ar: '', en: 'Long text' }, detailedDescriptionAr: '', detailedDescriptionEn: 'Long text',
    additionalImageUrls: [], teamMembers: Array.from({ length: teamCount }, (_, i) => mkTeam('Member ' + (i + 1))),
    frontendTech: ['Angular'], backendTech: ['.NET'],
    duration: { ar: '', en: '' }, durationAr: '', durationEn: '', sourceCodeUrl: null, videoUrl: null,
    painPointsAr: [], painPointsEn: ['Slow'],
    keyFeatures: [{ icon: 'shield', titleAr: '', titleEn: 'Secure', descriptionAr: '', descriptionEn: 'Very' }],
    executionSteps: [{ order: 2, titleAr: '', titleEn: 'Build', descriptionAr: '', descriptionEn: '' },
                     { order: 1, titleAr: '', titleEn: 'Plan', descriptionAr: '', descriptionEn: '' }],
    results: []
  };
}
