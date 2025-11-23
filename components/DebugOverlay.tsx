import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseService';

const DebugOverlay: React.FC = () => {
    const { user, profile, loading } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [envStatus, setEnvStatus] = useState<any>({});

    useEffect(() => {
        // Check env vars (safely)
        const url = (import.meta as any).env?.VITE_SUPABASE_URL;
        const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
        setEnvStatus({
            urlPresent: !!url,
            keyPresent: !!key,
            urlValue: url ? url.substring(0, 15) + '...' : 'MISSING',
        });

        // Listen for custom toggle event
        const handleToggle = () => setIsVisible(prev => !prev);
        window.addEventListener('toggle-debug-overlay', handleToggle);
        return () => window.removeEventListener('toggle-debug-overlay', handleToggle);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-2 right-2 bg-black/90 text-green-400 p-4 rounded border border-green-500 z-50 font-mono text-xs max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-2 border-b border-green-700 pb-1">
                <h3 className="font-bold">Debug Overlay</h3>
                <button onClick={() => setIsVisible(false)} className="text-red-400 hover:text-red-300">X</button>
            </div>

            <div className="space-y-1">
                <div><span className="text-gray-400">Loading:</span> {loading ? 'TRUE' : 'FALSE'}</div>
                <div><span className="text-gray-400">User:</span> {user ? user.email : 'NULL'}</div>
                <div><span className="text-gray-400">Profile:</span> {profile ? `${profile.full_name} (${profile.role})` : 'NULL'}</div>

                <div className="mt-2 border-t border-green-700 pt-1">
                    <div><span className="text-gray-400">Supabase URL:</span> {envStatus.urlPresent ? 'OK' : 'MISSING'}</div>
                    <div><span className="text-gray-400">Supabase Key:</span> {envStatus.keyPresent ? 'OK' : 'MISSING'}</div>
                    <div className="text-gray-500 text-[10px]">{envStatus.urlValue}</div>
                </div>

                <div className="mt-2 pt-1 border-t border-green-700">
                    <button onClick={() => supabase.signOut()} className="bg-red-900/50 text-red-200 px-2 py-1 rounded w-full hover:bg-red-900">Force Sign Out</button>
                </div>
            </div>
        </div>
    );
};

export default DebugOverlay;
