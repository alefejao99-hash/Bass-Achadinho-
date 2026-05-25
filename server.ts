/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy client generation for Gemini to avoid crash if API key is not yet set
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper to extract basic OpenGraph tags if we don't use Gemini or as a fallback
function fallbackScraper(html: string): { name: string; price: number; imageUrl: string; description: string } {
  const result = {
    name: 'Produto Shopee',
    price: 0,
    imageUrl: '',
    description: '',
  };

  // Try to find title in og:title or title tag
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
  if (ogTitleMatch && ogTitleMatch[1]) {
    result.name = ogTitleMatch[1].trim();
  } else {
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleTagMatch && titleTagMatch[1]) {
      result.name = titleTagMatch[1].trim();
    }
  }

  // Try to find image in og:image or twitter:image
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
  if (ogImageMatch && ogImageMatch[1]) {
    result.imageUrl = ogImageMatch[1].trim();
  }

  // Try to find description
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (ogDescMatch && ogDescMatch[1]) {
    result.description = ogDescMatch[1].trim();
  }

  // Try to find price
  // Marketplaces often format inside ld+json/scripts as "price": "12.34" or "price": 12.34
  const priceAmountMatch = html.match(/["']price["']\s*:\s*["']?([\d.,]+)["']?/i) ||
                           html.match(/<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i) ||
                           html.match(/<meta[^>]*property=["']price:amount["'][^>]*content=["']([^"']+)["']/i);
  if (priceAmountMatch && priceAmountMatch[1]) {
    const rawPrice = priceAmountMatch[1].replace(',', '.');
    const parsedPrice = parseFloat(rawPrice);
    if (!isNaN(parsedPrice)) {
      result.price = parsedPrice;
    }
  }

  // Clean title suffix like " | Shopee Brasil"
  result.name = result.name.replace(/\s*\|\s*Shopee\s*Brasil.*/gi, '');

  return result;
}

// POST: /api/expand-shopee-link
// Expands shopee short links (shope.ee) to long links or resolves redirected links
async function resolveUrlRedirect(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    return response.url || url;
  } catch (err) {
    console.error('Error resolving URL redirect:', err);
    return url;
  }
}

// API endpoint to fetch name, price, description and image with high precision
app.post('/api/fetch-shopee-metadata', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL do produto é obrigatória!' });
  }

  try {
    // 1. Resolve potential Shopee shortlink (shope.ee) first
    const resolvedUrl = await resolveUrlRedirect(url);
    console.log(`Fetching Shopee URL: ${resolvedUrl}`);

    // Receive page content
    const fetchResponse = await fetch(resolvedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });

    if (!fetchResponse.ok) {
      throw new Error(`Shopee retornou status: ${fetchResponse.status}`);
    }

    const html = await fetchResponse.text();

    // 2. Perform fallback basic scraping right away so we have initial parameters
    const basicInfo = fallbackScraper(html);

    // 3. Try to use Gemini to refine this info and extract the EXACT price and neat product name!
    const gemini = getGeminiClient();
    if (gemini) {
      // To save tokens and stay within content limits, we take the head segment or script content
      // which contains meta values, titles, and json data
      const sampleHtml = html.substring(0, 120000); // 120KB is ample for heads & script blocks

      try {
        const prompt = `Você é uma inteligência artificial especialista em marketing de afiliados da Shopee. 
Analise este trecho de HTML de um produto da Shopee Brasil e extraia os dados abaixo com precisão no formato JSON:
- "name" (O nome real, completo e correto do produto, limpo de códigos internos de lojistas ou caracteres espalhafatosos se houver - remova sufixos de plataformas como "Shopee Brasil")
- "price" (O valor atual do produto em formato numérico decimal. Exemplo: se for R$ 34,90 deve retornar 34.90. Se encontrar uma faixa de preço, use o menor valor ou o valor em destaque)
- "imageUrl" (O link absoluto da foto principal do produto. Exemplo: https://cf.shopee.com.br/file/...)
- "description" (Uma frase curta, persuasiva e convidativa sobre os benefícios deste produto para uso na divulgação de vendas)

Retorne estritamente o JSON contendo esses campos de acordo com as informações encontradas no HTML. Se não achar algum campo, use as estimativas básicas: 
Nome estimado: "${basicInfo.name}"
Preço estimado: ${basicInfo.price}
Imagem estimada: "${basicInfo.imageUrl}"
Descrição estimada: "${basicInfo.description}"

HTML do Produto:
${sampleHtml}`;

        const geminiRes = await gemini.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.NUMBER },
                imageUrl: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['name', 'price', 'imageUrl', 'description']
            }
          }
        });

        if (geminiRes.text) {
          const parsed = JSON.parse(geminiRes.text);
          console.log('Gemini Parsed Info:', parsed);
          // Return the high precision info! Ensure price is a valid number
          const finalPrice = parsed.price && !isNaN(Number(parsed.price)) ? Number(parsed.price) : basicInfo.price;
          
          return res.json({
            name: parsed.name || basicInfo.name,
            price: finalPrice || 29.90, // fallback to typical value if both fail
            imageUrl: parsed.imageUrl || basicInfo.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
            description: parsed.description || basicInfo.description,
            shopeeUrl: resolvedUrl,
          });
        }
      } catch (geminiError) {
        console.error('Gemini extraction failed, using fallback regex:', geminiError);
      }
    }

    // Fallback response with extracted metadata
    return res.json({
      name: basicInfo.name || 'Produto Shopee',
      price: basicInfo.price || 19.90,
      imageUrl: basicInfo.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
      description: basicInfo.description || 'Confira os detalhes e compre esse achado em destaque com preço especial.',
      shopeeUrl: resolvedUrl,
    });

  } catch (error: any) {
    console.error('Error fetching Shopee info:', error.message);
    return res.status(500).json({ 
      error: 'Não foi possível carregar as informações do link fornecido. Verifique se o link está ativo.',
      details: error.message
    });
  }
});

// Vite middleware for rendering and hot-reloading dev frontend and server listen wrapping
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully operational on port ${PORT}`);
  });
}

start();
