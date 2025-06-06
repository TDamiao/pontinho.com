
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface StoreAvatarProps {
  storeName: string;
  size?: 'sm' | 'md';
}

const StoreAvatar = ({ storeName, size = 'sm' }: StoreAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Tentar extrair domínio do nome da loja ou usar o nome diretamente
  const getDomain = (store: string) => {
    const cleanStore = store.toLowerCase().replace(/\s+/g, '');
    // Mapeamento comum de lojas para domínios
    const domainMap: { [key: string]: string } = {
      'ifood': 'ifood.com.br',
      'uber': 'uber.com',
      'ubereats': 'uber.com',
      '99': '99app.com',
      'rappi': 'rappi.com.br',
      'magazine': 'magazineluiza.com.br',
      'magazineluiza': 'magazineluiza.com.br',
      'americanas': 'americanas.com.br',
      'submarino': 'submarino.com.br',
      'casasbahia': 'casasbahia.com.br',
      'extra': 'extra.com.br',
      'carrefour': 'carrefour.com.br',
      'amazon': 'amazon.com.br',
      'netshoes': 'netshoes.com.br',
      'centauro': 'centauro.com.br',
      'zara': 'zara.com',
      'hm': 'hm.com',
      'nike': 'nike.com.br',
      'adidas': 'adidas.com.br'
    };
    
    return domainMap[cleanStore] || `${cleanStore}.com.br`;
  };

  const domain = getDomain(storeName);
  const logoUrl = `https://logo.clearbit.com/${domain}`;
  const firstLetter = storeName.charAt(0).toUpperCase();
  
  const sizeClass = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';

  return (
    <Avatar className={sizeClass}>
      {!imageError && (
        <AvatarImage 
          src={logoUrl} 
          alt={`${storeName} logo`}
          onError={() => setImageError(true)}
        />
      )}
      <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-medium">
        {firstLetter}
      </AvatarFallback>
    </Avatar>
  );
};

export default StoreAvatar;
