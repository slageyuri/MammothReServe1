import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
    return (
        <div className="bg-base-100 p-6 rounded-2xl shadow-lg flex items-center transform hover:scale-105 transition-transform duration-300 border border-base-300">
            <div className={`p-4 rounded-full mr-4 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-neutral-content">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;