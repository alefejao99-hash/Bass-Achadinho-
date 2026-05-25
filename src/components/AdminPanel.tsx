/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlusCircle, RotateCcw, Copy, Check, Upload, HelpCircle, Save, X, RefreshCw, FileCode, Sparkles, Loader2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { PRESET_IMAGES } from '../data';

interface AdminPanelProps {
  onSaveProduct: (product: Omit<Product, 'id'> & { id?: string }) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  availableGroups: string[];
  onResetDefaults: () => void;
  allProducts: Product[];
  onImportProducts: (products: Product[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onSaveProduct,
  editingProduct,
  setEditingProduct,
  availableGroups,
  onResetDefaults,
  allProducts,
  onImportProducts,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [shopeeUrl, setShopeeUrl] = useState('');
  const [adGroup, setAdGroup] = useState('');
  const [newAdGroup, setNewAdGroup] = useState('');
  const [isCustomGroup, setIsCustomGroup] = useState(false);
  const [description, setDescription] = useState('');

  // Auto-Fetch metadata state
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const handleFetchMetadata = async () => {
    if (!shopeeUrl.trim()) {
      alert('Favor inserir primeiro o link do produto Shopee para obter o valor e nome corretos em tempo real!');
      return;
    }
    setIsFetchingInfo(true);
    setFetchError('');
    try {
      const response = await fetch('/api/fetch-shopee-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: shopeeUrl.trim() }),
      });
      if (!response.ok) {
        throw new Error('Falha ao obter os dados do link. Verifique a conexão do servidor.');
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Update fields
      if (data.name) setName(data.name);
      if (data.price) setPrice(data.price.toFixed(2).replace('.', ','));
      if (data.imageUrl) setImageUrl(data.imageUrl);
      if (data.description) setDescription(data.description);
      if (data.shopeeUrl) setShopeeUrl(data.shopeeUrl); // updated with resolved URL if redirect
    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || 'Erro ao carregar link. Você ainda pode preencher os campos manualmente!');
    } finally {
      setIsFetchingInfo(false);
    }
  };

  // Backup / JSON operations state
  const [showJsonTools, setShowJsonTools] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [jsonSuccess, setJsonSuccess] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setPrice(editingProduct.price.toString());
      setImageUrl(editingProduct.imageUrl);
      setShopeeUrl(editingProduct.shopeeUrl);
      setDescription(editingProduct.description || '');
      
      // Determine if group is custom
      const cleanGroup = editingProduct.adGroup;
      if (availableGroups.includes(cleanGroup)) {
        setAdGroup(cleanGroup);
        setIsCustomGroup(false);
      } else {
        setNewAdGroup(cleanGroup);
        setIsCustomGroup(true);
      }
    } else {
      resetForm();
    }
  }, [editingProduct, availableGroups]);

  const resetForm = () => {
    setName('');
    setPrice('');
    setImageUrl('');
    setShopeeUrl('');
    setDescription('');
    setAdGroup(availableGroups[1] || availableGroups[0] || 'Eletrônicos');
    setNewAdGroup('');
    setIsCustomGroup(false);
    setEditingProduct(null);
  };

  const handlePresetSelect = (url: string, label: string) => {
    setImageUrl(url);
    if (!name) {
      setName(label);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !shopeeUrl.trim()) {
      alert('Por favor, preencha nome, valor e o link do anúncio!');
      return;
    }

    const priceNum = parseFloat(price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Por favor, insira um valor numérico válido maior que zero.');
      return;
    }

    const finalAdGroup = isCustomGroup ? newAdGroup.trim() : adGroup;
    if (!finalAdGroup || finalAdGroup.trim() === '') {
      alert('Por favor, informe ou crie um grupo de anúncios!');
      return;
    }

    // fallback placeholder image if empty
    const finalImageUrl = imageUrl.trim() || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80';

    onSaveProduct({
      id: editingProduct?.id,
      name: name.trim(),
      price: priceNum,
      imageUrl: finalImageUrl,
      shopeeUrl: shopeeUrl.trim(),
      adGroup: finalAdGroup.trim(),
      description: description.trim()
    });

    resetForm();
  };

  // Export
  const handleExportBackup = async () => {
    const dataStr = JSON.stringify(allProducts, null, 2);
    try {
      await navigator.clipboard.writeText(dataStr);
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Import
  const handleImportJson = () => {
    setJsonError('');
    setJsonSuccess(false);
    try {
      if (!jsonInput.trim()) {
        setJsonError('Por favor, cole as informações de backup em JSON.');
        return;
      }
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        setJsonError('Formato inválido. O arquivo de backup deve ser uma lista de produtos JSON.');
        return;
      }
      
      // Basic validate
      const valid = parsed.every(p => p.name && p.price && p.shopeeUrl && p.adGroup);
      if (!valid) {
        setJsonError('Alguns produtos na lista estão incompletos (faltando nome, valor, link ou grupo de anúncios).');
        return;
      }

      onImportProducts(parsed);
      setJsonSuccess(true);
      setJsonInput('');
      setTimeout(() => setJsonSuccess(false), 3000);
    } catch (err: any) {
      setJsonError(`Erro de codificação JSON: ${err.message}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Panel Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-50">
        <div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-gray-800 flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-shopee-orange" />
            {editingProduct ? 'Editar Produto Cadastrado' : 'Cadastrar Meu Produto para Divulgação'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {editingProduct 
              ? 'Edite as informações abaixo e clique em Atualizar.' 
              : 'Cadastre seus achados preenchendo imagem, nome, valor e o link do anúncio para direcionar direto para a Shopee!'}
          </p>
        </div>

        {/* Quick Utilities controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJsonTools(!showJsonTools)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 hover:border-gray-250 text-xs font-semibold text-gray-500 cursor-pointer transition-all"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Ferramentas de Backup</span>
          </button>
          
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 text-xs font-semibold text-gray-500 cursor-pointer transition-all"
            title="Restaurar Produtos Padrões do Aplicativo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Iniciais</span>
          </button>
        </div>
      </div>

      {/* Backup JSON tools collapsible section */}
      <AnimatePresence>
        {showJsonTools && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-gray-50 rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-700">Backup & Importação do Catálogo (JSON)</span>
              <button 
                onClick={() => setShowJsonTools(false)}
                className="text-gray-400 hover:text-gray-650 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Você pode copiar ou fazer backup dos seus produtos para não perdê-los no navegador! Copie o catálogo atual ou faça importação colando o código previamente salvo.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleExportBackup}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  copiedBackup
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                    : 'bg-white border border-gray-100 text-slate-800 hover:bg-gray-100'
                }`}
              >
                {copiedBackup ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Código do Catálogo Atual</span>
              </button>
            </div>

            {/* Input Import */}
            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Importar Código de Backup
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Cole aqui a estrutura JSON de backup para importar os produtos...'
                className="w-full h-24 p-3 rounded-xl border border-gray-100 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-shopee-orange bg-white"
              />
              
              {jsonError && (
                <p className="text-xs text-red-500 font-medium">{jsonError}</p>
              )}
              {jsonSuccess && (
                <p className="text-xs text-emerald-600 font-bold">✓ Catálogo importado de backup com sucesso!</p>
              )}

              <button
                onClick={handleImportJson}
                className="flex items-center gap-1 px-4.5 py-2 rounded-xl bg-shopee-dark hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Salvar & Importar Catálogo</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main product input form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Row 1: Name and Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Nome do Produto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mini Roteador Portátil Dual Band Dual Antenas"
              className="w-full px-4.5 py-3 rounded-xl border border-gray-100 focus:outline-hidden focus:ring-2 focus:ring-shopee-orange font-medium text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Valor (R$) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">R$</span>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29,90"
                className="w-full pl-10 pr-4.5 py-3 rounded-xl border border-gray-100 focus:outline-hidden focus:ring-2 focus:ring-shopee-orange font-semibold text-sm"
              />
            </div>
          </div>

        </div>

        {/* Row 2: Shopee URL Link with Auto-Fetch button */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>Link do Anúncio / Afiliado Shopee</span>
              <span className="text-red-500">*</span>
            </span>
            <span className="text-[10px] text-gray-400 font-normal normal-case">Suporta links curtos (shope.ee) ou links diretos</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              required
              value={shopeeUrl}
              onChange={(e) => setShopeeUrl(e.target.value)}
              placeholder="Ex: https://shpe.ee/8A9xyz ou correspondente"
              className="flex-1 px-4.5 py-3 rounded-xl border border-gray-100 focus:outline-hidden focus:ring-2 focus:ring-shopee-orange font-medium text-sm"
            />
            <button
              type="button"
              disabled={isFetchingInfo}
              onClick={handleFetchMetadata}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border ${
                isFetchingInfo 
                  ? 'bg-orange-50 text-shopee-orange border-orange-200 cursor-not-allowed' 
                  : 'bg-shopee-orange/10 hover:bg-shopee-orange/15 text-shopee-orange border-shopee-orange/20 hover:shadow-md'
              }`}
            >
              {isFetchingInfo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-shopee-orange" />
                  <span>Obtendo dados com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse text-shopee-orange" />
                  <span>Obtendo Preço e Nome com IA ✨</span>
                </>
              )}
            </button>
          </div>
          {fetchError && (
            <p className="text-xs text-amber-600 font-medium">
              ⚠️ Nota: {fetchError}
            </p>
          )}
        </div>

        {/* Row 3: Image input and presets option */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Link da Imagem (URL)</span>
              <span className="text-[10px] text-zinc-400 font-normal normal-case">Insira um link ou clique nos presets abaixo</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4.5 py-3 rounded-xl border border-gray-100 focus:outline-hidden focus:ring-2 focus:ring-shopee-orange font-medium text-sm"
              />
            </div>
          </div>

          {/* Quick preset images picker */}
          <div className="space-y-1.5">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Sugestões de fotos em alta definição (Clique para preencher a imagem automaticamente):
            </span>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-2xl border border-gray-100/50">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(preset.url, preset.label)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                    imageUrl === preset.url
                      ? 'bg-shopee-orange/10 border-shopee-orange/30 text-shopee-orange scale-102'
                      : 'bg-white border-gray-105 hover:bg-zinc-50'
                  }`}
                >
                  📸 {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 4: Ad Group selection / creation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Grupo de Anúncio / Categoria
            </label>
            <div className="flex items-center gap-4 bg-gray-50/50 p-2.5 rounded-xl border border-gray-150/40">
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  checked={!isCustomGroup}
                  onChange={() => setIsCustomGroup(false)}
                  className="accent-shopee-orange"
                />
                <span>Escolher Existente</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  checked={isCustomGroup}
                  onChange={() => setIsCustomGroup(true)}
                  className="accent-shopee-orange"
                />
                <span>Criar Novo Grupo</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            {isCustomGroup ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Especificar Novo Grupo
                </label>
                <input
                  type="text"
                  required={isCustomGroup}
                  value={newAdGroup}
                  onChange={(e) => setNewAdGroup(e.target.value)}
                  placeholder="Ex: Utilidades, Moda Masculina"
                  className="w-full px-4.5 py-3 rounded-xl border border-gray-100 focus:outline-hidden focus:ring-2 focus:ring-shopee-orange font-semibold text-sm"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Selecionar Grupo Existente
                </label>
                <select
                  value={adGroup}
                  onChange={(e) => setAdGroup(e.target.value)}
                  className="w-full px-4 px-4.5 py-3 rounded-xl border border-gray-100 bg-white focus:outline-hidden focus:ring-2 focus:ring-shopee-orange font-semibold text-sm cursor-pointer"
                >
                  {availableGroups
                    .filter(g => g !== 'Todos')
                    .map((g, idx) => (
                      <option key={idx} value={g}>
                        {g}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

        </div>

        {/* Short description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Curta Descrição / Detalhe Promocional
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Ideal para quem busca economizar tempo. Envio nacional super rápido e excelente avaliação de compradores!"
            rows={2}
            className="w-full px-4.5 py-3 rounded-xl border border-gray-100 focus:outline-hidden focus:ring-2 focus:ring-shopee-orange font-medium text-sm"
          />
        </div>

        {/* Action Triggers form footer */}
        <div className="flex items-center gap-3 pt-3 justify-end">
          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
          >
            {editingProduct ? 'Cancelar Edição' : 'Limpar Formulário'}
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 bg-shopee-orange hover:bg-shopee-orange-hover text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-2xl transition-all shadow-md shadow-shopee-orange/20 hover:shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{editingProduct ? 'Atualizar Informações' : 'Salvar no Catálogo'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
