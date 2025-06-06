
import React from 'react';
import { TrendingUp, ThumbsUp, Tag } from 'lucide-react';

interface StatsSectionProps {
  totalCoupons: number;
  totalUpvotes: number;
}

const StatsSection: React.FC<StatsSectionProps> = ({ totalCoupons, totalUpvotes }) => {
  return (
    <section className="py-8 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalCoupons}</p>
              <p className="text-gray-600">Cupons Ativos</p>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <ThumbsUp className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalUpvotes}</p>
              <p className="text-gray-600">Votos Positivos</p>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Tag className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-800">100%</p>
              <p className="text-gray-600">Democrático</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
