import React, { createContext, useContext, useState } from 'react';
import { MOCK_ASSETS, FAMILY_MEMBERS, ASSET_TYPES } from '../data/mockData';

const AssetContext = createContext();

export const AssetProvider = ({ children }) => {
    const [assets, setAssets] = useState(MOCK_ASSETS);
    const [members] = useState(FAMILY_MEMBERS);

    // Helper to format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getAssetsByMember = (memberId) => {
        return assets.filter(a => a.ownerId === memberId);
    };

    const getMemberTotal = (memberId) => {
        return getAssetsByMember(memberId).reduce((acc, curr) => acc + curr.value, 0);
    };

    return (
        <AssetContext.Provider value={{
            assets,
            members,
            assetTypes: ASSET_TYPES,
            formatCurrency,
            getAssetsByMember,
            getMemberTotal
        }}>
            {children}
        </AssetContext.Provider>
    );
};

export const useAssets = () => useContext(AssetContext);
