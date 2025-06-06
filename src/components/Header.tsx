
import React from 'react';
import { Github, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-4">
      <div className="flex items-center justify-between">
        {/* Espaço vazio onde estava a logo */}
        <div></div>
        
        {/* Botões do lado direito */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://link.mercadopago.com.br/pontinhopontocom', '_blank')}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Doe</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://github.com/TDamiao/Pontinho', '_blank')}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
          >
            <Github className="w-4 h-4" />
            <span>Colaborar</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;