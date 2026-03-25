#!/usr/bin/env node

/**
 * Stripe Products & Prices Creation Script
 *
 * Automatically creates all products and prices in Stripe for TIER Golf
 * Outputs environment variables for easy copying to .env
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/create-stripe-products.js
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Product and price definitions
const PRODUCTS = [
  {
    id: 'premium',
    name: 'Player Premium',
    description: 'For junior golfers ready to level up',
    role: 'player',
    features: [
      'Unlimited IUP tracking',
      'Basic training plans',
      'Progress analytics',
      'Coach feedback',
      'Mobile app access',
    ],
    prices: {
      monthly: { amount: 14900, currency: 'nok' }, // 149 NOK
      yearly: { amount: 149900, currency: 'nok' }, // 1499 NOK
    },
  },
  {
    id: 'elite',
    name: 'Player Elite',
    description: 'For competitive players',
    role: 'player',
    features: [
      'Everything in Premium',
      'Advanced training ROI predictor',
      'Peer + Pro benchmarking',
      'Video analysis with AI',
      'Goal progression forecasts',
      'Priority coach support',
    ],
    prices: {
      monthly: { amount: 29900, currency: 'nok' }, // 299 NOK
      yearly: { amount: 299900, currency: 'nok' }, // 2999 NOK
    },
  },
  {
    id: 'base',
    name: 'Coach Base',
    description: 'For individual coaches',
    role: 'coach',
    features: [
      'Up to 10 active players',
      'IUP management',
      'Training plan templates',
      'Basic analytics',
      'Email support',
    ],
    prices: {
      monthly: { amount: 19900, currency: 'nok' }, // 199 NOK
      yearly: { amount: 199900, currency: 'nok' }, // 1999 NOK
    },
  },
  {
    id: 'pro',
    name: 'Coach Pro',
    description: 'For academy coaches',
    role: 'coach',
    features: [
      'Everything in Base',
      'Up to 30 active players',
      'Advanced analytics',
      'Team performance tracking',
      'Video analysis tools',
      'Priority support',
    ],
    prices: {
      monthly: { amount: 49900, currency: 'nok' }, // 499 NOK
      yearly: { amount: 499900, currency: 'nok' }, // 4999 NOK
    },
  },
  {
    id: 'team',
    name: 'Coach Team',
    description: 'For golf academies',
    role: 'coach',
    features: [
      'Everything in Pro',
      'Unlimited players',
      'Multi-coach collaboration',
      'Performance alerts',
      'Custom integrations',
      'Dedicated account manager',
    ],
    prices: {
      monthly: { amount: 99900, currency: 'nok' }, // 999 NOK
      yearly: { amount: 999900, currency: 'nok' }, // 9999 NOK
    },
  },
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function createProduct(productDef) {
  log(`\nCreating product: ${productDef.name}`, 'blue');

  try {
    // Create product
    const product = await stripe.products.create({
      name: productDef.name,
      description: productDef.description,
      metadata: {
        role: productDef.role,
        features: productDef.features.join('|'),
      },
    });

    log(`✓ Product created: ${product.id}`, 'green');

    const priceIds = {};

    // Create monthly price
    log(`  Creating monthly price...`, 'blue');
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: productDef.prices.monthly.amount,
      currency: productDef.prices.monthly.currency,
      recurring: {
        interval: 'month',
        trial_period_days: 14,
      },
      metadata: {
        plan_id: productDef.id,
        interval: 'monthly',
      },
    });
    priceIds.monthly = monthlyPrice.id;
    log(`  ✓ Monthly price created: ${monthlyPrice.id}`, 'green');

    // Create yearly price
    log(`  Creating yearly price...`, 'blue');
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: productDef.prices.yearly.amount,
      currency: productDef.prices.yearly.currency,
      recurring: {
        interval: 'year',
        trial_period_days: 14,
      },
      metadata: {
        plan_id: productDef.id,
        interval: 'yearly',
      },
    });
    priceIds.yearly = yearlyPrice.id;
    log(`  ✓ Yearly price created: ${yearlyPrice.id}`, 'green');

    return {
      productId: product.id,
      ...priceIds,
    };
  } catch (error) {
    log(`✗ Error creating product ${productDef.name}: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  console.log('');
  log('═══════════════════════════════════════════════════', 'blue');
  log('  TIER Golf - Stripe Products & Prices Creator', 'blue');
  log('═══════════════════════════════════════════════════', 'blue');
  console.log('');

  // Check for Stripe API key
  if (!process.env.STRIPE_SECRET_KEY) {
    log('ERROR: STRIPE_SECRET_KEY environment variable not set', 'red');
    log('Usage: STRIPE_SECRET_KEY=sk_test_... node scripts/create-stripe-products.js', 'yellow');
    process.exit(1);
  }

  log(`Using Stripe account: ${process.env.STRIPE_SECRET_KEY.substring(0, 15)}...`, 'blue');
  console.log('');

  const envVars = [];

  try {
    for (const productDef of PRODUCTS) {
      const result = await createProduct(productDef);

      // Store environment variables
      const prefix = `STRIPE_PRICE_${productDef.id.toUpperCase()}`;
      envVars.push(`${prefix}_MONTHLY=${result.monthly}`);
      envVars.push(`${prefix}_YEARLY=${result.yearly}`);
    }

    // Display summary
    console.log('');
    log('═══════════════════════════════════════════════════', 'green');
    log('  ✓ All products and prices created successfully!', 'green');
    log('═══════════════════════════════════════════════════', 'green');
    console.log('');

    log('Add these to your apps/api/.env file:', 'yellow');
    console.log('');
    log('# Stripe Price IDs', 'blue');
    envVars.forEach((envVar) => log(envVar, 'green'));
    console.log('');

    log('Next steps:', 'yellow');
    log('1. Copy the environment variables above to apps/api/.env', 'blue');
    log('2. Restart your API server', 'blue');
    log('3. Test checkout flow at http://localhost:3001/pricing', 'blue');
    console.log('');
  } catch (error) {
    log(`\nFailed to create products: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
