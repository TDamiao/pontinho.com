
export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export const generateShareUrl = (couponId: string, medium: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/cupom/${couponId}?utm_source=share&utm_medium=${medium}&utm_campaign=coupon_share`;
};

export const getShareUrls = (couponId: string, text: string) => {
  const url = generateShareUrl(couponId, 'social');
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  return {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };
};
