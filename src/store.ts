import { create } from 'zustand';
import type { Asset, FamilyMember } from './types';
import * as firestoreService from './firestoreService';

interface AppState {
    members: FamilyMember[];
    assets: Asset[];
    isLoading: boolean;
    isInitialized: boolean;

    // Member actions
    addMember: (member: FamilyMember) => Promise<void>;
    updateMember: (id: string, updates: Partial<FamilyMember>) => Promise<void>;
    deleteMember: (id: string) => Promise<void>;

    // Asset actions
    addAsset: (asset: Asset) => Promise<void>;
    updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
    deleteAsset: (id: string) => Promise<void>;
    updateAssetValue: (id: string, newValue: number) => Promise<void>;

    // Internal setters (for real-time updates)
    setMembers: (members: FamilyMember[]) => void;
    setAssets: (assets: Asset[]) => void;
    setLoading: (loading: boolean) => void;
    setInitialized: (initialized: boolean) => void;

    // Utility
    initializeDefaultData: () => Promise<void>;
}

const DEFAULT_MEMBERS: FamilyMember[] = [
    { id: '1', name: 'Haris Ratno Pambudi', role: 'head' },
    { id: '2', name: 'Meta Nurjayanti', role: 'spouse' },
    { id: '3', name: 'Muhammad Ashraf Rizqullah', role: 'child' },
    { id: '4', name: 'Muhammad Arshad Hanan', role: 'child' },
];

