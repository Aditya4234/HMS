import { create } from 'zustand';

interface BookingFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

interface BookingState {
  filters: BookingFilters;
  setFilters: (filters: Partial<BookingFilters>) => void;
  resetFilters: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  filters: {
    page: 1,
    limit: 10,
  },
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  resetFilters: () =>
    set({
      filters: { page: 1, limit: 10 },
    }),
}));
