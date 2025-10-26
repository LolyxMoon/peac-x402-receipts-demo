import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://2larp402.vercel.app/';
  const lastMod = new Date();

  return [
    {
      url: `${base}/`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${base}/shop`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${base}/verify/offline`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.6
    }
  ];
}
