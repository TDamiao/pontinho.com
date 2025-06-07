
export const generateSeoFriendlyUrl = (coupon: {
  id: string;
  store: string;
  discount: string;
  code: string;
}) => {
  const storeName = coupon.store
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
    
  const discount = coupon.discount
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special chars and spaces
    .replace(/off/g, '')
    .replace(/desconto/g, '');
    
  return `/cupom/${coupon.id}/${storeName}-${discount}-${coupon.code.toLowerCase()}`;
};

export const extractCouponIdFromUrl = (pathname: string): string | null => {
  // Handle both old format (/cupom/:id) and new SEO format (/cupom/:id/:seo-slug)
  const matches = pathname.match(/\/cupom\/([a-f0-9-]{36})/);
  return matches ? matches[1] : null;
};

export const generateMetaTags = (coupon: {
  store: string;
  code: string;
  discount: string;
  description: string;
}) => {
  const title = `Cupom ${coupon.code} - ${coupon.discount} OFF no ${coupon.store} | Pontinho.com`;
  const description = `${coupon.description} - Cupom validado pela comunidade no Pontinho.com`;
  
  return {
    title,
    description,
    keywords: `cupom ${coupon.store}, desconto ${coupon.store}, ${coupon.code}, ofertas ${coupon.store}`
  };
};