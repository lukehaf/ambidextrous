// test_slice.js

// testSlice consists of 3 datastructures: presentables (for all screens), results (from all screens), and currentScreen (so the currently-rendered screen knows which part of presentables to draw from, and which part of results to write to).
// eventually I could make these 3 datastructures into 3 different slices, I bet. But no need.

// First though, here's a function for initializing the results datastructure. It creates an echo-results-object and a recall-results object, and gets called 4 times. First 2 times are both for names, and require the `names` parameter. Second 2 times are both for objects, and require the `objects` parameter.
const names = { lapsEcho: 2, repsEcho: 2, lapsRecall: 3, dominoHeight: 5 }; // For createQuarterResults(names). also used by currentScreen
const objects = { lapsEcho: 1, repsEcho: 1, lapsRecall: 3, dominoHeight: 5 }; // For createQuarterResults(objects). also used by currentScreen
function createQuarterResults({ lapsEcho, repsEcho, lapsRecall, dominoHeight }) {
  return {
    // results of the echo-practice (from the perspective of calling this function for the 1st listHalf of names):
    echo: Array.from({ length: lapsEcho }, () => ( // an array of length lapsEchoNames = 2, because everyone gets two laps of practice.
      Array.from({ length: dominoHeight }, () => ( // 1st lap: needs to be an array of length dominoHeightNames = 5. It holds 5 objects: one for each domino.
        Array.from({ length: repsEcho }, () => ({ // 1st domino: needs to be an array of length repsNames = 2. It holds 2 objects: one for each rep.
          // Here's the object-shape per rep:
          completed: false,
          repTime: null, // the whole echo-domino shares a counter (and perhaps a timebar?), which isn't reset by wrongSubmissions. // wrongSubmissions each have an attemptTime, which are included in the overall repTime.
          wrongSubmissions: [], // wrongSubmissions contains type, submission, and time. No initialization needed, since each submission-object is submitted as a unit, and can simply be appended.
          targetPair: null, // I’d be happy for each domino-pair to know it’s correct targetString… that’s a good safeguard, in case there’s confusion about how the list-order works.
        }))
      ))
    )),
    // results of the recall-test (for the 1st listHalf of names):
    recall: Array.from({ length: lapsRecall }, () => ( // an array of length lapsRecall = 3, because everyone gets 3 laps through the recall-test
      Array.from({ length: dominoHeight }, () => ({ // 1st lap: needs to be an array of length dominoHeightNames = 5. It holds 5 objects: one for each domino-pair.
        // Here's the object-shape for each domino pair:
        dominoPairTime: null, // the whole domino pair shares a timebar, which isn't reset by wrongSubmissions to leftHalf or rightHalf. That's their incentive to get it right the first time. And if they have to hit IDK, they don't get any timebar area whatsoever. //// wrongSubmissions each have an attemptTime, which are included in the overall dominoPairTime.
        leftHalf: { completed: false, wrongSubmissions: [], resetKey: 0 }, // The wrongSubmissions array remains empty if they get it right first try. Each incorrect userEntry is added as another object in the array.
        //                                                    // each wrongSubmissions object needs a type key, with space, backspace, or IDK button. It also needs another submissionTime (since I want to see if the time they take on their FIRST entry predicts incorrectness)
        rightHalf: { completed: false, wrongSubmissions: [], resetKey: 0 }, // wrongSubmission (for the rightHalf) now allows multiple attempts, to detect unordered schemas (valid entry, wrong place).
        reinforcementAttempts: [],
        targetPair: null, // I’d be happy for each domino-pair in the dominoStack to know it’s correct targetString… that’s a good safeguard, in case there’s confusion about how the list-order works.
      }))
    )),
  };
}

