import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Users,
    Plus,
    ArrowUpRight,
    Banknote,
    PiggyBank,
    CircleDollarSign,
    Coins,
    BarChart3,
    LineChart,
    Shield,
    RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency, formatPercentage, calculateProfit, calculateProfitPercentage } from '../utils';
import { ASSET_TYPE_LABELS, ASSET_TYPE_COLORS, AssetType } from '../types';
import GrowthChart from '../components/GrowthChart';
import AllocationChart from '../components/AllocationChart';
import AddAssetModal from '../components/AddAssetModal';
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

export default function Dashboard() {
    const { members, assets, updateAsset } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [goldPrice, setGoldPrice] = useState(getStoredGoldPrice());
    const [isUpdatingGold, setIsUpdatingGold] = useState(false);

    // Calculate totals
    const totalCurrent = assets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalInitial = assets.reduce((sum, a) => sum + a.initialValue, 0);
    const totalProfit = calculateProfit(totalCurrent, totalInitial);
    const profitPct = calculateProfitPercentage(totalCurrent, totalInitial);
    const isPositive = totalProfit >= 0;

    // Update all gold assets with latest price
    const handleUpdateGoldPrices = async () => {
        setIsUpdatingGold(true);
        const newPrice = await fetchAntamGoldPrice();

        if (newPrice) {
            setGoldPrice(newPrice);

            // Update all gold assets
            assets.forEach(asset => {
                if (asset.type === 'gold' && asset.goldDetails) {
                    const newValue = calculateGoldValue(asset.goldDetails.weightGram, newPrice.pricePerGram);
                    updateAsset(asset.id, { currentValue: newValue });
                }
            });
        }

        setIsUpdatingGold(false);
    };

    // Per member stats
    const memberStats = members.map((member, index) => {
        const memberAssets = assets.filter((a) => a.ownerId === member.id);
        const current = memberAssets.reduce((sum, a) => sum + a.currentValue, 0);
        const initial = memberAssets.reduce((sum, a) => sum + a.initialValue, 0);
        return {
            ...member,
            totalValue: current,
            profit: calculateProfit(current, initial),
            profitPct: calculateProfitPercentage(current, initial),
            assetCount: memberAssets.length,
            colorClass: MEMBER_COLORS[index % MEMBER_COLORS.length],
        };
    });

    // Recent assets (sorted by updatedAt)
    const recentAssets = [...assets]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5);

    // Count gold assets
    const goldAssets = assets.filter(a => a.type === 'gold');

    return (
        <div className="space-y-8">
            {/* Header */}
            <AnimatedSection animation="fade-up">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500 mt-1">Ringkasan aset keluarga</p>
                    </div>
                    <div className="flex gap-2">

                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Aset
                        </button>
                    </div>
                </div>
            </AnimatedSection>



            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnimatedSection animation="fade-up" delay={100}>
                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase">Total Aset</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCurrent)}</p>
                            <p className="text-sm text-gray-500 mt-1">{assets.length} aset</p>
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection animation="fade-up" delay={150}>
                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${isPositive
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25'
                                : 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/25'
                                }`}>
                                {isPositive ? <TrendingUp className="w-6 h-6 text-white" /> : <TrendingDown className="w-6 h-6 text-white" />}
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase">Profit/Loss</span>
                        </div>
                        <div className="mt-4">
                            <p className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatCurrency(totalProfit)}
                            </p>
                            <p className={`text-sm mt-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatPercentage(profitPct)}
                            </p>
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection animation="fade-up" delay={200}>
                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                                <Coins className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase">Modal Awal</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInitial)}</p>
                            <p className="text-sm text-gray-500 mt-1">dari {assets.length} aset</p>
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection animation="fade-up" delay={250}>
                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase">Anggota</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                            <p className="text-sm text-gray-500 mt-1">anggota keluarga</p>
                        </div>
                    </div>
                </AnimatedSection>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatedSection animation="fade-left" delay={300}>
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pertumbuhan Aset</h3>
                        <GrowthChart assets={assets} />
                    </div>
                </AnimatedSection>

                <AnimatedSection animation="fade-right" delay={300}>
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alokasi Aset</h3>
                        <AllocationChart assets={assets} />
                    </div>
                </AnimatedSection>
            </div>

            {/* Member Overview */}
            <AnimatedSection animation="fade-up" delay={350}>
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Per Anggota</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {memberStats.map((member, idx) => (
                            <AnimatedSection key={member.id} animation="scale" delay={400 + idx * 50}>
                                <Link
                                    to={`/member/${member.id}`}
                                    className="group p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all duration-300 block"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-full ${member.colorClass} flex items-center justify-center text-white text-sm font-semibold`}>
                                            {getInitials(member.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-gray-500">{member.assetCount} aset</p>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(member.totalValue)}</p>
                                    <p className={`text-sm ${member.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {member.profit >= 0 ? '+' : ''}{formatCurrency(member.profit)} ({formatPercentage(member.profitPct)})
                                    </p>
                                </Link>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* Recent Assets */}
            <AnimatedSection animation="fade-up" delay={500}>
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Aset Terbaru</h3>
                        <Link to="/assets" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                            Lihat Semua →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentAssets.map((asset, idx) => {
                            const owner = members.find((m) => m.id === asset.ownerId);
                            const profit = calculateProfit(asset.currentValue, asset.initialValue);
                            const Icon = ASSET_ICONS[asset.type];
                            const color = ASSET_TYPE_COLORS[asset.type];
                            return (
                                <AnimatedSection key={asset.id} animation="fade-left" delay={550 + idx * 50}>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow transition-all">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${color}20` }}
                                        >
                                            <Icon className="w-5 h-5" style={{ color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {asset.name}
                                                {asset.goldDetails && (
                                                    <span className="text-yellow-600 text-sm ml-2">
                                                        ({asset.goldDetails.weightGram}g)
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {ASSET_TYPE_LABELS[asset.type]} • {owner?.name}
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
                                                {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                                            </p>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            );
                        })}
                    </div>
                </div>
            </AnimatedSection>

            <AddAssetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
