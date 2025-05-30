
import React, { useState } from 'react';
import { X, Gift, ExternalLink, Calendar, Tag, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      toast.success('Cupom enviado com sucesso! Obrigado por contribuir com a comunidade.');
    } else {
      toast.error('Por favor, corrija os erros no formulário');
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
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Gift className="w-4 h-4 mr-2" />
                Enviar Cupom
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponSubmissionForm;
