import React, { useState, useMemo, useRef } from 'react';
import { generateAlertMessage, analyzeFoodImage } from '../services/geminiService';
import type { Donation, Role, FoodSafetyInfo, AIAnalysis } from '../types';

interface DonationFormProps {
    onNewDonation: (donation: Omit<Donation, 'id' | 'timestamp' | 'donorType' | 'reservations'>) => void;
    userRole: Role;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error('Failed to convert blob to base64 string.'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const SafetyChecklistItem = ({ id, checked, onChange, label }) => (
    <div className="flex items-start p-3 bg-base-300/50 rounded-lg border border-slate-600">
        <div className="flex items-center h-5">
            <input 
                id={id} 
                type="checkbox" 
                checked={checked} 
                onChange={onChange} 
                className="focus:ring-primary h-4 w-4 text-primary border-slate-500 rounded bg-slate-700" 
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor={id} className="font-medium text-neutral-content">{label}</label>
        </div>
    </div>
);

const NotificationCheckbox = ({ id, role, checked, onChange, label }) => (
     <div className="flex items-center">
        <input 
            id={id}
            type="checkbox"
            checked={checked}
            onChange={() => onChange(role)}
            className="h-4 w-4 text-primary focus:ring-primary border-slate-500 rounded bg-slate-700"
        />
        <label htmlFor={id} className="ml-2 block text-sm text-neutral-content">{label}</label>
    </div>
);

const ALLERGENS = ['Milk', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 'Wheat', 'Soybeans', 'Sesame'];

const AllergenCheckbox = ({ id, allergen, checked, onChange, label }) => (
     <div className="flex items-center">
        <input 
            id={id}
            type="checkbox"
            checked={checked}
            onChange={() => onChange(allergen)}
            className="h-4 w-4 text-primary focus:ring-primary border-slate-500 rounded bg-slate-700"
        />
        <label htmlFor={id} className="ml-2 block text-sm text-neutral-content">{label}</label>
    </div>
);


const DonationForm: React.FC<DonationFormProps> = ({ onNewDonation, userRole }) => {
    const [foodItem, setFoodItem] = useState('');
    const [servings, setServings] = useState('');
    const [pickupLocation, setPickupLocation] = useState('Main Dining Hall');
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [safeTemp, setSafeTemp] = useState(false);
    const [notContaminated, setNotContaminated] = useState(false);
    const [isOpened, setIsOpened] = useState<boolean | null>(null);
    const [timeOut, setTimeOut] = useState('');

    const [allergens, setAllergens] = useState<string[]>([]);

    const [alertFor, setAlertFor] = useState<Role[]>(
        userRole === 'student-group'
            ? ['student', 'student-group']
            : ['student', 'student-group', 'food-bank']
    );
    
    const handleAlertForChange = (role: Role) => {
        setAlertFor(prev => 
            prev.includes(role) 
                ? prev.filter(r => r !== role) 
                : [...prev, role]
        );
    };

    const handleAllergenChange = (allergen: string) => {
        setAllergens(prev =>
            prev.includes(allergen)
                ? prev.filter(a => a !== allergen)
                : [...prev, allergen]
        );
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAiAnalysis(null);
            setIsAnalyzing(true);
            setError('');

            const reader = new FileReader();
            reader.onload = async (e) => {
                const dataUrl = e.target?.result as string;
                setImageSrc(dataUrl);

                try {
                    const base64Data = dataUrl.split(',')[1];
                    const analysis = await analyzeFoodImage(base64Data);
                    setAiAnalysis(analysis);
                    setFoodItem(analysis.foodName); // Auto-fill food item
                    if (analysis.estimatedServings) {
                        setServings(analysis.estimatedServings.toString());
                    }
                } catch (err) {
                    setError('AI analysis failed. Please describe the food manually.');
                } finally {
                    setIsAnalyzing(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const resetForm = () => {
        setFoodItem('');
        setServings('');
        setPickupLocation('Main Dining Hall');
        setSafeTemp(false);
        setNotContaminated(false);
        setIsOpened(null);
        setTimeOut('');
        setAlertFor(
            userRole === 'student-group'
                ? ['student', 'student-group']
                : ['student', 'student-group', 'food-bank']
        );
        setAllergens([]);
        setImageSrc(null);
        setAiAnalysis(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const canSubmit = useMemo(() => {
        if (!imageSrc) return false;
        const servingsNum = parseInt(servings, 10);
        if (!foodItem.trim() || isNaN(servingsNum) || servingsNum <= 0 || !pickupLocation.trim()) return false;
        if (!safeTemp || !notContaminated || isOpened === null) return false;
        if (isOpened && !timeOut.trim()) return false;
        if (alertFor.length === 0) return false;
        return true;
    }, [foodItem, servings, pickupLocation, safeTemp, notContaminated, isOpened, timeOut, alertFor, imageSrc]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canSubmit) {
            setError('Please fill all fields, including a photo, and answer safety questions favorably.');
            return;
        }

        setError('');
        setIsLoading(true);
        setSuccessMessage('');
        
        try {
            const servingsNum = parseInt(servings, 10);
            const { alertMessage } = await generateAlertMessage(foodItem, servingsNum);
            
            const safetyInfo: FoodSafetyInfo = {
                safeTemp,
                notContaminated,
                isOpened: isOpened!,
                timeOutInHours: isOpened ? parseFloat(timeOut) : undefined
            };

            const foodWeightLbs = aiAnalysis?.estimatedWeightLbs || (servingsNum * 1.25); // Fallback if AI fails

            const newDonationData: Omit<Donation, 'id' | 'timestamp' | 'donorType' | 'reservations'> = {
                foodItem,
                initialServings: servingsNum,
                remainingServings: servingsNum,
                pickupLocation,
                status: 'available' as const,
                safetyInfo,
                alertMessage,
                foodWeightLbs,
                alertFor,
                allergens: userRole === 'dining-hall' ? allergens : undefined,
                imageUrl: imageSrc!,
                aiAnalysis: aiAnalysis || undefined,
            };

            onNewDonation(newDonationData);

            setSuccessMessage(`Success! Alert for ${servingsNum} servings of ${foodItem} sent.`);
            resetForm();
            setTimeout(() => setSuccessMessage(''), 5000);

        } catch (apiError) {
            console.error(apiError);
            setError('Failed to process donation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (userRole === 'food-bank' || userRole === 'student') {
        return (
            <div className="w-full bg-base-100 p-8 rounded-2xl shadow-lg text-center border border-base-300">
                 <h2 className="text-2xl font-bold text-neutral-content mb-2">Welcome!</h2>
                 <p className="text-gray-400">View and reserve available donations on the dashboard.</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-base-100 p-8 rounded-2xl shadow-lg border border-base-300">
            <h2 className="text-2xl font-bold text-neutral-content mb-2">Log Surplus Food</h2>
            <p className="text-gray-400 mb-6">Enter details to alert local groups and track your impact.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                 <fieldset>
                    <legend className="text-lg font-semibold text-neutral-content mb-3 border-b border-base-300 pb-2">Food Photo (Required)</legend>
                    <div className="p-3 bg-base-200 rounded-lg border border-dashed border-base-300 text-center">
                        <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" ref={fileInputRef} />
                        {!imageSrc && (
                            <div className="py-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <p className="mt-2 text-sm text-gray-300">Take or upload a photo of the food.</p>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-3 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-focus rounded-md shadow-sm">
                                    {isAnalyzing ? 'Analyzing...' : 'Select Photo'}
                                </button>
                            </div>
                        )}
                        {imageSrc && (
                             <div className="relative">
                                <img src={imageSrc} alt="Preview of donated food" className="mt-2 rounded-lg max-h-60 w-auto mx-auto"/>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium text-white bg-primary bg-opacity-80 hover:bg-opacity-100 rounded-md shadow-sm">
                                    Change Photo
                                </button>
                             </div>
                        )}
                    </div>
                    {isAnalyzing && (
                        <div className="mt-4 text-center text-sm text-gray-300 flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing with AI...
                        </div>
                    )}
                    {aiAnalysis && !isAnalyzing && (
                        <div className="mt-4 p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
                            <h4 className="font-bold text-blue-300">AI Analysis</h4>
                            <p className="text-sm text-blue-300 mt-1">{aiAnalysis.summary}</p>
                            <ul className="list-disc list-inside text-sm text-blue-400 mt-2 space-y-1">
                                {aiAnalysis.observations.map((obs, i) => <li key={i}>{obs}</li>)}
                            </ul>
                        </div>
                    )}
                 </fieldset>

                <fieldset>
                    <legend className="text-lg font-semibold text-neutral-content mb-3 border-b border-base-300 pb-2">Donation Details</legend>
                    <div>
                        <label htmlFor="foodItem" className="block text-sm font-medium text-gray-300">Food Item (AI Suggested)</label>
                        <input type="text" id="foodItem" value={foodItem} onChange={(e) => setFoodItem(e.target.value)} placeholder="e.g., Vegetable Lasagna" className="mt-1 block w-full px-4 py-3 bg-base-300 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-content" disabled={isLoading} />
                    </div>
                    <div className="mt-4">
                        <label htmlFor="servings" className="block text-sm font-medium text-gray-300">Number of Servings (AI Suggested)</label>
                        <input type="number" id="servings" value={servings} onChange={(e) => setServings(e.target.value)} placeholder="e.g., 15" className="mt-1 block w-full px-4 py-3 bg-base-300 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-content" min="1" disabled={isLoading} />
                    </div>
                    <div className="mt-4">
                        <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-300">Pickup Location</label>
                        <input type="text" id="pickupLocation" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="e.g., Main Dining Hall, rear entrance" className="mt-1 block w-full px-4 py-3 bg-base-300 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-content" disabled={isLoading} />
                    </div>
                </fieldset>
                
                <fieldset>
                    <legend className="text-lg font-semibold text-neutral-content mb-3 border-b border-base-300 pb-2">Notification Targets</legend>
                    <div className="p-3 bg-base-300/50 rounded-lg border border-slate-600">
                         <p className="text-sm font-medium text-gray-300 mb-3">Select which groups to notify about this donation:</p>
                         <div className="flex flex-wrap gap-x-6 gap-y-3">
                            <NotificationCheckbox id="alert-students" role="student" checked={alertFor.includes('student')} onChange={handleAlertForChange} label="Students" />
                            <NotificationCheckbox id="alert-student-groups" role="student-group" checked={alertFor.includes('student-group')} onChange={handleAlertForChange} label="Student Groups" />
                            {userRole !== 'student-group' && (
                                <NotificationCheckbox id="alert-food-banks" role="food-bank" checked={alertFor.includes('food-bank')} onChange={handleAlertForChange} label="Food Banks" />
                            )}
                         </div>
                    </div>
                </fieldset>

                {userRole === 'dining-hall' && (
                    <fieldset>
                        <legend className="text-lg font-semibold text-neutral-content mb-3 border-b border-base-300 pb-2">Allergen Information</legend>
                        <div className="p-3 bg-base-300/50 rounded-lg border border-slate-600">
                             <p className="text-sm font-medium text-gray-300 mb-3">Select any of the following allergens present in the food:</p>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                                {ALLERGENS.map(allergen => (
                                    <AllergenCheckbox
                                        key={allergen}
                                        id={`allergen-${allergen.toLowerCase().replace(' ', '-')}`}
                                        allergen={allergen}
                                        checked={allergens.includes(allergen)}
                                        onChange={handleAllergenChange}
                                        label={allergen}
                                    />
                                ))}
                             </div>
                        </div>
                    </fieldset>
                )}

                <fieldset>
                    <legend className="text-lg font-semibold text-neutral-content mb-3 border-b border-base-300 pb-2">Food Safety Checklist</legend>
                    <div className="space-y-4">
                        <SafetyChecklistItem id="safeTemp" checked={safeTemp} onChange={e => setSafeTemp(e.target.checked)} label="Is the food stored at a safe temperature?" />
                        <SafetyChecklistItem id="notContaminated" checked={notContaminated} onChange={e => setNotContaminated(e.target.checked)} label="Has the food been protected from contamination?" />
                        
                         <div className="p-3 bg-base-300/50 rounded-lg border border-slate-600">
                            <p className="text-sm font-medium text-gray-300 mb-2">Is the food package opened?</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => setIsOpened(false)} className={`py-2 px-4 rounded-md text-sm font-semibold transition-colors ${isOpened === false ? 'bg-primary text-white ring-2 ring-offset-2 ring-offset-base-100 ring-primary-focus' : 'bg-slate-600 hover:bg-slate-500 text-neutral-content'}`}>No</button>
                                <button type="button" onClick={() => setIsOpened(true)} className={`py-2 px-4 rounded-md text-sm font-semibold transition-colors ${isOpened === true ? 'bg-primary text-white ring-2 ring-offset-2 ring-offset-base-100 ring-primary-focus' : 'bg-slate-600 hover:bg-slate-500 text-neutral-content'}`}>Yes</button>
                            </div>
                        </div>

                        {isOpened && (
                             <div className="transition-all duration-300 ease-in-out">
                                <label htmlFor="timeOut" className="block text-sm font-medium text-gray-300">If opened, how long has it been out (in hours)?</label>
                                <input type="number" id="timeOut" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} placeholder="e.g., 1.5" className="mt-1 block w-full px-4 py-3 bg-base-300 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-content" min="0" step="0.5" disabled={isLoading} />
                             </div>
                        )}
                    </div>
                </fieldset>
                
                {error && <p className="text-sm text-error">{error}</p>}
                {successMessage && <p className="text-sm text-success">{successMessage}</p>}
                
                <div>
                    <button type="submit" disabled={isLoading || isAnalyzing || !canSubmit} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-content bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-primary disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Log Surplus & Alert Groups'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DonationForm;