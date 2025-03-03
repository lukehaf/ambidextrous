// welcome_slice.js
/* eslint-disable @stylistic/max-statements-per-line */
import axios from 'axios';
// export const ROOT_URL = 'https://ambi-server.onrender.com/api';
export const ROOT_URL = 'http://localhost:9090/api';

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
    serverSays: null,
    setServerSays: (message) => set((draftState) => { draftState.welcomeSlice.serverSays = message; }, false, 'setServerSays'),
    fetchNth: {
      noID: async () => {
        try { // create an nthParticipant in the server using axios, and return the nthParticipant #
          // curl -X POST "http://localhost:9090/api/nth/no-ID" worked for testing! returned {"_id":"67c3e102cfdde460ac9fbed3","createdAt":"2025-03-02T04:39:30.401Z","updatedAt":"2025-03-02T04:39:30.401Z","nthParticipant":2,"__v":0,"id":"67c3e102cfdde460ac9fbed3"}
          const response = await axios.post(`${ROOT_URL}/nth/no-ID`); // ('https://ambi-server.onrender.com/api/nth/no-ID'); // ('http://localhost:9090/api/nth/no-ID')
          const nthParticipant = response.data.nthParticipant;
          get().testSlice.initCounterbal({ nth: nthParticipant }); // As a response, I'm having this route return the actual document that was saved. Perfect! It's an object with a key called nthParticipant.
          get().testSlice.setNthParticipant(nthParticipant);
        }
        catch (error) {
          get().errorSlice.newError(error.message);
        }
      },
      withID: async (event) => {
        event.preventDefault(); // on form submit, default behavior is to reload the browser.
        get().welcomeSlice.setServerSays('nothingYet');

        // submit to backend.
        const studentID = event.target.studentID.value.trim(); // trim whitespace
        try {
          const response = await axios.post(`${ROOT_URL}/nth/with-ID`, { studentID }); // This sends {studentID: 'f004gkb'}
          const serverSays = response.data.serverSays; // As a response, I'm having this route return the actual document that was saved, plus an extra serverSays key. Perfect! It's an object with a key called nthParticipant.
          get().welcomeSlice.setServerSays(serverSays);

          if (serverSays === 'proceed') {
            const nthParticipant = response.data.nthParticipant;
            get().testSlice.initCounterbal({ nth: nthParticipant });
            get().testSlice.setNthParticipant(nthParticipant);
          }
        }
        catch (error) {
          get().errorSlice.newError('error submitting student ID: ', error.message);
        }
      },

    },
  };
}

// make the list of screens here. It branches, so don't try to use an array. have a goTo<Screen> setter for each screen, instead. Actually, just have one, and pass it an argument depending on where it's called from.
