import React from 'react';
import { useAssets } from '../../context/AssetContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowUpRight } from 'lucide-react';

const Dashboard = ({ onSelectMember }) => {
    const { assets, members, formatCurrency, assetTypes } = useAssets();

    const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0);

    // Group by member for cards
    const memberStats = members.map(member => {
        const memberAssets = assets.filter(a => a.ownerId === member.id);
        const value = memberAssets.reduce((acc, curr) => acc + curr.value, 0);
        // Calculate weighted profit (simplified)
        const totalProfit = memberAssets.reduce((acc, curr) => acc + (curr.value * (curr.profit / 100)), 0);
        const avgProfit = value > 0 ? (totalProfit / value) * 100 : 0;

        return { ...member, value, profit: avgProfit };
    });

    // Prepare data for Pie Chart (By Asset Type)
    const assetsByType = Object.values(assetTypes).map(type => {
        const typeValue = assets
            .filter(a => a.type === type.id)
            .reduce((acc, curr) => acc + curr.value, 0);
        return { name: type.label, value: typeValue, color: type.color };
    }).filter(item => item.value > 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Total Card */}
            <section className="glass-panel" style={{ padding: '32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <h2 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Total Family Net Worth</h2>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, margin: '16px 0', lineHeight: 1 }} className="text-gradient">
                    {formatCurrency(totalValue)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--success)' }}>
                    <ArrowUpRight size={16} />
                    <span style={{ fontWeight: 600 }}>+4.2%</span>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>vs last month</span>
                </div>
            </section>

            {/* Member Cards */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {memberStats.map(member => (
                    <div
                        key={member.id}
                        onClick={() => onSelectMember && onSelectMember(member.id)}
                        className="glass-panel"
                        style={{
                            padding: '24px',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    background: `${member.avatarColor}20`,
                                    color: member.avatarColor,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '1.2rem'
                                }}>
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{member.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.role}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>
                            {formatCurrency(member.value)}
                        </div>

                        {member.profit > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--success)' }}>
                                <ArrowUpRight size={14} />
                                <span>+{member.profit.toFixed(1)}% Profit</span>
                            </div>
                        )}
                    </div>
                ))}
            </section>

            {/* Visualization */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {/* Allocation Chart */}
                <div className="glass-panel" style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 24px 0' }}>Asset Allocation</h3>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={assetsByType}
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {assetsByType.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--glass-border)', borderRadius: '12px' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Growth Placeholder */}
                <div className="glass-panel" style={{ padding: '24px', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0 }}>Portfolio Growth</h3>
                    <div style={{ padding: '12px 24px', background: 'var(--bg-highlight)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                        Sample Graph Placeholder
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
