import { Doughnut } from 'react-chartjs-2';
import './ChartConfig';
import type { Asset } from '../types';
import { ASSET_TYPE_LABELS, ASSET_TYPE_COLORS, AssetType } from '../types';
import { formatCurrency } from '../utils';

interface AllocationChartProps {
    assets: Asset[];
}

export default function AllocationChart({ assets }: AllocationChartProps) {
    // Group by type
    const byType: Record<AssetType, number> = {} as any;

    assets.forEach((asset) => {
        byType[asset.type] = (byType[asset.type] || 0) + asset.currentValue;
    });

    const types = Object.keys(byType) as AssetType[];
    const values = types.map((t) => byType[t]);
    const colors = types.map((t) => ASSET_TYPE_COLORS[t]);
    const labels = types.map((t) => ASSET_TYPE_LABELS[t]);
    const total = values.reduce((a, b) => a + b, 0);

    const data = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: colors.map((c) => `${c}40`),
                borderColor: colors,
                borderWidth: 2,
                hoverOffset: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        layout: {
            padding: {
                top: 20,
                bottom: 10,
            },
        },
        plugins: {
            legend: {
                display: false, // Hide default legend, we'll make custom one
            },
            tooltip: {
                backgroundColor: 'white',
                titleColor: '#1f2937',
                bodyColor: '#6b7280',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: (ctx: any) => {
                        const value = ctx.raw as number;
                        const pct = ((value / total) * 100).toFixed(1);
                        return `Rp ${(value / 1000000).toFixed(1)}M (${pct}%)`;
                    },
                },
            },
        },
    };

    if (assets.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400">
                Belum ada data aset
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Chart */}
            <div className="h-52 relative">
                <Doughnut data={data} options={options} />
            </div>

            {/* Custom Legend with lines */}
            <div className="grid grid-cols-2 gap-2 px-2">
                {types.map((type, index) => {
                    const value = values[index];
                    const pct = ((value / total) * 100).toFixed(1);
                    const color = ASSET_TYPE_COLORS[type];
                    return (
                        <div
                            key={type}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {/* Color indicator with line effect */}
                            <div className="flex items-center gap-1">
                                <div
                                    className="w-3 h-3 rounded-full shadow-sm"
                                    style={{ backgroundColor: color }}
                                />
                                <div
                                    className="w-4 h-0.5"
                                    style={{ backgroundColor: color }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-700 truncate">
                                    {ASSET_TYPE_LABELS[type]}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {pct}% • {formatCurrency(value)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
