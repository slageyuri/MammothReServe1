import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import DonationForm from './components/DonationForm';
import Dashboard from './components/Dashboard';
import SignIn from './components/SignIn';
import RegistrationForm from './components/RegistrationForm';
import AnalyzeUsers from './components/AnalyzeUsers';
import EmailPreviewModal from './components/EmailPreviewModal';
import RoleSelection from './components/RoleSelection';
import type { Donation, Reservation, Role, FoodSafetyInfo, PendingUser } from './types';
import { generateApprovalEmailContent, type EmailContent } from './services/emailService';
import Confirmations from './components/Confirmations';

// --- INITIAL STATE (EMPTY) ---
const initialDonations: Donation[] = [];
const initialPendingUsers: PendingUser[] = [];


// --- MODAL COMPONENTS ---

const StaffPasswordModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void; onSubmit: (password: string) => void }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'ValDonation') {
            onSubmit(password);
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-base-100 rounded-lg shadow-xl p-8 w-full max-w-sm border border-base-300" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-neutral-content mb-4">Dining Hall Staff Verification</h3>
                <p className="text-sm text-gray-400 mb-4">Please enter the staff password to continue.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-3 py-2 bg-base-300 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-white"
                        autoFocus
                    />
                    {error && <p className="text-xs text-error mt-2">{error}</p>}
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-base-300 hover:bg-slate-600 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-focus rounded-md shadow-sm">Sign In</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ReservationModalProps {
    donation: Donation | null;
    isOpen: boolean;
    onClose: () => void;
    onReserve: (details: { pickupTime: string; servingsTaken: number; }) => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ donation, isOpen, onClose, onReserve }) => {
    const [pickupTime, setPickupTime] = useState('');
    const [isTakingAll, setIsTakingAll] = useState(true);
    const [servingsToTake, setServingsToTake] = useState('');
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (donation) {
            setPickupTime('');
            setIsTakingAll(true);
            setServingsToTake(donation.remainingServings.toString());
            setError('');
        }
    }, [donation]);

    if (!isOpen || !donation) return null;

    const handleReserveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numToTake = parseInt(servingsToTake, 10);
        if (!pickupTime.trim()) {
            setError('Please provide a pickup time.');
            return;
        }
        if (isNaN(numToTake) || numToTake <= 0 || numToTake > donation.remainingServings) {
            setError(`Please enter a valid number of servings (1-${donation.remainingServings}).`);
            return;
        }
        onReserve({ pickupTime, servingsTaken: numToTake });
    };
    
    const handleTakingAllChange = (checked: boolean) => {
        setIsTakingAll(checked);
        if (checked) {
            setServingsToTake(donation.remainingServings.toString());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start z-50 p-4 overflow-y-auto" aria-modal="true" role="dialog" onClick={onClose}>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl max-w-4xl w-full my-8 transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-1">
                    <img src={donation.imageUrl} alt={`Photo of ${donation.foodItem}`} className="w-full h-64 object-cover rounded-t-xl bg-slate-800" />
                </div>
                <div className="p-6">
                    <h2 className="text-3xl font-bold text-white mb-4">Reserve: {donation.foodItem}</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Information */}
                        <div className="space-y-6">
                             {donation.donorType === 'student-group' && (
                                <div className="bg-yellow-900/50 border border-yellow-700 p-4 rounded-lg">
                                    <h4 className="font-bold text-yellow-300">Safety Notice</h4>
                                    <p className="text-sm text-yellow-300 mt-1">
                                        This food is from a student group. Mammoth ReServe cannot guarantee it was prepared or stored in a commercial kitchen. Please consume at your own discretion.
                                    </p>
                                </div>
                            )}

                            {donation.aiAnalysis && (
                                <div className="bg-blue-900/50 border border-blue-700 p-4 rounded-lg">
                                    <h4 className="font-bold text-blue-300">AI-Generated Summary</h4>
                                    {donation.aiAnalysis.estimatedServings && <p className="text-sm text-blue-200 mt-2">Estimated Servings: <span className="font-bold">{donation.aiAnalysis.estimatedServings}</span></p>}
                                    <p className="text-sm text-blue-200 mt-2">{donation.aiAnalysis.summary}</p>
                                    <ul className="list-disc list-inside text-sm text-blue-300 mt-3 space-y-1">
                                        {donation.aiAnalysis.observations.map((obs, i) => <li key={i}>{obs}</li>)}
                                    </ul>
                                </div>
                            )}

                             <div className="bg-amber-900/50 border border-amber-700 p-4 rounded-lg">
                                <h4 className="font-bold text-amber-300 mb-3">Food Safety & Allergen Information</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-amber-200">
                                    <p>Safe temp: <span className="font-medium">{donation.safetyInfo.safeTemp ? 'Yes' : 'No'}</span></p>
                                    <p>Contamination protected: <span className="font-medium">{donation.safetyInfo.notContaminated ? 'Yes' : 'No'}</span></p>
                                    <p>Package opened: <span className="font-medium">{donation.safetyInfo.isOpened ? 'Yes' : 'No'}</span></p>
                                    {donation.safetyInfo.isOpened && <p>Time since opening: <span className="font-medium">{donation.safetyInfo.timeOutInHours} hours</span></p>}
                                    {donation.allergens && donation.allergens.length > 0 && (
                                        <div className="col-span-full">Contains: <span className="font-medium">{donation.allergens.join(', ')}</span></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Actions */}
                        <div className="lg:sticky top-8 self-start">
                             <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                                    <div>
                                        <p className="text-sm text-gray-400">Servings Available</p>
                                        <p className="text-2xl font-bold text-white">{donation.remainingServings}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Pickup Location</p>
                                        <p className="text-lg font-semibold text-white truncate">{donation.pickupLocation}</p>
                                    </div>
                                </div>
                                <form onSubmit={handleReserveSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-300">When can you pick it up?</label>
                                            <input type="text" id="pickupTime" value={pickupTime} onChange={e => setPickupTime(e.target.value)} required placeholder="e.g., Today at 5:30 PM" className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-white sm:text-sm" />
                                        </div>
                                        <div className="flex items-start bg-slate-700/50 p-3 rounded-md">
                                            <input id="isTakingAll" type="checkbox" checked={isTakingAll} onChange={e => handleTakingAllChange(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-slate-500 rounded mt-1 bg-slate-600" />
                                            <label htmlFor="isTakingAll" className="ml-3 block text-sm text-gray-200">Are you taking all remaining <span className="font-bold">{donation.remainingServings}</span> servings?</label>
                                        </div>
                                        {!isTakingAll && (
                                            <div>
                                                <label htmlFor="servingsToTake" className="block text-sm font-medium text-gray-300">How many servings are you picking up?</label>
                                                <input type="number" id="servingsToTake" value={servingsToTake} onChange={e => setServingsToTake(e.target.value)} max={donation.remainingServings} min="1" required className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-white sm:text-sm" />
                                            </div>
                                        )}
                                        {error && <p className="text-sm text-error mt-2">{error}</p>}
                                    </div>
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-slate-700 hover:bg-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary">Cancel</button>
                                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-focus rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary">Confirm Reservation</button>
                                    </div>
                                </form>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


function App() {
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const [currentUser, setCurrentUser] = useState<Role | null>(null);
  const [page, setPage] = useState<'roleselection' | 'login' | 'register' | 'app'>('roleselection');
  const [registrationRole, setRegistrationRole] = useState<'student-group' | 'food-bank' | null>(null);
  const [diningHallView, setDiningHallView] = useState<'donate' | 'analyze' | 'confirmations'>('donate');
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>(initialPendingUsers);
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailContent | null>(null);

  const handleSelectRole = (role: 'student' | 'dining-hall' | 'organization') => {
    if (role === 'student') {
        setCurrentUser('student');
        setPage('app');
    } else if (role === 'dining-hall') {
        setIsPasswordModalOpen(true);
    } else if (role === 'organization') {
        setPage('login');
    }
  };

  const handleDiningHallLogin = () => {
    setIsPasswordModalOpen(false);
    setCurrentUser('dining-hall');
    setPage('app');
    setDiningHallView('donate');
  };
  
  const handleUserLogin = (email: string, password: string): boolean => {
    const user = pendingUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.status === 'approved' && u.password === password
    );

    if (user) {
      setCurrentUser(user.type);
      setPage('app');
      return true;
    }
    return false;
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setPage('roleselection');
  };

  const handleNavigateToRegister = (role: 'student-group' | 'food-bank') => {
    setRegistrationRole(role);
    setPage('register');
  };

  const handleBackToLogin = () => {
    setRegistrationRole(null);
    setPage('login');
  };

  const handleRegister = (newUserData: Omit<PendingUser, 'id' | 'status' | 'type'>) => {
    const newUser: PendingUser = {
      ...(newUserData as any),
      id: new Date().toISOString(),
      status: 'pending',
      type: registrationRole!,
    };
    setPendingUsers(prev => [...prev, newUser]);
    window.alert('Registration submitted! Your application is pending approval by Dining Hall Staff.');
    handleBackToLogin();
  };
  
 const handleApproveUser = (userId: string, password: string) => {
    let approvedUser: PendingUser | undefined;
    
    setPendingUsers(currentUsers => {
        const userToApprove = currentUsers.find(user => user.id === userId);
        if (userToApprove) {
            approvedUser = { ...userToApprove, status: 'approved', password };
        }
        return currentUsers.map(user => (user.id === userId ? { ...user, status: 'approved', password } : user));
    });

    if (approvedUser) {
        const emailContent = generateApprovalEmailContent(approvedUser, password);
        setPreviewEmail(emailContent);
        setIsPreviewModalOpen(true);
    }
  };


  const handleRejectUser = (userId: string) => {
    setPendingUsers(users => users.map(user => 
        user.id === userId ? { ...user, status: 'rejected' } : user
    ));
  };

  const handleRevokeUser = (userId: string) => {
    setPendingUsers(users => users.map(user => 
        user.id === userId ? { ...user, status: 'pending', password: '' } : user
    ));
  };
  
  const handleRecoverUser = (userId: string) => {
    setPendingUsers(users => users.map(user => 
        user.id === userId ? { ...user, status: 'pending' } : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    setPendingUsers(users => users.filter(user => user.id !== userId));
  };


  const handleNewDonation = (donationData: Omit<Donation, 'id' | 'timestamp' | 'donorType' | 'reservations'>) => {
    const timestamp = new Date();
    const newDonation: Donation = {
        ...donationData,
        id: timestamp.toISOString(),
        timestamp,
        donorType: currentUser!,
        reservations: [],
    };
    setDonations(prevDonations => [...prevDonations, newDonation]);
  };

  const handleOpenReserveModal = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDonation(null);
  };

  const handleConfirmReservation = (details: { pickupTime: string; servingsTaken: number; }) => {
    if (!selectedDonation) return;

    setDonations(donations.map(d => {
        if (d.id === selectedDonation.id) {
            const remaining = d.remainingServings - details.servingsTaken;
            const newReservation: Reservation = {
                id: new Date().toISOString(),
                reserverRole: currentUser!,
                pickupTime: details.pickupTime,
                servingsTaken: details.servingsTaken,
                status: 'pending',
            };
            return { 
                ...d, 
                remainingServings: remaining,
                status: remaining <= 0 ? 'fully-reserved' : 'available',
                reservations: [...d.reservations, newReservation]
            };
        }
        return d;
    }));
    handleCloseModal();
  };

  const handleCompletePickup = (donationId: string, reservationId: string) => {
    setDonations(currentDonations =>
      currentDonations.map(donation => {
        if (donation.id === donationId) {
          const updatedReservations = donation.reservations.map(res =>
            res.id === reservationId ? { ...res, status: 'completed' as const } : res
          );
          return { ...donation, reservations: updatedReservations };
        }
        return donation;
      })
    );
  };
  
  const handleRemoveReservation = (donationId: string, reservationId: string) => {
    setDonations(currentDonations => {
        const donationIndex = currentDonations.findIndex(d => d.id === donationId);
        if (donationIndex === -1) return currentDonations;

        const donation = currentDonations[donationIndex];
        const reservation = donation.reservations.find(r => r.id === reservationId);

        if (!reservation) return currentDonations;

        const updatedDonation = {
            ...donation,
            remainingServings: donation.remainingServings + reservation.servingsTaken,
            status: 'available' as const,
            reservations: donation.reservations.filter(r => r.id !== reservationId),
        };

        const newDonations = [...currentDonations];
        newDonations[donationIndex] = updatedDonation;
        return newDonations;
    });
  };

  // Filter donations for the staff confirmation page
  const diningHallDonations = useMemo(() => {
    return donations.filter(d => d.donorType === 'dining-hall');
  }, [donations]);

  // --- RENDER LOGIC ---

  if (page === 'login') {
      return <SignIn onUserLogin={handleUserLogin} onNavigateToRegister={handleNavigateToRegister} onBack={() => setPage('roleselection')} />;
  }

  if (page === 'register' && registrationRole) {
      return <RegistrationForm role={registrationRole} onRegister={handleRegister} onBack={handleBackToLogin} />;
  }

  if (page === 'app' && currentUser) {
      return (
        <div className="min-h-screen bg-base-200 font-sans text-neutral">
          <Header currentUser={currentUser} onSignOut={handleSignOut} onNavigate={setDiningHallView} currentView={diningHallView} />
          <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            {currentUser === 'dining-hall' && diningHallView === 'analyze' ? (
              <AnalyzeUsers 
                users={pendingUsers} 
                onApprove={handleApproveUser} 
                onReject={handleRejectUser}
                onRevoke={handleRevokeUser}
                onRecover={handleRecoverUser}
                onDelete={handleDeleteUser}
              />
            ) : currentUser === 'dining-hall' && diningHallView === 'confirmations' ? (
              <Confirmations donations={diningHallDonations} onCompletePickup={handleCompletePickup} onNotCompletedPickup={handleRemoveReservation} />
            ) : currentUser === 'student' ? (
                <Dashboard 
                    donations={donations} 
                    onReserveClick={handleOpenReserveModal} 
                    currentUser={currentUser} 
                    onCancelReservation={handleRemoveReservation}
                    onCompletePickup={handleCompletePickup}
                />
            ) : (
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-1/3 lg:sticky lg:top-8">
                   <DonationForm onNewDonation={handleNewDonation} userRole={currentUser} />
                </div>
                <div className="w-full lg:w-2/3">
                  <Dashboard 
                    donations={donations} 
                    onReserveClick={handleOpenReserveModal} 
                    currentUser={currentUser} 
                    onCancelReservation={handleRemoveReservation}
                    onCompletePickup={handleCompletePickup}
                  />
                </div>
              </div>
            )}
          </main>
          <ReservationModal 
            isOpen={isModalOpen}
            donation={selectedDonation}
            onClose={handleCloseModal}
            onReserve={handleConfirmReservation}
          />
          <EmailPreviewModal
            isOpen={isPreviewModalOpen}
            email={previewEmail}
            onClose={() => setIsPreviewModalOpen(false)}
          />
        </div>
      );
  }

  return (
    <>
      <RoleSelection onSelectRole={handleSelectRole} />
      <StaffPasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onSubmit={handleDiningHallLogin} />
    </>
  );
}

export default App;