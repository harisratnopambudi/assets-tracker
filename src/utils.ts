export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export function formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
}

export function calculateProfit(current: number, initial: number): number {
    return current - initial;
}

export function calculateProfitPercentage(current: number, initial: number): number {
    if (initial === 0) return 0;
    return ((current - initial) / initial) * 100;
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
