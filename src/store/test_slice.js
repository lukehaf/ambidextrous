// test_slice.js

// testSlice consists of 3 datastructures: presentables (for all screens), results (from all screens), and currentScreen (so the currently-rendered screen knows which part of presentables to draw from, and which part of results to write to).
// eventually I could make these 3 datastructures into 3 different slices, I bet. But no need. // results has a group of setters, beneath it. Maybe the other 2 datastructures will too.

// First though, here's a function for initializing the results datastructure. It creates an echo-results-object and a recall-results object, and gets called 4 times. First 2 times are both for names, and require the `names` parameter. Second 2 times are both for objects, and require the `objects` parameter.
const HARD = { // the function requires some hardcoded lengths
  names: { lapsEcho: 2, repsEcho: 2, lapsRecall: 3, dominoHeight: 5 }, // For createQuarterResults(names). also used by currentScreen and updateScreen()
  objects: { lapsEcho: 1, repsEcho: 1, lapsRecall: 3, dominoHeight: 5 } }; // For createQuarterResults(objects). also used by currentScreen and updateScreen()
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

// This function updates draftState.currentScreen; it's called synchronously as the last line of setCorrect/submitBad (once their prior lines have slaked their need for currentScreen's unmodified base state). Synchronousness (making updateScreen a helper function within a setter, rather than in independent setter) matters since Zustand doesn't guarantee the order of execution for two setters called during the same render cycle of a React component.
function updateScreen(draftState) { // In javascript, objects are passed by reference; that's how I'm certain that updateScreen is mutating the setter's draftState, rather than an independent copy (while leaving the setter's draftState untouched (that's what the spread operator's for: creating a copy of the object.)). The setter's draftState is what needs to be mutated, so immer can polish the draft into a full-fledged new state, which can be passed to Zustand and committed/made unmutable.
  const currentScreen = draftState.testSlice.currentScreen; // similarly, currentScreen is an object, so the = passes a reference (rather than the object itself). So, mutating currentScreen affects the original object. (This would not work for primitives (e.g., a number, string, or boolean), since those are passed by value (creating an independent copy).)
  const echo_dominoPointer = currentScreen.echo_dominoPointer;
  const echoPointer = currentScreen.echoPointer;
  /////////////////////////////////////////////////////////
  // FIRST, I'M JUST CONSIDERING HOW YOU MOVE WITHIN ONE echo, within one listHalf, for names. //- When updateScreen is called during recall, use a recall-specific incrementing pattern. After incrementing: create new recall-domino-key, using all the updated values
  switch (currentScreen.echoOrRecall) {
    case 'echo':
      // - use an echo-specific incrementing pattern. Go look at createQuarterResults(), so the pattern navigates that.

      if (currentScreen.correct === false) { // submitBad sets currentScreen.correct = false; // setCorrect sets currentScreen.correct = true.
        currentScreen.attempt += 1;
        // After incrementing: create new echo-domino-key, using all the updated values
      }
      else if (currentScreen.correct === true) { // Time to move on to a new rep! (It's ECHO, so there aren't any reinforcement cases where you'd get linger for an ADDITIONAL correct)
        currentScreen.attempt = 0; // reset attempt to 0; now they're on a new rep.

        const maxIndexReps = HARD[currentScreen.namesOrObjects].repsEcho - 1; // from my hardcoded stuff at the top of the file.
        if (echo_dominoPointer.rep < maxIndexReps) { // if they still have reps remaining, then it's not yet time to move on.
          echo_dominoPointer.rep += 1; // Give them their next rep.
        }
        else if (echo_dominoPointer.rep === maxIndexReps) { // They completed their rep. Time to move on! (next pairIndex.)
          echo_dominoPointer.rep = 0; // reset rep to 0; now they're on a new pairIndex.

          const maxPairIndex = HARD[currentScreen.namesOrObjects].dominoHeight - 1;
          if (echo_dominoPointer.pairIndex < maxPairIndex) { // they still have pairs remaining.
            echo_dominoPointer.pairIndex += 1; // Give them their next pair.
          }
          else if (echo_dominoPointer.pairIndex === maxPairIndex) { // They completed the pair. Time to move on! (next lap.)
            echo_dominoPointer.pairIndex = 0;
            /////////////////////////////////////////////////////////////////////////////////////
            // RESUME HERE! GIVE THEM THIR NEXT LAP, OR CHECK IF IT'S TIME TO MOVE ON (RESETTING LAP TO 0.)
          }
        }
        // if rep(0 index) + 1  === length, it's time to move on.
        // if rep(0 index) + 1 < length, it's not yet time to move on.
        // how to get repsEcho from the below? I guess it depends on whether it's names vs objects.
        // use currentScreen.namesOrObjects
        // these exist as global variables: HARD

        // inside a function, I have an object called currentScreen, where currentScreen.namesOrObjects either equals 'names' or 'objects'.
        // can I type [currentScreen.namesOrObjects].repsEcho to retrieve 2?

        ///////////////////////////////////////////////////////////////
        // Increment rep, and potentially all the other keys, before updateDominoResetKey makes use of the new values.
        // Things which updateScreen should increment (case echo):
        //       whichScreen: // whichScreen = 'Results';
        //       echo_dominoPointer
        //       //  namesOrObjects: null, //depends on counterbalanced
        //       //  listHalf: null, // depends on counterbalanced
        //       //  echoOrRecall: 'echo', // (2vs1 space logic depends on this, and whether the domino grabs 2 words or just 1.)
        //       //  lap: null,
        //       //  pairIndex: null, // for objects, increment in the 02413 order. // I like the 02413 order because you’re not consciously chaining anything until the last moment. It’s just a faith in the process kind of thing. // const scrambledPairIndex = (pairIndex < Math.ceil(dominoStackHeight / 2)) ? (pairIndex * 2) : ((pairIndex - Math.ceil(dominoStackHeight / 2)) * 2 + 1); // use the modulo operator to cycle the indices back when pairIndex exceeds half the height.
        //       //  rep: null,

        //       Save these for last, in case they're useful for subsetting.
        //       // time: {
        //       //   atFocus: null, // Store when the screen's active domino focused. // read by setCorrect
        //       //   atLastSubmission: null, // read by submitBad
        //       // },
        //       // whichFocus: { pairIndex: 0, leftOrRight: 'rightHalf' }, // read by setCorrect.recall
        //       // echoOrRecall: null, // for echo-specific incrementing pattern: increment pairIndex
        //       // namesOrObjects // needed by updateScreen while updating echo_dominoPointer
        //       // add another key here to indicate the counterbalanced order?
        //       // After incrementing: create new echo-domino-key, using all the updated values
        //       // After incrementing: read storyText & storyTime from presentables, using all the updated keys.
        //       // after incrementing, initialize targetPair (in the results) (as part of establishing the new domino)
        //       echoPointer
        //       // dominoResetKey: null, // set by updateDominoResetKey.echo()
        //       // storyText: null,
        //       // storyTime: null,
        //       // updateStoryAndTime: (listHalf, pairIndex) => set((draftState) => {
        //       //   draftState.testSlice.currentScreen.echoPointer.storyText = draftState.testSlice.presentables.targetPairs.objects[listHalf][pairIndex].storyText;
        //       //   draftState.testSlice.currentScreen.echoPointer.storyTime = draftState.testSlice.presentables.targetPairs.objects[listHalf][pairIndex].storyTime;
        //       // }, false, 'updateStoryAndTime'),// CALL WHENEVER THE DOMINOPAIR CHANGES, if it's an object-pair that's getting shown next. otherwise have storyText and storyTime be null

      // THEN, GO AHEAD AND COMPLETE THE ^^ INCREMENTER FOR ECHO. RECALL WILL BE QUICK, AFTER THAT, NOW THAT I'VE GOT THE PATTERN SORTED OUT.
      }
      // release the currentScreen message-attributes so they're ready for the next cycle
      currentScreen.correct = null;
      break;
  }
}

