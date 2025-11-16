import React, { useState } from 'react';
import type { PendingUser } from '../types';
import PasswordCreationModal from './PasswordCreationModal';

interface AnalyzeUsersProps {
    users: PendingUser[];
    onApprove: (id: string, password: string) => void;
    onReject: (id: string) => void;
    onRevoke: (id: string) => void;
    onRecover: (id: string) => void;
    onDelete: (id: string) => void;
}

const UserCard: React.FC<{ 
    user: PendingUser; 
    onApproveClick: (user: PendingUser) => void; 
    onReject: (id: string) => void; 
    onRevoke: (id: string) => void;
    onRecover: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ user, onApproveClick, onReject, onRevoke, onRecover, onDelete }) => {
    const isStudentGroup = user.type === 'student-group';
    const title = isStudentGroup ? user.groupName : user.businessName;
    const subtitle = isStudentGroup ? user.college : user.managerName;
    
    return (
        <div className="bg-base-100 p-6 rounded-lg shadow-md border border-base-300">
            <div className="flex flex-col sm:flex-row justify-between items-start">
                <div>
                    <p className="text-xs uppercase font-semibold text-primary">{user.type.replace('-', ' ')}</p>
                    <h3 className="text-xl font-bold text-neutral-content">{title}</h3>
                    <p className="text-gray-400">{subtitle}</p>
                </div>
                <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-4 flex items-center gap-2">
                    {user.status === 'pending' && (
                        <>
                            <button 
                                onClick={() => onReject(user.id)}
                                className="px-3 py-2 text-xs font-bold text-red-300 bg-red-900/40 hover:bg-red-900/60 rounded-md"
                            >
                                Reject
                            </button>
                             <button 
                                onClick={() => onApproveClick(user)}
                                className="px-3 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-focus rounded-md shadow-sm"
                            >
                                Approve
                            </button>
                        </>
                    )}
                    {user.status === 'approved' && (
                         <button 
                            onClick={() => onRevoke(user.id)}
                            className="px-3 py-2 text-xs font-bold text-white bg-gray-500 hover:bg-gray-600 rounded-md"
                        >
                            Remove Approval
                        </button>
                    )}
                    {user.status === 'rejected' && (
                        <>
                            <button 
                                onClick={() => onDelete(user.id)}
                                className="px-3 py-2 text-xs font-bold text-red-300 bg-red-900/40 hover:bg-red-900/60 rounded-md"
                            >
                                Delete
                            </button>
                             <button 
                                onClick={() => onRecover(user.id)}
                                className="px-3 py-2 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-sm"
                            >
                                Recover
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-base-300 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <InfoItem label="Contact Email" value={user.email} />
                <InfoItem label="Contact Phone" value={user.phoneNumber} />
                {isStudentGroup ? (
                    <InfoItem label="Members" value={user.memberCount} />
                ) : (
                    <>
                        <InfoItem label="Location" value={user.location} />
                        <InfoItem label="Purpose" value={user.purpose} />
                    </>
                )}
            </div>
        </div>
    );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <span className="font-semibold text-gray-300">{label}: </span>
        <span className="text-gray-200">{value}</span>
    </div>
);


const AnalyzeUsers: React.FC<AnalyzeUsersProps> = ({ users, onApprove, onReject, onRevoke, onRecover, onDelete }) => {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);

    const pending = users.filter(u => u.status === 'pending');
    const approved = users.filter(u => u.status === 'approved');
    const rejected = users.filter(u => u.status === 'rejected');

    const handleApproveClick = (user: PendingUser) => {
        setSelectedUser(user);
        setIsPasswordModalOpen(true);
    };

    const handleModalClose = () => {
        setIsPasswordModalOpen(false);
        setSelectedUser(null);
    };


    const handlePasswordConfirm = (password: string) => {
        if (selectedUser) {
            onApprove(selectedUser.id, password);
        }
        handleModalClose();
    };

    const renderUserList = (userList: PendingUser[]) => {
        return userList.map(user => 
            <UserCard 
                key={user.id} 
                user={user} 
                onApproveClick={handleApproveClick} 
                onReject={onReject} 
                onRevoke={onRevoke} 
                onRecover={onRecover} 
                onDelete={onDelete} 
            />
        );
    };
    
    const userNameForModal = selectedUser ? (selectedUser.type === 'student-group' ? selectedUser.groupName : selectedUser.managerName) : '';


    return (
        <div className="w-full space-y-12">
            <div>
                <h2 className="text-3xl font-bold text-neutral-content mb-2">Pending Approvals</h2>
                <p className="text-gray-400">Review and approve new Student Groups and Food Banks.</p>
                 <div className="mt-6 space-y-4">
                    {pending.length > 0 ? (
                        renderUserList(pending)
                    ) : (
                        <p className="text-gray-500 text-center py-8 bg-base-100 rounded-lg border border-base-300">No pending applications.</p>
                    )}
                </div>
            </div>

            <div>
                 <h2 className="text-3xl font-bold text-neutral-content mb-2">Approved Users</h2>
                 <p className="text-gray-400">A list of all currently approved organizations.</p>
                 <div className="mt-6 space-y-4">
                    {approved.length > 0 ? (
                        renderUserList(approved)
                    ) : (
                        <p className="text-gray-500 text-center py-8 bg-base-100 rounded-lg border border-base-300">No users have been approved yet.</p>
                    )}
                </div>
            </div>

            <div>
                 <h2 className="text-3xl font-bold text-neutral-content mb-2">Rejected Users</h2>
                 <p className="text-gray-400">Rejected applications can be recovered or permanently deleted.</p>
                 <div className="mt-6 space-y-4">
                    {rejected.length > 0 ? (
                        renderUserList(rejected)
                    ) : (
                        <p className="text-gray-500 text-center py-8 bg-base-100 rounded-lg border border-base-300">No applications have been rejected.</p>
                    )}
                </div>
            </div>
             <PasswordCreationModal 
                isOpen={isPasswordModalOpen}
                userName={userNameForModal}
                onClose={handleModalClose}
                onSubmit={handlePasswordConfirm}
            />
        </div>
    );
};

export default AnalyzeUsers;