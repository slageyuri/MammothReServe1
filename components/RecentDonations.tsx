import React from 'react';
import type { Donation } from '../types';

interface AvailableDonationsProps {
    donations: Donation[];
    onReserveClick: (donation: Donation) => void;
}

const AvailableDonations: React.FC<AvailableDonationsProps> = ({ donations, onReserveClick }) => {
    return (
        <div className="bg-base-100 p-6 rounded-2xl shadow-lg border border-base-300">
            <h3 className="font-bold text-xl mb-4 text-neutral-content">Available for Pickup</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {donations.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No surplus food available for you right now.</p>
                ) : (
                    donations.map(donation => (
                        <div key={donation.id} className="p-4 bg-base-300/50 rounded-lg transform transition-shadow hover:shadow-md flex gap-4 items-center border border-slate-700">
                            <img src={donation.imageUrl} alt={donation.foodItem} className="w-20 h-20 object-cover rounded-md flex-shrink-0 bg-base-300"/>
                            <div className="flex-grow flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div>
                                    <p className="font-semibold text-neutral-content">{donation.foodItem}</p>
                                    <p className="text-sm text-gray-400">{donation.remainingServings} / {donation.initialServings} servings left</p>
                                    <p className="text-xs text-gray-500 mt-1">Logged at {donation.timestamp.toLocaleTimeString()}</p>
                                    <p className="text-xs text-gray-400 mt-1">Pickup at: <span className="font-medium text-gray-300">{donation.pickupLocation}</span></p>
                                </div>
                                <div className="mt-3 sm:mt-0 sm:text-right flex-shrink-0">
                                    <p className="text-sm font-medium text-primary">{donation.foodWeightLbs.toFixed(1)} lbs not wasted</p>
                                     <button 
                                        onClick={() => onReserveClick(donation)}
                                        className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-focus rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-300 focus:ring-primary transition-colors"
                                    >
                                        Reserve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AvailableDonations;