//////////////////////////
export default function createTestSlice(set) {
  return {

    // MOVE CURRENTSCREEN TO BE BELOW SUBMITBAD, ONCE DONE CREATING UPDATESCREEN()
    currentScreen: {
      // This section of currentScreen is a MESSAGE from setCorrect() or submitBad() to updateScreen(). Not listened to by any components. Either setCorrect/submitBad gives it a value; then updateScreen reads it and resets it to null.
      correct: null, // I should add a key at the top of the currentScreen object; it starts null, and then setCorrect changes it to ‘correct’, or submitBad sets it to ‘incorrect’, and then updateScreen changes it back to null.
      // This section of currentScreen is ONLY LISTENED TO BY setCorrect() and submitBad(). updateScreen resets it/increments it. Not listened to by any components.
      time: {
        atFocus: null, // Store when the screen's active domino focused. // read by setCorrect
        atLastSubmission: null, // read by submitBad
      },
      whichFocus: { pairIndex: 0, leftOrRight: 'rightHalf' }, // read by setCorrect.recall
      // this section of currentScreen is ONLY LISTENED TO BY updateScreen(), and is not reset to null each cycle. Incrementing is also done by updateScreen().
      attempt: null, // used by newDominoResetKey. = wrongSubmissions.length() (for the sake of the new key, the length should be calculated from draftState AFTER the next wrongSubmission is pushed.)
      echoOrRecall: null, // for echo-specific incrementing pattern: increment pairIndex
      namesOrObjects: null,
      //   // add another key here to indicate the counterbalanced order?
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      // This section is listened to by components. (One store-object per component; this prevents listening overlaps & side-effects.) Favor the components listening directly, rather than passing them props.
      // Each <component>Pointer contains pointers & display-state:
      // // // Pointers: subset `presentables` and `results`; (this clears out ugly array-sifting logic from the components). (Naming-rule: append "pointer" to a state-object's name whenever its purpose is to subset 'presentables' or 'results'.)
      // // // Display-state: (WOULD be feasible to calculate within the component, via pointers/presentables/results). HOWEVER, it's another opportunity to declutter/hide logic, just like the pointers allow.
      whichScreen: null, // stub. Currently I'm using the legacy currentScreenTest. // possible values: 'TestHasThreeUIs', 'EchoNames', 'EchoObjects', 'Recall'.
      echoPointer: { // listened to by the EchoNames component and the EchoObjects component
        // EchoNames and EchoObjects listens to a reset key, which resets both their Domino and timebar
        dominoResetKey: null, // set by updateDominoResetKey.echo()
        storyText: null,
        storyTime: null,
      },
      echo_dominoPointer: { // listened to by the Domino component (that renders inside an Echo component). // echo_DominoPointer subsets `presentables` & `results` & contains display state.
        // keys for subsetting:
        namesOrObjects: null,
        listHalf: null,
        lap: null, // also used by echo Domino components, as part of their reset-key.
        pairIndex: null, // I like the 02413 order because you’re not consciously chaining anything until the last moment. It’s just a faith in the process kind of thing. // const scrambledPairIndex = (pairIndex < Math.ceil(dominoStackHeight / 2)) ? (pairIndex * 2) : ((pairIndex - Math.ceil(dominoStackHeight / 2)) * 2 + 1); // use the modulo operator to cycle the indices back when pairIndex exceeds half the height.
        rep: null, // also used by echo Domino components, as part of their reset-key.
        // keys for display-type & submission-logic:
        echoOrRecall: 'echo', // (2vs1 space logic depends on this, and whether the domino grabs 2 words or just 1.) // the domino will also get passed an echo prop by its parent, so it knows to listen to the echo.dominoPointer object. But also have the echo key inside the echo.dominoPointer, so only dominoPointer gets passed into the domino, instead of also passing in an auxilliary prop object.
      },

      recallPointer: {
        // the Recall component (dominoStack) listens to a top-level reset key, and an objectful of domino-level reset keys.
        stackResetKey: null,
        dominoResetKeys: // Initialized to be dominoStackHeight long, and be made of objects with leftHalf & rightHalf
      Array.from(
        { length: (HARD.names.dominoHeight === HARD.objects.dominoHeight) ? HARD.names.dominoHeight : null }, // an array of length dominoHeightNames = 5. The ternary's just to check whether I'm still using = 5 for both names and objects
        // 2nd argument: a mapping function, to create the entries in the array. Here, each one's an object (with a leftHalf and rightHalf).
        () => Object.fromEntries( // expects an array of [key, value] pairs (which can be assembled into an object). Create that array using map.
          ['leftHalf', 'rightHalf'].map(key => [key, null]),
        )),
        dominoStackHeight: (HARD.names.dominoHeight === HARD.objects.dominoHeight) ? HARD.names.dominoHeight : null, // I'm currently assuming both lists have the same # of pairs, and that only one recallPointer is needed. (Or, I could have a setter, which is called by get() whenever objects changes to names)
      },

      recall_dominoPointers: // listened to by the Domino components (that render inside a Recall component). Contains 10 pointers-- one for each domino.
  Array.from(
    { length: (HARD.names.dominoHeight === HARD.objects.dominoHeight) ? HARD.names.dominoHeight : null }, // an array of length dominoHeightNames = 5. The ternary's just to check whether I'm still using = 5 for both names and objects
    (_, pairIndex) => // Make pairIndex available (for dynamic use, initializing each dominoPointer). // The mapping function's 1st argument is _, unutilized here. The 2nd argument is the index of the array, which you can name whatever you like (for instance, pairIndex).
      Object.fromEntries( // expects an array of [key, value] pairs (which can be assembled into an object). Create that array using map.
        ['leftHalf', 'rightHalf'].map(key => [key, { // map takes an array of keys, and returns an array of [key, value] arrays. The value (the actual dominoPointer structure) is the following object:
        // dominoPointer structure:
        // keys for subsetting:
          namesOrObjects: null,
          listHalf: null,
          lap: null, // used in the reset-key for the dominoStack.
          pairIndex, // dynamically assigned by Array.from()
          // keys for display-type & submission-logic:
          echoOrRecall: 'recall', // (2vs1 space logic depends on this, and whether the domino grabs 2 words or just 1.)
          leftOrRight: key, // dynamically assigned by map // (controls whether the grey text is shown, and whether they get unlimited tries.)
          focused: null, // Listened to by dominoes that know they're part of a dominoStack.
          reinforcementNeeded: null, // listened to by domino-pairs that know they're part of a dominoStack. // for IDK-button submissions or incorrect rightHalf followed by a correct rightHalf.
          rightHalfGrey: null, // (for when the rightHalf needs to show grey, and behave like a leftHalf, IF they've clicked the IDK button or correctly submitted the rightHalf following an incorrect submission of rightHalf.)
        }]),
      ),
  ),
    },
    //////////////////////////////
    results: { // initialize 4 quarter-results: (2 namesOrObjects x 2 listHalf)
      names: { one: createQuarterResults(HARD.names), two: createQuarterResults(HARD.names) },
      objects: { one: createQuarterResults(HARD.objects), two: createQuarterResults(HARD.objects) },
    },

    // Below are 3 setters, which act upon the above results datastructure.
    // Each setter contains two functions: an echo-version & a recall-version. Subset & call like so: submitBad[echoOrRecall](wrongEntry)

    setCorrect: { // to document a correct submission; this triggers the nextScreen setter
      echo: () => set((draftState) => {
        // get echo_dominoPointer, which we'll use to subset results, and then subset results
        const { namesOrObjects, listHalf, lap, pairIndex, rep } = draftState.testSlice.currentScreen.echo_dominoPointer;
        const thisRep = draftState.testSlice.results[namesOrObjects][listHalf].echo[lap][pairIndex][rep];
        // mutate results
        thisRep.completed = true;
        thisRep.repTime = Date.now() - draftState.currentScreen.time.atFocus; // Calculate elapsed time, from when this domino first focused to when it received this correct submission
        // mutate currentScreen (its non-pointers; just the top-level attributes read by updateScreen only)
        draftState.testSlice.currentScreen.correct = true;
        updateScreen(draftState); // a helper function that mutates currentScreen's component pointers, once setCorrect's done using their base state.
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
          pairTier.dominoPairTime = Date.now() - draftState.currentScreen.time.atFocus;
        }
        updateScreen(draftState); // a helper function that mutates currentScreen, once setCorrect's done using its base state.
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
          attemptTime: Date.now() - draftState.currentScreen.time.atLastSubmission,
        };
        thisRep.wrongSubmissions.push(wrongSubmission);
        updateScreen(draftState); // a helper function which mutates currentScreen, once submitBad's done using the base state.
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
          attemptTime: Date.now() - draftState.currentScreen.time.atLastSubmission,
        };
        // append wrongSubmission to the wrongSubmissions array (under leftOrRight)
        pairTier[leftOrRight].wrongSubmissions.push(wrongSubmission);
        // a setter which increments screenIndex, triggered by setCorrect. // (nextScreen also handles changing focus to next domino on same screen)
        updateScreen(draftState); // a helper function which mutates currentScreen, once submitBad's done using the base state.
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

    // we also need a counterBalanced object: an array of strings, dictating the order, say Names1 Names2 Objects1 Objects2. That lets the store be set up in the same order each time, and handles some conditional render type thing about what ([namesOrObjects][1vs2] gets passed to recall, echo_names, and echo_objects)?
  };
}
