import React, { useState } from 'react';

interface PasswordCreationModalProps {
    isOpen: boolean;
    userName: string;
    onClose: () => void;
    onSubmit: (password: string) => void;
}

const PasswordCreationModal: React.FC<PasswordCreationModalProps> = ({ isOpen, userName, onClose, onSubmit }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        setError('');
        onSubmit(password);
        setPassword('');
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={handleClose}>
            <div className="bg-base-100 rounded-lg shadow-xl p-8 w-full max-w-sm border border-base-300" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-neutral-content mb-2">Create Password for {userName}</h3>
                <p className="text-sm text-gray-400 mb-6">Create a secure, temporary password. The user will be notified via email.</p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="password-creation" className="block text-sm font-medium text-gray-300">New Password</label>
                    <input
                        type="text"
                        id="password-creation"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter temporary password"
                        className="mt-1 w-full px-3 py-2 bg-base-300 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-neutral-content"
                        autoFocus
                    />
                    {error && <p className="text-xs text-error mt-2">{error}</p>}
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-base-300 hover:bg-slate-600 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-focus rounded-md shadow-sm">Confirm & Send Email</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordCreationModal;