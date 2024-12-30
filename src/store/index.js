import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useStore = create(devtools(immer((set) => { // middleware lets redux chrome devtools access the store!
  return {
    // counter slice (well, not actually a slice yet)
    count: 0,
    increment: () => set((draftState) => { draftState.count += 1; }, false, 'count/increment'),
    decrement: () => set((draftState) => { draftState.count -= 1; }, false, 'count/decrement'),
    // domino slice
    dominoTerm: '',
    setDominoTerm: (term) => set({ dominoTerm: term }),
  };
})));

export default useStore;
