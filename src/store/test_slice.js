// test_slice.js

// testSlice consists of 3 datastructures: presentables (for all screens), results (from all screens), and currentScreen (so the currently-rendered screen knows which part of presentables to draw from, and which part of results to write to).
// eventually I could make these 3 datastructures into 3 different slices, I bet. But no need. // results has a group of setters, beneath it. Maybe the other 2 datastructures will too.

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
        targetPair: null, // I’d be happy for each domino-pair in the dominoStack to know it’s correct targetString… that’s a good safeguard, in case there’s confusion about how the list-order works.
        dominoPairTime: null, // the whole domino pair shares a timebar, which isn't reset by wrongSubmissions to leftHalf or rightHalf. That's their incentive to get it right the first time. And if they have to hit IDK, they don't get any timebar area whatsoever. //// wrongSubmissions each have an attemptTime, which are included in the overall dominoPairTime.
        leftHalf: { completed: false, wrongSubmissions: [] }, // The wrongSubmissions array remains empty if they get it right first try. Each incorrect userEntry is added as another object in the array.
        //                                                    // each wrongSubmissions object needs a type key, with space, backspace, or IDK button. It also needs another submissionTime (since I want to see if the time they take on their FIRST entry predicts incorrectness)
        rightHalf: { completed: false, wrongSubmissions: [] }, // wrongSubmission (for the rightHalf) now allows multiple attempts, to detect unordered schemas (valid entry, wrong place).
        reinforcement: null, // If reinforcement is needed, this is initialized with {an object identical to its above 4 lines}. Reinforcement happens for the whole pair at once. a wrongSubmission on the right half would need to grab and append the left half of the targetString, since it's not actually known by that domino.
      }))
    )),
  };
}

