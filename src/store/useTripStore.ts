import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Define the types for our data
interface Member {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  payer_id: string;
  amount: number;
  allocations: Record<string, number>;
}

interface TripState {
  allTrips: any[];
  currentTripId: string;
  members: Member[];
  expenses: Expense[];
  theme: 'light' | 'dark';
  trackEvent: (eventName: string) => void;
  addMember: (name: string) => void;
  addExpense: (payer_id: string, totalAmount: number, allocations?: Record<string, number>) => void;
  saveCurrentTrip: (name: string) => void;
  toggleTheme: () => void;
  resetTrip: () => void;
}

// 2. Create the store with proper typing
export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      allTrips: [],
      currentTripId: crypto.randomUUID(),
      members: [],
      expenses: [],
      theme: 'light',

      trackEvent: (eventName: string) => {
        console.log(`[Analytics]: ${eventName}`);
      },

      addMember: (name: string) => {
        set((state) => ({ 
          members: [...state.members, { id: crypto.randomUUID(), name }] 
        }));
        get().trackEvent('Add Member');
      },

      addExpense: (payer_id: string, totalAmount: number, allocations?: Record<string, number>) => {
        const { members } = get();
        
        // Use provided allocations or default to equal split
        const finalAllocations = allocations || members.reduce((acc, m) => ({
          ...acc,
          [m.id]: totalAmount / (members.length || 1) // Prevent division by zero
        }), {});

        set((state) => ({
          expenses: [...state.expenses, { 
            id: crypto.randomUUID(), 
            payer_id, 
            amount: totalAmount, 
            allocations: finalAllocations 
          }]
        }));
        get().trackEvent('Add Expense');
      },

      saveCurrentTrip: (name: string) => {
        const { members, expenses, currentTripId, allTrips } = get();
        set({
          allTrips: [...allTrips, { id: currentTripId, name, members, expenses, date: new Date().toISOString() }],
          members: [],
          expenses: [],
          currentTripId: crypto.randomUUID()
        });
        get().trackEvent('Save Trip');
      },

      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      
      resetTrip: () => {
        set({ members: [], expenses: [] });
        get().trackEvent('Reset Trip');
      },
    }),
    { name: 'split-it-storage-v2' }
  )
);