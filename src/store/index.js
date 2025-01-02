// store/index.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useStore = create(devtools(immer((set) => { // middleware lets redux chrome devtools access the store!
  return {
    // which screen should be shown, right now?
    currentScreen: 'Welcome', // initial screen
    goToTest: () => set((draftState) => { draftState.currentScreen = 'Test'; }, false, 'goToTest'), // I'll probably say "DominoEcho" (a specific test screen), rather than relying on an additional "which screen" variable?
    consent: true, // later I'll add a setter function, for once they click "agree" at the bottom of the test info
    // gaveConsent
    studyInfoVisible: false,
    showStudyInfo: () => set((draftState) => { draftState.studyInfoVisible = true; }, false, 'showStudyInfo'),

    // counter state
    participantsStillNeeded: 24,

    // domino state
    dominoTerm: '',
    setDominoTerm: (term) => set((draftState) => { draftState.dominoTerm = term; }, false, 'setDominoTerm'),
    elapsedTime: null,
    setElapsedTime: (time) => set((draftState) => { draftState.elapsedTime = time; }, false, 'setElapsedTime'),
  };
})));

export default useStore;
