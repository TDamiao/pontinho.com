
import React from 'react';

const PontinhoLogo = ({ size = 'md', showText = true }: { size?: 'sm' | 'md' | 'lg', showText?: boolean }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Círculo principal com gradiente vibrante */}
        <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full shadow-lg flex items-center justify-center relative overflow-hidden">
          {/* Brilho interno */}
          <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
          
          {/* Ponto central brilhante */}
          <div className="w-2/5 h-2/5 bg-white rounded-full shadow-inner flex items-center justify-center relative z-10">
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full animate-pulse"></div>
          </div>
          
          {/* Efeito de rotação */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform rotate-45 animate-spin-slow"></div>
        </div>
        
        {/* Sombra externa colorida */}
        <div className="absolute -inset-1 bg-gradient-to-br from-purple-400/30 via-pink-400/30 to-red-400/30 rounded-full blur-sm -z-10"></div>
      </div>
      
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${textSizes[size]}`}>
          Pontinho
        </span>
      )}
    </div>
  );
};

export default PontinhoLogo;
