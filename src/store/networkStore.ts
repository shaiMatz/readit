import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
}

interface NetworkActions {
  setOnline: (value: boolean) => void;
}

export const useNetworkStore = create<NetworkState & NetworkActions>()((set) => ({
  isOnline: true,
  setOnline: (value) => set({ isOnline: value }),
}));

