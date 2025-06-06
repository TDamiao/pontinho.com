
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

export const useCouponVoting = () => {
  const getUserIP = () => {
    return `${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleVote = async (
    couponId: string, 
    type: 'up' | 'down',
    currentCoupon: Coupon,
    onUpdate: (couponId: string, updates: Partial<Coupon>) => void
  ) => {
    const userIP = getUserIP();

    try {
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

      let newUpvotes = currentCoupon.upvotes;
      let newDownvotes = currentCoupon.downvotes;

      if (existingVote) {
        if (existingVote.vote_type === type) {
          toast.error('Você já votou neste cupom!');
          return;
        }

        if (existingVote.vote_type === 'up' && type === 'down') {
          newUpvotes = currentCoupon.upvotes - 1;
          newDownvotes = currentCoupon.downvotes + 1;
        } else if (existingVote.vote_type === 'down' && type === 'up') {
          newUpvotes = currentCoupon.upvotes + 1;
          newDownvotes = currentCoupon.downvotes - 1;
        }

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

        if (type === 'up') {
          newUpvotes = currentCoupon.upvotes + 1;
        } else {
          newDownvotes = currentCoupon.downvotes + 1;
        }

        toast.success(type === 'up' ? 'Voto positivo registrado!' : 'Voto negativo registrado!');
      }

      const shouldDeactivate = newDownvotes >= 20;

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

      onUpdate(couponId, {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        is_active: !shouldDeactivate
      });

      if (shouldDeactivate) {
        toast.warning('Cupom desativado por receber muitos votos negativos');
      }

    } catch (error) {
      console.error('Erro ao votar:', error);
      toast.error('Erro ao processar voto');
    }
  };

  const handleReport = async (couponId: string) => {
    const userIP = getUserIP();

    try {
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

      const { error: reportError } = await supabase
        .from('reports')
        .insert({
          coupon_id: couponId,
          reporter_ip: userIP,
          reason: 'expired'
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

  return { handleVote, handleReport };
};