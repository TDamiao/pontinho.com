import React, { useState, useEffect } from 'react';
import { Search, Plus, ThumbsUp, ThumbsDown, Flag, ExternalLink, Calendar, Tag, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CouponSubmissionForm from '@/components/CouponSubmissionForm';
import CouponCard from '@/components/CouponCard';
import SearchBar from '@/components/SearchBar';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  store: string;
  code: string;
  description: string;
  discount: string;
  category: string;
  expiry_date: string;
  upvotes: number;
  downvotes: number;
  link: string;
  created_at: string;
  is_active: boolean;
}

const Index = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar cupons do Supabase
  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('upvotes', { ascending: false });

      if (error) {
        console.error('Erro ao buscar cupons:', error);
        toast.error('Erro ao carregar cupons');
        return;
      }

      setCoupons(data || []);
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
      toast.error('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar cupons baseado na busca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCoupons(coupons);
    } else {
      const filtered = coupons.filter(coupon => 
        coupon.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCoupons(filtered);
    }
  }, [searchTerm, coupons]);

  // Carregar cupons quando o componente montar
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Função para obter IP do usuário (simulado)
  const getUserIP = () => {
    // Em produção, você pode usar um serviço como ipify ou ipapi
    return `${Math.random().toString(36).substr(2, 9)}`;
  };

  // Votar em cupom com sistema de voto único
  const handleVote = async (couponId: string, type: 'up' | 'down') => {
    const userIP = getUserIP();

    try {
      // Verificar se o usuário já votou neste cupom
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('*')
        .eq('coupon_id', couponId)
        .eq('voter_ip', userIP)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar voto:', checkError);
        toast.error('Erro ao processar voto');
        return;
      }

      const currentCoupon = coupons.find(c => c.id === couponId);
      if (!currentCoupon) return;

      let newUpvotes = currentCoupon.upvotes;
      let newDownvotes = currentCoupon.downvotes;

      if (existingVote) {
        // Se já votou, verificar se está trocando o voto
        if (existingVote.vote_type === type) {
          toast.error('Você já votou neste cupom!');
          return;
        }

        // Trocar voto - atualizar contadores e o voto existente
        if (existingVote.vote_type === 'up' && type === 'down') {
          newUpvotes = currentCoupon.upvotes - 1;
          newDownvotes = currentCoupon.downvotes + 1;
        } else if (existingVote.vote_type === 'down' && type === 'up') {
          newUpvotes = currentCoupon.upvotes + 1;
          newDownvotes = currentCoupon.downvotes - 1;
        }

        // Atualizar voto existente
        const { error: updateVoteError } = await supabase
          .from('votes')
          .update({ vote_type: type })
          .eq('id', existingVote.id);

        if (updateVoteError) {
          console.error('Erro ao atualizar voto:', updateVoteError);
          toast.error('Erro ao atualizar voto');
          return;
        }

        toast.success('Voto alterado com sucesso!');
      } else {
        // Primeiro voto - criar novo registro
        const { error: voteError } = await supabase
          .from('votes')
          .insert({
            coupon_id: couponId,
            voter_ip: userIP,
            vote_type: type
          });

        if (voteError) {
          console.error('Erro ao registrar voto:', voteError);
          toast.error('Erro ao registrar voto');
          return;
        }

        // Atualizar contadores
        if (type === 'up') {
          newUpvotes = currentCoupon.upvotes + 1;
        } else {
          newDownvotes = currentCoupon.downvotes + 1;
        }

        toast.success(type === 'up' ? 'Voto positivo registrado!' : 'Voto negativo registrado!');
      }

      // Verificar se deve desativar o cupom
      const shouldDeactivate = newDownvotes >= 20;

      // Atualizar contadores do cupom
      const { error: updateError } = await supabase
        .from('coupons')
        .update({
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          is_active: !shouldDeactivate
        })
        .eq('id', couponId);

      if (updateError) {
        console.error('Erro ao atualizar cupom:', updateError);
        toast.error('Erro ao atualizar cupom');
        return;
      }

      // Atualizar estado local
      setCoupons(prevCoupons => 
        prevCoupons.map(coupon => {
          if (coupon.id === couponId) {
            return {
              ...coupon,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              is_active: !shouldDeactivate
            };
          }
          return coupon;
        })
      );

      if (shouldDeactivate) {
        toast.warning('Cupom desativado por receber muitos votos negativos');
        fetchCoupons(); // Recarregar lista para remover cupom desativado
      }

    } catch (error) {
      console.error('Erro ao votar:', error);
      toast.error('Erro ao processar voto');
    }
  };

  // Reportar cupom com sistema de report único
  const handleReport = async (couponId: string, reason: string = 'expired') => {
    const userIP = getUserIP();

    try {
      // Verificar se o usuário já reportou este cupom
      const { data: existingReport, error: checkError } = await supabase
        .from('reports')
        .select('*')
        .eq('coupon_id', couponId)
        .eq('reporter_ip', userIP)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar report:', checkError);
        toast.error('Erro ao processar report');
        return;
      }

      if (existingReport) {
        toast.error('Você já reportou este cupom!');
        return;
      }

      // Registrar o report
      const { error: reportError } = await supabase
        .from('reports')
        .insert({
          coupon_id: couponId,
          reporter_ip: userIP,
          reason: reason
        });

      if (reportError) {
        console.error('Erro ao registrar report:', reportError);
        toast.error('Erro ao registrar report');
        return;
      }

      toast.success('Cupom reportado com sucesso!');

    } catch (error) {
      console.error('Erro ao reportar:', error);
      toast.error('Erro ao processar report');
    }
  };

  // Submeter novo cupom
  const handleSubmitCoupon = async (newCouponData: any) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .insert({
          store: newCouponData.store,
          code: newCouponData.code,
          description: newCouponData.description,
          discount: newCouponData.discount,
          category: newCouponData.category,
          expiry_date: newCouponData.expiryDate,
          link: newCouponData.link,
          upvotes: 0,
          downvotes: 0,
          is_active: true
        });

      if (error) {
        console.error('Erro ao criar cupom:', error);
        toast.error('Erro ao criar cupom');
        return;
      }

      toast.success('Cupom criado com sucesso!');
      setShowSubmissionForm(false);
      fetchCoupons(); // Recarregar lista de cupons

    } catch (error) {
      console.error('Erro ao criar cupom:', error);
      toast.error('Erro ao criar cupom');
    }
  };

  // Ordenar cupons por votos positivos (ranking democrático)
  const sortedCoupons = [...filteredCoupons].sort((a, b) => b.upvotes - a.upvotes);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600">Carregando cupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Hero Section - Restaurado para o design original democrático */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6 animate-fade-in">
            🗳️ Pontinho.com
          </h1>
          <p className="text-2xl mb-4 opacity-90 animate-fade-in">
            A primeira plataforma de cupons 100% democrática do Brasil
          </p>
          <p className="text-lg mb-8 opacity-80 max-w-3xl mx-auto">
            Aqui, a comunidade decide quais cupons são realmente bons! 
            Vote, avalie e ajude outros consumidores a encontrar as melhores ofertas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
            <SearchBar 
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Busque por loja ou categoria..."
            />
            <Button 
              onClick={() => setShowSubmissionForm(true)}
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Cupom
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{coupons.length}</p>
                <p className="text-gray-600">Cupons Ativos</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <ThumbsUp className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {coupons.reduce((sum, c) => sum + c.upvotes, 0)}
                </p>
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {searchTerm && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Resultados para "{searchTerm}" ({filteredCoupons.length} {filteredCoupons.length === 1 ? 'cupom' : 'cupons'})
            </h2>
          </div>
        )}

        {sortedCoupons.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">
              {searchTerm ? 'Nenhum cupom encontrado para sua busca.' : 'Nenhum cupom disponível.'}
            </p>
            <Button 
              onClick={() => setShowSubmissionForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Seja o primeiro a adicionar um cupom
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedCoupons.map((coupon, index) => (
              <CouponCard
                key={coupon.id}
                coupon={{
                  id: coupon.id,
                  store: coupon.store,
                  code: coupon.code,
                  description: coupon.description,
                  discount: coupon.discount,
                  category: coupon.category,
                  expiryDate: coupon.expiry_date,
                  upvotes: coupon.upvotes,
                  downvotes: coupon.downvotes,
                  link: coupon.link,
                  submittedAt: coupon.created_at,
                  isActive: coupon.is_active
                }}
                onVote={(couponId, type) => handleVote(couponId, type)}
                onReport={() => handleReport(coupon.id)}
                rank={index + 1}
              />
            ))}
          </div>
        )}
      </main>

      {/* Call to Action - Rodapé centralizado */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Contribua com a Comunidade
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Ajude outros consumidores encontrando e validando os melhores cupons. 
            Sua participação faz a diferença no sistema democrático do Pontinho.com!
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={() => setShowSubmissionForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Novo Cupom
            </Button>
          </div>
        </div>
      </section>

      {/* Submission Form Modal */}
      {showSubmissionForm && (
        <CouponSubmissionForm
          onSubmit={handleSubmitCoupon}
          onClose={() => setShowSubmissionForm(false)}
        />
      )}
    </div>
  );
};

export default Index;
