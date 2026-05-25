/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, Sparkles, Settings2, Eye, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  totalProducts: number;
}

export const Navbar: React.FC<NavbarProps> = ({ isAdmin, setIsAdmin, totalProducts }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Brand area */}
          <div className="flex items-center gap-3">
            <motion.div 
              className="bg-shopee-orange p-2.5 rounded-2xl flex items-center justify-center text-white shadow-md shadow-shopee-orange/20"
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5 leading-none">
                <span className="font-display font-black text-lg sm:text-2xl tracking-tighter text-shopee-orange">
                  BASS
                </span>
                <span className="font-display font-extrabold text-sm sm:text-xl text-gray-800">
                  COMPRE MAIS ACHADINHO
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] text-gray-400 font-bold tracking-wider mt-0.5 sm:mt-1">
                SEU LINK DIRETO PARA A SHOPEE
              </p>
            </div>
          </div>

          {/* Quick Info & Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Products counter indicator */}
            <div className="hidden md:flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-650">
              <Sparkles className="w-3.5 h-3.5 text-shopee-orange" />
              <span>{totalProducts} {totalProducts === 1 ? 'Produto' : 'Produtos'} Cadastrados</span>
            </div>

            {/* Admin Toggle button - highly visual instructions */}
            <button
              id="toggle-admin-btn"
              onClick={() => setIsAdmin(!isAdmin)}
              className={`relative flex items-center gap-2 px-3.5 py-2 sm:px-4.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 shadow-sm cursor-pointer ${
                isAdmin 
                  ? 'bg-shopee-dark text-white hover:bg-black' 
                  : 'bg-shopee-orange/10 text-shopee-orange hover:bg-shopee-orange/15 hover:shadow-md'
              }`}
            >
              {isAdmin ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Ver Como Visitante</span>
                </>
              ) : (
                <>
                  <Settings2 className="w-4 h-4 animate-pulse" />
                  <span>Gerenciar Produtos</span>
                </>
              )}
              {/* Notification badge when not in admin to guide user */}
              {!isAdmin && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-shopee-orange opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-shopee-orange"></span>
                </span>
              )}
            </button>
            
          </div>
        </div>
      </div>
    </header>
  );
};
