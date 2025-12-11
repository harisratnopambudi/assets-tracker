export const FAMILY_MEMBERS = [
    { id: 'ayah', name: 'Ayah', role: 'Head', avatarColor: '#3b82f6' }, // Blue
    { id: 'ibu', name: 'Ibu', role: 'Wife', avatarColor: '#ec4899' },   // Pink
    { id: 'anak1', name: 'Anak 1', role: 'Child', avatarColor: '#10b981' }, // Emerald
    { id: 'anak2', name: 'Anak 2', role: 'Child', avatarColor: '#f59e0b' }, // Amber
];

export const ASSET_TYPES = {
    DEPOSITO: { id: 'deposito', label: 'Deposito', color: '#6366f1' },       // Indigo
    SAVINGS: { id: 'tabungan', label: 'Tabungan Uang', color: '#10b981' },   // Emerald
    GOLD: { id: 'emas', label: 'Tabungan Emas', color: '#f59e0b' },          // Amber
    MUTUAL_FUND: { id: 'reksadana', label: 'Reksadana', color: '#8b5cf6' },  // Violet
    STOCK: { id: 'saham', label: 'Saham', color: '#ec4899' },                // Pink
    BPJS: { id: 'bpjs', label: 'JHT BPJS', color: '#14b8a6' },               // Teal
};

// Initial data for visualization
export const MOCK_ASSETS = [
    { id: 1, ownerId: 'ayah', type: 'deposito', name: 'Deposito Bank BCA', value: 100000000, profit: 4.5 },
    { id: 2, ownerId: 'ayah', type: 'saham', name: 'BBCA', value: 50000000, profit: 15.2 },
    { id: 3, ownerId: 'ayah', type: 'bpjs', name: 'Saldo JHT', value: 75000000, profit: 2.5 },

    { id: 4, ownerId: 'ibu', type: 'emas', name: 'Emas Antam 10g', value: 12000000, profit: 10.5 },
    { id: 5, ownerId: 'ibu', type: 'reksadana', name: 'Sucorinvest', value: 25000000, profit: 6.8 },

    { id: 6, ownerId: 'anak1', type: 'tabungan', name: 'Tabungan Pendidikan', value: 5000000, profit: 0.5 },
    { id: 7, ownerId: 'anak1', type: 'emas', name: 'Tabungan Emas', value: 2000000, profit: 5.0 },

    { id: 8, ownerId: 'anak2', type: 'tabungan', name: 'Celengan', value: 1000000, profit: 0 },
];
