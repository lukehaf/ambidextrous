import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useStore = create(devtools(immer((set) => { // middleware lets redux chrome devtools access the store!
  return {
    count: 0,
    // careful with this syntax - if 2nd arg is true it will replace all state rather than merge
    // 3rd arg gives redux chrome devtools a stringname for each action, so it's not labeled "anonymous"
    increment: () => set((draftState) => { draftState.count += 1; }, false, 'count/increment'),
    decrement: () => set((draftState) => { draftState.count -= 1; }, false, 'count/decrement'),
  };
})));

export default useStore;
