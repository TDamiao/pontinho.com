
import React from 'react';
import { X, Share2, MessageCircle, Send, Twitter, Facebook, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getShareUrls, generateShareUrl } from '@/utils/shareUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: {
    id: string;
    store: string;
    code: string;
    discount: string;
  };
}

const ShareModal = ({ isOpen, onClose, coupon }: ShareModalProps) => {
  if (!isOpen) return null;

  const shareText = `Cupom ${coupon.code} com ${coupon.discount} OFF no ${coupon.store}`;
  const shareUrls = getShareUrls(coupon, shareText);
  const shareUrl = generateShareUrl(coupon, 'direct');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  const openShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="w-5 h-5" />
              <span>Compartilhar Cupom</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Compartilhe este cupom:</p>
            <p className="font-medium text-gray-800">{shareText}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              onClick={() => openShare(shareUrls.whatsapp)}
              className="flex items-center space-x-2 h-12"
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span>WhatsApp</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => openShare(shareUrls.telegram)}
              className="flex items-center space-x-2 h-12"
            >
              <Send className="w-5 h-5 text-blue-500" />
              <span>Telegram</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => openShare(shareUrls.twitter)}
              className="flex items-center space-x-2 h-12"
            >
              <Twitter className="w-5 h-5 text-blue-400" />
              <span>Twitter</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => openShare(shareUrls.facebook)}
              className="flex items-center space-x-2 h-12"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span>Facebook</span>
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={copyToClipboard}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copiar Link</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareModal;