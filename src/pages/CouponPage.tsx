import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import CouponCard from '@/components/CouponCard';
import CouponSubmissionForm from '@/components/CouponSubmissionForm';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import CallToActionSection from '@/components/CallToActionSection';
import { useCouponData } from '@/hooks/useCouponData';
import { useCouponVoting } from '@/hooks/useCouponVoting';

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

const CouponPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCoupons, setFilteredCoupons] = useState<any[]>([]);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const { coupon, allCoupons, loading, fetchAllCoupons, updateCoupon } = useCouponData(id);
  const { handleVote, handleReport } = useCouponVoting();

  // Filter coupons based on search (excluding current coupon)
  useEffect(() => {
    const otherCoupons = allCoupons.filter(c => c.id !== id);
    if (searchTerm.trim() === '') {
      setFilteredCoupons(otherCoupons);
    } else {
      const filtered = otherCoupons.filter(c => 
        c.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCoupons(filtered);
    }
  }, [searchTerm, allCoupons, id]);

  const handleVoteWrapper = async (couponId: string, type: 'up' | 'down') => {
    const currentCoupon = couponId === id ? coupon : allCoupons.find(c => c.id === couponId);
    if (!currentCoupon) return;

    await handleVote(couponId, type, currentCoupon, (couponId, updates) => {
      updateCoupon(couponId, updates);
      if (updates.is_active === false && couponId === id) {
        fetchAllCoupons();
      }
    });
  };

  const handleSubmitCoupon = async () => {
    setShowSubmissionForm(false);
    fetchAllCoupons();
  };

  // Sort other coupons by positive votes
  const sortedOtherCoupons = [...filteredCoupons].sort((a, b) => b.upvotes - a.upvotes);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-gray-600">Carregando cupom...</p>
        </div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Cupom não encontrado</h1>
          <p className="text-gray-600 mb-8">O cupom que você está procurando não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  const totalUpvotes = allCoupons.reduce((sum, c) => sum + c.upvotes, 0);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        
        <HeroSection 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddCoupon={() => setShowSubmissionForm(true)}
        />

        <StatsSection 
          totalCoupons={allCoupons.length}
          totalUpvotes={totalUpvotes}
        />

        <div className="container mx-auto px-4 py-12">
          {/* Featured Coupon */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Cupom Compartilhado</h2>
            <div className="max-w-md mx-auto">
              <CouponCard
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
                onVote={handleVoteWrapper}
                onReport={() => handleReport(coupon.id)}
                rank={0}
              />
            </div>
          </div>

          {/* Other Coupons */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Explore Mais Cupons</h2>
            
            {searchTerm && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Resultados para "{searchTerm}" ({filteredCoupons.length} {filteredCoupons.length === 1 ? 'cupom' : 'cupons'})
                </h3>
              </div>
            )}

            {sortedOtherCoupons.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600 mb-4">
                  {searchTerm ? 'Nenhum outro cupom encontrado para sua busca.' : 'Nenhum outro cupom disponível.'}
                </p>
                <Button 
                  onClick={() => setShowSubmissionForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Novo Cupom
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedOtherCoupons.map((otherCoupon, index) => (
                  <CouponCard
                    key={otherCoupon.id}
                    coupon={{
                      id: otherCoupon.id,
                      store: otherCoupon.store,
                      code: otherCoupon.code,
                      description: otherCoupon.description,
                      discount: otherCoupon.discount,
                      category: otherCoupon.category,
                      expiryDate: otherCoupon.expiry_date,
                      upvotes: otherCoupon.upvotes,
                      downvotes: otherCoupon.downvotes,
                      link: otherCoupon.link,
                      submittedAt: otherCoupon.created_at,
                      isActive: otherCoupon.is_active
                    }}
                    onVote={handleVoteWrapper}
                    onReport={() => handleReport(otherCoupon.id)}
                    rank={index + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <CallToActionSection onAddCoupon={() => setShowSubmissionForm(true)} />
      </div>

      {showSubmissionForm && (
        <CouponSubmissionForm
          onSubmit={handleSubmitCoupon}
          onClose={() => setShowSubmissionForm(false)}
        />
      )}
    </>
  );
};

export default CouponPage;
