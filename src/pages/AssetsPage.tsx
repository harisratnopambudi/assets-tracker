import { useState } from 'react';
import { Plus, Search, Trash2, Download, Pencil, Banknote, PiggyBank, CircleDollarSign, Coins, BarChart3, LineChart, Shield } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, formatPercentage, calculateProfit, calculateProfitPercentage } from '../utils';
import { ASSET_TYPE_LABELS, ASSET_TYPE_COLORS, AssetType, Asset } from '../types';
import AddAssetModal from '../components/AddAssetModal';
import EditAssetModal from '../components/EditAssetModal';
import { AnimatedSection } from '../hooks/useScrollAnimation';

// Asset type icons mapping
const ASSET_ICONS: Record<AssetType, React.ElementType> = {
    savings: PiggyBank,
    deposit: Banknote,
    cash: CircleDollarSign,
    gold: Coins,
    mutual_fund: BarChart3,
    stocks: LineChart,
    bpjs_jht: Shield,
};

// Helper to get initials
function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

const MEMBER_COLORS = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-emerald-500',
    'bg-amber-500',
];

export default function AssetsPage() {
    const { members, assets, deleteAsset } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
    const [sortBy, setSortBy] = useState<'value' | 'profit' | 'name'>('value');

    const getMemberName = (id: string) => members.find((m) => m.id === id)?.name || 'Unknown';
    const getMemberIndex = (id: string) => members.findIndex((m) => m.id === id);

    // Filter and sort
    let filteredAssets = assets.filter((asset) => {
        const matchesSearch =
            asset.name.toLowerCase().includes(search.toLowerCase()) ||
            getMemberName(asset.ownerId).toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'all' || asset.type === filterType;
        return matchesSearch && matchesType;
    });

    // Sort
    filteredAssets = [...filteredAssets].sort((a, b) => {
        if (sortBy === 'value') return b.currentValue - a.currentValue;
        if (sortBy === 'profit') {
            const profitA = a.currentValue - a.initialValue;
            const profitB = b.currentValue - b.initialValue;
            return profitB - profitA;
        }
        return a.name.localeCompare(b.name);
    });

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Hapus aset "${name}"?`)) {
            deleteAsset(id);
        }
    };

    const exportToCSV = () => {
        const headers = ['Nama', 'Jenis', 'Pemilik', 'Nilai Awal', 'Nilai Saat Ini', 'Profit', 'Berat Emas (g)'];
        const rows = assets.map((asset) => [
            asset.name,
            ASSET_TYPE_LABELS[asset.type],
            getMemberName(asset.ownerId),
            asset.initialValue,
            asset.currentValue,
            asset.currentValue - asset.initialValue,
            asset.goldDetails?.weightGram || '',
        ]);

        const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aset-keluarga.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const totalValue = filteredAssets.reduce((sum, a) => sum + a.currentValue, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <AnimatedSection animation="fade-up">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Semua Aset</h1>
                        <p className="text-gray-500 mt-1">
                            {filteredAssets.length} aset • Total {formatCurrency(totalValue)}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={exportToCSV} className="btn-secondary">
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </button>
                        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Aset
                        </button>
                    </div>
                </div>
            </AnimatedSection>

            {/* Filters */}
            <AnimatedSection animation="fade-up" delay={100}>
                <div className="glass-card p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari aset..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as AssetType | 'all')}
                                className="select-field w-auto"
                            >
                                <option value="all">Semua Jenis</option>
                                {Object.entries(ASSET_TYPE_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'value' | 'profit' | 'name')}
                                className="select-field w-auto"
                            >
                                <option value="value">Nilai Tertinggi</option>
                                <option value="profit">Profit Tertinggi</option>
                                <option value="name">Nama A-Z</option>
                            </select>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* Asset List */}
            <AnimatedSection animation="fade-up" delay={200}>
                <div className="glass-card">
                    {filteredAssets.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 mb-4">
                                {search || filterType !== 'all' ? 'Tidak ada aset yang cocok' : 'Belum ada aset'}
                            </p>
                            {!search && filterType === 'all' && (
                                <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Aset Pertama
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-auto max-h-[calc(100vh-14rem)] relative">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                                            Aset
                                        </th>
                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                                            Jenis
                                        </th>
                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                                            Pemilik
                                        </th>
                                        <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                                            Nilai
                                        </th>
                                        <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                                            Profit
                                        </th>
                                        <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredAssets.map((asset, idx) => {
                                        const profit = calculateProfit(asset.currentValue, asset.initialValue);
                                        const pct = calculateProfitPercentage(asset.currentValue, asset.initialValue);
                                        const Icon = ASSET_ICONS[asset.type];
                                        const color = ASSET_TYPE_COLORS[asset.type];
                                        const memberIdx = getMemberIndex(asset.ownerId);
                                        const memberColor = MEMBER_COLORS[memberIdx >= 0 ? memberIdx % MEMBER_COLORS.length : 0];
                                        return (
                                            <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors scroll-animate visible" style={{ transitionDelay: `${idx * 30}ms` }}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                            style={{ backgroundColor: `${color}20` }}
                                                        >
                                                            <Icon className="w-5 h-5" style={{ color }} />
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-900">{asset.name}</span>
                                                            {asset.goldDetails && (
                                                                <span className="block text-xs text-yellow-600">
                                                                    {asset.goldDetails.weightGram} gram
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {ASSET_TYPE_LABELS[asset.type]}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded-full ${memberColor} flex items-center justify-center text-white text-xs font-semibold`}>
                                                            {getInitials(getMemberName(asset.ownerId))}
                                                        </div>
                                                        <span className="text-gray-700">{getMemberName(asset.ownerId)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                    {formatCurrency(asset.currentValue)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`font-medium ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                                                    </span>
                                                    <span className={`block text-sm ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {formatPercentage(pct)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            onClick={() => setEditingAsset(asset)}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(asset.id, asset.name)}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </AnimatedSection>

            <AddAssetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EditAssetModal
                isOpen={!!editingAsset}
                onClose={() => setEditingAsset(null)}
                asset={editingAsset}
            />
        </div>
    );
}
