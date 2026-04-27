import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';

const DebugOverlay: React.FC = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handler = () => setShow((prev) => !prev);
        window.addEventListener('toggle-debug-overlay', handler);
        return () => window.removeEventListener('toggle-debug-overlay', handler);
    }, []);

    if (!show) return null;

    const currentProfileId = api.getCurrentProfileId();

    return (
        <div className="fixed top-0 right-0 z-[9999] bg-black/90 text-white text-xs p-4 m-2 rounded-lg shadow-xl max-w-xs font-mono border border-white/10">
            <div className="space-y-2">
                <div className="text-lg font-bold mb-2 text-teal-400">Debug Panel</div>
                <div className="text-gray-400 text-[10px]">PostgreSQL Version</div>
                <div className="border-t border-white/10 pt-2">
                    <div><span className="text-gray-400">API:</span> /api (proxied)</div>
                    <div><span className="text-gray-400">Profile ID:</span> {currentProfileId || 'NONE'}</div>
                </div>
                <div className="border-t border-white/10 pt-2 space-y-1">
                    <button onClick={() => { api.clearCurrentProfile(); window.location.reload(); }} className="bg-red-900/50 text-red-200 px-2 py-1 rounded w-full hover:bg-red-900">Force Sign Out</button>
                </div>
            </div>
        </div>
    );
}

export default DebugOverlay;
