export interface FoodSafetyInfo {
  safeTemp: boolean;
  notContaminated: boolean;
  isOpened: boolean;
  timeOutInHours?: number;
}

export type Role = 'dining-hall' | 'student-group' | 'food-bank' | 'student';

export interface Reservation {
  id: string;
  reserverRole: Role;
  pickupTime: string;
  servingsTaken: number;
  status: 'pending' | 'completed';
}

export interface AIAnalysis {
  foodName: string;
  summary: string;
  observations: string[];
  estimatedServings?: number;
  estimatedWeightLbs?: number;
}

export interface Donation {
  id:string;
  foodItem: string;
  initialServings: number;
  remainingServings: number;
  foodWeightLbs: number; // in lbs
  timestamp: Date;
  alertMessage: string;
  status: 'available' | 'fully-reserved';
  donorType: Role;
  safetyInfo: FoodSafetyInfo;
  reservations: Reservation[];
  pickupLocation: string;
  alertFor: Role[];
  allergens?: string[]; // Array of allergen names
  imageUrl: string; // Base64 Data URI
  aiAnalysis?: AIAnalysis;
}

export interface ChartData {
  day: string;
  servings: number;
}

// --- New Types for User Registration and Approval ---

interface BasePendingUser {
  id: string;
  email: string;
  phoneNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  password?: string;
}

export interface PendingStudentGroup extends BasePendingUser {
  type: 'student-group';
  college: string;
  groupName: string;
  memberCount: string;
}

export interface PendingFoodBank extends BasePendingUser {
  type: 'food-bank';
  managerName: string;
  businessName: string;
  purpose: string;
  location: string;
}

export type PendingUser = PendingStudentGroup | PendingFoodBank;