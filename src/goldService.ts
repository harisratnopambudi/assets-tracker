// Gold Price Service for Antam LM
// Uses a public API proxy or manual update

import type { GoldPriceState } from './types';

// Default Antam LM price (will be updated manually or via API)
const DEFAULT_GOLD_PRICE: GoldPriceState = {
    pricePerGram: 1456000, // Approximate Antam LM price per gram (Dec 2024)
    lastUpdated: new Date().toISOString(),
    source: 'Manual Update',
};

// Storage key
const GOLD_PRICE_KEY = 'antam-gold-price';

// Get stored gold price
export function getStoredGoldPrice(): GoldPriceState {
    try {
        const stored = localStorage.getItem(GOLD_PRICE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error reading gold price:', e);
    }
    return DEFAULT_GOLD_PRICE;
}

// Save gold price to storage
export function saveGoldPrice(price: GoldPriceState): void {
    try {
        localStorage.setItem(GOLD_PRICE_KEY, JSON.stringify(price));
    } catch (e) {
        console.error('Error saving gold price:', e);
    }
}

// Fetch gold price from API (using a CORS proxy for logammulia.com)
export async function fetchAntamGoldPrice(): Promise<GoldPriceState | null> {
    try {
        // Try to fetch from a public gold price API
        // Using harga-emas.org API (more reliable for Indonesian gold prices)
        const response = await fetch('https://api.allorigins.win/get?url=' +
            encodeURIComponent('https://harga-emas.org/1-gram/'));

        if (!response.ok) {
            throw new Error('Failed to fetch gold price');
        }

        const data = await response.json();
        const html = data.contents;

        // Parse the HTML to extract Antam price
        // Look for the Antam price in the table
        const antamMatch = html.match(/Antam[\s\S]*?Rp[\s.]*([\d.,]+)/i);

        if (antamMatch) {
            const priceStr = antamMatch[1].replace(/\./g, '').replace(/,/g, '');
            const price = parseInt(priceStr, 10);

            if (price > 0) {
                const goldPrice: GoldPriceState = {
                    pricePerGram: price,
                    lastUpdated: new Date().toISOString(),
                    source: 'harga-emas.org',
                };
                saveGoldPrice(goldPrice);
                return goldPrice;
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching gold price:', error);
        return null;
    }
}

// Update gold price manually
export function updateGoldPriceManual(pricePerGram: number): GoldPriceState {
    const goldPrice: GoldPriceState = {
        pricePerGram,
        lastUpdated: new Date().toISOString(),
        source: 'Manual Update',
    };
    saveGoldPrice(goldPrice);
    return goldPrice;
}

// Calculate gold asset value based on weight and current price
export function calculateGoldValue(weightGram: number, pricePerGram: number): number {
    return Math.round(weightGram * pricePerGram);
}

// Format gold weight display
export function formatGoldWeight(grams: number): string {
    if (grams >= 1) {
        return `${grams} gram`;
    }
    return `${grams * 1000} mg`;
}
