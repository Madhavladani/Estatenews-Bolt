import type { City, Project, Collection, News } from './types';

const SITE_URL = 'https://propdiscover.com';
const SITE_NAME = 'PropDiscover';

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
  const url = `${SITE_URL}${path}`;
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
    '@type': 'Residence' === project.project_type ? 'Residence' : 'CommercialBuilding',
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
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: collection.title,
    description: collection.intro_content,
  };
}

export function buildNewsArticleSchema(article: News) {
  const url = `${SITE_URL}${article.canonical_path || `/news/${article.slug}`}`;
  const image = article.og_image || article.featured_image || `${SITE_URL}/og-default.jpg`;
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.meta_title || article.title,
    name: article.title,
    description: article.meta_description || article.excerpt,
    image: [image],
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: article.author_name ? [{ '@type': 'Person', name: article.author_name }] : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
  };
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
