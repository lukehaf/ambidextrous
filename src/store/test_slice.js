export default function createTestSlice(set) {
  return {
    // screen-state stuff for test screens:
    currentScreenTest: 'TestHasThreeUIs', // eventually this can be encompassed by just currentScreen, but for now I'm actually trying to show 2 screens at once sometimes
    goToEchoNames: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'EchoNames'; }, false, 'goToEchoNames'), // couldn't I have just one function for all this? and pass the screen name? & then somehow get that out into the devtools middleware?
    goToEchoObjects: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'EchoObjects'; }, false, 'goToEchoObjects'),
    goToRecall: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'Recall'; }, false, 'goToRecall'),
    goToDominoStack: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'DominoStack'; }, false, 'goToDominoStack'),

    // for domino (legacy version)
    targetString: 'Reggie',

    // FOR DOMINO (on the recall task only) (eventually I'll make a bigger data structure which also handles the echo tasks)
    targetWordArray: ['rake', 'leaves', 'stream', 'bees', 'hivebox', 'mouse'],
    dominoStackHeight: 5, // Number of domino pairs
    whichFocus: { // initialize which domino starts out focused
      pairIndex: 0,
      whichHalf: 'leftHalf',
    },
    dominoStackResults: [], // Each domino in the domino_stack gets its own object in this array.
    // Initialize the array, to schema out its structure (and initialize each "completed" to false).
    // Call this initialization function when the component loads. Or eventually, when we have the bigger structure, that will get initialized on the app's load.
    initializeDominoStack: () => set(({ testSlice: draftState }) => {
      draftState.dominoStackResults = Array.from({ length: draftState.dominoStackHeight }, () => ({
        // Here's the object-shape for each domino pair:
        elapsedTime: null, // the whole domino pair shares a timebar
        leftHalf: { completed: false, wrongSubmissions: [] }, // The wrongSubmissions array remains empty if they get it right first try. Each incorrect userEntry is added as another object in the array.
        rightHalf: { completed: false, wrongSubmissions: [] }, // wrongSubmission (for the rightHalf) is NOT an array; they only get one shot.
      }));
    }, false, 'initializeDominoStack'),
    // Setters, for the recall-task domino stack
    setElapsedTime: (pairIndex, time) => set(({ testSlice: draftState }) => {
      draftState.dominoStackResults[pairIndex].elapsedTime = time;
    }, false, 'setElapsedTime'),
    setHasReceivedCorrectSubmission: (pairIndex, whichHalf) => set(({ testSlice: draftState }) => {
      draftState.dominoStackResults[pairIndex][whichHalf].completed = true;
      if (whichHalf === 'leftHalf') {
        draftState.whichFocus.whichHalf = 'rightHalf';
      }
      else if (whichHalf === 'rightHalf') {
        draftState.whichFocus.whichHalf = 'leftHalf';
        draftState.whichFocus.pairIndex++;
      }
    }, false, 'setHasReceivedCorrectSubmission'),
    setWrongSubmission: (pairIndex, whichHalf, whichAttempt, userEntry, spaceOrBackspace) => set(({ testSlice: draftState }) => {
      draftState.dominoStackResults[pairIndex][whichHalf].wrongSubmissions[whichAttempt] = { spaceOrBackspace: spaceOrBackspace, userEntry: userEntry };
    }, false, 'setWrongSubmission'),

    dominoResetKey: 0, // in the recall task, this is used by each domino-pair. We might need another for the whole domino-stack.
    incrementDominoResetKey: () => set(({ testSlice: draftState }) => { draftState.dominoResetKey += 1; }, false, 'incrementDominoResetKey'),

    dominoStackResetKey: 0, // in the recall task, this is used by each domino-pair. We might need another for the whole domino-stack.
    incrementDominoStackResetKey: () => set(({ testSlice: draftState }) => { draftState.dominoStackResetKey += 1; }, false, 'incrementDominoStackResetKey'),
  };
}