const DEFAULT_ASSETS: Asset[] = [
    {
        id: 'a1',
        name: 'Tabungan BCA',
        type: 'savings',
        ownerId: '1',
        initialValue: 50000000,
        currentValue: 55000000,
        history: [
            { date: '2024-01-01', value: 50000000 },
            { date: '2024-02-01', value: 52000000 },
            { date: '2024-03-01', value: 55000000 },
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-03-01',
        notes: 'Rekening Utama',
    },
    {
        id: 'a2',
        name: 'Deposito Mandiri',
        type: 'deposit',
        ownerId: '1',
        initialValue: 100000000,
        currentValue: 105000000,
        history: [
            { date: '2024-01-01', value: 100000000 },
            { date: '2024-03-01', value: 105000000 },
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-03-01',
        notes: 'Cabang Sudirman',
    },
    {
        id: 'a3',
        name: 'Emas Antam',
        type: 'gold',
        ownerId: '2',
        initialValue: 30000000,
        currentValue: 35000000,
        history: [
            { date: '2024-01-01', value: 30000000 },
            { date: '2024-02-01', value: 32000000 },
            { date: '2024-03-01', value: 35000000 },
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-03-01',
        goldDetails: {
            weightGram: 25,
            buyPricePerGram: 1200000,
        },
        notes: 'Toko Emas Cantika',
    },
    {
        id: 'a4',
        name: 'Reksadana BNP Paribas',
        type: 'mutual_fund',
        ownerId: '2',
        initialValue: 25000000,
        currentValue: 28000000,
        history: [
            { date: '2024-01-01', value: 25000000 },
            { date: '2024-03-01', value: 28000000 },
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-03-01',
    },
    {
        id: 'a5',
        name: 'Saham BBCA',
        type: 'stocks',
        ownerId: '1',
        initialValue: 40000000,
        currentValue: 45000000,
        history: [
            { date: '2024-01-01', value: 40000000 },
            { date: '2024-02-01', value: 42000000 },
            { date: '2024-03-01', value: 45000000 },
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-03-01',
    },
    {
        id: 'a6',
        name: 'Tabungan Anak',
        type: 'savings',
        ownerId: '3',
        initialValue: 5000000,
        currentValue: 6000000,
        history: [
            { date: '2024-01-01', value: 5000000 },
            { date: '2024-03-01', value: 6000000 },
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-03-01',
    },
];

export const useStore = create<AppState>()((set, get) => ({
    members: [],
    assets: [],
    isLoading: true,
    isInitialized: false,

    // Internal setters
    setMembers: (members) => set({ members }),
    setAssets: (assets) => set({ assets }),
    setLoading: (isLoading) => set({ isLoading }),
    setInitialized: (isInitialized) => set({ isInitialized }),

    // Member actions
    addMember: async (member) => {
        try {
            await firestoreService.addMember(member);
            // Real-time listener will update state
        } catch (error) {
            console.error('Error adding member:', error);
        }
    },

    updateMember: async (id, updates) => {
        try {
            await firestoreService.updateMember(id, updates);
        } catch (error) {
            console.error('Error updating member:', error);
        }
    },

    deleteMember: async (id) => {
        try {
            // Delete member and their assets
            await firestoreService.deleteAssetsByOwner(id);
            await firestoreService.deleteMember(id);
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    },

    // Asset actions
    addAsset: async (asset) => {
        try {
            // Optimistic update
            set((state) => ({ assets: [...state.assets, asset] }));
            await firestoreService.addAsset(asset);
        } catch (error) {
            console.error('Error adding asset:', error);
        }
    },

    updateAsset: async (id, updates) => {
        try {
            const updatedAt = new Date().toISOString().split('T')[0];
            const fullUpdates = { ...updates, updatedAt };

            // Optimistic update
            set((state) => ({
                assets: state.assets.map((a) =>
                    a.id === id ? { ...a, ...fullUpdates } : a
                ),
            }));

            await firestoreService.updateAsset(id, fullUpdates);
        } catch (error: any) {
            console.error('Error updating asset:', error);
            // Revert optimistic update? For now just alert to debug
            alert(`Gagal menyimpan perubahan: ${error.message || error}`);
            // Force reload to sync state
            window.location.reload();
        }
    },

    deleteAsset: async (id) => {
        try {
            // Optimistic update
            set((state) => ({
                assets: state.assets.filter((a) => a.id !== id),
            }));
            await firestoreService.deleteAsset(id);
        } catch (error) {
            console.error('Error deleting asset:', error);
        }
    },

    updateAssetValue: async (id, newValue) => {
        try {
            const now = new Date().toISOString().split('T')[0];

            // Optimistic update
            set((state) => {
                const asset = state.assets.find((a) => a.id === id);
                if (!asset) return state;

                return {
                    assets: state.assets.map((a) =>
                        a.id === id
                            ? {
                                ...a,
                                currentValue: newValue,
                                history: [...a.history, { date: now, value: newValue }],
                                updatedAt: now,
                            }
                            : a
                    ),
                };
            });

            await firestoreService.updateAsset(id, {
                currentValue: newValue,
                history: (get().assets.find(a => a.id === id)?.history || []),
                updatedAt: now,
            });
        } catch (error) {
            console.error('Error updating asset value:', error);
        }
    },

    initializeDefaultData: async () => {
        try {
            set({ isLoading: true });
            await firestoreService.initializeDefaultData(DEFAULT_MEMBERS, DEFAULT_ASSETS);
            set({ isInitialized: true, isLoading: false });
        } catch (error) {
            console.error('Error initializing default data:', error);
            set({ isLoading: false });
        }
    },
}));

// Setup real-time listeners
let membersUnsubscribe: (() => void) | null = null;
let assetsUnsubscribe: (() => void) | null = null;

export function setupRealtimeListeners() {
    const store = useStore.getState();

    // Subscribe to members changes
    membersUnsubscribe = firestoreService.subscribeMembersChanges((members) => {
        useStore.setState({ members });
    });

    // Subscribe to assets changes
    assetsUnsubscribe = firestoreService.subscribeAssetsChanges((assets) => {
        useStore.setState({ assets, isLoading: false });
    });
}

export function cleanupRealtimeListeners() {
    if (membersUnsubscribe) {
        membersUnsubscribe();
        membersUnsubscribe = null;
    }
    if (assetsUnsubscribe) {
        assetsUnsubscribe();
        assetsUnsubscribe = null;
    }
}
