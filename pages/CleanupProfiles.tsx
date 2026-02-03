import React, { useState } from 'react';
import { cleanupTasteProfiles } from '../scripts/cleanupTasteProfiles';

/**
 * Admin utility page to clean up polluted taste profile data
 * Navigate to /cleanup-profiles to access this page
 */
const CleanupProfiles: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string>('');

    const handleCleanup = async () => {
        setStatus('running');
        setMessage('Cleaning up taste profiles...');

        try {
            await cleanupTasteProfiles();
            setStatus('success');
            setMessage('✅ Cleanup complete! All taste profiles have been deleted. Fresh profiles will be generated on next user activity.');
        } catch (error) {
            setStatus('error');
            setMessage(`❌ Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 space-y-6">
            <div className="glass-panel p-8 rounded-3xl">
                <h1 className="text-3xl font-bold text-brand-black mb-4">
                    Cleanup Taste Profiles
                </h1>
                <p className="text-brand-slate/70 mb-6">
                    This utility will delete all existing taste profiles that contain polluted data
                    (restaurant names as keys instead of proper IDs). After cleanup, fresh profiles
                    will be automatically generated with correct IDs when users interact with restaurants.
                </p>

                <div className="bg-orange-50 border border-brand-orange/20 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-brand-orange font-semibold">
                        ⚠️ Warning: This action cannot be undone. Only run this in the Firebase Emulator.
                    </p>
                </div>

                <button
                    onClick={handleCleanup}
                    disabled={status === 'running'}
                    className="w-full bg-brand-orange hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg"
                >
                    {status === 'running' ? (
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Cleaning up...
                        </div>
                    ) : (
                        'Run Cleanup'
                    )}
                </button>

                {message && (
                    <div className={`mt-6 p-4 rounded-2xl ${status === 'success' ? 'bg-green-50 text-green-800' :
                            status === 'error' ? 'bg-red-50 text-red-800' :
                                'bg-blue-50 text-blue-800'
                        }`}>
                        <p className="text-sm font-medium whitespace-pre-wrap">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CleanupProfiles;