export default function createTestSlice(set, get) {
  return {
    results: { // initialize 4 quarter-results: (2 namesOrObjects x 2 listHalf)
      names: { one: createQuarterResults(names), two: createQuarterResults(names) },
      objects: { one: createQuarterResults(objects), two: createQuarterResults(objects) },
    },

    // Below are 3 setters, which act upon the above results datastructure.
    // Each setter contains two functions: an echo-version & a recall-version. Subset & call like so: submitBad[echoOrRecall](wrongEntry)

    setCorrect: { // to document a correct submission; this triggers the nextScreen setter
      echo: () => set((draftState) => {
        // get echo_dominoPointer, which we'll use to subset results, and then subset results
        const { namesOrObjects, listHalf, lap, pairIndex, rep } = draftState.testSlice.currentScreen.echo_dominoPointer;
        const thisRep = draftState.testSlice.results[namesOrObjects][listHalf].echo[lap][pairIndex][rep];
        // update results
        thisRep.completed = true;
        thisRep.repTime = Date.now() - draftState.currentScreen.time.sinceFocus; // Calculate elapsed time, from when this domino first focused to when it received this correct submission
        draftState.nextScreen(); // a setter which increments screenIndex, triggered by setCorrect.
      }, false, 'setCorrect.echo'),
      recall: () => set((draftState) => {
        // get the currently focused domino, which we'll use to subset recall_dominoPointers
        const { pairIndex, leftOrRight } = draftState.testSlice.currentScreen.whichFocus;
        // get recall_dominoPointers, which we'll use to subset results, and then subset results
        const { namesOrObjects, listHalf, lap } = draftState.testSlice.currentScreen.recall_dominoPointers[pairIndex][leftOrRight];
        const thisPair = draftState.testSlice.results[namesOrObjects][listHalf].recall[lap][pairIndex];
        // if this is a reinforcement rep, then thisPair.reinforcement will have been initialized by an empty object (and thus will be truthy) (before the user could possibly try to submit anything.)
        const pairTier = thisPair.reinforcement || thisPair;

        // update results:
        pairTier[leftOrRight].completed = true;
        // Calculate elapsed time, from when this domino first focused to when it received this correct submission. (a reinforcement correct submission will have a longer elapsed time than the initial correct submission)
        if (leftOrRight === 'rightHalf') { // the whole pair's complete only when the rightHalf's complete.
          pairTier.dominoPairTime = Date.now() - draftState.currentScreen.time.sinceFocus;
        }
        draftState.nextScreen(); // a setter which increments screenIndex, triggered by setCorrect. // (nextScreen also handles changing focus to next domino on same screen)
      }, false, 'setCorrect.echo'),
    },
    startScreen: () => set((draftState) => { // CALL THIS WHENEVER A NEW DOMINO FOCUSES. probably doesn't need to be a full setter.
      draftState.currentScreen.startTime = Date.now(); // Capture the system time when screen starts
    }),

    submitBad: {
      echo: ({ submissionType, userEntry }) => set((draftState) => {
        // get echo_dominoPointer, which we'll use to subset results, and then subset results
        const { namesOrObjects, listHalf, lap, pairIndex, rep } = draftState.testSlice.currentScreen.echo_dominoPointer;
        const thisRep = draftState.testSlice.results[namesOrObjects][listHalf].echo[lap][pairIndex][rep];
        // update results. First, modify the wrongSubmission parameter-object to include an attemptTime. Then, append wrongSubmission to the wrongSubmissions array.
        const wrongSubmission = {
          submissionType, // submissionType: (space or backspace)
          userEntry, // the array of character-objects that they typed
          attemptTime: Date.now() - draftState.currentScreen.time.sinceLastSubmission,
        };
        thisRep.wrongSubmissions.push(wrongSubmission);
        draftState.nextScreen(); // a setter which increments screenIndex, triggered by setCorrect.
      }, false, 'submitBad.echo'),

      recall: ({ submissionType, userEntry }) => set((draftState) => {
        // get the currently focused domino, which we'll use to subset recall_dominoPointers
        const { pairIndex, leftOrRight } = draftState.testSlice.currentScreen.whichFocus;
        // get recall_dominoPointers, which we'll use to subset results, and then subset results
        const { namesOrObjects, listHalf, lap } = draftState.testSlice.currentScreen.recall_dominoPointers[pairIndex][leftOrRight];
        const thisPair = draftState.testSlice.results[namesOrObjects][listHalf].recall[lap][pairIndex];
        // if this is a reinforcement rep, then thisPair.reinforcement will have been initialized by an empty object (and thus will be truthy) (before the user could possibly try to submit anything.)
        const pairTier = thisPair.reinforcement || thisPair;
        // update results. First, modify the wrongSubmission parameter-object to include an attemptTime.
        const wrongSubmission = {
          submissionType, // submissionType: (space or backspace, or IDK (only possible on rightHalf of recall-dominoes)
          userEntry, // the array of character-objects that they typed
          attemptTime: Date.now() - draftState.currentScreen.time.sinceLastSubmission,
        };
        // append wrongSubmission to the wrongSubmissions array (under leftOrRight)
        pairTier[leftOrRight].wrongSubmissions.push(wrongSubmission);
        // a setter which increments screenIndex, triggered by setCorrect. // (nextScreen also handles changing focus to next domino on same screen)
        draftState.nextScreen();
      }, false, 'submitBad.recall'),
    },

    updateDominoResetKey: {
      echo: () => set((draftState) => {
        // get echo_dominoPointer. Concatenate its properties to create a unique reset key.
        const { namesOrObjects, listHalf, lap, pairIndex, rep, attempt } = draftState.testSlice.currentScreen.echo_dominoPointer;
        draftState.testSlice.currentScreen.echoPointer.dominoResetKey = `${namesOrObjects}-${listHalf}-${lap}-${pairIndex}-${rep}-${attempt}`;
      }, false, 'updateDominoResetKey.echo'),
      /// ///////// CALL ^^ USING GET() WHENEVER ONE OF THE DEPENDENCIES CHANGES
      recall: () => set((draftState) => {
        // get the currently focused domino, which we'll use to subset recall_dominoPointers
        const { pairIndex, leftOrRight } = draftState.testSlice.currentScreen.whichFocus;
        // get the correct dominoPointer from recall_dominoPointers. Concatenate its properties to create a unique reset key.
        const { namesOrObjects, listHalf, lap, attempt } = draftState.testSlice.currentScreen.recall_dominoPointers[pairIndex][leftOrRight];
        draftState.testSlice.currentScreen.recallPointer.dominoResetKeys[pairIndex][leftOrRight] = `${namesOrObjects}-${listHalf}-${lap}-${leftOrRight}-${attempt}`;
      }, false, 'updateDominoResetKey.recall'),
      /// ///////// CALL ^^ USING GET() WHENEVER ONE OF THE DEPENDENCIES CHANGES
    },

    currentScreen: {
      // contains pointers and display-state, organized by component. (One store-object per component; this prevents listening overlaps & side-effects.) Favor the components listening directly, rather than passing them props.
      // Pointers: subset `presentables` and `results`; (this clears out ugly array-sifting logic from the components). (Naming-rule: append "pointer" to a state-object's name whenever its purpose is to subset 'presentables' or 'results'.)
      // Display-state: (WOULD be feasible to calculate within the component, via pointers/presentables/results). HOWEVER, it's another opportunity to declutter/hide logic, just like the pointers allow.

      whichScreen: null, // stub. Currently I'm using the legacy currentScreenTest. // possible values: 'TestHasThreeUIs', 'EchoNames', 'EchoObjects', 'Recall', 'DominoStack'.
      time: {
        sinceFocus: null, // Store when the screen's active domino focused. // read by setCorrect (not a component)
        sinceLastSubmission: null, // read by submitBad (not a component)
      },
      whichFocus: { pairIndex: 0, leftOrRight: 'rightHalf' }, // read by setCorrect.recall (not a component)
      // here I'm assuming that echoNames & echoObjects can listen to an identically shaped object:
      echoPointer: { // listened to by the EchoNames component and the EchoObjects component
        // EchoNames and EchoObjects listens to a reset key, which resets both their Domino and timebar
        dominoResetKey: '',
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
        attempt: 0, // used by newDominoResetKey. Unnecessary for submissions; they just append. // wrongSubmissions.length()
        // keys for display-type & submission-logic:
        echoOrRecall: 'echo', // (2vs1 space logic depends on this, and whether the domino grabs 2 words or just 1.) // the domino will also get passed an echo prop by its parent, so it knows to listen to the echo.dominoPointer object. But also have the echo key inside the echo.dominoPointer, so only dominoPointer gets passed into the domino, instead of also passing in an auxilliary prop object.
        // obsolete keys:
        // //   scrambledPairIndex: // no need for an additional scrambledPairIndex anymore, for echo_objects. pairIndex points to a location in presentables and results, independent from the order in which the 5 echo_objects screens are presented.
      },

      recallPointer: {
        // the Recall component (dominoStack) listens to a top-level reset key, and an objectful of domino-level reset keys.

        stackResetKey: '',
        // MOVE THIS SETTER TO BE PART OF THE NEXTSCREEN SETTER. it's not called by a usersubmission (space bar or backspace.)
        updateResetKey: (namesOrObjects, listHalf, lap) => set((draftState) => { draftState.testSlice.currentScreen.recallPointer.resetKey = `${namesOrObjects}-${listHalf}-${lap}`; }, false, 'updateResetKey'), // using just "lap" as the reset key wouldn't be sufficient, if I decide to change # of laps to 1.
        /// //// CALL newResetKey() whenever one of its 3 dependencies changes. This can happen inside dominoPointers; the setters for the 3 dependencies just need to include a get().updateCatKey(); after their set();. & that’s great. It helps show who’s listening, (in addition to the one component per object), and avoid mysterious dependencies.

        dominoResetKeys: [], // INITIALIZE THIS to be dominoStackHeight long, and be made of objects with leftHalf & rightHalf
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
        attempt: 0, // used by newDominoResetKey. Unnecessary for submissions; they just append. // wrongSubmissions.length()
        // keys for display-type & submission-logic:
        echoOrRecall: 'echo', // (also a prop) // (2vs1 space logic depends on this, and whether the domino grabs 2 words or just 1.) // echoOrRecall is also a prop; duplicate it here, though.
        leftOrRight: 'leftHalf', // (also a prop) (for display-type & submission-logic) (controls whether the grey text is shown, and whether they get unlimited tries.)
        focused: false, // Listened to by dominoes that know they're part of a dominoStack. // I NEED TO INITIALIZE WHICH DOMINO STARTS OUT FOCUSED. deal with that when I make the setFocus.
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

    //////////////////////////////////////////////////////////////////
    // LEGACY CODE. GRADUALLY MOVE EVERYTHING BELOW UP INTO THE DESIRED 3 DATASTRUCTURES.
    // screen-state stuff for knowing which screen-type to render. (right now, you select this via TestHasThreeUIs, but eventually it will also listen to whichPR)
    currentScreenTest: 'TestHasThreeUIs', // eventually this can be encompassed by just currentScreen, but for now I'm actually trying to show 2 screens at once sometimes
    goToEchoNames: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'EchoNames'; }, false, 'goToEchoNames'), // couldn't I have just one function for all this? and pass the screen name? & then somehow get that out into the devtools middleware?
    goToEchoObjects: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'EchoObjects'; }, false, 'goToEchoObjects'),
    goToRecall: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'Recall'; }, false, 'goToRecall'),
    goToDominoStack: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'DominoStack'; }, false, 'goToDominoStack'),

    // we also need a counterBalanced object: an array of strings, dictating the order, say Names1 Names2 Objects1 Objects2. That lets the store be set up in the same order each time, and handles some conditional render type thing about what ([namesOrObjects][1vs2] gets passed to recall, echo_names, and echo_objects)?
  };
}
