export default function createTestSlice(set) {
  return {
    // screen-state stuff for test screens:
    currentScreenTest: 'EchoObjects', // eventually this can be encompassed by just currentScreen, but for now I'm actually trying to show 2 screens at once sometimes
    goToEchoNames: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'EchoNames'; }, false, 'goToEchoNames'),
    goToEchoObjects: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'EchoObjects'; }, false, 'goToEchoObjects'),
    goToRecall: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'Recall'; }, false, 'goToRecall'),

    // for EchoObjects:
    timeRemaining: 6, // unused, rn. This is a placeholder in case I have to pass in diff values for each story.

    // domino state
    // dominoTerm: '',
    // setDominoTerm: (term) => set((draftState) => { draftState.dominoTerm = term; }, false, 'setDominoTerm'),
    // elapsedTime: null,
    // setElapsedTime: (time) => set((draftState) => { draftState.elapsedTime = time; }, false, 'setElapsedTime'),
  };
}
