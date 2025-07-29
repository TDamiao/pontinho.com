import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords, canonical, image, jsonLd }) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    {keywords && <meta name="keywords" content={keywords} />}
    {canonical && <link rel="canonical" href={canonical} />}

    {/* Open Graph */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    {image && <meta property="og:image" content={image} />}
    {canonical && <meta property="og:url" content={canonical} />}

    {/* Twitter Card */}
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {image && <meta name="twitter:image" content={image} />}

    {jsonLd && (
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    )}
  </Helmet>
);

export default SEO;
