/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from './types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Mini Processador de Alimentos Portátil Sem Fio USB',
    price: 24.90,
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
    shopeeUrl: 'https://shopee.com.br/search?keyword=mini%20processador%20de%20alimentos%20portatil%20usb',
    adGroup: 'Cozinha',
    description: 'Praticidade máxima para triturar temperos, alho e cebola no seu dia a dia com apenas um clique.'
  },
  {
    id: '2',
    name: 'Smartwatch D20 Bluetooth Inteligente à Prova d\'Água',
    price: 34.90,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
    shopeeUrl: 'https://shopee.com.br/search?keyword=smartwatch%20d20',
    adGroup: 'Eletrônicos',
    description: 'Monitore seus passos, batimentos cardíacos e receba notificações direto no seu pulso.'
  },
  {
    id: '3',
    name: 'Umidificador de Ar Ultra-Sônico Luminária LED RGB',
    price: 29.90,
    imageUrl: 'https://images.unsplash.com/photo-1519183071298-a2962feb14f4?auto=format&fit=crop&w=600&q=80',
    shopeeUrl: 'https://shopee.com.br/search?keyword=umidificador%20de%20ar%20rgb',
    adGroup: 'Casa & Decoração',
    description: 'Deixe o ambiente com ar fresco, hidratado e com uma iluminação ambiente colorida aconchegante.'
  },
  {
    id: '4',
    name: 'Fone de Ouvido Bluetooth Sem Fio Estéreo TWS i12',
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    shopeeUrl: 'https://shopee.com.br/search?keyword=fone%20de%20ouvido%20bluetooth%20tws',
    adGroup: 'Eletrônicos',
    description: 'Fone de excelente qualidade de áudio para música e ligações, confortável e livre de cabos.'
  },
  {
    id: '5',
    name: 'Mochila Antifurto Impermeável com Porta de Carga USB',
    price: 89.90,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    shopeeUrl: 'https://shopee.com.br/search?keyword=mochila%20antifurto%20usb',
    adGroup: 'Acessórios',
    description: 'Proteja seus pertences e carregue seus eletrônicos com estilo, segurança e conforto.'
  },
  {
    id: '6',
    name: 'Garrafa Térmica Digital Inteligente 500ml Inox LED',
    price: 39.90,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    shopeeUrl: 'https://shopee.com.br/search?keyword=garrafa%20termica%20digital%20led',
    adGroup: 'Utilidades',
    description: 'Indicação digital inteligente de temperatura ao toque na tampa, conservando suas bebidas quentes ou frias.'
  }
];

export const PRESET_IMAGES = [
  { label: 'Cozinha', url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80' },
  { label: 'Luminária/Umidificador', url: 'https://images.unsplash.com/photo-1519183071298-a2962feb14f4?auto=format&fit=crop&w=600&q=80' },
  { label: 'Fones Ouvido', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80' },
  { label: 'Mochila', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' },
  { label: 'Garrafa Térmica', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Moda Feminina', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
  { label: 'Maquiagem & Beleza', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
  { label: 'Suporte de Celular', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80' },
  { label: 'Organizador', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80' }
];

export const DEFAULT_AD_GROUPS = ['Todos', 'Eletrônicos', 'Cozinha', 'Casa & Decoração', 'Acessórios', 'Utilidades'];
