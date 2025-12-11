import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore, setupRealtimeListeners, cleanupRealtimeListeners } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MemberPage from './pages/MemberPage';
import AssetsPage from './pages/AssetsPage';
import { Loader2 } from 'lucide-react';

function App() {
    const { initializeDefaultData, isLoading, isInitialized } = useStore();

    useEffect(() => {
        // Setup real-time listeners
        setupRealtimeListeners();

        // Initialize default data if needed
        initializeDefaultData();

        // Cleanup on unmount
        return () => {
            cleanupRealtimeListeners();
        };
    }, [initializeDefaultData]);

    // Show loading state while initializing
    if (isLoading && !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Memuat data dari Firebase...</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/member/:memberId" element={<MemberPage />} />
                    <Route path="/assets" element={<AssetsPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
