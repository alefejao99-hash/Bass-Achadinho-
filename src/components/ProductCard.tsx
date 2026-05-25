/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, MessageSquare, Trash2, Edit2, ShoppingCart, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isAdmin, onEdit, onDelete }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(product.price);

  // Clipboard copies
  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(product.shopeeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar link', err);
    }
  };

  const copyPromoText = async () => {
    const promoText = `🔥 *OLHA ESSE ACHADO INCRÍVEL NA SHOPEE!* 🔥\n\n*${product.name}*\n\n${product.description ? `✨ _${product.description}_\n\n` : ''}💰 Por apenas: *${formattedPrice}*\n\n👉 Compre aqui com segurança:\n🔗 ${product.shopeeUrl}\n\n🏷️ Grupo: #${product.adGroup.replace(/\s+/g, '')}`;
    try {
      await navigator.clipboard.writeText(promoText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar texto promocional', err);
    }
  };

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col relative group"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* Category/AdGroup label badge on top of image */}
      <div className="absolute top-3 left-3 z-20">
        <span className="flex items-center gap-1 bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs backdrop-blur-xs">
          <Tag className="w-3 h-3 text-shopee-orange" />
          {product.adGroup}
        </span>
      </div>

      {/* Admin Quick Options overlay on hover */}
      {isAdmin && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-white/95 p-1 rounded-full shadow-md backdrop-blur-xs">
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 text-gray-600 hover:text-shopee-orange hover:bg-shopee-orange/5 rounded-full transition-all cursor-pointer"
            title="Editar Produto"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all cursor-pointer"
            title="Excluir Produto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Product Image section with zoom on hover */}
      <div className="relative pt-[85%] overflow-hidden bg-gray-50 border-b border-gray-50">
        <a 
          href={product.shopeeUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute inset-0 block cursor-pointer"
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 scale-100 group-hover:scale-105"
            onError={(e) => {
              // fallback image placeholder
              e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80';
            }}
          />
        </a>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price Tag with modern badges */}
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-xl sm:text-2xl font-display font-extrabold text-shopee-orange">
              {formattedPrice}
            </span>
          </div>

          <h3 className="font-display font-bold text-gray-800 text-sm sm:text-base leading-snug line-clamp-2 mb-2 group-hover:text-shopee-orange transition-colors">
            <a href={product.shopeeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {product.name}
            </a>
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
            {product.description || 'Nenhuma descrição inserida para este produto.'}
          </p>
        </div>

        {/* Action Triggers */}
        <div className="space-y-2 mt-auto">
          {/* Main Action Button - Direct redirect to Shopee */}
          <a
            href={product.shopeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-shopee-orange hover:bg-shopee-orange-hover text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-2xl transition-all shadow-md shadow-shopee-orange/15 hover:shadow-lg hover:-translate-y-0.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Comprar na Shopee</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-90" />
          </a>

          {/* Social / Copy actions */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={copyLinkToClipboard}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-white border-gray-100 hover:border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              title="Copiar link de divulgação direto"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>

            <button
              onClick={copyPromoText}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                copiedText
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-white border-gray-100 hover:border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              title="Gerar texto estruturado para divulgar no WhatsApp/Redes sociais"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Divulgar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
