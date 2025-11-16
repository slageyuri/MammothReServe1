import React, { useMemo } from 'react';
import type { Donation, Reservation } from '../types';

const roleNames: Record<string, string> = {
    'student-group': 'Student Group',
    'dining-hall': 'Dining Hall Staff',
    'food-bank': 'Food Bank',
    'student': 'Student'
};

const ReservationCard: React.FC<{
    donation: Donation;
    reservation: Reservation;
    onCompletePickup?: (donationId: string, reservationId: string) => void;
    onNotCompletedPickup?: (donationId: string, reservationId: string) => void;
}> = ({ donation, reservation, onCompletePickup, onNotCompletedPickup }) => {
    return (
        <div className="bg-base-100 p-5 rounded-lg shadow-md border border-base-300">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <p className="text-lg font-bold text-neutral-content">{donation.foodItem}</p>
                    <p className="text-sm text-gray-400">
                        <span className="font-semibold">{reservation.servingsTaken} servings</span> reserved
                    </p>
                    <div className="mt-2 text-sm text-gray-300">
                        <p>Reserved by: <span className="font-medium text-gray-200">{roleNames[reservation.reserverRole] || 'Unknown'}</span></p>
                        <p>Pickup Time: <span className="font-medium text-gray-200">{reservation.pickupTime}</span></p>
                        <p>Location: <span className="font-medium text-gray-200">{donation.pickupLocation}</span></p>
                    </div>
                </div>
                <div className="flex-shrink-0 mt-3 sm:mt-0">
                    {reservation.status === 'pending' && onCompletePickup && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onNotCompletedPickup?.(donation.id, reservation.id)}
                                className="px-4 py-2 text-sm font-bold text-gray-300 bg-base-300 hover:bg-slate-600 rounded-md shadow-sm transition-colors"
                            >
                                Not Completed
                            </button>
                            <button
                                onClick={() => onCompletePickup(donation.id, reservation.id)}
                                className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-focus rounded-md shadow-sm transition-colors"
                            >
                                Mark as Completed
                            </button>
                        </div>
                    )}
                    {reservation.status === 'completed' && (
                        <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-green-300 bg-green-900/50 rounded-md">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Pickup Completed
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface ConfirmationsProps {
    donations: Donation[];
    onCompletePickup: (donationId: string, reservationId: string) => void;
    onNotCompletedPickup: (donationId: string, reservationId: string) => void;
}

const Confirmations: React.FC<ConfirmationsProps> = ({ donations, onCompletePickup, onNotCompletedPickup }) => {
    
    const { pendingReservations, completedReservations } = useMemo(() => {
        const pending: { donation: Donation; reservation: Reservation }[] = [];
        const completed: { donation: Donation; reservation: Reservation }[] = [];

        donations.forEach(donation => {
            donation.reservations.forEach(reservation => {
                const item = { donation, reservation };
                if (reservation.status === 'pending') {
                    pending.push(item);
                } else {
                    completed.push(item);
                }
            });
        });

        // Sort by reservation creation time (newest first)
        pending.sort((a, b) => b.reservation.id.localeCompare(a.reservation.id));
        completed.sort((a, b) => b.reservation.id.localeCompare(a.reservation.id));

        return { pendingReservations: pending, completedReservations: completed };
    }, [donations]);
    
    return (
        <div className="w-full space-y-12">
            <div>
                <h2 className="text-3xl font-bold text-neutral-content mb-2">Pending Pickups</h2>
                <p className="text-gray-400">Confirm when an organization has picked up their reserved food.</p>
                <div className="mt-6 space-y-4">
                    {pendingReservations.length > 0 ? (
                        pendingReservations.map(({ donation, reservation }) => (
                            <ReservationCard
                                key={reservation.id}
                                donation={donation}
                                reservation={reservation}
                                onCompletePickup={onCompletePickup}
                                onNotCompletedPickup={onNotCompletedPickup}
                            />
                        ))
                    ) : (
                        <p className="text-gray-400 text-center py-8 bg-base-100 rounded-lg border border-base-300">No pending pickups.</p>
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-3xl font-bold text-neutral-content mb-2">Completed Pickups</h2>
                <p className="text-gray-400">A history of all successfully completed pickups.</p>
                <div className="mt-6 space-y-4">
                    {completedReservations.length > 0 ? (
                        completedReservations.map(({ donation, reservation }) => (
                            <ReservationCard
                                key={reservation.id}
                                donation={donation}
                                reservation={reservation}
                            />
                        ))
                    ) : (
                        <p className="text-gray-400 text-center py-8 bg-base-100 rounded-lg border border-base-300">No pickups have been completed yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Confirmations;