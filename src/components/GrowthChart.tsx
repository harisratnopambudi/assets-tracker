import { Line } from 'react-chartjs-2';
import './ChartConfig';
import type { Asset } from '../types';

interface GrowthChartProps {
    assets: Asset[];
    title?: string;
}

export default function GrowthChart({ assets, title }: GrowthChartProps) {
    // Collect all unique dates
    const allDates = new Set<string>();
    assets.forEach((asset) => {
        asset.history.forEach((h) => allDates.add(h.date));
    });

    const sortedDates = Array.from(allDates).sort();

    // Calculate total value for each date
    const totalValues = sortedDates.map((date) => {
        return assets.reduce((sum, asset) => {
            const entry = asset.history.find((h) => h.date === date);
            if (entry) return sum + entry.value;

            // Find closest prior value
            const priorEntry = asset.history
                .filter((h) => h.date <= date)
                .sort((a, b) => b.date.localeCompare(a.date))[0];

            return sum + (priorEntry?.value || asset.initialValue);
        }, 0);
    });

    const formatLabel = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
    };

    const data = {
        labels: sortedDates.map(formatLabel),
        datasets: [
            {
                label: title || 'Total Aset',
                data: totalValues,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'white',
                titleColor: '#1f2937',
                bodyColor: '#6b7280',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: (ctx: any) => {
                        const value = ctx.raw as number;
                        return `Rp ${(value / 1000000).toFixed(1)} Juta`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#9ca3af',
                    font: { size: 11 },
                },
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    color: '#9ca3af',
                    font: { size: 11 },
                    callback: (value: any) => `${(value / 1000000).toFixed(0)}M`,
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    if (sortedDates.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400">
                Belum ada data historis
            </div>
        );
    }

    return (
        <div className="h-64">
            <Line data={data} options={options} />
        </div>
    );
}
