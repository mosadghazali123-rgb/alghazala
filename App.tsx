import React, { useState, useEffect, useMemo } from 'react';
import { 
  Language, Theme, Page, Product, Category, User, DashboardStats, SecurityLog, Review, WeightOption, StoreSettings
} from './types';
import { db } from './services/db';
import { api } from './services/api';
import { PRODUCTS } from './constants';
import { geminiService } from './services/geminiService';
import Button from './components/Button';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const translations = {
  ar: {
    storeName: "الغزالي", slogan: "أصل النقاء والجودة", admin: "لوحة التحكم الآمنة",
    revenue: "الإيرادات", orders: "الطلبات", products: "المنتجات", customers: "العملاء",
    security_logs: "سجلات الأمان", manage_reviews: "إدارة المراجعات",
    average_rating: "متوسط التقييم", logs: "Logs", status_secure: "النظام محمي بـ AES-256",
    save: "حفظ البيانات 👑", update_btn: "تحديث الأمان 🔐",
    login_title: "نظام الدخول المشفر",
    email: "البريد الإلكتروني", pass: "كلمة المرور", login: "دخول آمن",
    back_home: "العودة للمتجر", rating: "التقييمات",
    stock: "المخزون", min_stock: "تنبيه نقص المخزون", weight: "الوزن",
    price: "السعر", botanical: "المصدر النباتي", origin: "بلد المنشأ",
    add_new: "إضافة منتج جديد", edit: "تعديل المنتج",
    store_settings: "إعدادات المتجر", upload_logo: "رفع لوجو جديد",
    upload_hero: "تغيير صورة الغلاف",
    desc_ar: "الوصف بالعربي", desc_en: "Description (EN)",
    ai_gen: "توليد الوصف بالذكاء الاصطناعي", ai_loading: "جاري التوليد...",
    upload_product_img: "رفع صورة المنتج",
    motion_studio: "استوديو الحركة (Veo)",
    image_studio: "استوديو الصور (AI)",
    creative: "الاستوديو الإبداعي",
    start_generation: "ابدأ التوليد السحري ✨",
    select_key: "يجب اختيار مفتاح API مفعل به الدفع لاستخدام Veo",
    billing_link: "معلومات الدفع والتسعير",
    prompt_placeholder: "صف ما تريد إنشاءه (مثلاً: عسل يتساقط ببطء على ملعقة خشبية في غابة مشمسة)...",
    video_res: "الدقة", video_ratio: "نسبة العرض",
    categories: {
      honey: "عسل نحل", oils: "زيوت طبيعية", halawa: "طحينة وحلاوة",
      dates: "تمور", zamzam: "ماء زمزم", candles: "شموع", other: "أخرى"
    }
  },
  en: {
    storeName: "Al Ghazaly", slogan: "Origin of Purity", admin: "Secure Dashboard",
    revenue: "Revenue", orders: "Orders", products: "Products", customers: "Customers",
    security_logs: "Security Logs", manage_reviews: "Reviews",
    average_rating: "Avg Rating", logs: "Logs", status_secure: "Secured with AES-256",
    save: "Save Securely 👑", update_btn: "Update Security 🔐",
    login_title: "Encrypted Login",
    email: "Email", pass: "Password", login: "Secure Login",
    back_home: "Store", rating: "Ratings",
    stock: "Stock", min_stock: "Min Stock Alert", weight: "Weight",
    price: "Price", botanical: "Botanical Source", origin: "Origin",
    add_new: "Add New Product", edit: "Edit Product",
    store_settings: "Store Settings", upload_logo: "Upload Logo",
    upload_hero: "Upload Cover",
    desc_ar: "Arabic Description", desc_en: "English Description",
    ai_gen: "Generate Description with AI", ai_loading: "Generating...",
    upload_product_img: "Upload Product Image",
    motion_studio: "Motion Studio (Veo)",
    image_studio: "Image Studio (AI)",
    creative: "Creative Studio",
    start_generation: "Start Magic Generation ✨",
    select_key: "Must select a paid API key to use Veo video generation",
    billing_link: "Billing & Pricing Info",
    prompt_placeholder: "Describe what you want to create (e.g., honey dripping slowly onto a wooden spoon in a sunlit forest)...",
    video_res: "Resolution", video_ratio: "Aspect Ratio",
    categories: {
      honey: "Honey", oils: "Natural Oils", halawa: "Halawa & Tahini",
      dates: "Dates", zamzam: "Zamzam Water", candles: "Candles", other: "Other"
    }
  }
};

