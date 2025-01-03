// store/index.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// import the state slices
import createWelcomeSlice from './welcome_slice.js';
import createTestSlice from './test_slice.js';

// create the store from the slices
const useStore = create(devtools(immer((...args) => ({
  welcomeSlice: createWelcomeSlice(...args),
  testSlice: createTestSlice(...args),
}))));

export default useStore;
