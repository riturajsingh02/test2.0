/**
 * THE CANDLEIER — BACKEND CONFIGURATION
 * Centralized, safe environment variable configuration.
 *
 * IMPORTANT:
 * The fallback values below are DEMO PLACEHOLDERS for local
 * configuration/testing only. They are NOT real API credentials.
 *
 * Real credentials should be supplied through environment variables.
 */

export const config = {
  // ============================================================
  // AUTHENTICATION & SECURITY
  // ============================================================
  auth: {
    jwtSecret:
      process.env.JWT_SECRET ||
      'thecandleier_sanctuary_secure_jwt_secret_key_2026',

    jwtExpiresIn:
      process.env.JWT_EXPIRES_IN ||
      '7d',

    sessionSecret:
      process.env.SESSION_SECRET ||
      'thecandleier_sanctuary_session_secret_2026',

    cookieMaxAge:
      7 * 24 * 60 * 60 * 1000, // 7 days in ms

    saltRounds: 10,

    otpExpiresInMinutes: 10,
    maxOtpAttempts: 5,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15
  },

  // ============================================================
  // SMS & OTP GATEWAYS
  // ============================================================
  sms: {
    provider: process.env.SMS_PROVIDER || 'auto', // 'twilio', 'msg91', 'console'
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromPhone: process.env.TWILIO_PHONE_NUMBER || ''
    },
    msg91: {
      authKey: process.env.MSG91_AUTH_KEY || '',
      senderId: process.env.MSG91_SENDER_ID || 'CNDLR',
      templateId: process.env.MSG91_TEMPLATE_ID || ''
    }
  },

  // ============================================================
  // GOOGLE OAUTH
  // ============================================================
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }
  },

  // ============================================================
  // SHOPIFY
  // ============================================================
  shopify: {
    storeDomain:
      process.env.SHOPIFY_STORE_DOMAIN ||
      'thecandleier-demo.myshopify.com',

    storefrontAccessToken:
      process.env.SHOPIFY_STOREFRONT_TOKEN ||
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
      'shpat_test_demo_storefront_token_01',

    apiVersion:
      process.env.SHOPIFY_API_VERSION ||
      '2024-04',

    adminAccessToken:
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ||
      'shpat_test_demo_admin_token_01',

    webhookSecret:
      process.env.SHOPIFY_WEBHOOK_SECRET ||
      'shpss_test_demo_webhook_secret_01'
  },

  // ============================================================
  // PAYMENT GATEWAYS — TEST/DEMO CONFIGURATION
  // ============================================================
  payments: {
    razorpay: {
      keyId:
        process.env.RAZORPAY_KEY_ID ||
        'rzp_test_candleierDemo99',

      keySecret:
        process.env.RAZORPAY_KEY_SECRET ||
        'candleier_test_secret_key_88'
    },

    stripe: {
      publishableKey:
        process.env.STRIPE_PUBLISHABLE_KEY ||
        'pk_test_candleier_demo_publishable_key',

      secretKey:
        process.env.STRIPE_SECRET_KEY ||
        'sk_test_candleier_demo_secret_key',

      webhookSecret:
        process.env.STRIPE_WEBHOOK_SECRET ||
        'whsec_test_candleier_demo_webhook'
    }
  },

  // ============================================================
  // WHATSAPP & CONTACT INFORMATION
  // ============================================================
  contact: {
    whatsappNumber:
      process.env.WHATSAPP_NUMBER ||
      '+919762831995',

    supportEmail:
      process.env.SUPPORT_EMAIL ||
      'support@thecandleier.com',

    supportPhone:
      process.env.SUPPORT_PHONE ||
      '+91 9762831995'
  },

  // ============================================================
  // ANALYTICS & TRACKING
  // ============================================================
  analytics: {
    ga4MeasurementId:
      process.env.GA4_MEASUREMENT_ID ||
      process.env.GOOGLE_ANALYTICS_ID ||
      'G-DEMOTEST01',

    metaPixelId:
      process.env.META_PIXEL_ID ||
      '000000000000000',

    googleAdsId:
      process.env.GOOGLE_ADS_ID ||
      'AW-0000000000'
  },

  // ============================================================
  // ORDER TRACKING
  // ============================================================
  tracking: {
    orderTrackingEndpoint:
      process.env.ORDER_TRACKING_ENDPOINT ||
      ''
  },

  // ============================================================
  // SERVER RUNTIME
  // ============================================================
  server: {
    env:
      process.env.NODE_ENV ||
      'development',

    port:
      parseInt(process.env.PORT, 10) ||
      3000,

    isProduction:
      process.env.NODE_ENV === 'production'
  }
};

export default config;
