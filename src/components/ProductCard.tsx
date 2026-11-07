/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Heart, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export default function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onSelectProduct
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#EFE8DE] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F2ECE3]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badge on Bottom-Left of Image */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="bg-black/65 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
            {product.badge}
          </span>
        </div>

        {/* Favorite Heart Button on Top-Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-xs text-[#523E33] flex items-center justify-center transition-all hover:scale-110 shadow-xs cursor-pointer"
          title={isFavorite ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-[#7A695E]'
            }`}
          />
        </button>

        {/* Out of Stock overlay if disabled */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              สินค้าหมดชั่วคราว
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div className="space-y-1">
          {/* Tag & Rating Row */}
          <div className="flex items-center justify-between text-[11px] text-[#8C6445] font-medium">
            <span>{product.categoryTag}</span>
            <div className="flex items-center gap-1 text-[#4A382D]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold">{product.rating}</span>
              <span className="text-[#9C8A7E]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="text-sm font-bold text-[#2B1810] line-clamp-1 hover:text-[#C97A32] cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-[11px] text-[#7A695E] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart button */}
        <div className="pt-2 border-t border-[#F5EFE8] flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-[#2B1810] font-prompt">
              ฿{product.priceNormal}
            </span>
            {product.originalPriceNormal && (
              <span className="text-[11px] text-[#A8988C] line-through">
                ฿{product.originalPriceNormal}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => onSelectProduct(product)}
            disabled={!product.inStock}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95 ${
              product.inStock
                ? 'bg-[#2B1810] hover:bg-[#3E2317] text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มลงตะกร้า</span>
          </button>
        </div>
      </div>
    </div>
  );
}
