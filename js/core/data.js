/* =========================================================
   THE CANDLEIER — INTEGRATION SETTINGS & INVENTORY
   ========================================================= */
const CANDLEIER_CONFIG = {
  shopifyStoreDomain: window.SHOPIFY_STORE_DOMAIN || '',
  shopifyStorefrontToken: window.SHOPIFY_STOREFRONT_TOKEN || '',
  shopifyApiVersion: '2024-04',
  customerAccountUrl: '/account.html',
  pincodeServiceabilityEndpoint: '/api/check-pincode',
  orderTrackingEndpoint: '',
  ga4MeasurementId: '',
  metaPixelId: ''
};

// Asynchronously fetch server-side configuration if available
(function initConfig() {
  if (typeof fetch === 'function') {
    fetch('/api/config')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          if (data.shopifyStoreDomain && !CANDLEIER_CONFIG.shopifyStoreDomain) {
            CANDLEIER_CONFIG.shopifyStoreDomain = data.shopifyStoreDomain;
          }
          if (data.shopifyStorefrontToken && !CANDLEIER_CONFIG.shopifyStorefrontToken) {
            CANDLEIER_CONFIG.shopifyStorefrontToken = data.shopifyStorefrontToken;
          }
          if (data.shopifyApiVersion) {
            CANDLEIER_CONFIG.shopifyApiVersion = data.shopifyApiVersion;
          }
          if (data.ga4MeasurementId) {
            CANDLEIER_CONFIG.ga4MeasurementId = data.ga4MeasurementId;
          }
          if (data.metaPixelId) {
            CANDLEIER_CONFIG.metaPixelId = data.metaPixelId;
          }
          if (data.orderTrackingEndpoint) {
            CANDLEIER_CONFIG.orderTrackingEndpoint = data.orderTrackingEndpoint;
          }
          if (window.CandleierAnalytics && typeof window.CandleierAnalytics.init === 'function') {
            window.CandleierAnalytics.init(CANDLEIER_CONFIG);
          }
        }
      })
      .catch(() => {});
  }
})();

const storeCategories = [
  "Premium Luxury Candles",
  "Metal Collection",
  "Diffusers and Aromas",
  "Wooden Collection",
  "Home essentials",
  "Seven Chakra- Positivity collection"
];

