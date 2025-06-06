
import React from 'react';
import { Plus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CallToActionSectionProps {
  onAddCoupon: () => void;
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({ onAddCoupon }) => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Contribua com a Comunidade
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Ajude outros consumidores encontrando e validando os melhores cupons. 
          Sua participação faz a diferença no sistema democrático do Pontinho.com!
        </p>
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={onAddCoupon}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Novo Cupom
          </Button>
          
          <Button 
            onClick={() => window.open('https://link.mercadopago.com.br/pontinhopontocom', '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          >
            <Heart className="w-5 h-5 mr-2" />
            Apoiar o Projeto
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
