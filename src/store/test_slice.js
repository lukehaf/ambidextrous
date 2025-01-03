/* eslint-disable @stylistic/max-statements-per-line */
export default function createTestSlice(set) {
  return {
    count: 0,
    increment: () => set(({ countSlice: draftState }) => { draftState.count += 1; }, false, 'counter/increment'),
    decrement: () => set(({ countSlice: draftState }) => { draftState.count -= 1; }, false, 'counter/decrement'),

    // screen-state stuff for test screens:
    currentScreenTest: 'EchoObjects', // eventually this can be encompassed by just currentScreen, but for now I'm actually trying to show 2 screens at once sometimes
    goToEchoNames: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'EchoNames'; }, false, 'goToEchoNames'),
    goToEchoObjects: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'EchoObjects'; }, false, 'goToEchoObjects'),
    goToRecall: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'Recall'; }, false, 'goToRecall'),

    // for EchoObjects:
    timeRemaining: 6, // Countdown timer in seconds
    isVisible: false, // Whether the EchoNames component is visible
    startCountdown: () => {
      let time = 5; // here's what actually gets decremented, and which timeRemaining tracks
      const intervalId = setInterval(() => {
        if (time <= 0) {
          clearInterval(intervalId); // Stop the interval once the timer hits 0; intervalID is returned conveniently by the preexisting setInterval function
          set(({ testSlice: draftState }) => { draftState.isVisible = true; }, false, 'make EchoNames visible');
        }
        else {
          set(({ testSlice: draftState }) => { draftState.timeRemaining = time; }, false, 'decrease counter'); // Update the timeRemaining in the store
          time--; // Decrement the time
        }
      }, 1000); // 1000 milliseconds
    },

    // domino state
    // dominoTerm: '',
    // setDominoTerm: (term) => set((draftState) => { draftState.dominoTerm = term; }, false, 'setDominoTerm'),
    // elapsedTime: null,
    // setElapsedTime: (time) => set((draftState) => { draftState.elapsedTime = time; }, false, 'setElapsedTime'),
  };
}
