import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { ChartData, Donation } from '../types';

interface DonationsChartProps {
    donations: Donation[];
}

const DonationsChart: React.FC<DonationsChartProps> = ({ donations }) => {
    const data = useMemo<ChartData[]>(() => {
        const weeklyData: { [key: string]: number } = {
            'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0
        };

        const dayMapping = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        donations.forEach(donation => {
            const dayOfWeek = dayMapping[donation.timestamp.getDay()];
            if (dayOfWeek) {
                weeklyData[dayOfWeek] += donation.initialServings;
            }
        });

        return Object.entries(weeklyData).map(([day, servings]) => ({ day, servings }));
    }, [donations]);


    return (
        <div className="bg-base-100 p-6 rounded-2xl shadow-lg h-96 border border-base-300">
            <h3 className="font-bold text-xl mb-4 text-neutral-content">Weekly Donations (Servings)</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                    <XAxis dataKey="day" tick={{ fill: '#9ca3af' }} axisLine={{ stroke: '#4b5563' }} tickLine={{ stroke: '#4b5563' }} />
                    <YAxis tick={{ fill: '#9ca3af' }} axisLine={{ stroke: '#4b5563' }} tickLine={{ stroke: '#4b5563' }} />
                    <Tooltip 
                        cursor={{fill: 'rgba(167, 139, 250, 0.1)'}}
                        contentStyle={{ 
                            background: '#1f2937', // base-100
                            border: '1px solid #374151', // base-300
                            borderRadius: '0.5rem',
                            color: '#d1d5db' // neutral
                        }} 
                        labelStyle={{ color: '#f9fafb' }}
                    />
                    <Bar dataKey="servings" fill="#f472b6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DonationsChart;