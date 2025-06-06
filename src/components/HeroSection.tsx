
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/SearchBar';

interface HeroSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddCoupon: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onAddCoupon 
}) => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-4 animate-fade-in">
          Pontinho.com
        </h1>
        <p className="text-xl mb-4 opacity-90 animate-fade-in">
          A primeira plataforma de cupons 100% democrática do Brasil
        </p>
        <p className="text-lg mb-8 opacity-80 max-w-3xl mx-auto">
          Aqui, a comunidade decide quais cupons são realmente bons! 
          Vote, avalie e ajude outros consumidores a encontrar as melhores ofertas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
          <SearchBar 
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Busque por loja ou categoria..."
          />
          <Button 
            onClick={onAddCoupon}
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Cupom
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
