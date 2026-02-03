import React, { useState } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import Modal from '../../components/common/Modal';
import { formatDateOfBirth } from '../../services/userDataService';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const {
        userProfile,
        userPreferences,
        updateUserPreferences,
        updateEmail,
        deleteAccount,
        reauthenticate
    } = useAuth();

    // UI Local State
    const [isLoading, setIsLoading] = useState(false);

    // Edit States
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingDOB, setIsEditingDOB] = useState(false);
    const [newEmail, setNewEmail] = useState(userProfile?.email || '');
    const [newDOB, setNewDOB] = useState(userPreferences?.dateOfBirth || '');

    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleUpdateLanguage = async (langCode: string) => {
        try {
            await updateUserPreferences({ language: langCode });
        } catch (error) {
            console.error('Failed to update language', error);
        }
    };

    const handleUpdateEmail = async () => {
        if (!newEmail || newEmail === userProfile?.email) {
            setIsEditingEmail(false);
            return;
        }

        try {
            setIsLoading(true);
            await reauthenticate(); // Force re-auth
            await updateEmail(newEmail);
            setIsEditingEmail(false);
            alert('Email updated! Please check your inbox to verify your new email.');
        } catch (error: any) {
            console.error('Failed to update email', error);
            alert(error.message || 'Failed to update email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateDOB = async () => {
        if (!newDOB || newDOB === userPreferences?.dateOfBirth) {
            setIsEditingDOB(false);
            return;
        }

        try {
            setIsLoading(true);
            await reauthenticate(); // Force re-auth
            await updateUserPreferences({ dateOfBirth: newDOB });
            setIsEditingDOB(false);
        } catch (error: any) {
            console.error('Failed to update DOB', error);
            alert(error.message || 'Failed to update Date of Birth. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setIsLoading(true);
            await reauthenticate(); // Force re-auth
            await deleteAccount();
            window.location.href = '/'; // Force redirect to home/landing
        } catch (error: any) {
            console.error('Failed to delete account', error);
            alert(error.message || 'Failed to delete account. Please try again.');
            setIsLoading(false);
            setShowDeleteConfirm(false); // Close confirm on error to allow retry
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Account Settings"
            maxWidth="max-w-xl"
        >
            <div className="flex flex-col gap-6">

                {/* Account Section */}
                <section>
                    <h4 className="text-xs font-bold text-brand-slate/50 uppercase tracking-widest mb-4">Account Information</h4>

                    <div className="space-y-4">
                        {/* Email */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between group">
                            <div>
                                <p className="text-xs text-brand-slate/60 font-medium mb-1">Email Address</p>
                                {isEditingEmail ? (
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="text-brand-black font-semibold bg-white border border-brand-orange/30 rounded px-2 py-1 outline-none focus:border-brand-orange w-full"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className="text-brand-black font-semibold">{userProfile?.email}</p>
                                        {userProfile?.emailVerified && (
                                            <span className="bg-green-100 text-green-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Verified</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            {isEditingEmail ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleUpdateEmail}
                                        disabled={isLoading}
                                        className="text-xs font-bold text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        {isLoading ? 'Wait...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => { setIsEditingEmail(false); setNewEmail(userProfile?.email || ''); }}
                                        disabled={isLoading}
                                        className="text-xs font-bold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditingEmail(true)}
                                    className="text-xs font-bold text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20 px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        {/* Date of Birth */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between group">
                            <div>
                                <p className="text-xs text-brand-slate/60 font-medium mb-1">Date of Birth</p>
                                {isEditingDOB ? (
                                    <input
                                        type="date"
                                        value={newDOB}
                                        onChange={(e) => setNewDOB(e.target.value)}
                                        className="text-brand-black font-semibold bg-white border border-brand-orange/30 rounded px-2 py-1 outline-none focus:border-brand-orange"
                                        autoFocus
                                    />
                                ) : (
                                    <p className="text-brand-black font-semibold">
                                        {userPreferences?.dateOfBirth ? formatDateOfBirth(userPreferences.dateOfBirth) : 'Not configured'}
                                    </p>
                                )}
                            </div>
                            {isEditingDOB ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleUpdateDOB}
                                        disabled={isLoading}
                                        className="text-xs font-bold text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        {isLoading ? 'Wait...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => { setIsEditingDOB(false); setNewDOB(userPreferences?.dateOfBirth || ''); }}
                                        disabled={isLoading}
                                        className="text-xs font-bold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditingDOB(true)}
                                    className="text-xs font-bold text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20 px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    Change
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <hr className="border-slate-100" />

                {/* Preferences Section */}
                <section>
                    <h4 className="text-xs font-bold text-brand-slate/50 uppercase tracking-widest mb-4">Preferences</h4>

                    {/* Language */}
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-brand-black">App Language</p>
                                <p className="text-xs text-brand-slate/60">Select your preferred language</p>
                            </div>
                        </div>
                        <select
                            value={userPreferences?.language || 'en'}
                            onChange={(e) => handleUpdateLanguage(e.target.value)}
                            className="bg-white border border-slate-200 text-brand-black text-sm rounded-lg focus:ring-brand-orange focus:border-brand-orange block p-2.5 outline-none font-medium"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                    </div>
                </section>

                <hr className="border-slate-100" />

                {/* Danger Zone */}
                <section>
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">Danger Zone</h4>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-red-700">Delete Account</p>
                            <p className="text-xs text-red-500/80 mt-1">Permanently delete your account and all data.</p>
                        </div>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                            Delete Account
                        </button>
                    </div>
                </section>
            </div>

            {/* Delete Confirmation Modal Layer */}
            {showDeleteConfirm && (
                <Modal
                    isOpen={showDeleteConfirm}
                    onClose={() => !isLoading && setShowDeleteConfirm(false)}
                    title="Delete Account?"
                    showCloseButton={!isLoading}
                    maxWidth="max-w-md"
                >
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg leading-6 font-medium text-brand-black mb-2">Are you absolutely sure?</h3>
                        <p className="text-sm text-brand-slate/60 mb-6">
                            This action cannot be undone. This will permanently delete your account, your taste profile, and remove your data from our servers.
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                type="button"
                                className="inline-flex justify-center w-full rounded-xl border border-transparent shadow-sm px-4 py-3 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:w-auto sm:text-sm"
                                onClick={handleDeleteAccount}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                            <button
                                type="button"
                                className="inline-flex justify-center w-full rounded-xl border border-slate-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:w-auto sm:text-sm"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </Modal>
    );
};

export default SettingsModal;
