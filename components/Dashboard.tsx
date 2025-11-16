import React, { useMemo } from 'react';
import type { Donation, Reservation, Role } from '../types';
import StatCard from './StatCard';
import DonationsChart from './DonationsChart';
import AvailableDonations from './RecentDonations';

const ServingIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0c-.454-.303-.977-.454-1.5-.454V8.546c.523 0 1.046-.151 1.5-.454a2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0 2.704 2.704 0 003 0c.454.303.977.454 1.5.454v7z" /></svg>);
const WeightIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2m-3 2h16M5 12h14M8 12l-1.65 5.5a1 1 0 00.95 1.45h8.4a1 1 0 00.95-1.45L16 12H8z" /></svg>);

interface ReservationWithFood extends Reservation {
    foodItem: string;
    donationId: string;
    donorType: Role;
}

const ReservedDonations: React.FC<{ 
    donations: Donation[], 
    onCancelReservation: (donationId: string, reservationId: string) => void,
    onCompleteReservation: (donationId: string, reservationId: string) => void,
    currentUser: Role,
}> = ({ donations, onCancelReservation, onCompleteReservation, currentUser }) => {
    
    const userReservations = useMemo<ReservationWithFood[]>(() => {
        return donations
            .flatMap(donation => 
                donation.reservations
                    .filter(res => res.reserverRole === currentUser)
                    .map(res => ({ ...res, foodItem: donation.foodItem, donationId: donation.id, donorType: donation.donorType }))
            )
            .sort((a, b) => b.id.localeCompare(a.id));
    }, [donations, currentUser]);

    return (
        <div className="bg-base-100 p-6 rounded-2xl shadow-lg mt-6 border border-base-300">
            <h3 className="font-bold text-xl mb-4 text-neutral-content">Reservation History</h3>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                {userReservations.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No reservations have been made yet.</p>
                ) : (
                    userReservations.map(res => (
                        <div key={res.id} className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-neutral-content">{res.foodItem}</p>
                                    <p className="text-sm text-gray-300">{res.servingsTaken} servings reserved</p>
                                    <p className="text-xs text-gray-400 mt-1">By: {res.reserverRole.replace('-', ' ')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-secondary">Pickup: {res.pickupTime}</p>
                                    {res.status === 'pending' ? (
                                        <div className="flex items-center gap-2 mt-2 justify-end">
                                            {res.donorType === 'student-group' && (
                                                <button
                                                    onClick={() => onCompleteReservation(res.donationId, res.id)}
                                                    className="px-3 py-1 text-xs font-medium text-green-300 bg-green-900/50 hover:bg-green-900/80 rounded-md transition-colors"
                                                >
                                                    Mark as Completed
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => onCancelReservation(res.donationId, res.id)}
                                                className="px-3 py-1 text-xs font-medium text-red-300 bg-red-900/50 hover:bg-red-900/80 rounded-md transition-colors"
                                            >
                                                Cancel Reservation
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-2 flex items-center justify-end gap-1 px-2 py-1 text-xs font-bold text-green-300 bg-green-900/50 rounded-md">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            <span>Completed</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const DonationHistory: React.FC<{ donations: Donation[] }> = ({ donations }) => {
    const sortedDonations = useMemo(() => 
        [...donations].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
        [donations]
    );

    return (
        <div className="bg-base-100 p-6 rounded-2xl shadow-lg mt-6 border border-base-300">
            <h3 className="font-bold text-xl mb-4 text-neutral-content">Your Donation History</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {sortedDonations.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">You haven't made any donations yet.</p>
                ) : (
                    sortedDonations.map(donation => (
                        <div key={donation.id} className="p-4 bg-base-300/40 border border-slate-700 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-neutral-content">{donation.foodItem}</p>
                                    <p className="text-sm text-gray-300">{donation.initialServings} servings donated</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-primary">{donation.foodWeightLbs.toFixed(1)} lbs not wasted</p>
                                    <p className="text-xs text-gray-500 mt-1">{donation.timestamp.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

interface DashboardProps {
    donations: Donation[];
    onReserveClick: (donation: Donation) => void;
    currentUser: Role;
    onCancelReservation: (donationId: string, reservationId: string) => void;
    onCompletePickup: (donationId: string, reservationId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ donations, onReserveClick, currentUser, onCancelReservation, onCompletePickup }) => {
    // Filter data for stats and history based on the donor's role.
    const donationsForStats = useMemo(() => {
        if (currentUser === 'dining-hall' || currentUser === 'student-group') {
            return donations.filter(d => d.donorType === currentUser);
        }
        // Students and Food Banks see the total community impact.
        return donations;
    }, [donations, currentUser]);
    
    // Calculate stats based on the correctly scoped data.
    const { totalServings, totalFoodWeightLbs } = useMemo(() => {
        return donationsForStats.reduce(
            (acc, donation) => {
                acc.totalServings += donation.initialServings;
                acc.totalFoodWeightLbs += donation.foodWeightLbs;
                return acc;
            },
            { totalServings: 0, totalFoodWeightLbs: 0 }
        );
    }, [donationsForStats]);

    // Filter for donations that are available for the current user to reserve.
    const availableDonations = useMemo(() => {
        return donations
            .filter(d => d.status === 'available' && d.alertFor.includes(currentUser))
            .slice()
            .reverse();
    }, [donations, currentUser]);


    return (
        <div className="w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Total Servings Donated" value={totalServings.toLocaleString()} icon={<ServingIcon />} color="bg-primary" />
                <StatCard title="Total Food Not Wasted" value={`${totalFoodWeightLbs.toFixed(1)} lbs`} icon={<WeightIcon />} color="bg-green-600" />
            </div>
            
            {/* Students do not see the weekly donations chart to simplify their view. */}
            {currentUser !== 'student' && <DonationsChart donations={donationsForStats} />}

            {/* For roles that can donate, show their donation history */}
            {(currentUser === 'dining-hall' || currentUser === 'student-group') && (
                <DonationHistory donations={donationsForStats} />
            )}

            {/* For roles that can reserve, show available donations and their reservation history */}
            {(currentUser === 'student' || currentUser === 'food-bank' || currentUser === 'student-group') && (
                 <>
                    <AvailableDonations donations={availableDonations} onReserveClick={onReserveClick} />
                    <ReservedDonations 
                        donations={donations} 
                        onCancelReservation={onCancelReservation}
                        onCompleteReservation={onCompletePickup}
                        currentUser={currentUser}
                    />
                </>
            )}
        </div>
    );
};

export default Dashboard;