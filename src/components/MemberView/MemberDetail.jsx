import React from 'react';
import { useAssets } from '../../context/AssetContext';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const MemberDetail = ({ memberId, onBack }) => {
    const { members, getAssetsByMember, formatCurrency, assetTypes } = useAssets();

    const member = members.find(m => m.id === memberId);
    if (!member) return null;

    const assets = getAssetsByMember(memberId);
    const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.3s ease' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={onBack} className="glass-panel" style={{ padding: '12px', borderRadius: '50%', display: 'flex', color: 'var(--text-primary)', transition: 'transform 0.2s' }}>
                    <ArrowLeft size={20} />
                </button>
                <h2 style={{ margin: 0 }}>{member.name}'s Portfolio</h2>
            </div>

            {/* Overview Card */}
            <section className="glass-panel" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '24px', background: `linear-gradient(135deg, ${member.avatarColor}20 0%, rgba(22, 27, 34, 0.6) 100%)`, borderLeft: `4px solid ${member.avatarColor}` }}>
                <div style={{ padding: '16px', background: member.avatarColor, borderRadius: '50%', color: '#fff', boxShadow: `0 4px 12px ${member.avatarColor}60` }}>
                    <Wallet size={32} />
                </div>
                <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Assets</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{formatCurrency(totalValue)}</div>
                </div>
            </section>

            {/* Asset List */}
            <h3 style={{ margin: '8px 0 0 0' }}>Asset Breakdown</h3>
            {assets.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }} className="glass-panel">
                    No assets recorded for this member yet.
                </div>
            ) : (
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {assets.map(asset => {
                        const typeInfo = Object.values(assetTypes).find(t => t.id === asset.type) || { label: 'Unknown', color: '#888' };
                        const isPositive = asset.profit >= 0;

                        return (
                            <div key={asset.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
                                {/* Decorative background blob */}
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: `${typeInfo.color}15`, borderRadius: '50%' }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', position: 'relative' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: `${typeInfo.color}25`, color: typeInfo.color, fontWeight: 600, border: `1px solid ${typeInfo.color}40` }}>
                                            {typeInfo.label}
                                        </span>
                                        <div style={{ marginTop: '12px', fontWeight: 600, fontSize: '1.2rem' }}>{asset.name}</div>
                                    </div>
                                    <div style={{
                                        color: isPositive ? 'var(--success)' : 'var(--danger)',
                                        display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 500,
                                        background: isPositive ? 'rgba(63, 185, 80, 0.1)' : 'rgba(248, 81, 73, 0.1)',
                                        padding: '4px 8px', borderRadius: '6px'
                                    }}>
                                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {Math.abs(asset.profit)}%
                                    </div>
                                </div>

                                <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 'auto' }}>
                                    {formatCurrency(asset.value)}
                                </div>
                            </div>
                        );
                    })}
                </section>
            )}
        </div>
    );
};

export default MemberDetail;
