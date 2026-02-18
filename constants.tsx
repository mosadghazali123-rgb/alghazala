
import { Product, Review } from './types';

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/share/1HArRNEWAV/",
  instagram: "https://www.instagram.com/the_honey_off_algazala?igsh=aWE1Z3ZqYjk4d2Zj"
};

export const PRODUCTS: Product[] = [
  { 
    id: 'h1', 
    name: { ar: 'عسل سدر جبلي فاخر', en: 'Premium Mountain Sidr Honey' }, 
    category: 'honey', 
    price: 950, 
    images: ['https://images.unsplash.com/photo-1589733901241-5d5297e7dec2?q=80&w=800'], 
    description: { ar: 'عسل سدر طبيعي خام مستخلص من جبال اليمن، يتميز بقوامه الكثيف.', en: 'Natural raw Sidr honey extracted from Yemen mountains, thick texture.' }, 
    // Fix: Replaced 'weight' with 'weight_options' and included required fields for Product type
    weight_options: [{ weight: '1kg', price: 950 }], 
    stock: 50, 
    sku: 'HNY-SDR-01', 
    status: 'active', 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cartAddCount: 0,
    purchaseCount: 0,
    final_price: 950,
    minimum_stock_alert: 5,
    origin_country: 'Egypt',
    production_date: new Date().toISOString(),
    expiration_date: new Date().toISOString(),
    featured: true
  },
  { 
    id: 'o1', 
    name: { ar: 'زيت زيتون بكر ممتاز', en: 'Extra Virgin Olive Oil' }, 
    category: 'oils', 
    price: 480, 
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800'], 
    description: { ar: 'عصرة أولى على البارد من أجود أنواع الزيتون السيناوي.', en: 'First cold press from the finest Sinai olives.' }, 
    // Fix: Replaced 'weight' with 'weight_options' and included required fields for Product type
    weight_options: [{ weight: '1L', price: 480 }], 
    stock: 100, 
    sku: 'OIL-OLV-01', 
    status: 'active', 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cartAddCount: 0,
    purchaseCount: 0,
    final_price: 480,
    minimum_stock_alert: 5,
    origin_country: 'Egypt',
    production_date: new Date().toISOString(),
    expiration_date: new Date().toISOString(),
    featured: true
  }
];

const names = ["أحمد حسن", "محمد علي", "محمود إبراهيم", "مصطفى كامل", "ياسين السيد", "سارة محمود", "إيمان علي", "نورهان فتحي", "دعاء الصاوي", "شريف منير", "خالد يوسف", "طارق شوقي", "عماد متعب", "عصام الحضري", "حازم إمام", "وائل جمعة", "منى زكي", "هند صبري", "يسرا", "أحمد السقا", "كريم عبد العزيز", "محمد هنيدي", "أشرف عبد الباقي", "باسم سمرة", "ماجد الكدواني", "بيومي فؤاد", "أمير كرارة", "ظافر العابدين", "عمر يوسف", "علي ربيع"];

const phrases = [
  "العسل بجد ملوش مثيل، ريحة وطعم وقوام أصلي فعلاً.",
  "جربت عسل الموالح وحقيقي فرق معايا في المناعة جداً.",
  "زيت الزيتون ريحته بتجيب لآخر البيت، أول مرة أجرب زيت بكر حقيقي كدة.",
  "الخدمة ممتازة والتوصيل كان سريع جداً، شكراً للغزالي.",
  "والله العظيم العسل تحفة، أحسن من ماركات تانية كتير غالية عالفاضي.",
  "التغليف شيك أوي ويحافظ على الحاجة، دي أهم حاجة عندي.",
  "جبت منه لولادي وعجبهم جداً، هكرر الطلب تاني أكيد.",
  "يا جماعة زيت الزيتون ده وهم، خفيف وطعمه يجنن في السلطة.",
  "شكراً على الأمانة، الحاجة وصلت زي الوصف بالظبط وأحسن.",
  "عسل السدر أصلي مليون في المية، ربنا يبارك ليكم.",
  "كنت خايف أشتري أونلاين بس الغزالي طلع قد الثقة.",
  "أحلى حاجة إن الحاجة طبيعية ومن غير إضافات.",
  "التعامل قمة في الرقي والذوق، بجد تسلموا.",
  "الأسعار مناسبة جداً مقارنة بالجودة اللي وصلتني.",
  "طلبت كمية ووصلت في ميعادها، بجد شابوه.",
  "عسل الموالح خفيف وجميل جداً للفطار.", 
  "جربت أنواع كتير بس ده فعلاً طعم النحل الحقيقي.",
  "يا ريت كل المواقع زيكم في المصداقية والسرعة.",
  "الحاجة مغلفة كويس جداً ومفيش أي تسريب حصل في الزيت.",
  "منتج مصري يشرف بجد، فخورين بيكم."
];

export const REVIEWS: Review[] = Array.from({ length: 100 }).map((_, i) => {
  const randomDate = new Date(2025, 0, Math.floor(Math.random() * 60) + 1); // من يناير 2025
  return {
    id: `rev-${i}`,
    productId: Math.random() > 0.5 ? 'h1' : 'o1',
    userName: names[Math.floor(Math.random() * names.length)],
    rating: Math.floor(Math.random() * 3) + 3, // من 3 لـ 5
    comment: phrases[Math.floor(Math.random() * phrases.length)],
    date: randomDate.toISOString().split('T')[0],
    approved: true
  };
});