export default function createTestSlice(set, get) {
  return {
    currentScreen: {
      // contains pointers and display-state, organized by component. (One store-object per component; this prevents listening overlaps & side-effects.) Favor the components listening directly, rather than passing them props.
      // Pointers: subset `presentables` and `results`; (this clears out ugly array-sifting logic from the components). (Naming-rule: append "pointer" to a state-object's name whenever its purpose is to subset 'presentables' or 'results'.)
      // Display-state: (WOULD be feasible to calculate within the component, via pointers/presentables/results). HOWEVER, it's another opportunity to declutter/hide logic, just like the pointers allow.

      whichScreen: null, // stub. Currently I'm using the legacy currentScreenTest. // possible values: 'TestHasThreeUIs', 'EchoNames', 'EchoObjects', 'Recall', 'DominoStack'.

      // here I'm assuming that echoNames & echoObjects can listen to an identically shaped object:
      echoPointer: { // listened to by the EchoNames component and the EchoObjects component
        // EchoNames and EchoObjects listens to a reset key for its one constituent Domino component
        resetKey: '',
        newDominoResetKey: ({ namesOrObjects, listHalf, lap, pairIndex, rep },
          attempt, // (wrongSubmissions.length() + 1),
        ) => set((draftState) => { draftState.testSlice.currentScreen.echoPointer.resetKey = `${namesOrObjects}-${listHalf}-${lap}-${pairIndex}-${rep}-${attempt}`; }, false, 'newDominoResetKey'),
        /// ///////// CALL USING GET() WHENEVER ONE OF THE DEPENDENCIES CHANGES

        storyText: '',
        storyTime: null,
        updateStoryAndTime: (listHalf, pairIndex) => set((draftState) => {
          draftState.testSlice.currentScreen.echoPointer.storyText = draftState.testSlice.presentables.targetPairs.objects[listHalf][pairIndex].storyText;
          draftState.testSlice.currentScreen.echoPointer.storyTime = draftState.testSlice.presentables.targetPairs.objects[listHalf][pairIndex].storyTime;
        }, false, 'updateStoryAndTime'),
        // CALL WHENEVER THE DOMINOPAIR CHANGES, if it's an object-pair that's getting shown next. otherwise have storyText and storyTime be null
      },
      echo_dominoPointer: { // listened to by the Domino component (that renders inside an Echo component).
        // echo_DominoPointer subsets `presentables` & `results` & contains display state.

        // keys for subsetting:
        namesOrObjects: 'objects',
        listHalf: 'one',
        lap: 0, // also used by echo Domino components, as part of their reset-key.
        pairIndex: 0, // I like the 02413 order because you’re not consciously chaining anything until the last moment. It’s just a faith in the process kind of thing. // const scrambledPairIndex = (pairIndex < Math.ceil(dominoStackHeight / 2)) ? (pairIndex * 2) : ((pairIndex - Math.ceil(dominoStackHeight / 2)) * 2 + 1); // use the modulo operator to cycle the indices back when pairIndex exceeds half the height.
        rep: 0, // also used by echo Domino components, as part of their reset-key.
        // keys for display-type & submission-logic:
        echoOrRecall: 'echo', // (2vs1 space logic depends on this, and whether the domino grabs 2 words or just 1.) // the domino will also get passed an echo prop by its parent, so it knows to listen to the echo.dominoPointer object. But also have the echo key inside the echo.dominoPointer, so only dominoPointer gets passed into the domino, instead of also passing in an auxilliary prop object.
        // obsolete keys:
        // //   scrambledPairIndex: // no need for an additional scrambledPairIndex anymore, for echo_objects. pairIndex points to a location in presentables and results, independent from the order in which the 5 echo_objects screens are presented.
      },

      ////////////////////////////////////////////
      /// /// NEXT: hurray, now I have a resetKey for each domino!

      // now make the domino in echo listen to its reset key
      // // then revise all the domino_logic, to handle the two different domino_pointers.
      /////////////////////////////////
      recallPointer: {
        // the Recall component (dominoStack) listens to a top-level reset key, and an objectful of domino-level reset keys.

        resetKey: '',
        newResetKey: (namesOrObjects, listHalf, lap) => set((draftState) => { draftState.testSlice.currentScreen.recallPointer.resetKey = `${namesOrObjects}-${listHalf}-${lap}`; }, false, 'newResetKey'), // using just "lap" as the reset key wouldn't be sufficient, if I decide to change # of laps to 1.
        /// //// CALL newResetKey() whenever one of its 3 dependencies changes. This can happen inside dominoPointers; the setters for the 3 dependencies just need to include a get().updateCatKey(); after their set();. & that’s great. It helps show who’s listening, (in addition to the one component per object), and avoid mysterious dependencies.

        dominoResetKeys: [], // INITIALIZE THIS to be dominoStackHeight long, and be made of objects with leftHalf & rightHalf
        newDominoResetKey: ({ namesOrObjects, listHalf, lap },
          pairIndex, leftOrRightHalf, // for subsetting
          attempt, // (wrongSubmissions.length() + 1),
        ) => set((draftState) => { draftState.testSlice.currentScreen.recallPointer.dominoResetKeys[pairIndex][leftOrRightHalf] = `${namesOrObjects}-${listHalf}-${lap}-${attempt}`; }, false, 'newDominoResetKey'),
        /// ///////// CALL USING GET() WHENEVER ONE OF THE DEPENDENCIES CHANGES

        dominoStackHeight: (names.dominoHeight === objects.dominoHeight) ? names.dominoHeight : null, // I'm currently assuming both lists have the same # of pairs, and that only one recallPointer is needed. (Or, I could have a setter, which is called by get() whenever objects changes to names)
      },

      recall_dominoPointers: { // listened to by the Domino components (that render inside a Recall component).
        ////////////////////////////////
        // there should be 10 dominoPointers, right? Probably initialized to the right length by a function?
        // some of these keys also exist as props to the domino, but it's nice to have them all internal as well, so just dominoPointer needs to be passed as an argument/prop.
        // keys for subsetting:
        namesOrObjects: 'objects',
        listHalf: 'one',
        lap: 0, // used in the reset-key for the dominoStack.
        pairIndex: 0, // (also a prop)
        // keys for display-type & submission-logic:
        echoOrRecall: 'echo', // (also a prop) // (2vs1 space logic depends on this, and whether the domino grabs 2 words or just 1.) // echoOrRecall is also a prop; duplicate it here, though.
        leftOrRight: 'leftHalf', // (also a prop) (for display-type & submission-logic) (controls whether the grey text is shown, and whether they get unlimited tries.)
        focus: false, // Listened to by dominoes that know they're part of a dominoStack. // I NEED TO INITIALIZE WHICH DOMINO STARTS OUT FOCUSED. deal with that when I make the setFocus.
        // there only need to be 5 of the following. (also concern display-type)
        reinforcementNeeded: null, // listened to by domino-pairs that know they're part of a dominoStack. // for IDK-button submissions or incorrect rightHalf followed by a correct rightHalf.
        rightHalfGrey: false, // (for when the rightHalf needs to show grey, and behave like a leftHalf, IF they've clicked the IDK button or correctly submitted the rightHalf following an incorrect submission of rightHalf.)

        // obsolete keys:
        // //   whichAttempt: 0, // this prop's no longer needed. It was going to be for moving them on after 1 attempt on recall (rightHalf).
        // //   scrambledPairIndex: // no need for an additional scrambledPairIndex anymore, for echo_objects. pairIndex points to a location in presentables and results, independent from the order in which the 5 echo_objects screens are presented.
        // //   rep: 0, // used as a reset-key for the echos. (Domino-stack gets one rep per domino; no need for a reset.)

      },
    },
    presentables: {
      targetPairs: { // FOR DOMINO (names & objects; one and two)
        // targetPairs also contains the stories & storyTimes. That's fine. They belong together conceptually & are accessed together.
        names: {
          one: [
            { leftHalf: 'liam', rightHalf: 'emma' },
            { leftHalf: 'emma', rightHalf: 'noah' },
            { leftHalf: 'noah', rightHalf: 'ava' },
            { leftHalf: 'ava', rightHalf: 'mia' },
            { leftHalf: 'mia', rightHalf: 'ethan' },
          ],
          two: [
            { leftHalf: 'chloe', rightHalf: 'owen' },
            { leftHalf: 'owen', rightHalf: 'caleb' },
            { leftHalf: 'caleb', rightHalf: 'jack' },
            { leftHalf: 'jack', rightHalf: 'hannah' },
            { leftHalf: 'hannah', rightHalf: 'leo' },
          ],
        },
        objects: {
          one: [
            { leftHalf: 'rake', rightHalf: 'leaves', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'leaves', rightHalf: 'stream', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'stream', rightHalf: 'bees', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'bees', rightHalf: 'hivebox', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'hivebox', rightHalf: 'mouse', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
          ],
          two: [
            { leftHalf: 'peas', rightHalf: 'trellis', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'trellis', rightHalf: 'fish', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'fish', rightHalf: 'coins', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'coins', rightHalf: 'flag', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'flag', rightHalf: 'shoes', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
          ],
        },
      },
    },

    // initialize results for the 4 listHalfs, according to createQuarterResults()
    results: {
      names: {
        // which listHalf
        one: createQuarterResults(names),
        two: createQuarterResults(names),
      },
      objects: {
        // which listHalf
        one: createQuarterResults(objects),
        two: createQuarterResults(objects),
      },
    },

    // setters (anything that modifies results):
    submitBadEcho: ({ namesOrObjects, listHalf, lap, pairIndex, rep }, // keys for subsetting, all contained within dominoPointer
      wrongSubmission) => set((draftState) => { // wrongSubmission: an object containing { submissionType: (space, backspace, or IDK (only for recall)), userEntry, attemptTime (since the last submission attempt or domino focus)}
      draftState.testSlice.results[namesOrObjects][listHalf].echo[lap][pairIndex][rep].wrongSubmissions.push(wrongSubmission); // append wrongSubmission to the wrongSubmissions array (which was initialized as `[]`)
    }, false, 'submitBadEcho'),

    submitBadRecall: ({ namesOrObjects, listHalf, lap, rep }, // keys for subsetting, all contained within dominoPointer
      { pairIndex, leftOrRight }, // keys for subsetting, contained in the prop passed by dominoStack
      wrongSubmission) => set((draftState) => { // wrongSubmission: an object containing { submissionType: (space, backspace, or IDK (only for recall)), userEntry, attemptTime (since the last submission attempt or domino focus)}
      draftState.testSlice.results[namesOrObjects][listHalf].recall[lap][pairIndex][leftOrRight].wrongSubmissions.push(wrongSubmission); // append wrongSubmission to the wrongSubmissions array (which was initialized as `[]`)
    }, false, 'submitBadRecall'),

    //////////////////////////////////////////////////////////////////
    // LEGACY CODE. GRADUALLY MOVE EVERYTHING BELOW UP INTO THE DESIRED 3 DATASTRUCTURES.
    // screen-state stuff for knowing which screen-type to render. (right now, you select this via TestHasThreeUIs, but eventually it will also listen to whichPR)
    currentScreenTest: 'TestHasThreeUIs', // eventually this can be encompassed by just currentScreen, but for now I'm actually trying to show 2 screens at once sometimes
    goToEchoNames: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'EchoNames'; }, false, 'goToEchoNames'), // couldn't I have just one function for all this? and pass the screen name? & then somehow get that out into the devtools middleware?
    goToEchoObjects: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'EchoObjects'; }, false, 'goToEchoObjects'),
    goToRecall: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'Recall'; }, false, 'goToRecall'),
    goToDominoStack: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'DominoStack'; }, false, 'goToDominoStack'),

    // we also need a counterBalanced object: an array of strings, dictating the order, say Names1 Names2 Objects1 Objects2. That lets the store be set up in the same order each time, and handles some conditional render type thing about what ([namesOrObjects][1vs2] gets passed to recall, echo_names, and echo_objects)?
    ////////////////////////////////
    dominoStackResults: [], // Each domino in the domino_stack gets its own object in this array.
    // Initialize the array, to schema out its structure (and initialize each "completed" to false).
    // Call this initialization function when the component loads. Or eventually, when we have the bigger structure, that will get initialized on the app's load.
    initializeDominoStack: () => {},
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

    dominoResetKey: 0, // in the recall task, this is used by each domino-pair. We might need another for the whole domino-stack.
    incrementDominoResetKey: () => set(({ testSlice: draftState }) => { draftState.dominoResetKey += 1; }, false, 'incrementDominoResetKey'),

    dominoStackResetKey: 0, // in the recall task, this is used by each domino-pair. We might need another for the whole domino-stack.
    incrementDominoStackResetKey: () => set(({ testSlice: draftState }) => { draftState.dominoStackResetKey += 1; }, false, 'incrementDominoStackResetKey'),
  };
}
