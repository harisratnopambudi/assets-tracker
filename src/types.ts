// Types for Family Asset Tracker

export type Role = 'head' | 'spouse' | 'child';

export type AssetType =
    | 'savings'
    | 'deposit'
    | 'cash'
    | 'gold'
    | 'mutual_fund'
    | 'stocks'
    | 'bpjs_jht';

export interface FamilyMember {
    id: string;
    name: string;
    role: Role;
    avatar?: string;
}

export interface HistoricalValue {
    date: string;
    value: number;
}

// Gold-specific fields
export interface GoldDetails {
    weightGram: number;      // Berat emas dalam gram
    buyPricePerGram: number; // Harga beli per gram
}

// Stock-specific fields
export interface StockDetails {
    lots: number;            // Jumlah lot (1 lot = 100 lembar)
    buyPricePerLot: number;  // Harga beli per lot
    ticker?: string;         // Kode saham (opsional)
}

export interface Asset {
    id: string;
    name: string;
    type: AssetType;
    ownerId: string;
    initialValue: number;
    currentValue: number;
    history: HistoricalValue[];
    createdAt: string;
    updatedAt: string;
    // Type-specific optional fields
    goldDetails?: GoldDetails;
    stockDetails?: StockDetails;
    notes?: string;
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
    savings: 'Tabungan',
    deposit: 'Deposito',
    cash: 'Kas',
    gold: 'Emas',
    mutual_fund: 'Reksadana',
    stocks: 'Saham',
    bpjs_jht: 'BPJS JHT',
};

export const ASSET_TYPE_COLORS: Record<AssetType, string> = {
    savings: '#2563eb',
    deposit: '#7c3aed',
    cash: '#16a34a',
    gold: '#ca8a04',
    mutual_fund: '#dc2626',
    stocks: '#0891b2',
    bpjs_jht: '#ea580c',
};

export const ROLE_LABELS: Record<Role, string> = {
    head: 'Kepala Keluarga',
    spouse: 'Pasangan',
    child: 'Anak',
};

// Gold price state
export interface GoldPriceState {
    pricePerGram: number;
    lastUpdated: string;
    source: string;
}
