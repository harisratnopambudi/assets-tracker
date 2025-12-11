import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Pencil, Banknote, PiggyBank, CircleDollarSign, Coins, BarChart3, LineChart, Shield, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, formatPercentage, calculateProfit, calculateProfitPercentage } from '../utils';
import { ASSET_TYPE_LABELS, ASSET_TYPE_COLORS, ROLE_LABELS, AssetType, Asset } from '../types';
import GrowthChart from '../components/GrowthChart';
import AllocationChart from '../components/AllocationChart';
import AddAssetModal from '../components/AddAssetModal';
import EditAssetModal from '../components/EditAssetModal';
import { AnimatedSection } from '../hooks/useScrollAnimation';
import { getStoredGoldPrice, fetchAntamGoldPrice, calculateGoldValue } from '../goldService';

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

export default function MemberPage() {
    const { memberId } = useParams<{ memberId: string }>();
    const { members, assets, deleteAsset, updateAsset } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [isUpdatingGold, setIsUpdatingGold] = useState(false);
    const [goldPrice, setGoldPrice] = useState(getStoredGoldPrice());

    const memberIndex = members.findIndex((m) => m.id === memberId);
    const member = members[memberIndex];
    const memberAssets = assets.filter((a) => a.ownerId === memberId);
    const goldAssets = memberAssets.filter(a => a.type === 'gold');

    if (!member) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl mb-4">?</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Anggota tidak ditemukan</h2>
                <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
                    ← Kembali ke Dashboard
                </Link>
            </div>
        );
    }

    const totalCurrent = memberAssets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalInitial = memberAssets.reduce((sum, a) => sum + a.initialValue, 0);
    const totalProfit = calculateProfit(totalCurrent, totalInitial);
    const profitPct = calculateProfitPercentage(totalCurrent, totalInitial);
    const colorClass = MEMBER_COLORS[memberIndex % MEMBER_COLORS.length];

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Hapus aset "${name}"?`)) {
            deleteAsset(id);
        }
    };

    const handleUpdateGoldPrices = async () => {
        setIsUpdatingGold(true);
        const newPrice = await fetchAntamGoldPrice();

        if (newPrice) {
            setGoldPrice(newPrice);
            goldAssets.forEach(asset => {
                if (asset.goldDetails) {
                    const newValue = calculateGoldValue(asset.goldDetails.weightGram, newPrice.pricePerGram);
                    updateAsset(asset.id, { currentValue: newValue });
                }
            });
        }

        setIsUpdatingGold(false);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <AnimatedSection animation="fade-up">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-full ${colorClass} flex items-center justify-center text-white text-xl font-bold`}>
                                {getInitials(member.name)}
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{member.name}</h1>
                                <p className="text-gray-500">{ROLE_LABELS[member.role]}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">

                        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Aset
                        </button>
                    </div>
                </div>
            </AnimatedSection>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AnimatedSection animation="fade-up" delay={100}>
                    <div className="stat-card">
                        <p className="text-sm text-gray-500">Total Aset</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalCurrent)}</p>
                    </div>
                </AnimatedSection>
                <AnimatedSection animation="fade-up" delay={150}>
                    <div className="stat-card">
                        <p className="text-sm text-gray-500">Modal Awal</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalInitial)}</p>
                    </div>
                </AnimatedSection>
                <AnimatedSection animation="fade-up" delay={200}>
                    <div className="stat-card">
                        <p className="text-sm text-gray-500">Profit/Loss</p>
                        <p className={`text-2xl font-bold mt-1 ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
                        </p>
                        <p className={`text-sm ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatPercentage(profitPct)}
                        </p>
                    </div>
                </AnimatedSection>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatedSection animation="fade-left" delay={250}>
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pertumbuhan Aset</h3>
                        <GrowthChart assets={memberAssets} title={`Aset ${member.name}`} />
                    </div>
                </AnimatedSection>
                <AnimatedSection animation="fade-right" delay={250}>
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alokasi Aset</h3>
                        <AllocationChart assets={memberAssets} />
                    </div>
                </AnimatedSection>
            </div>

            {/* Asset List */}
            <AnimatedSection animation="fade-up" delay={300}>
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Daftar Aset ({memberAssets.length})
                    </h3>

                    {memberAssets.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <PiggyBank className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 mb-4">Belum ada aset</p>
                            <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Aset Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {memberAssets.map((asset, idx) => {
                                const profit = calculateProfit(asset.currentValue, asset.initialValue);
                                const pct = calculateProfitPercentage(asset.currentValue, asset.initialValue);
                                const Icon = ASSET_ICONS[asset.type];
                                const color = ASSET_TYPE_COLORS[asset.type];
                                return (
                                    <AnimatedSection key={asset.id} animation="fade-left" delay={350 + idx * 50}>
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow transition-all">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                style={{ backgroundColor: `${color}20` }}
                                            >
                                                <Icon className="w-6 h-6" style={{ color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900">{asset.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {ASSET_TYPE_LABELS[asset.type]}
                                                    {asset.goldDetails && (
                                                        <span className="text-yellow-600 ml-1">
                                                            • {asset.goldDetails.weightGram} gram
                                                        </span>
                                                    )}
                                                </p>
                                                {asset.notes && (
                                                    <p className="text-xs text-gray-400 mt-0.5 italic">
                                                        "{asset.notes}"
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">{formatCurrency(asset.currentValue)}</p>
                                                <p className={`text-sm ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {profit >= 0 ? '+' : ''}{formatCurrency(profit)} ({formatPercentage(pct)})
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
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
                                        </div>
                                    </AnimatedSection>
                                );
                            })}
                        </div>
                    )}
                </div>
            </AnimatedSection>

            <AddAssetModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                defaultOwnerId={memberId}
            />
            <EditAssetModal
                isOpen={!!editingAsset}
                onClose={() => setEditingAsset(null)}
                asset={editingAsset}
            />
        </div>
    );
}
