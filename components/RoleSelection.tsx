import React from 'react';
import logoSrc from '../mammoth.png';

type RoleCardProps = {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
};

const RoleCard: React.FC<RoleCardProps> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-6 bg-base-100 rounded-2xl shadow-lg border border-base-300 hover:border-primary hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
    >
        <div className="flex items-center">
            <div className="p-3 bg-primary rounded-full text-white mr-4">{icon}</div>
            <div>
                <h3 className="text-xl font-bold text-neutral-content">{title}</h3>
                <p className="text-gray-400 mt-1">{description}</p>
            </div>
        </div>
    </button>
);

const StudentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
    </svg>
);

const StaffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const OrgIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

interface RoleSelectionProps {
    onSelectRole: (role: 'student' | 'dining-hall' | 'organization') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
    return (
        <div className="min-h-screen bg-base-200 flex flex-col justify-center items-center p-4">
            <div className="max-w-2xl w-full text-center">
                <img src={logoSrc} alt="Mammoth ReServe" className="h-28 w-auto mx-auto mb-8" />
                <p className="text-gray-400 mt-3 mb-10 text-lg">Select your role to continue.</p>

                <div className="space-y-6">
                    <RoleCard
                        title="Guest Student"
                        description="View and reserve available surplus food."
                        icon={<StudentIcon />}
                        onClick={() => onSelectRole('student')}
                    />
                    <RoleCard
                        title="Dining Hall Staff"
                        description="Log surplus food and manage user accounts."
                        icon={<StaffIcon />}
                        onClick={() => onSelectRole('dining-hall')}
                    />
                    <RoleCard
                        title="Student Group / Food Bank"
                        description="Sign in to your approved organization account."
                        icon={<OrgIcon />}
                        onClick={() => onSelectRole('organization')}
                    />
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;