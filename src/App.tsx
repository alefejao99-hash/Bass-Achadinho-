/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { AdminPanel } from './components/AdminPanel';
import { DEFAULT_PRODUCTS, DEFAULT_AD_GROUPS } from './data';
import { Product } from './types';
import { Search, Filter, SlidersHorizontal, ShoppingBag, Plus, Tag, HelpCircle, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Load products from localStorage or use defaults
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('shopee_products_catalog');
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    } catch (e) {
      console.error('Falha ao ler dados do localStorage', e);
      return DEFAULT_PRODUCTS;
    }
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedAdGroup, setSelectedAdGroup] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevante'); // relevante, preco-min, preco-max, nome-az
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Sync products with local storage
  useEffect(() => {
    try {
      localStorage.setItem('shopee_products_catalog', JSON.stringify(products));
    } catch (e) {
      console.error('Falha ao salvar dados no localStorage', e);
    }
  }, [products]);

  // Compute available product ad groups dynamically (always unique to current list)
  const availableGroups = useMemo(() => {
    const groups = new Set<string>();
    groups.add('Todos');
    products.forEach((p) => {
      if (p.adGroup) groups.add(p.adGroup);
    });
    // Convert to array and filter out null empty values
    return Array.from(groups).filter(Boolean);
  }, [products]);

  // Handle Save / Create / Update
  const handleSaveProduct = (productData: Omit<Product, 'id'> & { id?: string }) => {
    if (productData.id) {
      // Editing
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productData.id ? { ...p, ...productData } : p
        )
      );
    } else {
      // Adding new product
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
    setEditingProduct(null);
  };

  // Handle Delete
  const handleDeleteProduct = (id: string) => {
    const confirmed = window.confirm('Deseja realmente remover este produto do seu catálogo?');
    if (confirmed) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      // Stop editing if deleted product was in active edit
      if (editingProduct?.id === id) {
        setEditingProduct(null);
      }
    }
  };

  // Reset to default sample set
  const handleResetDefaults = () => {
    const confirmed = window.confirm(
      'Deseja restaurar os produtos padrão iniciais? Isso substituirá sua lista atual.'
    );
    if (confirmed) {
      setProducts(DEFAULT_PRODUCTS);
      setSelectedAdGroup('Todos');
      setSearchQuery('');
      setEditingProduct(null);
    }
  };

  // Import from backup
  const handleImportCatalog = (imported: Product[]) => {
    setProducts(imported);
    setSelectedAdGroup('Todos');
    setSearchQuery('');
    setEditingProduct(null);
  };

  // Filter & Sort computation
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Ad Group Filter
    if (selectedAdGroup !== 'Todos') {
      result = result.filter(
        (p) => p.adGroup.toLowerCase() === selectedAdGroup.toLowerCase()
      );
    }

    // Search Query (by name or group)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.adGroup.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'preco-min') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'preco-max') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'nome-az') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    // "relevante" utilizes the default array ordering (newest first for custom items)

    return result;
  }, [products, selectedAdGroup, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#f8fbfe] font-sans text-gray-800 flex flex-col justify-between">
      
      {/* Top Navigation */}
      <Navbar 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin} 
        totalProducts={products.length} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-6 sm:space-y-8">
        
        {/* Decorative Hero Callout Banner - Dynamic information depending on settings */}
        <div id="hero-banner" className="bg-gradient-to-tr from-shopee-orange via-orange-600 to-amber-500 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl shadow-shopee-orange/10 relative overflow-hidden">
          
          {/* Ambient background designs */}
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute left-1/3 bottom-0 translate-y-12 w-48 h-48 rounded-full bg-white/5 blur-xl" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Promoções e Achados Ativos
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl leading-tight tracking-tight">
              BASS COMPRE MAIS ACHADINHO!
            </h1>
            <p className="text-white/85 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-medium">
              Aqui você pode cadastrar e divulgar seus próprios produtos! Quando as pessoas clicam nos produtos da vitrine, elas são direcionadas instantaneamente direto para a Shopee para finalizar a compra no canal seguro.
            </p>
          </div>

          {!isAdmin && (
            <div className="absolute bottom-6 right-6 hidden lg:block z-10">
              <button
                onClick={() => {
                  setIsAdmin(true);
                  // scroll to admin panel
                  setTimeout(() => {
                    document.getElementById('admin-container')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="bg-white hover:bg-orange-50 text-shopee-orange text-xs sm:text-sm font-bold py-2.5 px-5 rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Meus Links</span>
              </button>
            </div>
          )}
        </div>

        {/* Collapsing Admin Customizer section */}
        <AnimatePresence>
          {isAdmin && (
            <motion.div
              id="admin-container"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="scroll-mt-24"
            >
              <AdminPanel
                onSaveProduct={handleSaveProduct}
                editingProduct={editingProduct}
                setEditingProduct={setEditingProduct}
                availableGroups={availableGroups}
                onResetDefaults={handleResetDefaults}
                allProducts={products}
                onImportProducts={handleImportCatalog}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls Layout: Search, sorting, categories/adGroups tab selection */}
        <div id="controls-panel" className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-xs space-y-5">
          
          {/* Row A: Search Inputs and Sorter Selection */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input bar */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquise por nome do produto, grupo ou detalhe..."
                className="w-full pl-11 pr-4.5 py-3 rounded-2xl border border-gray-100 focus:outline-hidden focus:ring-2 focus:ring-shopee-orange font-medium text-sm transition-all text-gray-800 bg-gray-50/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded-md cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Sorterm Selection */}
            <div className="flex items-center gap-3 self-end lg:self-auto min-w-fit">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                Ordenar por:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-100 bg-white text-xs font-semibold text-gray-650 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-shopee-orange"
              >
                <option value="relevante">Relevância (Iniciais)</option>
                <option value="preco-min">Menor Preço primeiro</option>
                <option value="preco-max">Maior Preço primeiro</option>
                <option value="nome-az">Alfabeto (A-Z)</option>
              </select>
            </div>

          </div>

          {/* Row B: Horizontal Scroll of Groups / Category chips selection */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-shopee-orange" />
              Grupos de Anúncio / Categorias Ativas:
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {availableGroups.map((group, idx) => {
                const isActive = selectedAdGroup === group;
                // Count current listings for this group badge
                const count = products.filter(
                  (p) => group === 'Todos' || p.adGroup.toLowerCase() === group.toLowerCase()
                ).length;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedAdGroup(group)}
                    className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-shopee-orange text-white shadow-md shadow-shopee-orange/15'
                        : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    <span>{group}</span>
                    <span className={`inline-block text-[10px] py-0.5 px-2.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-250/50 text-gray-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Dynamic Catalog Section View */}
        <div>
          
          {/* Active section headers */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-black text-xl sm:text-2xl text-gray-800 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5.5 h-5.5 text-shopee-orange" />
              <span>Lista de Achados</span>
              {selectedAdGroup !== 'Todos' && (
                <span className="text-sm font-medium text-gray-400">
                  em <strong className="text-zinc-650">#{selectedAdGroup}</strong>
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-450 font-semibold bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
              Exibindo {filteredProducts.length} de {products.length} {products.length === 1 ? 'resultado' : 'resultados'}
            </p>
          </div>

          {/* Grid Layout of Cards */}
          <AnimatePresence mode="popLayout">
            {filteredProducts.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isAdmin={isAdmin}
                    onEdit={(prod) => {
                      setEditingProduct(prod);
                      setIsAdmin(true); // make sure admin section is open
                      // Scroll to admin panel
                      setTimeout(() => {
                        document.getElementById('admin-container')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-xl mx-auto space-y-4"
              >
                <div className="w-16 h-16 bg-shopee-orange/10 rounded-full flex items-center justify-center mx-auto text-shopee-orange">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-lg text-gray-800">
                    Nenhum produto localizado
                  </h3>
                  <p className="text-xs text-gray-400">
                    Não encontramos resultados correspondentes para os filtros ou busca indicados.
                  </p>
                </div>
                
                <div className="flex justify-center gap-3.5 pt-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedAdGroup('Todos');
                    }}
                    className="px-4.5 py-2.5 rounded-xl border border-gray-100 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Resetar Filtros
                  </button>
                  
                  {!isAdmin && (
                    <button
                      onClick={() => setIsAdmin(true)}
                      className="px-4.5 py-2.5 rounded-xl bg-shopee-orange hover:bg-shopee-orange-hover text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Cadastrar Produto
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </main>

      {/* Aesthetic instructions footer content */}
      <footer className="bg-white border-t border-gray-100 mt-16 py-8 sm:py-10 text-center">
        <div className="max-w-7xl mx-auto px-4 divide-y divide-gray-50 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1">
            <span>🔴 canais de ofertas</span>
            <span className="w-1.5 h-1.5 bg-shopee-orange rounded-full animate-ping" />
            <span>Divulgador Afiliado Shopee</span>
          </p>
          <div className="pt-4 text-[11px] text-gray-400 max-w-xl mx-auto leading-relaxed">
            Todas as imagens são ilustrativas obtidas de bancos de dados públicos. Ao clicar em comprar, você será levado para o marketplace oficial da Shopee para realizar sua compra em ambiente seguro e com garantia oficial de recebimento.
          </div>
        </div>
      </footer>

    </div>
  );
}
