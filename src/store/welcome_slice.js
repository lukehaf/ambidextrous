// welcome_slice.js
/* eslint-disable @stylistic/max-statements-per-line */
import { HARD } from './test_logic';

export default function createWelcomeSlice(set) {
  return {
    currentScreen: 'Welcome', // 5 options: 'Welcome', 'Onboarding', 'Sandbox', 'FirstAttempt', and 'Test'. Initial screen should be 'Welcome'.
    nthParticipant: HARD.nthParticipant, // this participant would be the nthParticipant. (But it's 0-indexed, so it's actually the number of complete submissions that have been received.)
    // this could actually just be a useState, local to the Welcome component.
    consentFormVisible: false,
    showConsentForm: () => set((draftState) => { draftState.welcomeSlice.consentFormVisible = true; }, false, 'showConsentForm'),

    // onboarding!
    nextScreen: (screen) => {
      set((draftState) => { draftState.welcomeSlice.currentScreen = screen; }, false, 'nextScreen');
      window.scrollTo(0, 0); // not a soft scroll; it jumps there. But for this, that's fine
    },
    /////////////////////////////////////////////////
    // there are two onboarding paths which should set this true. Make sure both work
    sandbox: null,
    setSandbox: (boolean) => set((draftState) => { draftState.welcomeSlice.sandbox = boolean; }, false, 'setSandbox'),
  };
}

// make the list of screens here. It branches, so don't try to use an array. have a goTo<Screen> setter for each screen, instead. Actually, just have one, and pass it an argument depending on where it's called from.
