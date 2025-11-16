import React from 'react';
import type { EmailContent } from '../services/emailService';

interface EmailPreviewModalProps {
    isOpen: boolean;
    email: EmailContent | null;
    onClose: () => void;
}

const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ isOpen, email, onClose }) => {
    if (!isOpen || !email) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-base-100 rounded-2xl shadow-xl p-8 max-w-2xl w-full m-4 transform transition-all border border-base-300" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                     <h2 className="text-2xl font-bold text-neutral-content">Email Confirmation</h2>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <p className="text-sm text-center text-green-300 bg-green-900/50 p-3 rounded-md border border-green-700 mb-6">
                    This is a preview of the email sent to the user. In a production environment, this would be delivered to their inbox.
                </p>

                <div className="space-y-4 text-sm">
                    <div className="flex border-b border-base-300 pb-2">
                        <p className="font-semibold text-gray-400 w-20">To:</p>
                        <p className="text-neutral">{email.to}</p>
                    </div>
                    <div className="flex border-b border-base-300 pb-2">
                        <p className="font-semibold text-gray-400 w-20">Subject:</p>
                        <p className="text-neutral font-medium">{email.subject}</p>
                    </div>
                    <div className="pt-2">
                         <p className="font-semibold text-gray-400 w-20 mb-2">Body:</p>
                         <pre className="bg-base-200 p-4 rounded-lg whitespace-pre-wrap font-sans text-neutral text-sm leading-relaxed">
                            {email.body}
                         </pre>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-focus rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-primary"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailPreviewModal;