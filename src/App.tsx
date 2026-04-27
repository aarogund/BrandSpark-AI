/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Palette, RefreshCw, Layers, Copy, Check, Download, Share2 } from 'lucide-react';
import { generateBrandDetails, generateLogo, BrandIdentity } from './services/geminiService';

export default function App() {
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<BrandIdentity | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!idea.trim() || isGenerating) return;

    setIsGenerating(true);
    setResult(null);
    setLogoUrl(null);

    try {
      // Step 1: Generate Text Details
      const details = await generateBrandDetails(idea);
      setResult(details);

      // Step 2: Generate Logo
      try {
        const url = await generateLogo(details.imagePrompt);
        setLogoUrl(url);
      } catch (imgError) {
        console.error('Logo generation failed:', imgError);
        // Fallback to a placeholder if image generation fails
        setLogoUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(details.name)}&background=random&size=512`);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-50/80 backdrop-blur-md border-b border-neutral-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-xl">BrandSpark</span>
          </div>
          <button 
            onClick={() => { setIdea(''); setResult(null); setLogoUrl(null); }}
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {!result && !isGenerating ? (
            <motion.section
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
                  Turn your idea into a <span className="italic text-neutral-500">brand.</span>
                </h1>
                <p className="text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Enter your business concept and we'll generate a complete identity: name, tagline, logo, and palette.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="relative group">
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="e.g., A sustainable coffee brand that helps reforestation..."
                    className="w-full min-h-[160px] p-5 rounded-2xl border-2 border-neutral-200 focus:border-neutral-900 focus:ring-0 transition-all resize-none text-lg bg-white shadow-sm group-hover:border-neutral-300"
                    required
                  />
                  <div className="absolute bottom-4 right-4 text-xs font-mono text-neutral-400 group-focus-within:text-neutral-900">
                    {idea.length} / 500
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!idea.trim() || isGenerating}
                  className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
                >
                  Generate Identity
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              <div className="flex flex-wrap gap-2 justify-center pt-4">
                {['SaaS Platform', 'Eco-friendly Fashion', 'Modern Bakery', 'Pet Grooming'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setIdea(tag)}
                    className="px-4 py-2 rounded-full border border-neutral-200 text-sm font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-all active:scale-95"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.section>
          ) : isGenerating ? (
            <motion.section
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-8"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-neutral-900 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold tracking-tight">Designing your brand...</h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
                  className="text-neutral-500 font-mono text-sm"
                >
                  Brewing creative names & sketching logos
                </motion.p>
              </div>
            </motion.section>
          ) : result && (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Logo & Header */}
              <div className="text-center space-y-6">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-48 h-48 mx-auto bg-white rounded-3xl border border-neutral-200 shadow-xl p-6 flex items-center justify-center overflow-hidden relative group"
                >
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Brand Logo" 
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-neutral-300 animate-pulse">
                      <Layers className="w-12 h-12" />
                      <span className="text-xs font-mono">Generating Image...</span>
                    </div>
                  )}
                </motion.div>

                <div className="space-y-2">
                  <h1 className="text-5xl font-black tracking-tighter uppercase">{result.name}</h1>
                  <p className="text-xl text-neutral-500 italic font-serif leading-relaxed">"{result.tagline}"</p>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Description Card */}
                <div className="p-6 bg-white rounded-3xl border border-neutral-200 shadow-sm space-y-3 md:col-span-2">
                  <div className="flex items-center gap-2 text-neutral-400 font-bold text-xs uppercase tracking-widest">
                    <Sparkles className="w-4 h-4" />
                    Brand Mission
                  </div>
                  <p className="text-neutral-700 leading-relaxed text-lg">
                    {result.description}
                  </p>
                </div>

                {/* Color Palette */}
                <div className="p-6 bg-white rounded-3xl border border-neutral-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-neutral-400 font-bold text-xs uppercase tracking-widest">
                      <Palette className="w-4 h-4" />
                      Color Palette
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.entries(result.colorPalette) as [string, string][]).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <button
                          onClick={() => copyToClipboard(value, key)}
                          className="w-full aspect-square rounded-xl shadow-inner border border-neutral-100 hover:scale-105 transition-transform group relative overflow-hidden"
                          style={{ backgroundColor: value }}
                        >
                           <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                              {copiedField === key ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                           </div>
                        </button>
                        <div className="text-[10px] font-mono text-center text-neutral-400 uppercase truncate">
                          {key}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-6 bg-white rounded-3xl border border-neutral-200 shadow-sm flex flex-col justify-between gap-4">
                   <div className="flex items-center gap-2 text-neutral-400 font-bold text-xs uppercase tracking-widest">
                    <RefreshCw className="w-4 h-4" />
                    Quick Actions
                  </div>
                  
                  <div className="space-y-2">
                    <button className="w-full py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                      <Download className="w-4 h-4" /> Save Brand Assets
                    </button>
                    <button className="w-full py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                      <Share2 className="w-4 h-4" /> Share Identity
                    </button>
                  </div>

                  <button 
                    onClick={() => handleGenerate()}
                    className="w-full py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    Generate Another
                  </button>
                </div>
              </div>

              {/* Prompt Visual Debug (Optional/Admin) */}
              <div className="p-4 bg-neutral-100 rounded-2xl border border-neutral-200">
                <p className="text-[10px] text-neutral-400 uppercase font-bold mb-2">Internal Logo Prompt</p>
                <p className="text-xs text-neutral-500 font-mono">
                  {result.imagePrompt}
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {copiedField && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-neutral-900 text-white rounded-full text-xs font-medium shadow-xl z-[100]"
          >
            Copied {copiedField} hex code!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