const CANDLE_INVENTORY = [
  { id: 1, title: "Golden Glow Votives – Set of 2", category: "Premium Luxury Candles", price: 279, origPrice: 349, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 2, title: "Ivory Glow Votive", category: "Premium Luxury Candles", price: 149, origPrice: 169, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 3, title: "Colour Glow Votives", category: "Premium Luxury Candles", price: 179, origPrice: 199, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 4, title: "Diamond Glow Jar – White", category: "Premium Luxury Candles", price: 849, origPrice: 999, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 5, title: "Diamond Glow Jar – Black", category: "Premium Luxury Candles", price: 849, origPrice: 999, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 6, title: "Diamond Glow Jar – Amber", category: "Premium Luxury Candles", price: 849, origPrice: 999, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 7, title: "Mosaic Glow Candle", category: "Premium Luxury Candles", price: 449, origPrice: 499, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 8, title: "Crystal Glow Candle", category: "Premium Luxury Candles", price: 849, origPrice: 999, burn: "30-55 Hours", badge: "BESTSELLER", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 9, title: "Triple Glow Bowl Candle", category: "Premium Luxury Candles", price: 799, origPrice: 899, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 10, title: "Double Glow Jar Candle", category: "Premium Luxury Candles", price: 749, origPrice: 849, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 11, title: "Grand Pillar – White – 12\"", category: "Premium Luxury Candles", price: 1749, origPrice: 1899, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 12, title: "Grand Pillar – Black – 12\"", category: "Premium Luxury Candles", price: 1749, origPrice: 1899, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 13, title: "Grand Pillar – Red – 12\"", category: "Premium Luxury Candles", price: 1749, origPrice: 1899, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 14, title: "Grand Pillar – Amber – 12\"", category: "Premium Luxury Candles", price: 1749, origPrice: 1899, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 15, title: "Classic Pillar – White – 9\"", category: "Premium Luxury Candles", price: 1549, origPrice: 1699, burn: "30-55 Hours", badge: "BESTSELLER", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 16, title: "Classic Pillar – Black – 9\"", category: "Premium Luxury Candles", price: 1549, origPrice: 1699, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 17, title: "Classic Pillar – Red – 9\"", category: "Premium Luxury Candles", price: 1549, origPrice: 1699, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 18, title: "Classic Pillar – Amber – 9\"", category: "Premium Luxury Candles", price: 1549, origPrice: 1699, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 19, title: "Mini Pillar – White – 6\"", category: "Premium Luxury Candles", price: 1349, origPrice: 1499, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 20, title: "Mini Pillar – Black – 6\"", category: "Premium Luxury Candles", price: 1349, origPrice: 1499, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 21, title: "Mini Pillar – Red – 6\"", category: "Premium Luxury Candles", price: 1349, origPrice: 1499, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 22, title: "Mini Pillar – Amber – 6\"", category: "Premium Luxury Candles", price: 1349, origPrice: 1499, burn: "30-55 Hours", badge: "BESTSELLER", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 23, title: "Grand Square Candle – White – 12\"", category: "Premium Luxury Candles", price: 1749, origPrice: 1899, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 24, title: "Grand Square Candle – Black – 12\"", category: "Premium Luxury Candles", price: 1749, origPrice: 1899, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 25, title: "Grand Square Candle – Red – 12\"", category: "Premium Luxury Candles", price: 1749, origPrice: 1899, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 26, title: "Grand Square Candle – Amber – 12\"", category: "Premium Luxury Candles", price: 1749, origPrice: 1899, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 27, title: "Classic Square Candle – White – 9\"", category: "Premium Luxury Candles", price: 1549, origPrice: 1699, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 28, title: "Classic Square Candle – Black – 9\"", category: "Premium Luxury Candles", price: 1549, origPrice: 1699, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 29, title: "Classic Square Candle – Red – 9\"", category: "Premium Luxury Candles", price: 1549, origPrice: 1699, burn: "30-55 Hours", badge: "BESTSELLER", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 30, title: "Classic Square Candle – Amber – 9\"", category: "Premium Luxury Candles", price: 1549, origPrice: 1699, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 31, title: "Mini Square Candle – White – 6\"", category: "Premium Luxury Candles", price: 1349, origPrice: 1499, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 32, title: "Mini Square Candle – Black – 6\"", category: "Premium Luxury Candles", price: 1349, origPrice: 1499, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 33, title: "Mini Square Candle – Red – 6\"", category: "Premium Luxury Candles", price: 1349, origPrice: 1499, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 34, title: "Mini Square Candle – Amber – 6\"", category: "Premium Luxury Candles", price: 1349, origPrice: 1499, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 35, title: "Ribbed Glow Pillar – Red", category: "Premium Luxury Candles", price: 549, origPrice: 699, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 36, title: "Ribbed Glow Pillar – White", category: "Premium Luxury Candles", price: 549, origPrice: 699, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 37, title: "Ribbed Glow Pillar – Amber", category: "Premium Luxury Candles", price: 549, origPrice: 699, burn: "30-55 Hours", badge: "BESTSELLER", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 38, title: "Ribbed Glow Pillar – Black", category: "Premium Luxury Candles", price: 549, origPrice: 699, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 39, title: "Mandala Glow Tin – Large", category: "Premium Luxury Candles", price: 399, origPrice: 499, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 40, title: "Mandala Glow Tin – Small", category: "Premium Luxury Candles", price: 399, origPrice: 499, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 41, title: "Golden Metal Luxe Jar Candle", category: "Metal Collection", price: 849, origPrice: 899, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 42, title: "Golden Metal Bowl Candle", category: "Metal Collection", price: 599, origPrice: 699, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 43, title: "Hazy Metal Luxe Jar Candle", category: "Metal Collection", price: 749, origPrice: 799, burn: "30-55 Hours", badge: "BESTSELLER", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 44, title: "Floral Glow Metal Collection – Set of 3", category: "Metal Collection", price: 849, origPrice: 999, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 45, title: "Metal Glow Votive", category: "Metal Collection", price: 499, origPrice: 599, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 46, title: "Neroli Reed Diffuser", category: "Diffusers and Aromas", price: 849, origPrice: 999, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 47, title: "Jasmine Reed Diffuser", category: "Diffusers and Aromas", price: 849, origPrice: 999, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 48, title: "Lemongrass Reed Diffuser", category: "Diffusers and Aromas", price: 849, origPrice: 999, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 49, title: "Lavender Reed Diffuser", category: "Diffusers and Aromas", price: 849, origPrice: 999, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 50, title: "Water Lily Reed Diffuser", category: "Diffusers and Aromas", price: 849, origPrice: 999, burn: "30-55 Hours", badge: "BESTSELLER", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 51, title: "Oud Reed Diffuser", category: "Diffusers and Aromas", price: 849, origPrice: 999, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 52, title: "Trio Aroma Diffuser Set", category: "Diffusers and Aromas", price: 799, origPrice: 899, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 53, title: "Coco Wood Candle", category: "Wooden Collection", price: 449, origPrice: 599, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 54, title: "Grand Boat Candle – Large", category: "Wooden Collection", price: 2149, origPrice: 2299, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 55, title: "Grand Boat Candle – Medium", category: "Wooden Collection", price: 1849, origPrice: 1999, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 56, title: "Glow Tea Lights – Set of 50", category: "Premium Luxury Candles", price: 229, origPrice: 299, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 57, title: "Glow Tea Lights – Set of 20", category: "Premium Luxury Candles", price: 129, origPrice: 149, burn: "30-55 Hours", badge: "BESTSELLER", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 58, title: "Pearl Shell Candle", category: "Premium Luxury Candles", price: 299, origPrice: 349, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 59, title: "Christmas Glow Trees – Set of 2", category: "Premium Luxury Candles", price: 449, origPrice: 599, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 60, title: "Classic Taper Candles – Red – Set of 2", category: "Premium Luxury Candles", price: 189, origPrice: 249, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 61, title: "Classic Taper Candles – Amber – Set of 2", category: "Premium Luxury Candles", price: 189, origPrice: 249, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 62, title: "Classic Taper Candles – White – Set of 2", category: "Premium Luxury Candles", price: 189, origPrice: 249, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 63, title: "Classic Taper Candles – Black – Set of 2", category: "Premium Luxury Candles", price: 189, origPrice: 249, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/third.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 64, title: "Gold Dust Taper Candles – Set of 2", category: "Premium Luxury Candles", price: 289, origPrice: 349, burn: "30-55 Hours", badge: "BESTSELLER", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/four.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 65, title: "Scented Wardrobe Wax Tablets", category: "Home essentials", price: 449, origPrice: 499, burn: "30-55 Hours", badge: "", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/one.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." },
  { id: 66, title: "Seven Chakra Candle Set – Set of 7", category: "Seven Chakra- Positivity collection", price: 699, origPrice: 749, burn: "30-55 Hours", badge: "NEW ARRIVAL", notes: { top: "Premium Soy Wax", heart: "Essential Oils", base: "Therapeutic Fragrance" }, image: "asset/second.jpg", desc: "Hand-poured 100% natural botanical soy wax candles designed to elevate your space." }
];

/* Add presentation-safe product details without changing the existing inventory names/prices. */
CANDLE_INVENTORY.forEach(product => {
  product.dimensions = product.dimensions || (product.category === 'Travel Tins' ? '7 × 7 × 5 cm' : product.category === 'Gift Hampers' ? '24 × 18 × 10 cm' : '9 × 9 × 11 cm');
  product.stock = Number.isFinite(product.stock) ? product.stock : 20;
  product.variants = product.variants || [
    { id: `${product.id}-standard`, title: 'Standard', price: product.price, available: product.stock > 0 }
  ];
});
