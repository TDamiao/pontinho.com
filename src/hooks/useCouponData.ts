
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const useCouponData = (couponId?: string) => {
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupon = async () => {
    if (!couponId) return;

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', couponId)
        .single();

      if (error) {
        console.error('Erro ao buscar cupom:', error);
        toast.error('Cupom não encontrado');
        navigate('/');
        return;
      }

      setCoupon(data);
    } catch (error) {
      console.error('Erro ao buscar cupom:', error);
      toast.error('Erro ao carregar cupom');
      navigate('/');
    }
  };

  const fetchAllCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('upvotes', { ascending: false });

      if (error) {
        console.error('Erro ao buscar cupons:', error);
        return;
      }

      setAllCoupons(data || []);
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCoupon = (couponId: string, updates: Partial<Coupon>) => {
    if (coupon && coupon.id === couponId) {
      setCoupon(prev => prev ? { ...prev, ...updates } : null);
    }
    
    setAllCoupons(prev => 
      prev.map(c => c.id === couponId ? { ...c, ...updates } : c)
    );
  };

  useEffect(() => {
    if (couponId) {
      fetchCoupon();
    }
    fetchAllCoupons();
  }, [couponId]);

  return {
    coupon,
    allCoupons,
    loading,
    fetchAllCoupons,
    updateCoupon
  };
};
