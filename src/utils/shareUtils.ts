
import { generateSeoFriendlyUrl } from './seoUtils';

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export const generateShareUrl = (coupon: {
  id: string;
  store: string;
  discount: string;
  code: string;
}, medium: string): string => {
  const baseUrl = window.location.origin;
  const pathPrefix = window.location.pathname.includes('/cupom/') 
    ? window.location.pathname.split('/cupom/')[0] 
    : '';
  
  const seoUrl = generateSeoFriendlyUrl(coupon);
  return `${baseUrl}${pathPrefix}${seoUrl}?utm_source=share&utm_medium=${medium}&utm_campaign=coupon_share`;
};

export const getShareUrls = (coupon: {
  id: string;
  store: string;
  discount: string;
  code: string;
}, text: string) => {
  const url = generateShareUrl(coupon, 'social');
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  return {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };
};