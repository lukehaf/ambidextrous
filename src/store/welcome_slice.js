// welcome_slice.js
/* eslint-disable @stylistic/max-statements-per-line */
import axios from 'axios';

export default function createWelcomeSlice(set, get) {
  return {
    currentScreen: 'Welcome', // 4 options: 'Welcome', 'Onboarding', 'GeneralInstructions', and 'Test'. Initial screen should be 'Welcome'.
    consentFormVisible: false, // this could actually just be a useState, local to the Welcome component.
    showConsentForm: () => set((draftState) => { draftState.welcomeSlice.consentFormVisible = true; }, false, 'showConsentForm'),

    // onboarding!
    nextScreen: (screen) => {
      set((draftState) => { draftState.welcomeSlice.currentScreen = screen; }, false, 'nextScreen');
      window.scrollTo(0, 0); // not a soft scroll; it jumps there. But for this, that's fine
    },
    beta: false,
    setBeta: (boolean) => set((draftState) => { draftState.welcomeSlice.beta = boolean; }, false, 'setBeta(true)'),
    fetchNth: {
      noID: async () => {
        try { // create an nthParticipant in the server using axios, and return the nthParticipant #
          // curl -X POST "http://localhost:9090/api/nth/no-ID" worked for testing! returned {"_id":"67c3e102cfdde460ac9fbed3","createdAt":"2025-03-02T04:39:30.401Z","updatedAt":"2025-03-02T04:39:30.401Z","nthParticipant":2,"__v":0,"id":"67c3e102cfdde460ac9fbed3"}
          const response = await axios.post('http://localhost:9090/api/nth/no-ID'); // (`${ROOT_URL}/nth/no-ID`);
          const nthParticipant = response.data.nthParticipant;
          get().testSlice.initCounterbal({ nth: nthParticipant }); // As a response, I'm having this route return the actual document that was saved. Perfect! It's an object with a key called nthParticipant.
          get().testSlice.setNthParticipant(nthParticipant);
        }
        catch (error) {
          get().errorSlice.newError(error.message);
        }
      },
    },
  };
}

// make the list of screens here. It branches, so don't try to use an array. have a goTo<Screen> setter for each screen, instead. Actually, just have one, and pass it an argument depending on where it's called from.
