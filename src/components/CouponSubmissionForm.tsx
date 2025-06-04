import React, { useState } from 'react';
import { X, Gift, ExternalLink, Calendar, Tag, Store, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { calculateImageHash, validateImageFile } from '@/utils/imageUtils';

interface CouponSubmissionFormProps {
  onSubmit: (coupon: any) => void;
  onClose: () => void;
}

const CouponSubmissionForm = ({ onSubmit, onClose }: CouponSubmissionFormProps) => {
  const [formData, setFormData] = useState({
    store: '',
    code: '',
    description: '',
    discount: '',
    category: '',
    expiryDate: '',
    link: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    // Apply character limits
    if (field === 'store' && value.length > 50) {
      processedValue = value.substring(0, 50);
    }
    if (field === 'description' && value.length > 350) {
      processedValue = value.substring(0, 350);
    }
    if (field === 'category' && value.length > 50) {
      processedValue = value.substring(0, 50);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Limpar erro quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSelectedImage(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File, couponId: string): Promise<{ url: string; hash: string } | null> => {
    try {
      const hash = await calculateImageHash(file);
      
      // Verificar se já existe imagem com mesmo hash para a loja
      const { data: existingCoupon } = await supabase
        .from('coupons')
        .select('id')
        .eq('store', formData.store)
        .eq('image_hash', hash)
        .single();

      if (existingCoupon) {
        toast.error(`Esta imagem já está cadastrada para a loja ${formData.store}`);
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${couponId}/image.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('coupon-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        toast.error('Erro ao fazer upload da imagem');
        return null;
      }

      const { data } = supabase.storage
        .from('coupon-images')
        .getPublicUrl(fileName);

      return { url: data.publicUrl, hash };
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast.error('Erro ao processar imagem');
      return null;
    }
  };

  const validateDiscount = (value: string) => {
    // Aceita formatos: 20%, R$ 40,00, R$40,00, R$ 40.00, R$40.00, 40,00, 40.00
    const percentageRegex = /^\d+(\.\d+|,\d+)?%$/;
    const currencyRegexWithComma = /^R\$\s?\d+(\,\d{2})?$/;
    const currencyRegexWithDot = /^R\$\s?\d+(\.\d{2})?$/;
    const numberRegexWithComma = /^\d+(\,\d{2})?$/;
    const numberRegexWithDot = /^\d+(\.\d{2})?$/;
    
    return percentageRegex.test(value) || 
           currencyRegexWithComma.test(value) || 
           currencyRegexWithDot.test(value) ||
           numberRegexWithComma.test(value) ||
           numberRegexWithDot.test(value);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.store.trim()) newErrors.store = 'Nome da loja é obrigatório';
    if (!formData.discount.trim()) {
      newErrors.discount = 'Valor do desconto é obrigatório';
    } else if (!validateDiscount(formData.discount)) {
      newErrors.discount = 'Formato inválido. Use: 20%, R$ 40,00 ou 40,00';
    }
    if (!formData.expiryDate) newErrors.expiryDate = 'Data de expiração é obrigatória';
    if (!formData.link.trim()) newErrors.link = 'Link da loja é obrigatório';

    // Validar formato do link
    if (formData.link && !formData.link.match(/^https?:\/\/.+/)) {
      newErrors.link = 'Link deve começar com http:// ou https://';
    }

    // Validar data de expiração
    if (formData.expiryDate) {
      const today = new Date();
      const expiry = new Date(formData.expiryDate);
      if (expiry <= today) {
        newErrors.expiryDate = 'Data de expiração deve ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setUploading(true);

    try {
      // Criar cupom primeiro para obter ID
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .insert({
          store: formData.store,
          code: formData.code,
          description: formData.description,
          discount: formData.discount,
          category: formData.category,
          expiry_date: formData.expiryDate,
          link: formData.link,
          upvotes: 0,
          downvotes: 0,
          is_active: true
        })
        .select()
        .single();

      if (couponError) {
        console.error('Erro ao criar cupom:', couponError);
        toast.error('Erro ao criar cupom');
        return;
      }

      let imageData = null;
      if (selectedImage) {
        imageData = await uploadImage(selectedImage, coupon.id);
        if (!imageData) {
          // Se houve erro no upload, deletar o cupom criado
          await supabase.from('coupons').delete().eq('id', coupon.id);
          return;
        }

        // Atualizar cupom com dados da imagem
        const { error: updateError } = await supabase
          .from('coupons')
          .update({
            image_url: imageData.url,
            image_hash: imageData.hash
          })
          .eq('id', coupon.id);

        if (updateError) {
          console.error('Erro ao atualizar imagem do cupom:', updateError);
        }
      }

      onSubmit({
        ...formData,
        id: coupon.id,
        image_url: imageData?.url,
        image_hash: imageData?.hash
      });
      
      toast.success('Cupom criado com sucesso! Obrigado por contribuir com a comunidade.');
    } catch (error) {
      console.error('Erro ao criar cupom:', error);
      toast.error('Erro ao criar cupom');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Gift className="w-6 h-6 text-blue-600" />
              <span>Adicionar Novo Cupom</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Contribua com a comunidade adicionando um cupom válido. Todos os cupons são verificados democraticamente pelos usuários.
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Loja */}
            <div className="space-y-2">
              <Label htmlFor="store" className="flex items-center space-x-2">
                <Store className="w-4 h-4" />
                <span>Nome da Loja * (máx. 50 caracteres)</span>
              </Label>
              <Input
                id="store"
                placeholder="Ex: Amazon, Magazine Luiza, iFood..."
                value={formData.store}
                onChange={(e) => handleInputChange('store', e.target.value)}
                className={errors.store ? 'border-red-500' : ''}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{errors.store && <span className="text-red-500">{errors.store}</span>}</span>
                <span>{formData.store.length}/50</span>
              </div>
            </div>

            {/* Upload de Imagem */}
            <div className="space-y-2">
              <Label htmlFor="image" className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Imagem do Cupom (opcional - máx. 1MB)</span>
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500">
                Formatos aceitos: JPEG, PNG, WebP. Evitamos duplicatas por loja.
              </p>
            </div>

            {/* Código e Desconto - Melhor alinhamento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center space-x-2">
                  <Tag className="w-4 h-4" />
                  <span>Código do Cupom (opcional)</span>
                </Label>
                <Input
                  id="code"
                  placeholder="Ex: SAVE20NOW"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Valor do Desconto *</Label>
                <Input
                  id="discount"
                  placeholder="Ex: 20%, R$ 40,00 ou 40,00"
                  value={formData.discount}
                  onChange={(e) => handleInputChange('discount', e.target.value)}
                  className={errors.discount ? 'border-red-500' : ''}
                />
                {errors.discount && <p className="text-red-500 text-xs">{errors.discount}</p>}
              </div>
            </div>

            {/* Descrição - Opcional */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Desconto (opcional - máx. 350 caracteres)</Label>
              <Textarea
                id="description"
                placeholder="Ex: 20% de desconto em eletrônicos, válido para primeira compra..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
              <div className="flex justify-end text-xs text-gray-500">
                <span>{formData.description.length}/350</span>
              </div>
            </div>

            {/* Categoria e Data - Melhor alinhamento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria (opcional - máx. 50 caracteres)</Label>
                <Input
                  id="category"
                  placeholder="Ex: Eletrônicos, Delivery, Moda..."
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                />
                <div className="flex justify-end text-xs text-gray-500">
                  <span>{formData.category.length}/50</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Data de Expiração *</span>
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className={errors.expiryDate ? 'border-red-500' : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.expiryDate && <p className="text-red-500 text-xs">{errors.expiryDate}</p>}
              </div>
            </div>

            {/* Link */}
            <div className="space-y-2">
              <Label htmlFor="link" className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Link da Loja *</span>
              </Label>
              <Input
                id="link"
                type="url"
                placeholder="https://www.loja.com.br"
                value={formData.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
                className={errors.link ? 'border-red-500' : ''}
              />
              {errors.link && <p className="text-red-500 text-xs">{errors.link}</p>}
            </div>

            {/* Aviso */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Importante:</strong> Os cupons são verificados democraticamente pela comunidade. 
                Cupons inválidos ou expirados serão automaticamente removidos com base nos votos dos usuários.
              </p>
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Enviar Cupom
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponSubmissionForm;