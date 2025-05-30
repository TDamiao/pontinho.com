import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Flag, ExternalLink, Calendar, Copy, Award } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CouponProps {
  coupon: {
    id: string; // Mudado de number para string (UUID)
    store: string;
    code: string;
    description: string;
    discount: string;
    category: string;
    expiryDate: string;
    upvotes: number;
    downvotes: number;
    link: string;
    submittedAt: string;
    isActive: boolean;
  };
  onVote: (couponId: string, type: 'up' | 'down') => void; // Mudado de number para string
  onReport?: () => void;
  rank: number;
}

const CouponCard = ({ coupon, onVote, onReport, rank }: CouponProps) => {
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    fetchReportCount();
  }, [coupon.id]);

  const fetchReportCount = async () => {
    try {
      const { count, error } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id);

      if (error) {
        console.error('Erro ao buscar reports:', error);
        return;
      }

      setReportCount(count || 0);
    } catch (error) {
      console.error('Erro ao buscar reports:', error);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    toast.success('Código copiado para a área de transferência!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const isExpiringSoon = () => {
    const today = new Date();
    const expiry = new Date(coupon.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const voteRatio = coupon.upvotes + coupon.downvotes > 0 
    ? (coupon.upvotes / (coupon.upvotes + coupon.downvotes)) * 100 
    : 0;

  const getRiskLevel = () => {
    if (reportCount >= 10) return 'high';
    if (reportCount >= 5) return 'medium';
    if (reportCount >= 1) return 'low';
    return 'none';
  };

  const getRiskColor = () => {
    const risk = getRiskLevel();
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-400 hover:text-red-500';
    }
  };

  return (
    <Card className={`relative transition-all duration-300 hover:shadow-lg hover:scale-105 ${
      !coupon.isActive ? 'opacity-50 grayscale' : ''
    } ${rank <= 3 ? 'ring-2 ring-yellow-400' : ''}`}>
      {/* Ranking Badge */}
      {rank <= 3 && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            {rank === 1 && <Award className="w-4 h-4" />}
            {rank > 1 && rank}
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800 mb-1">{coupon.store}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{coupon.description}</p>
          </div>
          <Badge 
            variant="secondary" 
            className="ml-2 bg-green-100 text-green-800 font-bold"
          >
            {coupon.discount}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Código do Cupom */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Código do cupom:</p>
              <p className="font-mono font-bold text-lg text-gray-800">{coupon.code}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="hover:bg-gray-100"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Informações */}
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">{coupon.category}</Badge>
          <div className="flex items-center text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            <span className={isExpiringSoon() ? 'text-red-500 font-semibold' : ''}>
              Expira: {formatDate(coupon.expiryDate)}
            </span>
          </div>
        </div>

        {/* Barra de aprovação */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Aprovação da comunidade</span>
            <span>{Math.round(voteRatio)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${voteRatio}%` }}
            ></div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVote(coupon.id, 'up')}
              className="flex items-center space-x-1 hover:bg-green-50 hover:border-green-300"
              disabled={!coupon.isActive}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{coupon.upvotes}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVote(coupon.id, 'down')}
              className="flex items-center space-x-1 hover:bg-red-50 hover:border-red-300"
              disabled={!coupon.isActive}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{coupon.downvotes}</span>
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className={`relative ${getRiskColor()}`}
                onClick={onReport}
                disabled={!coupon.isActive}
              >
                <Flag className="w-4 h-4" />
                {reportCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                    {reportCount}
                  </span>
                )}
              </Button>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open(coupon.link, '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Usar
            </Button>
          </div>
        </div>

        {!coupon.isActive && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
            <p className="text-red-700 text-xs font-medium">
              ⚠️ Cupom desativado automaticamente por receber muitos votos negativos
            </p>
          </div>
        )}

        {reportCount >= 5 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mt-2">
            <p className="text-orange-700 text-xs font-medium">
              ⚠️ Este cupom recebeu {reportCount} reports. Use com cautela.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CouponCard;