const CATEGORIES: Category[] = ['honey', 'oils', 'halawa', 'dates', 'zamzam', 'candles', 'other'];

const MotionStudio: React.FC<{ lang: Language, t: any }> = ({ lang, t }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [config, setConfig] = useState<{ resolution: '720p' | '1080p', aspectRatio: '16:9' | '9:16' }>({
    resolution: '720p',
    aspectRatio: '16:9'
  });

  const handleGenerate = async () => {
    if (!prompt) return;
    const hasKey = await window.aistudio?.hasSelectedApiKey();
    if (!hasKey) await window.aistudio?.openSelectKey();
    setIsGenerating(true);
    setVideoUrl(null);
    try {
      const url = await geminiService.generateVideo(prompt, config, (msg) => setProgressMsg(msg));
      setVideoUrl(url);
    } catch (err: any) {
      if (err.message?.includes("entity was not found")) {
        alert(t.select_key);
        await window.aistudio?.openSelectKey();
      } else alert("Error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border-2 border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <i className="fa-solid fa-film text-amber-500"></i> {t.motion_studio}
          </h2>
          <p className="text-slate-500 font-bold mt-1 text-sm">Powered by Google Veo 3.1</p>
        </div>
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-amber-500 hover:underline text-xs font-black">
          <i className="fa-solid fa-circle-info"></i> {t.billing_link}
        </a>
      </div>
      <div className="space-y-4">
        <textarea 
          className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 outline-none focus:border-amber-500 transition-all text-lg min-h-[150px]"
          placeholder={t.prompt_placeholder}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 px-2">{t.video_res}</label>
            <select 
              value={config.resolution} 
              onChange={e => setConfig({...config, resolution: e.target.value as any})}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="720p">720p (HD)</option>
              <option value="1080p">1080p (Full HD)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 px-2">{t.video_ratio}</label>
            <select 
              value={config.aspectRatio} 
              onChange={e => setConfig({...config, aspectRatio: e.target.value as any})}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="16:9">Landscape (16:9)</option>
              <option value="9:16">Portrait (9:16)</option>
            </select>
          </div>
        </div>
        <Button className="w-full py-5 text-xl" onClick={handleGenerate} isLoading={isGenerating} disabled={!prompt}>
          {isGenerating ? progressMsg : t.start_generation}
        </Button>
      </div>
      {videoUrl && (
        <div className="mt-8 rounded-3xl overflow-hidden border-4 border-amber-500 shadow-2xl bg-black aspect-video flex items-center justify-center">
          <video src={videoUrl} controls className="w-full h-full" autoPlay loop />
        </div>
      )}
    </div>
  );
};

const ImageStudio: React.FC<{ lang: Language, t: any }> = ({ lang, t }) => {
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransform = async () => {
    if (!sourceImg || !prompt) return;
    setIsProcessing(true);
    try {
      const res = await geminiService.transformImage(sourceImg, prompt);
      setResultImg(res);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border-2 border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <i className="fa-solid fa-wand-magic-sparkles text-amber-500"></i> {t.image_studio}
          </h2>
          <p className="text-slate-500 font-bold mt-1 text-sm">Image-to-Image with Gemini 2.5 Flash</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 relative group overflow-hidden">
            {sourceImg ? (
              <img src={sourceImg} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <i className="fa-solid fa-cloud-arrow-up text-5xl mb-4"></i>
                <p className="font-bold">{t.upload_product_img}</p>
              </div>
            )}
            <input 
              type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                  const r = new FileReader();
                  r.onload = () => setSourceImg(r.result as string);
                  r.readAsDataURL(f);
                }
              }}
            />
          </div>
          <textarea 
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 outline-none"
            placeholder="Edit instructions: 'Make background a professional white studio'..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button className="w-full py-4" onClick={handleTransform} isLoading={isProcessing} disabled={!sourceImg || !prompt}>
            Apply AI Edits
          </Button>
        </div>
        <div className="space-y-4">
           <div className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
             {resultImg ? (
               <img src={resultImg} className="w-full h-full object-cover animate-in" />
             ) : (
               <div className="text-slate-400 font-bold flex flex-col items-center">
                 <i className="fa-solid fa-sparkles text-4xl mb-2"></i>
                 <span>Result will appear here</span>
               </div>
             )}
           </div>
           {resultImg && <Button variant="outline" className="w-full" onClick={() => {
               const link = document.createElement('a');
               link.href = resultImg; link.download = 'alghazaly-ai-image.png'; link.click();
           }}>Download Result</Button>}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<{ lang: Language, setUser: any, setPage: any, t: any, onProductsUpdate: () => void, settings: StoreSettings, onSettingsUpdate: (s: StoreSettings) => void }> = ({ lang, setUser, setPage, t, onProductsUpdate, settings, onSettingsUpdate }) => {
  const [view, setView] = useState<'stats' | 'products' | 'settings' | 'motion' | 'image'>('stats');
  const [products, setProducts] = useState<Product[]>(db.getProducts());
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  const [isAiLoading, setIsAiLoading] = useState<{[key: string]: boolean}>({});

  const stats = useMemo(() => db.getStats(), []);
  const refreshLocal = () => setProducts(db.getProducts());

  const handleSaveSettings = () => {
    onSettingsUpdate(localSettings);
    alert(lang === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!');
  };

  const handleAiDescription = async (targetLang: 'ar' | 'en') => {
    if (!editingProduct?.name?.[targetLang] || !editingProduct?.category) return alert(lang === 'ar' ? 'يرجى إدخال اسم المنتج واختيار القسم أولاً' : 'Please enter product name and select category first');
    const key = `desc-${targetLang}`;
    setIsAiLoading(prev => ({ ...prev, [key]: true }));
    try {
      const desc = await geminiService.generateDescription(editingProduct.name[targetLang]!, editingProduct.category!, targetLang, editingProduct.botanical_source);
      setEditingProduct(prev => ({ ...prev!, description: { ...prev!.description!, [targetLang]: desc } }));
    } catch { alert(lang === 'ar' ? 'فشل توليد الوصف' : 'Failed to generate description'); }
    finally { setIsAiLoading(prev => ({ ...prev, [key]: false })); }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const res = await api.saveProduct(editingProduct);
    if (res.success) { setEditingProduct(null); refreshLocal(); onProductsUpdate(); }
    else alert(res.error);
  };

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto animate-in">
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-200 dark:border-slate-800 shadow-xl">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t.admin}</h1>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { id: 'stats', label: t.revenue, icon: 'fa-chart-line' },
            { id: 'products', label: t.products, icon: 'fa-box' },
            { id: 'image', label: 'Image Studio', icon: 'fa-wand-magic' },
            { id: 'motion', label: 'Veo Studio', icon: 'fa-film' },
            { id: 'settings', label: t.store_settings, icon: 'fa-gears' }
          ].map((v: any) => (
            <button key={v.id} onClick={() => setView(v.id)} className={`px-5 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${view === v.id ? 'bg-amber-500 text-black shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
              <i className={`fas ${v.icon}`}></i> <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
          <button onClick={() => { db.logout(); setUser(null); setPage('home'); }} className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><i className="fa-solid fa-power-off"></i></button>
        </div>
      </header>

      {view === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in">
          {[{l: t.revenue, v: stats.totalRevenue, s: 'ج.م'}, {l: t.orders, v: stats.totalOrders, s: ''}, {l: t.products, v: stats.totalProducts, s: ''}, {l: t.average_rating, v: stats.averageRating, s: '★'}].map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm text-center">
              <p className="text-slate-500 font-bold mb-2">{item.l}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{item.v.toLocaleString()} <small className="text-sm font-medium">{item.s}</small></h3>
            </div>
          ))}
        </div>
      )}

      {view === 'settings' && (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl space-y-10 animate-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="space-y-6 flex flex-col items-center">
               <h3 className="text-xl font-black self-start">{lang === 'ar' ? 'الهوية البصرية' : 'Branding'}</h3>
               <div className="relative group w-48 h-48">
                 <div className="w-full h-full rounded-full border-4 border-amber-500 p-1 overflow-hidden bg-slate-100 shadow-xl transition-all group-hover:scale-105">
                    <img src={localSettings.logoUrl} className="w-full h-full object-cover rounded-full bg-transparent" />
                 </div>
                 <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all">
                   <i className="fa-solid fa-camera text-white text-3xl"></i>
                   <input type="file" className="hidden" accept="image/*" onChange={e => {
                     const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = () => setLocalSettings({...localSettings, logoUrl: r.result as string}); r.readAsDataURL(f); }
                   }} />
                 </label>
                 <span className="absolute -bottom-2 bg-amber-500 text-black px-4 py-1 rounded-full text-xs font-black shadow-lg">{t.upload_logo}</span>
               </div>
               <div className="w-full space-y-4 pt-4">
                 <div className="relative group aspect-video rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-50 shadow-inner">
                   <img src={localSettings.heroImageUrl} className="w-full h-full object-cover" />
                   <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                     <i className="fa-solid fa-image text-white text-3xl"></i>
                     <input type="file" className="hidden" accept="image/*" onChange={e => {
                       const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = () => setLocalSettings({...localSettings, heroImageUrl: r.result as string}); r.readAsDataURL(f); }
                     }} />
                   </label>
                 </div>
                 <p className="text-center text-xs font-bold text-slate-500">{t.upload_hero}</p>
               </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
               <h3 className="text-xl font-black">{lang === 'ar' ? 'النصوص والعناوين' : 'Texts & Titles'}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {['ar', 'en'].map(l => (
                    <div key={l} className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400 px-2">{l === 'ar' ? 'اسم المتجر (عربي)' : 'Store Name (EN)'}</label>
                      <input value={(localSettings.storeName as any)[l]} onChange={e => setLocalSettings({...localSettings, storeName: {...localSettings.storeName, [l]: e.target.value}})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 outline-none focus:border-amber-500" />
                    </div>
                 ))}
                 {['ar', 'en'].map(l => (
                    <div key={l} className="space-y-2 md:col-span-2">
                      <label className="text-xs font-black uppercase text-slate-400 px-2">{l === 'ar' ? 'شعار المتجر (عربي)' : 'Slogan (EN)'}</label>
                      <input value={(localSettings.slogan as any)[l]} onChange={e => setLocalSettings({...localSettings, slogan: {...localSettings.slogan, [l]: e.target.value}})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 outline-none focus:border-amber-500" />
                    </div>
                 ))}
               </div>
               <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Button className="w-full py-5 text-xl" onClick={handleSaveSettings}>{t.save}</Button>
               </div>
            </div>
          </div>
        </div>
      )}

      {view === 'motion' && <MotionStudio lang={lang} t={t} />}
      {view === 'image' && <ImageStudio lang={lang} t={t} />}

      {view === 'products' && (
        <div className="space-y-8 animate-in">
           <div className="flex justify-between items-center">
             <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.products}</h2>
             <Button onClick={() => setEditingProduct({ name: { ar: '', en: '' }, description: { ar: '', en: '' }, category: 'honey', images: [], weight_options: [{weight: '1kg', price: 0}], stock: 0, botanical_source: '', origin_country: 'Egypt' })} icon="fa-plus">{t.add_new}</Button>
           </div>
           {editingProduct && (
             <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
                <form onSubmit={handleSaveProduct} className="bg-white dark:bg-slate-900 w-full max-w-4xl p-10 rounded-[3rem] shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 animate-in">
                  <div className="flex flex-col items-center mb-10">
                    <div className="w-44 h-44 rounded-full border-[6px] border-amber-500 p-1.5 overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xl relative group">
                       {editingProduct.images?.[0] ? <img src={editingProduct.images[0]} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><i className="fa-solid fa-image text-4xl"></i></div>}
                       <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer rounded-full transition-all">
                         <i className="fa-solid fa-camera text-white text-3xl"></i>
                         <input type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = () => setEditingProduct({...editingProduct, images: [r.result as string]}); r.readAsDataURL(f); } }} />
                       </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <input placeholder="الاسم بالعربي" value={editingProduct.name?.ar} onChange={e => setEditingProduct({...editingProduct, name: {...editingProduct.name!, ar: e.target.value}})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none focus:border-amber-500" required />
                      <input placeholder="Product Name (EN)" value={editingProduct.name?.en} onChange={e => setEditingProduct({...editingProduct, name: {...editingProduct.name!, en: e.target.value}})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none focus:border-amber-500" required />
                      <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as Category})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none">
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{t.categories[cat]}</option>)}
                      </select>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" inputMode="decimal" placeholder={t.price} value={editingProduct.weight_options?.[0]?.price} 
                          onChange={e => { const v = e.target.value.replace(/[^0-9.]/g, ''); setEditingProduct({...editingProduct, weight_options: [{...editingProduct.weight_options![0], price: v === '' ? 0 : Number(v)}]}); }} 
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none" required />
                        <input type="text" inputMode="numeric" placeholder={t.stock} value={editingProduct.stock} 
                          onChange={e => { const v = e.target.value.replace(/\D/g, ''); setEditingProduct({...editingProduct, stock: v === '' ? 0 : Number(v)}); }} 
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none" required />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <textarea placeholder={t.desc_ar} value={editingProduct.description?.ar} onChange={e => setEditingProduct({...editingProduct, description: {...editingProduct.description!, ar: e.target.value}})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none min-h-[120px]" />
                        <button type="button" onClick={() => handleAiDescription('ar')} disabled={isAiLoading['desc-ar']} className="absolute bottom-3 left-3 bg-amber-500 text-black text-[10px] font-black px-3 py-2 rounded-lg shadow-lg flex items-center gap-1.5 hover:scale-105 transition-all">
                          <i className={`fa-solid ${isAiLoading['desc-ar'] ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i> {isAiLoading['desc-ar'] ? t.ai_loading : t.ai_gen}
                        </button>
                      </div>
                      <div className="relative">
                        <textarea placeholder={t.desc_en} value={editingProduct.description?.en} onChange={e => setEditingProduct({...editingProduct, description: {...editingProduct.description!, en: e.target.value}})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none min-h-[120px]" />
                        <button type="button" onClick={() => handleAiDescription('en')} disabled={isAiLoading['desc-en']} className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-black px-3 py-2 rounded-lg shadow-lg flex items-center gap-1.5 hover:scale-105 transition-all">
                          <i className={`fa-solid ${isAiLoading['desc-en'] ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i> {isAiLoading['desc-en'] ? t.ai_loading : t.ai_gen}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <Button type="submit" className="flex-1 py-5">{t.save}</Button>
                    <Button type="button" variant="outline" onClick={() => setEditingProduct(null)} className="flex-1 py-5">إلغاء</Button>
                  </div>
                </form>
             </div>
           )}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {products.map(p => (
               <div key={p.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 flex flex-col justify-between group hover:border-amber-500 transition-all">
                 <div className="flex gap-4 items-center">
                   <img src={p.images[0]} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                   <div>
                     <h4 className="font-black text-slate-900 dark:text-white">{p.name[lang]}</h4>
                     <p className="text-xs text-slate-500 font-bold">{t.categories[p.category]}</p>
                   </div>
                 </div>
                 <div className="mt-6 flex justify-between items-center">
                   <span className={`text-xs font-black px-3 py-1 rounded-full ${p.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{p.stock} في المخزن</span>
                   <Button variant="secondary" onClick={() => setEditingProduct(p)} icon="fa-pen" />
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');
  const [page, setPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(db.getSession());
  const [products, setProducts] = useState<Product[]>([]);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<StoreSettings>(db.getSettings());

  const refreshProducts = async () => {
    const prods = await api.getProducts({ activeOnly: true });
    if (prods.length === 0 && page === 'home') {
      PRODUCTS.forEach(p => db.saveProduct({...p, minimum_stock_alert: 5}));
      setProducts(await api.getProducts({ activeOnly: true }));
    } else setProducts(prods);
  };

  useEffect(() => { refreshProducts(); }, [page]);
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  const handleSettingsUpdate = (s: StoreSettings) => { db.updateSettings(s); setSettings(s); };
  const t = translations[lang];

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 flex flex-col font-cairo ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <nav className="fixed top-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-[100] h-20 px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={() => user ? setPage('admin_dashboard') : setPage('admin_login')} className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all"><i className="fa-solid fa-crown text-lg"></i></button>
             <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black">{lang === 'ar' ? 'English' : 'عربي'}</button>
          </div>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('home')}>
            <div className="w-12 h-12 rounded-full border-2 border-amber-500 p-0.5 bg-transparent overflow-hidden shadow-lg">
              <img src={settings.logoUrl} className="w-full h-full object-cover rounded-full" alt="Logo" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white hidden sm:block">{settings.storeName[lang]}</h1>
          </div>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all shadow-inner">
            <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>
        </div>
      </nav>

      <main className="flex-1 pt-20">
        {page === 'home' && (
          <div className="animate-in">
             <div className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden mb-20">
                <div className="absolute inset-0 z-0">
                  <img src={settings.heroImageUrl} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white dark:to-slate-950"></div>
                </div>
                <div className="relative z-10 text-center px-6 max-w-4xl">
                   <h1 className="text-5xl md:text-8xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
                     {lang === 'ar' ? 'جودة طبيعية ' : 'Natural Quality '} <span className="text-amber-500">{lang === 'ar' ? 'تثق بها' : 'You Trust'}</span>
                   </h1>
                   <p className="text-xl md:text-2xl text-slate-200 font-bold max-w-2xl mx-auto drop-shadow-md">{settings.slogan[lang]}</p>
                </div>
             </div>
             <div className="max-w-7xl mx-auto px-6 pb-20">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {products.map(p => (
                    <div key={p.id} onClick={() => setActiveProduct(p)} className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 overflow-hidden flex flex-col group hover:border-amber-500 transition-all cursor-pointer">
                      <div className="aspect-[4/5] relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                        <div className="absolute top-4 right-4 px-3 py-1 bg-black/70 text-amber-500 rounded-full text-[10px] font-black">{t.categories[p.category]}</div>
                      </div>
                      <div className="p-8 flex-1 flex flex-col">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{p.name[lang]}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-xs font-bold mb-6 line-clamp-2">{p.description[lang]}</p>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{p.final_price.toLocaleString()} <small className="text-[10px]">ج.م</small></span>
                          <Button icon="fa-cart-plus" className="!w-10 !h-10 !p-0 !rounded-xl" />
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
             </div>
          </div>
        )}

        {page === 'admin_login' && (
          <div className="pt-20 flex justify-center px-6">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800">
               <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 text-center">{t.login_title}</h2>
               <form onSubmit={async e => {
                 e.preventDefault(); const fd = new FormData(e.currentTarget); const res = await api.login(fd.get('email') as string, fd.get('pass') as string);
                 if(res.success) { setUser(res.user!); setPage('admin_dashboard'); } else alert('خطأ في البيانات');
               }} className="space-y-4">
                 <input name="email" type="email" placeholder={t.email} required className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 outline-none" />
                 <input name="pass" type="password" placeholder={t.pass} required className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 outline-none" />
                 <Button className="w-full py-4" type="submit">{t.login}</Button>
               </form>
            </div>
          </div>
        )}

        {page === 'admin_dashboard' && user && <AdminDashboard lang={lang} setUser={setUser} setPage={setPage} t={t} onProductsUpdate={refreshProducts} settings={settings} onSettingsUpdate={handleSettingsUpdate} />}
      </main>

      {activeProduct && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in">
          <div className="bg-white dark:bg-slate-950 w-full max-w-5xl rounded-[3rem] flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
            <div className="w-full md:w-1/2 relative"><img src={activeProduct.images[0]} className="w-full h-full object-cover" /><button onClick={() => setActiveProduct(null)} className="absolute top-6 right-6 w-10 h-10 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-all"><i className="fa-solid fa-xmark"></i></button></div>
            <div className="w-full md:w-1/2 p-10 overflow-y-auto">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">{activeProduct.name[lang]}</h2>
              <div className="flex gap-2 mb-6"><span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-bold">{t.categories[activeProduct.category]}</span>{activeProduct.botanical_source && <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold">{activeProduct.botanical_source}</span>}</div>
              <p className="text-slate-600 dark:text-slate-400 font-bold mb-8 leading-relaxed">{activeProduct.description[lang]}</p>
              <div className="text-4xl font-black text-amber-500 mb-8">{activeProduct.final_price.toLocaleString()} <span className="text-sm">ج.م</span></div>
              <Button className="w-full py-5 text-xl" icon="fa-shopping-bag">إضافة للسلة الآن</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;