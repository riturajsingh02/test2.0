/**
 * THE CANDLEIER — SHOPIFY SERVICE LAYER
 * Core GraphQL communicator for Shopify Storefront API
 */

import { config } from '../config/env.js';
import { ShopifyError } from '../utils/errors.js';

export class ShopifyService {
  /**
   * Check if Shopify Storefront API credentials are configured
   */
  static isConfigured() {
    return Boolean(config.shopify.storeDomain && config.shopify.storefrontAccessToken);
  }

  /**
   * Execute a GraphQL query or mutation against Shopify Storefront API
   */
  static async request(query, variables = {}) {
    if (!this.isConfigured()) {
      throw new ShopifyError(
        'Shopify Storefront credentials are not configured on the server. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN.',
        503
      );
    }

    const domain = config.shopify.storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const endpoint = `https://${domain}/api/${config.shopify.apiVersion}/graphql.json`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': config.shopify.storefrontAccessToken
        },
        body: JSON.stringify({ query, variables })
      });

      if (!response.ok) {
        throw new ShopifyError(`Shopify API responded with HTTP status ${response.status}`, response.status);
      }

      const json = await response.json();

      if (json.errors && json.errors.length > 0) {
        const errorMsg = json.errors.map(e => e.message).join('; ');
        throw new ShopifyError(errorMsg, 400, json.errors);
      }

      return json.data;
    } catch (err) {
      if (err instanceof ShopifyError) throw err;
      throw new ShopifyError(`Failed to connect to Shopify: ${err.message}`, 502);
    }
  }

  /**
   * Fetch live products from Shopify
   */
  static async getProducts({ first = 50, query = '', sortKey = 'BEST_SELLING', reverse = false } = {}) {
    const gql = `
      query getProducts($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
        products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
          edges {
            node {
              id
              title
              handle
              description
              availableForSale
              productType
              tags
              metafields(identifiers: [
                { namespace: "custom", key: "burn_time" },
                { namespace: "custom", key: "fragrance_notes" },
                { namespace: "custom", key: "wax_type" },
                { namespace: "custom", key: "dimensions" }
              ]) {
                key
                value
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    quantityAvailable
                    priceV2 {
                      amount
                      currencyCode
                    }
                    compareAtPriceV2 {
                      amount
                      currencyCode
                    }
                    sku
                  }
                }
              }
              images(first: 6) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.request(gql, { first, query: query || null, sortKey, reverse });
    return (data?.products?.edges || []).map(edge => this.formatProduct(edge.node));
  }

  /**
   * Fetch single product by handle
   */
  static async getProductByHandle(handle) {
    const gql = `
      query getProductByHandle($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          descriptionHtml
          availableForSale
          productType
          tags
          metafields(identifiers: [
            { namespace: "custom", key: "burn_time" },
            { namespace: "custom", key: "fragrance_notes" },
            { namespace: "custom", key: "wax_type" },
            { namespace: "custom", key: "dimensions" }
          ]) {
            key
            value
          }
          variants(first: 15) {
            edges {
              node {
                id
                title
                availableForSale
                quantityAvailable
                priceV2 {
                  amount
                  currencyCode
                }
                compareAtPriceV2 {
                  amount
                  currencyCode
                }
                sku
              }
            }
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    `;

    const data = await this.request(gql, { handle });
    if (!data?.product) return null;
    return this.formatProduct(data.product);
  }

  /**
   * Fetch collections from Shopify
   */
  static async getCollections(first = 20) {
    const gql = `
      query getCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              image {
                url
                altText
              }
            }
          }
        }
      }
    `;

    const data = await this.request(gql, { first });
    return (data?.collections?.edges || []).map(e => e.node);
  }

  /**
   * Format Shopify Product into unified Candleier Product Object
   */
  static formatProduct(node) {
    const variants = (node.variants?.edges || []).map(v => ({
      id: v.node.id,
      title: v.node.title,
      price: parseFloat(v.node.priceV2?.amount || 0),
      origPrice: parseFloat(v.node.compareAtPriceV2?.amount || v.node.priceV2?.amount || 0),
      currency: v.node.priceV2?.currencyCode || 'INR',
      available: v.node.availableForSale,
      stock: v.node.quantityAvailable ?? 10,
      sku: v.node.sku || ''
    }));

    const primaryVariant = variants[0] || { price: 0, origPrice: 0, available: false, stock: 0 };
    const images = (node.images?.edges || []).map(img => img.node.url);

    // Parse metafields
    const metafields = {};
    (node.metafields || []).forEach(mf => {
      if (mf && mf.key) metafields[mf.key] = mf.value;
    });

    return {
      id: node.id,
      shopifyId: node.id,
      handle: node.handle,
      title: node.title,
      desc: node.description || '',
      category: node.productType || 'Premium Luxury Candles',
      price: primaryVariant.price,
      origPrice: primaryVariant.origPrice,
      currency: primaryVariant.currency,
      stock: primaryVariant.stock,
      available: node.availableForSale,
      image: images[0] || 'asset/one.jpg',
      images: images.length > 0 ? images : ['asset/one.jpg'],
      badge: node.tags?.includes('bestseller') ? 'BESTSELLER' : (node.tags?.includes('new') ? 'NEW ARRIVAL' : ''),
      burn: metafields.burn_time || '35-50 Hours',
      dimensions: metafields.dimensions || '8cm × 9.5cm (220g)',
      wax: metafields.wax_type || '100% Pure Botanical Soy Wax',
      notes: {
        top: metafields.fragrance_notes || 'Pure Botanical Soy',
        heart: 'Therapeutic Essential Oils',
        base: 'Fine IFRA-Certified Fragrance'
      },
      variants
    };
  }
}

export default ShopifyService;
