import type { City, Project, Collection, Blog } from './types';
import { SITE_URL, toSiteUrl } from './site-url';

const SITE_NAME = 'Home Nesto';

export function buildMetaTags({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}) {
  const url = toSiteUrl(path);
  const ogImage = image || `${SITE_URL}/og-default.jpg`;
  return {
    title,
    description,
    canonical: url,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      image: ogImage,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      image: ogImage,
    },
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildProjectSchema(project: Project, city: City) {
  return {
    '@context': 'https://schema.org',
    '@type': 'residential' === project.project_type ? 'Residence' : 'CommercialBuilding',
    name: project.title,
    description: project.short_description,
    image: project.featured_image,
    address: {
      '@type': 'PostalAddress',
      addressLocality: project.location,
      addressRegion: city.state,
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: project.latitude,
      longitude: project.longitude,
    },
    offers: {
      '@type': 'Offer',
      price: project.price_range,
      priceCurrency: 'INR',
      availability: project.project_status === 'ready-to-move' ? 'InStock' : 'PreOrder',
    },
  };
}

export function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function buildCitySchema(city: City) {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: city.name,
    description: city.overview,
    image: city.hero_image,
    address: {
      '@type': 'PostalAddress',
      addressRegion: city.state,
      addressCountry: 'IN',
    },
  };
}

export function buildCollectionSchema(collection: Collection) {
  const url = collection.canonical_url || toSiteUrl(`/collections/${collection.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: collection.title,
    description: collection.intro_content,
    url,
  };
}

export function buildBlogArticleSchema(article: Blog) {
  const url = toSiteUrl(article.canonical_path || `/blog/${article.slug}`);
  const image = article.og_image || article.featured_image || `${SITE_URL}/og-default.jpg`;
  const keywords = article.meta_keywords
    ? article.meta_keywords
    : article.tags?.join(', ') || undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.meta_title || article.title,
    name: article.title,
    description: article.meta_description || article.excerpt,
    image: {
      '@type': 'ImageObject',
      url: image,
      width: 1200,
      height: 630,
    },
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: article.author
      ? {
        '@type': 'Person',
        name: article.author.full_name,
        url: toSiteUrl(`/author/${article.author.slug}`),
        image: article.author.photo_url,
        jobTitle: article.author.company_role,
      }
        : article.author_name
          ? { '@type': 'Person', name: article.author_name, url: toSiteUrl('/blog') }
          : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: keywords,
    articleSection: 'Real Estate Blog',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.prose p'],
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      sameAs: [
        'https://www.facebook.com/homenesto',
        'https://www.linkedin.com/company/home-nesto/',
        'https://x.com/homenesto',
        'https://www.instagram.com/home_nesto',
      ],
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
  };
}

// ─── Content Utilities ───────────────────────────────────────────────────────

/** Strip HTML tags and count words to estimate read time in minutes */
export function calculateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/** Extract FAQ pairs from HTML content that follows ## FAQs / ### Question / Answer structure */
export function extractFAQs(html: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  // Match FAQ section: look for h2 "FAQs" or "FAQ" then h3 headings
  const faqSectionMatch = html.match(/<h2[^>]*>[\s]*FAQ[s]?[\s]*<\/h2>([\s\S]*?)(?:<h2|$)/i);
  if (!faqSectionMatch) return faqs;
  const faqSection = faqSectionMatch[1];
  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = h3Regex.exec(faqSection)) !== null) {
    const question = match[1].replace(/<[^>]*>/g, '').trim();
    const answerHtml = match[2].trim();
    const answer = answerHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

/** Parse h2/h3 headings from HTML and return TOC entries with slugified ids */
export function extractTOC(
  html: string
): { id: string; text: string; level: 2 | 3 }[] {
  const toc: { id: string; text: string; level: 2 | 3 }[] = [];
  const headingRegex = /<(h2|h3)[^>]*(?:id="([^"]*)")?[^>]*>([\s\S]*?)<\/(h2|h3)>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase() as 'h2' | 'h3';
    const existingId = match[2];
    const rawText = match[3].replace(/<[^>]*>/g, '').trim();
    const id =
      existingId ||
      rawText
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);
    if (rawText) toc.push({ id, text: rawText, level: tag === 'h2' ? 2 : 3 });
  }
  return toc;
}

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    'new-launch': 'New Launch',
    'under-construction': 'Under Construction',
    'ready-to-move': 'Ready to Move',
  };
  return map[status] || status;
}

export function formatProjectType(type: string): string {
  return type === 'residential' ? 'Residential' : 'Commercial';
}

export function generateProjectDescription(project: Project, city: City): string {
  const status = formatStatus(project.project_status);
  const type = formatProjectType(project.project_type);
  const amenities = project.amenities.slice(0, 3).join(', ');
  return `${project.title} by ${project.builder_name} is a ${status.toLowerCase()} ${type.toLowerCase()} project in ${project.location}, ${city.name}. Offering ${project.price_range} with amenities like ${amenities}. ${project.short_description}`;
}

export function generateCityFAQs(city: City): { question: string; answer: string }[] {
  return [
    {
      question: `What are the best residential projects in ${city.name}?`,
      answer: `${city.name} offers several premium residential projects across top localities. Explore our curated list of the best residential properties with modern amenities and excellent connectivity.`,
    },
    {
      question: `What is the average property price in ${city.name}?`,
      answer: `Property prices in ${city.name} vary by locality and project type. Residential apartments range from affordable to luxury segments. Check our project listings for detailed pricing information.`,
    },
    {
      question: `Which are the top localities for real estate investment in ${city.name}?`,
      answer: `${city.name} has several emerging and established localities ideal for real estate investment. Areas with good infrastructure, connectivity, and social amenities tend to offer the best returns.`,
    },
    {
      question: `Is ${city.name} a good city for real estate investment?`,
      answer: `Yes, ${city.name} in ${city.state} is a promising real estate destination with growing infrastructure, expanding metro connectivity, and increasing demand for both residential and commercial properties.`,
    },
  ];
}

export function generateProjectFAQs(project: Project, city: City): { question: string; answer: string }[] {
  return [
    {
      question: `What is the price range of ${project.title}?`,
      answer: `${project.title} by ${project.builder_name} offers units in the price range of ${project.price_range}. Prices vary based on unit size and configuration.`,
    },
    {
      question: `Where is ${project.title} located?`,
      answer: `${project.title} is located in ${project.location}, ${city.name}, ${city.state}. The project enjoys excellent connectivity to major landmarks and business hubs.`,
    },
    {
      question: `What amenities does ${project.title} offer?`,
      answer: `${project.title} offers ${project.amenities.join(', ')} and more. The project is designed to provide a premium lifestyle with world-class facilities.`,
    },
    {
      question: `What is the possession date of ${project.title}?`,
      answer: `${project.title} is expected to be ready for possession by ${project.possession_date}. The project is currently ${formatStatus(project.project_status).toLowerCase()}.`,
    },
    {
      question: `Is ${project.title} RERA registered?`,
      answer: project.rera_number
        ? `Yes, ${project.title} is RERA registered with registration number ${project.rera_number}.`
        : `Please check with the developer for RERA registration details of ${project.title}.`,
    },
  ];
}

export const ITEMS_PER_PAGE = 12;
