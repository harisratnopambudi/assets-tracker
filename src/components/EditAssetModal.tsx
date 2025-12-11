import { useState, useEffect } from 'react';
import { X, RefreshCw, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { ASSET_TYPE_LABELS, AssetType, Asset } from '../types';
import { formatCurrency } from '../utils';
import { getStoredGoldPrice, fetchAntamGoldPrice, calculateGoldValue } from '../goldService';

interface EditAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: Asset | null;
}

const ASSET_TYPES: AssetType[] = [
    'savings', 'deposit', 'cash', 'gold', 'mutual_fund', 'stocks', 'bpjs_jht'
];

export default function EditAssetModal({ isOpen, onClose, asset }: EditAssetModalProps) {
    const { members, updateAsset } = useStore();
    const [form, setForm] = useState({
        name: '',
        type: 'savings' as AssetType,
        ownerId: '',
        initialValue: '',
        currentValue: '',
        // Gold specific
        goldWeight: '',
        // goldBuyPrice: '', // Removed from state

        // Stock specific
        stockLots: '',
        stockBuyPricePerLot: '',
        stockTicker: '',
        notes: '',
    });

    const [goldPrice, setGoldPrice] = useState(getStoredGoldPrice());
    const [isLoadingGoldPrice, setIsLoadingGoldPrice] = useState(false);

    // Reset form when asset changes
    useEffect(() => {
        if (asset) {
            setForm({
                name: asset.name,
                type: asset.type,
                ownerId: asset.ownerId,
                initialValue: asset.initialValue.toString(),
                currentValue: asset.currentValue.toString(),
                goldWeight: asset.goldDetails?.weightGram?.toString() || '',
                // goldBuyPrice: asset.goldDetails?.buyPricePerGram?.toString() || '', // No longer used directly

                stockLots: asset.stockDetails?.lots?.toString() || '',
                stockBuyPricePerLot: asset.stockDetails?.buyPricePerLot ? (asset.stockDetails.buyPricePerLot / 100).toString() : '', // Convert back to price per share
                stockTicker: asset.stockDetails?.ticker || '',
                notes: asset.notes || '',
            });
        }
    }, [asset]);

    // Update gold value when weight or price changes
    // Update gold value effect disabled to prevent overwriting manual inputs
    /*
    useEffect(() => {
        // Disabled
    }, ...);
    */

    // Update stock value when lots or price changes
    useEffect(() => {
        if (form.type === 'stocks' && form.stockLots && form.stockBuyPricePerLot) {
            const lots = parseInt(form.stockLots) || 0;
            const pricePerShare = parseFloat(form.stockBuyPricePerLot) || 0;
            const initialVal = lots * 100 * pricePerShare;

            setForm(f => ({
                ...f,
                initialValue: initialVal > 0 ? initialVal.toString() : f.initialValue,
            }));
        }
    }, [form.stockLots, form.stockBuyPricePerLot, form.type]);

    const handleRefreshGoldPrice = async () => {
        setIsLoadingGoldPrice(true);
        const newPrice = await fetchAntamGoldPrice();
        if (newPrice) {
            setGoldPrice(newPrice);
        }
        setIsLoadingGoldPrice(false);
    };

    if (!isOpen || !asset) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const updates: Partial<Asset> = {
            name: form.name,
            type: form.type,
            ownerId: form.ownerId,
            initialValue: Number(form.initialValue) || 0,
            currentValue: Number(form.currentValue) || 0,
            notes: form.notes || null, // Use null instead of undefined
        } as any; // Cast to any to allow nulls for optional fields if strict types complain

        // Add gold details if it's a gold asset
        if (form.type === 'gold' && form.goldWeight) {
            updates.goldDetails = {
                weightGram: parseFloat(form.goldWeight) || 0,
                buyPricePerGram: (Number(form.initialValue) || 0) / (parseFloat(form.goldWeight) || 1),
            };
            updates.stockDetails = null as any; // Correctly place this after the block
        } else if (form.type === 'stocks' && form.stockLots) {
            updates.stockDetails = {
                lots: parseInt(form.stockLots) || 0,
                buyPricePerLot: (parseFloat(form.stockBuyPricePerLot) || 0) * 100,
                ticker: form.stockTicker || undefined, // Ticker inside object might be fine if undefined, but safer to be string or null? 
                // actually nested undefined is usually also bad. 
                // stockTicker initializes to ''.
            };
            if (!updates.stockDetails.ticker) delete updates.stockDetails.ticker;

            updates.goldDetails = null as any;
        } else {
            updates.goldDetails = null as any;
            updates.stockDetails = null as any;
        }

        // Sanitize updates to remove undefined and convert NaN to null
        const cleanedUpdates = JSON.parse(JSON.stringify(updates));
        console.log('Submitting cleaned updates:', cleanedUpdates);

        updateAsset(asset.id, cleanedUpdates);
        onClose();
    };

    const isGold = form.type === 'gold';
    const isStock = form.type === 'stocks';
    const isSpecialType = isGold || isStock;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative glass-card w-full max-w-md animate-in max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 pb-0 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">Edit Aset</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Nama Aset
                            </label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder={isGold ? "contoh: Emas Antam 5g" : isStock ? "contoh: Saham BBCA" : "contoh: Tabungan BCA"}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Jenis Aset
                            </label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value as AssetType })}
                                className="select-field"
                            >
                                {ASSET_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {ASSET_TYPE_LABELS[type]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Pemilik
                            </label>
                            <select
                                value={form.ownerId}
                                onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
                                className="select-field"
                            >
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Gold-specific fields */}
                        {isGold && (
                            <div className="space-y-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                <div>
                                    <h3 className="text-sm font-semibold text-yellow-800 mb-4">Detail Emas</h3>

                                    <label className="block text-sm font-medium text-yellow-800 mb-1.5">
                                        Berat Emas (gram)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={form.goldWeight}
                                        onChange={(e) => setForm({ ...form, goldWeight: e.target.value })}
                                        placeholder="contoh: 5"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-yellow-800 mb-1.5">
                                        Total Modal Awal (Harga Beli Semuanya)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={form.initialValue}
                                        onChange={(e) => setForm({ ...form, initialValue: e.target.value })}
                                        placeholder="contoh: 562500"
                                        className="input-field"
                                    />
                                    <p className="text-xs text-yellow-600 mt-1">Masukan total harga beli nota</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-yellow-800 mb-1.5">
                                        Total Nilai Sekarang (Manual)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={form.currentValue}
                                        onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
                                        placeholder="contoh: 600000"
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        )}


                        {/* Stock-specific fields */}
                        {isStock && (
                            <div className="space-y-4 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                                <h3 className="text-sm font-semibold text-cyan-800">Detail Saham</h3>

                                <div className="text-xs text-cyan-700 bg-cyan-100 p-2 rounded-lg">
                                    <p>1 lot = 100 lembar saham</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-cyan-800 mb-1.5">
                                        Kode Saham (opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.stockTicker}
                                        onChange={(e) => setForm({ ...form, stockTicker: e.target.value.toUpperCase() })}
                                        placeholder="contoh: BBCA"
                                        className="input-field"
                                        maxLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-cyan-800 mb-1.5">
                                        Jumlah Lot
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={form.stockLots}
                                        onChange={(e) => setForm({ ...form, stockLots: e.target.value })}
                                        placeholder="contoh: 10"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-cyan-800 mb-1.5">
                                        Harga Beli (per Lembar)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={form.stockBuyPricePerLot}
                                        onChange={(e) => setForm({ ...form, stockBuyPricePerLot: e.target.value })}
                                        placeholder="contoh: 8500"
                                        className="input-field"
                                    />
                                </div>

                                {form.stockLots && form.stockBuyPricePerLot && (
                                    <div className="pt-2">
                                        <div className="text-center p-2 bg-white rounded-lg">
                                            <p className="text-xs text-gray-500">Total Modal ({form.stockLots} lot × {parseInt(form.stockLots) * 100} lembar)</p>
                                            <p className="font-semibold text-gray-900">{formatCurrency(Number(form.initialValue))}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-cyan-800 mb-1.5">
                                        Nilai Saat Ini (total)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={form.currentValue}
                                        onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
                                        placeholder="Masukkan nilai portfolio saat ini"
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Non-special value fields */}
                        {!isSpecialType && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Nilai Awal
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={form.initialValue}
                                        onChange={(e) => setForm({ ...form, initialValue: e.target.value })}
                                        placeholder="0"
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Nilai Saat Ini
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={form.currentValue}
                                        onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
                                        placeholder="0"
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Lokasi Penyimpanan / Institusi
                            </label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                placeholder="contoh: Bank Jago, Toko Emas Cantika, Bibit, dll"
                                className="input-field min-h-[80px]"
                            />
                        </div>
                    </div>

                    <div className="p-6 pt-4 border-t border-gray-100 bg-white/50 shrink-0 flex gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Batal
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            Simpan Perubahan
                        </button>
                    </div>
                </form >
            </div >
        </div >
    );
}
