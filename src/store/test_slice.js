// test_slice.js

// testSlice consists of 3 datastructures: presentables (for all screens), results (from all screens), and currentScreen (so the currently-rendered screen knows which part of presentables to draw from, and which part of results to write to).
// eventually I could make these 3 datastructures into 3 different slices, I bet. But no need. // results has a group of setters, beneath it. Maybe the other 2 datastructures will too.

// First though, here's a function for initializing the results datastructure. It creates an echo-results-object and a recall-results object, and gets called 4 times. First 2 times are both for names, and require the `names` parameter. Second 2 times are both for objects, and require the `objects` parameter.
const HARD = { // the function requires some hardcoded lengths
  names: { lapsEcho: 2, repsEcho: 2, lapsRecall: 3, dominoHeight: 5 }, // For createQuarterResults(names). also used by currentScreen and updateScreen()
  objects: { lapsEcho: 1, repsEcho: 1, lapsRecall: 3, dominoHeight: 5 }, // For createQuarterResults(objects). also used by currentScreen and updateScreen()
  nthParticipant: null };
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
          targetPair: { leftHalf: null, rightHalf: null }, // I’d be happy for each domino-pair to know it’s correct targetString… that’s a good safeguard, in case there’s confusion about how the list-order works.
        }))
      ))
    )),
    // results of the recall-test (for the 1st listHalf of names):
    recall: Array.from({ length: lapsRecall }, () => ( // an array of length lapsRecall = 3, because everyone gets 3 laps through the recall-test
      Array.from({ length: dominoHeight }, () => ({ // 1st lap: needs to be an array of length dominoHeightNames = 5. It holds 5 objects: one for each domino-pair.
        // Here's the object-shape for each domino pair:
        targetPair: { leftHalf: null, rightHalf: null }, // I’d be happy for each domino-pair in the dominoStack to know it’s correct targetString… that’s a good safeguard, in case there’s confusion about how the list-order works.
        dominoPairTime: null, // the whole domino pair shares a timebar, which isn't reset by wrongSubmissions to leftHalf or rightHalf. That's their incentive to get it right the first time. And if they have to hit IDK, they don't get any timebar area whatsoever. //// wrongSubmissions each have an attemptTime, which are included in the overall dominoPairTime.
        leftHalf: { completed: false, wrongSubmissions: [] }, // The wrongSubmissions array remains empty if they get it right first try. Each incorrect userEntry is added as another object in the array.
        //                                                    // each wrongSubmissions object has submissionType ('Spacebar' or 'Backspace'), userEntry (the array of character-objects that they typed), and attemptTime (Date.now() - draftState.testSlice.currentScreen.time.atLastSubmission) (since I want to see if the time they take on their FIRST entry predicts incorrectness)
        rightHalf: { completed: false, wrongSubmissions: [] }, // wrongSubmission (for the rightHalf) now allows multiple attempts, to detect unordered schemas (valid entry, wrong place).
        reinforcement: null, // If reinforcement is needed, this is initialized with {an object identical to its above 4 lines}. Reinforcement happens for the whole pair at once. a wrongSubmission on the right half would need to grab and append the left half of the targetString, since it's not actually known by that domino.
      }))
    )),
  };
}

// This non-set()-wrapped function mutates the incrementable keys in (draftState..echo_dominoPointer) or (draftState..recallPointer & draftState..recall_dominoPointers).
// It's called synchronously as the penultimate line of setCorrect (once the prior lines have slaked their need for currentScreen.<dominoPointer>'s unmodified base state). Synchronousness (making updateScreen a helper function within a setter, rather than in independent setter) matters since Zustand doesn't guarantee the order of execution for two setters called during the same render cycle of a React component.
// Afterwards, derivedKeys() is called (as the final line of setCorrect) to fill out the rest, based on the incremented keys. Since both are called by setCorrect we know the submission was correct; no need to worry about incrementing/resetting attempt. That's not even in the dominoPointer.
const incrementKeys = {
  // incrementKeys has 3 versions, each with a different increment-logic. (I created a separate version for each context; otherwise I'd have to intermix between-context if statements with within-context if statements, which I find confusing.)
  echo: { // The .echos only increment ..echo_dominoPointer
    names: (draftState) => { // In javascript, objects are passed by reference; that's how I'm certain that incrementKeys is mutating the setter's draftState, rather than an independent copy (while leaving the setter's draftState untouched (that's what the spread operator's for: creating a copy of the object.)). The setter's draftState is what needs to be mutated, so immer can polish the draft into a full-fledged new state, which can be passed to Zustand and committed/made unmutable.
      const echo_dominoPointer = draftState.testSlice.currentScreen.echo_dominoPointer; // similarly, currentScreen is an object, so the = passes a reference (rather than the object itself). So, mutating currentScreen affects the original object. (This would not work for primitives (e.g., a number, string, or boolean), since those are passed by value (creating an independent copy).)
      const ptr = echo_dominoPointer; // for brevity

      // increment (nestedly) rep, pairIndex, and lap
      if (ptr.rep++ < HARD.names.repsEcho) return; // this is called an "early return pattern", where () true triggers the return. The remaining lines are the else block.
      ptr.rep = 0; // say repsEcho is 2, and (0-indexed) ptr.rep is 0. They still need a second rep. So, increment (0-indexed) ptr.rep to 1, and the () evaluates true, and the early return executes. // now say ptr.rep, upon submission of the 1th (second) rep, gets incremented to 2. () evaluates false; no execution of the early return, and the next line executes, resetting ptr.rep.

      if (ptr.pairIndex++ < HARD.names.dominoHeight) return;
      ptr.pairIndex = 0;

      if (ptr.lap++ < HARD.names.lapsEcho) return;

      // they've completed all their reps, pairs, and laps (for this 8th of the test).

      // reset everything to null, including the derived keys. (probably unnecessary; it just gives InstructionsScreen a nice blank slate for initializing).
      ptr.lap = null;// null the incrementable keys in echo_dominoPointer
      ptr.pairIndex = null;
      ptr.rep = null;
      ptr.namesOrObjects = null; // null the InstructionsScreen-initialized keys in echo_dominoPointer
      ptr.listHalf = null;
      const echoPointer = draftState.testSlice.currentScreen.echoPointer; // null the derived keys in echoPointer
      echoPointer.dominoResetKey = null;
      echoPointer.storyText = null;
      echoPointer.storyTime = null;

      // increment counterbalanced.screenIndex, and use that to update whichScreen (with the name of the next React component to be conditionally rendered)
      const ctb = draftState.testSlice.currentScreen.counterbalanced;
      ctb.screenIndex++;
      draftState.testSlice.currentScreen.whichScreen = ctb.array[ctb.screenIndex];

      return 'complete'; // Indicates that echo_dominoPointer's keys (& the derived keys in echoPointer) were just set to null. (Don't try to set them like usual by calling derivedKeys.)
    },
    objects: (draftState) => { // incrementKeys.echo.objects uses scrambled order. (That's the only difference from incrementKeys.echo.names above.)
      const echo_dominoPointer = draftState.testSlice.currentScreen.echo_dominoPointer;
      const ptr = echo_dominoPointer;
      // nested incrementing: rep, pairIndex, lap.
      if (ptr.rep++ < HARD.objects.repsEcho) return;
      ptr.rep = 0;
      switch (ptr.pairIndex % 2) { // increment pairIndex in the 02413 order, just for echo.objects. // I like the 02413 order because you’re not consciously chaining anything until the last moment. It’s just a faith in the process kind of thing.
        case 0: // covers 0, 2, 4 ... // this switch statement can handle any dominoHeight, odd or even. For instance, dominoHeight = 6 produces 024135.
          if ((ptr.pairIndex += 2) < HARD.objects.dominoHeight) return;
          ptr.pairIndex = 1; // now we'll be running through the odd sequence.
          return; // otherwise lap++ below would execute; that's incorrect; we still have the 3 ... pairIndexes left.
        case 1: // covers 1, 3 ...
          if ((ptr.pairIndex += 2) < HARD.objects.dominoHeight) return;
          ptr.pairIndex = 0; // no break needed, since there are no further cases to fall-through onto
      }
      if (ptr.lap++ < HARD.names.lapsEcho) return;

      // reset everything to null; this 8th's complete
      ptr.lap = null;
      ptr.pairIndex = null;
      ptr.rep = null;
      ptr.namesOrObjects = null;
      ptr.listHalf = null;
      const echoPointer = draftState.testSlice.currentScreen.echoPointer;
      echoPointer.dominoResetKey = null;
      echoPointer.storyText = null;
      echoPointer.storyTime = null;
      // increment counterbalanced.screenIndex and update whichScreen
      const ctb = draftState.testSlice.currentScreen.counterbalanced;
      ctb.screenIndex++;
      draftState.testSlice.currentScreen.whichScreen = ctb.array[ctb.screenIndex];
      return 'complete';
    },
  },
  recall: (draftState) => { // .recall increments both ..whichFocus and ..recall_dominoPointers (they're complementary).
    // More specifically: whichFocus gets incremented, lap (for all recall_dominoPointers) can get incremented, and (if lap changes) recallPointer gets new reset keys (don't worry; no arguments are needed to build them).
    // OR if all laps are complete, currentScreen's time, whichFocus, and attempt are nulled; its counterbalanced & whichScreen are incremented; its recallPointer (comprised of reset keys) is nulled; and its recall_dominoPointers are nulled.

    const { whichFocus } = draftState.testSlice.currentScreen; // this is the stale whichFocus, in need of incrementation
    const oldDominosLap = draftState.testSlice.currentScreen.recall_dominoPointers[whichFocus.pairIndex][whichFocus.leftOrRight].lap; // to see if lap needs incrementation

    // increment leftOrRight
    if (whichFocus.leftOrRight === 'leftHalf') {
      whichFocus.leftOrRight = 'rightHalf';
    }
    else if (whichFocus.leftOrRight === 'rightHalf') {
      whichFocus.leftOrRight = 'leftHalf';

      // increment pairIndex
      if (whichFocus.pairIndex + 1 < ((HARD.names.dominoHeight === HARD.objects.dominoHeight) ? HARD.names.dominoHeight : null)) {
        whichFocus.pairIndex++;
      }
      else if (whichFocus.pairIndex + 1 >= ((HARD.names.dominoHeight === HARD.objects.dominoHeight) ? HARD.names.dominoHeight : null)) {
        whichFocus.pairIndex = 0;

        // increment lap, or if they're all out of laps, move on to the next instructions screen.
        if (oldDominosLap + 1 < ((HARD.names.lapsRecall === HARD.objects.lapsRecall) ? HARD.names.lapsRecall : null)) { // A NEW LAP IS BEGUN. increment lap for all recall_dominoPointers, reset all recallPointer.dominoResetKeys, and increment recallPointer.stackResetKey
        // Increment lap in all the recall_dominoPointers (they need it for their submission-logic)
          const { recall_dominoPointers } = draftState.testSlice.currentScreen;
          recall_dominoPointers.forEach(pairIndex => { // .forEach operates upon arrays
            ['leftHalf', 'rightHalf'].forEach(leftOrRight => {
              recall_dominoPointers[pairIndex][leftOrRight].lap++;
            });
          });

          // Reset all recallPointer.dominoResetKeys; they don't contain lap, so they have to restart at attempt 0 for each lap.
          const { dominoResetKeys } = draftState.testSlice.currentScreen.recallPointer;
          dominoResetKeys.forEach(pairIndex => {
            ['leftHalf', 'rightHalf'].forEach(leftOrRight => {
              dominoResetKeys[pairIndex][leftOrRight] = `leftOrRight:${leftOrRight}-attempt:0-thisPairNeedsReinforcement:false`;
            });
          });

          // Increment recallPointer.stackResetKey
          draftState.testSlice.currentScreen.recallPointer.stackResetKey++; // it's an integer. Always has same value as lap. Initialized to 0 for each 8th of the test.
        }
        else if (oldDominosLap + 1 >= ((HARD.names.lapsRecall === HARD.objects.lapsRecall) ? HARD.names.lapsRecall : null)) { // ALL LAPS ARE COMPLETE. // currentScreen's time, whichFocus, and attempt are nulled; its counterbalanced & whichScreen are incremented; its recallPointer (comprised of reset keys) is nulled; and its recall_dominoPointers are nulled.
        // Null the time keys; InstructionsScreen reinitializes them.
          draftState.testSlice.currentScreen.time.atPairFocus = null;
          draftState.testSlice.currentScreen.time.atLastSubmission = null;

          // Null the (incrementable) whichFocus keys; InstructionsScreen reinitializes them.
          draftState.testSlice.currentScreen.whichFocus.pairIndex = null;
          draftState.testSlice.currentScreen.whichFocus.leftOrRight = null;

          // Null the attempt key; InstructionsScreen reinitializes it.
          draftState.testSlice.currentScreen.attempt = null;

          // increment counterbalanced.screenIndex and update whichScreen
          const ctb = draftState.testSlice.currentScreen.counterbalanced;
          ctb.screenIndex++;
          draftState.testSlice.currentScreen.whichScreen = ctb.array[ctb.screenIndex];

          // Null the reset keys. All are reinitialized by InstructionsScreen.
          const { recallPointer } = draftState.testSlice.currentScreen;
          draftState.testSlice.currentScreen.recallPointer.stackResetKey = null;
          recallPointer.dominoResetKeys.forEach(pairIndex => {
            ['leftHalf', 'rightHalf'].forEach(leftOrRight => {
              recallPointer.dominoResetKeys[pairIndex][leftOrRight] = null;
            });
          });

          // Null lap, listHalf, namesOrObjects, focused, and thisPairNeedsReinforcement in all the recall_dominoPointers. Lap is the incrementable one; all 5 are initialized by InstructionsScreen.
          const { recall_dominoPointers } = draftState.testSlice.currentScreen;
          recall_dominoPointers.forEach(pairIndex => { // .forEach operates upon arrays
            ['leftHalf', 'rightHalf'].forEach(leftOrRight => {
              recall_dominoPointers[pairIndex][leftOrRight].lap = null;
              recall_dominoPointers[pairIndex][leftOrRight].listHalf = null;
              recall_dominoPointers[pairIndex][leftOrRight].namesOrObjects = null;
              recall_dominoPointers[pairIndex][leftOrRight].focused = null;
              recall_dominoPointers[pairIndex][leftOrRight].thisPairNeedsReinforcement = null;
            });
          });

          return 'complete';
        };
      }
    }
  },
};

const derivedKeys = { // update all keys, in the order they occur in currentScreen
  echo: ({ init }, draftState) => { // two versions: First version (init) is called by InstructionsScreen. Second is called in setCorrect, to prepare the next domino.
    // get refs to all the currentScreen objects we'll be updating
    const { time, whichFocus, echoPointer, echo_dominoPointer } = draftState.testSlice.currentScreen;

    // initialize time, for this domino
    time.atLastSubmission = Date.now();
    time.atPairFocus = Date.now();

    // whichFocus is not used by echo; initialize it to null
    whichFocus.pairIndex = null;
    whichFocus.leftOrRight = null;
    // attempt was already reset to 0
    // counterbalanced & whichScreen do not need incrementing

    // echo_dominoPointer
    if (init) {
      const { namesOrObjects, listHalf } = draftState.testSlice.currentScreen.counterbalanced;
      echo_dominoPointer.namesOrObjects = namesOrObjects;
      echo_dominoPointer.listHalf = listHalf;
      echo_dominoPointer.lap = 0;
      echo_dominoPointer.pairIndex = 0;
      echo_dominoPointer.rep = 0;
    };
    // echo_dominoPointer, !init: the incrementable keys were already incremented, by incrementKeys.echo. Actually, they're ALL just incrementable keys, and are already handled.
    // // namesOrObjects: null, // initialized by InstructionsScreen
    // // listHalf: null, // initialized by InstructionsScreen
    // // lap: null, same
    // // pairIndex: null, same
    // // rep: null, same

    // now get their updated versions (to use in the echoPointer.dominoResetKey and for subsetting)
    const { namesOrObjects, listHalf, lap, pairIndex, rep } = echo_dominoPointer;

    // echoPointer
    echoPointer.dominoResetKey = `lap:${lap}-pairIndex:${pairIndex}-rep:${rep}-attempt:0`; // Just reset for lap, pairIndex, rep, attempt. // It's nulled after each 8th of the test, so no need to worry about namesOrObjects, listHalf, or echoOrRecall.
    // echoPointer: get storyText and storyTime, to put in echoPointer. For names, these are undefined, and undefined is assigned as the value for echoPointer.storyText & .storyTime.
    const targetPair = draftState.testSlice.presentables.targetPairs[namesOrObjects][listHalf][pairIndex]; // the correct answer, from presentables
    echoPointer.storyText = targetPair.storyText;
    echoPointer.storyTime = targetPair.storyTime;

    // results
    // Go put the correct answer (from above step) in resultsPair.
    const resultsPair = draftState.testSlice.results[namesOrObjects][listHalf].echo[lap][pairIndex][rep]; // the submission location, in results
    resultsPair.targetPair.leftHalf = targetPair.leftHalf;
    resultsPair.targetPair.rightHalf = targetPair.rightHalf;
  },
  recall: ( // update all keys, in the order they occur in currentScreen
    { init, IDK }, // 3 versions: First version (init) is called by InstructionsScreen. Second and third versions (IDK and correct (the default; empty object)) are called in setCorrect, to prepare the next domino.
    draftState, // draftState.testSlice.currentScreen is what they all operate upon.
    whichFocus, // whichFocus has been incremented (or initialized) already; it's for the new domino.
  ) => {
    // get refs to all the currentScreen objects we'll be updating
    const { time, recallPointer, recall_dominoPointers } = draftState.testSlice.currentScreen;

    // initialize time, for this domino
    time.atLastSubmission = Date.now();
    if (whichFocus.leftOrRight === 'leftHalf') {
      time.atPairFocus = Date.now(); // time.atPairFocus only gets initialized by a leftHalf domino. (also handles IDK case; whenever IDK is clicked, the new domino is ALWAYS the leftHalf of the pair)
    }

    // whichFocus has already been updated
    // attempt was already reset to 0
    // counterbalanced & whichScreen do not need incrementing
    // recallPointer's reset keys have already been incremented (for IDK and correct)
    // // (for init, initialize all of recallPointer's reset keys:)
    if (init) {
      recallPointer.stackResetKey = 0; // it's an integer. Always has same value as lap. Initialized to 0 for each 8th of the test.
      recallPointer.dominoResetKeys.forEach(pairIndex => {
        ['leftHalf', 'rightHalf'].forEach(leftOrRight => {
          recallPointer.dominoResetKeys[pairIndex][leftOrRight] = `leftOrRight:${leftOrRight}-attempt:0-thisPairNeedsReinforcement:false`; // they don't contain lap, so they have to restart at attempt 0 for each lap.
        });
      });
    };

    // recall_dominoPointers
    if (init) {
      recall_dominoPointers.forEach(pairIndex => {
        ['leftHalf', 'rightHalf'].forEach(leftOrRight => {
          const { namesOrObjects, listHalf } = draftState.testSlice.currentScreen.counterbalanced;
          const ptr = recall_dominoPointers[pairIndex][leftOrRight];
          ptr.namesOrObjects = namesOrObjects;
          ptr.listHalf = listHalf;
          ptr.lap = 0;
          ptr.focused = false;
          ptr.thisPairNeedsReinforcement = false;
        });
      });
    };
    // recall_dominoPointers: subset the new one, using the new whichFocus
    const newDomino = recall_dominoPointers[whichFocus.pairIndex][whichFocus.leftOrRight];
    // namesOrObjects: // initialized by InstructionsScreen
    // listHalf: // initialized by InstructionsScreen
    // lap: // handled by IncrementKeys
    // pairIndex, // dynamically assigned by Array.from()
    // leftOrRight: key, // dynamically assigned by map
    newDomino.focused = true;
    // thisPairNeedsReinforcement: changed to false, for that domino in the pair, upon a correct (nonIDK) submission. For an IDK submission (rightHalf), incrementKeys sets it true in the old domino (the rightHalf), and derivedKeys sets it true in the new domino (the leftHalf).
    if (IDK) {
      newDomino.thisPairNeedsReinforcement = true;
    };

    // currentScreen's done.
    if (!init) {
      const targetPair = draftState.testSlice.presentables.targetPairs[newDomino.namesOrObjects][newDomino.listHalf][newDomino.pairIndex]; // the correct answer, from presentables
      const resultsPair = draftState.testSlice.results[newDomino.namesOrObjects][newDomino.listHalf].recall[newDomino.lap][newDomino.pairIndex]; // the submission location, in results

      if (IDK) { // Initialize the deeper results structure that this leftHalf and its rightHalf will submit to. (There was just an IDK click in rightHalf, which means it's the perfect time to initialize the deeper results structure.)
        resultsPair.reinforcement = {
          targetPair, // the correct answer, just to have it conveniently on hand // (for objects, the targetPair also contains storyTime and storyText.)
          dominoPairTime: null,
          leftHalf: { completed: false, wrongSubmissions: [] },
          rightHalf: { completed: false, wrongSubmissions: [] },
        };
      }
      else { // !init && !IDK means it's the default case, for correct submissions.
        // Go put the correct anwer in resultsPair (top tier, not reinforcement tier). It's a new domino, which has no need for a reinforcement tier, yet.
        resultsPair.targetPair[newDomino.leftOrRight] = targetPair[newDomino.leftOrRight];
      }
    }
  },
};

export default function createTestSlice(set) {
  return {
    // MOVE CURRENTSCREEN TO BE BELOW SUBMITBAD, ONCE DONE CREATING UPDATESCREEN()

    ////////////////////////////////////////////////////////////////////////////////
    // OH AND I NEED TO HANDLE INSTRUCTIONSSCREEN INITIALIZING THE nulled keys (with help from derivedKeys :). Check muse.
    currentScreen: {
      // This section of currentScreen is ONLY LISTENED TO BY setCorrect() and submitBad(). incrementKeys.recall resets/increments whichFocus, and derivedKeys resets time. Not listened to by any components.
      time: {
        atPairFocus: null, // Store when the screen's active domino focused. // read by setCorrect
        atLastSubmission: null, // read by submitBad
      },
      whichFocus: { pairIndex: null, leftOrRight: null }, // read by setCorrect.recall. // eg { pairIndex: 0, leftOrRight: 'rightHalf' }
      // This section of currentScreen is ONLY LISTENED TO BY newDominoResetKey. // incremented at end of submitBad, before it calls newDominoResetKey; reset at end of setCorrect, before it calls incrementKeys, then derivedKeys, then newDominoResetKey.
      attempt: null,
      // this section of currentScreen is ONLY LISTENED TO BY InstructionsScreen (and derivedKeys or newDominoResetKey?) (probably it should get relabeled as a pointer.). incrementKeys advances screenIndex (and updates whichScreen) in the event of completing an 8th of the test, but should not re-null anything. InstructionsScreen wants to know what just got completed, before updating them (upon click of nextScreen button).
      counterbalanced: {
        // these three keys are incremented by incrementKeys, to indicate the current eighth of the test. DON'T null them upon completing each 8th; InstructionsScreen needs them, to know the prior 8th.
        namesOrObjects: null,
        listHalf: null,
        echoOrRecall: null,
        // this array contains the counterbalanced order (of screens) for this participant. Eg names1 names2 objects1 objects2.
        screenIndex: null, // increments along the array. The value is sent to whichScreen.
        array: ((nthParticipant) => {
          // Each quarter of the test gets 4 screens: Instructions, Echo, Instructions, and Recall.
          const names1 = ['SpecificInstructions', 'EchoNames', 'SpecificInstructions', 'Recall'];
          const names2 = ['SpecificInstructions', 'EchoNames', 'SpecificInstructions', 'Recall'];
          const objects1 = ['SpecificInstructions', 'EchoObjects', 'SpecificInstructions', 'Recall'];
          const objects2 = ['SpecificInstructions', 'EchoObjects', 'SpecificInstructions', 'Recall'];
          // allocate 4 counterbalanced orders equally between participants. Cycle through 4 orders.
          let order = [];
          switch (nthParticipant % 4) {
            case 0:
              order = [names1, names2, objects1, objects2];
              break;
            case 1:
              order = [names2, names1, objects2, objects1];
              break;
            case 2:
              order = [objects1, objects2, names1, names2];
              break;
            case 3:
              order = [objects2, objects1, names2, names1];
              break;
          };
          return ['GeneralInstructions', ...order.flat()]; // .flat() merges nested arrays into a single-level array, and the spread operator unpacks it into its individual components.
        })(HARD.nthParticipant), // an Immediately Invoked Function Expression. Wrap an arrow function in parentheses, and pass it an argument in parentheses. (()=>{})() runs once and that's it. Great for initializing.

      },
      // This section of currentScreen is listened to by components. (One store-object per component; this prevents listening overlaps & side-effects.) Favor the components listening directly, rather than passing them props.
      // Each <component>Pointer contains pointers & display-state:
      // // // Pointers: subset `presentables` and `results`; (this clears out ugly array-sifting logic from the components). (Naming-rule: append "pointer" to a state-object's name whenever its purpose is to subset 'presentables' or 'results'.)
      // // // Display-state: (WOULD be feasible to calculate within the component, via pointers/presentables/results). HOWEVER, it's another opportunity to declutter/hide logic, just like the pointers allow.
      whichScreen: null, // stub. Currently I'm using the legacy currentScreenTest. // possible values: 'TestHasThreeUIs', 'EchoNames', 'EchoObjects', 'Recall'.
      echoPointer: { // listened to by the EchoNames component and the EchoObjects component
        // EchoNames and EchoObjects listens to a reset key, which resets both their Domino and timebar
        dominoResetKey: null,
        storyText: null,
        storyTime: null,
      },
      echo_dominoPointer: { // listened to by the Domino component (that renders inside an Echo component). // echo_DominoPointer subsets `presentables` & `results` & contains display state.
        // keys for subsetting (and for reset key)
        namesOrObjects: null,
        listHalf: null,
        lap: null,
        pairIndex: null, // I like the 02413 order because you’re not consciously chaining anything until the last moment. It’s just a faith in the process kind of thing. // const scrambledPairIndex = (pairIndex < Math.ceil(dominoStackHeight / 2)) ? (pairIndex * 2) : ((pairIndex - Math.ceil(dominoStackHeight / 2)) * 2 + 1); // use the modulo operator to cycle the indices back when pairIndex exceeds half the height.
        rep: null,
        // keys for display-type & submission-logic:
        echoOrRecall: 'echo', // (2vs1 space logic depends on this, and whether the domino grabs 2 words or just 1.) // the domino will also get passed an echo prop by its parent, so it knows to listen to the echo.dominoPointer object. But also have the echo key inside the echo.dominoPointer, so only dominoPointer gets passed into the domino, instead of also passing in an auxilliary prop object.
      },
      recallPointer: {
        // the Recall component (dominoStack) listens to a top-level reset key, and an objectful of domino-level reset keys.
        stackResetKey: null, // stackResetKey is an integer, and coincidentally always has the same value as lap. Nulled upon completion of 1/8th the test. Reinitialized to 0 by InstructionsScreen in preparation for next 1/8th.
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
              // keys for subsetting (and for reset key):
              namesOrObjects: null,
              listHalf: null,
              lap: null,
              pairIndex, // dynamically assigned by Array.from()
              leftOrRight: key, // dynamically assigned by map // (also controls display: whether the grey text is shown, and submission-logic (IDK button).)
              // keys for display-type & submission-logic:
              echoOrRecall: 'recall', // (2vs1 space logic depends on this, and whether the domino grabs 2 words or just 1.)
              focused: null, // Listened to by dominoes that know they're part of a dominoStack.
              thisPairNeedsReinforcement: null, // listened to by domino-pairs that know they're part of a dominoStack. // is set to true following an IDK-button submission. Initialize it as false. // decides whether to show grey remainderString & red highlights for rightHalf = true dominoes. // is NOT used to decide submission location, actually. // IS part of the reset key.
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

    setCorrect: { // to document a correct submission; this triggers attempt-reset, incrementKeys, & derivedKeys.
      echo: () => set((draftState) => {
        // get echo_dominoPointer, which we'll use to subset results, and then subset results
        const { namesOrObjects, listHalf, lap, pairIndex, rep } = draftState.testSlice.currentScreen.echo_dominoPointer;
        const thisRep = draftState.testSlice.results[namesOrObjects][listHalf].echo[lap][pairIndex][rep];
        // submit
        thisRep.completed = true;
        thisRep.repTime = Date.now() - draftState.testSlice.currentScreen.time.atPairFocus; // Calculate elapsed time, from when this domino first focused to when it received this correct submission
        // Reset attempt (for an impending newDominoResetKey). Their attempt was correct, and we'll be moving them on to their next rep (or pairIndex & rep). (or, moving on to the leftHalf of a reinforcement rep for this pair.)
        draftState.testSlice.currentScreen.attempt = 0;
        // increment rep, pairIndex, and lap (until this 8th of the test is finished)
        const returned = incrementKeys.echo[namesOrObjects](draftState); // a 3-version helper function
        if (returned !== 'complete') { // When this 8th of the test is 'complete', don't try to call derivedKeys. (incrementKeys just set to null all the incrementable and derivable keys. (in echo_dominoPointer and echoPointer). Don't try to call derivedKeys.)
          derivedKeys.echo(draftState);
        };
      }, false, 'setCorrect.echo'),
      // REFACTORED VERSION (WHICH HANDLES BOTH CORRECT & IDK)
      recall: (IDK) => set((draftState) => {
        // get the currently focused domino, which we'll use to subset recall_dominoPointers
        const { pairIndex, leftOrRight } = draftState.testSlice.currentScreen.whichFocus;
        // get recall_dominoPointers, which we'll use to subset results, and then subset results
        const { namesOrObjects, listHalf, lap } = draftState.testSlice.currentScreen.recall_dominoPointers[pairIndex][leftOrRight];
        const thisPair = draftState.testSlice.results[namesOrObjects][listHalf].recall[lap][pairIndex];
        // if this is a reinforcement rep (i.e. IDK was hit last time), then thisPair.reinforcement will have been initialized by an empty object (and thus will be truthy) (before the user could possibly try to submit anything.)
        const pairTier = thisPair.reinforcement || thisPair;

        // submit completed
        pairTier[leftOrRight].completed = true; // both IDK & correct are capable of setting outer tier's completed = true. Following IDK, correct (the only option) sets the inner tier's completed = true.
        // submit dominoPairTime, if the PAIR is complete (so, only for rightHalf dominoes). Both IDK & correct are capable of submitting dominoPairTime for the pair. Following IDK, correct (the only option) submits a dominoPairTime for the inner tier (for the pair).
        if (leftOrRight === 'rightHalf') {
          pairTier.dominoPairTime = Date.now() - draftState.testSlice.currentScreen.time.atPairFocus; // from when this domino first focused to when it received this correct submission. (a reinforcement correct submission will have a longer elapsed time than the initial correct submission)
        }
        // Reset attempt (for an impending newDominoResetKey). Their attempt was correct, and we'll be moving them on to their next leftOrRight. (or, moving on to the leftHalf of a reinforcement rep for this pair.)
        draftState.testSlice.currentScreen.attempt = 0;

        if (IDK) {
          // "increment" & "derivedKeys" functionality, for IDK
          // (now the recall dominoes have an IDK button, clickable when rightHalf and pairIndex are true and thisPairNeedsReinforcement is false. onClick triggers setCorrect, with an IDK argument.)
          // Only give them a reinforcement rep if they click the IDK button. Don't give them a reinforcement rep if they type it wrong but then do type it correctly all by themselves. (This makes it easier to score; Currently a reinforcement = null structure in the results means they got it correct all by themselves; IDK button initializes it and makes it non null. Giving them reinforcement rep after typing it correctly should be scored correct, but would unnull it.)
          // Reinforcement reps are for the whole pair. You want to reinforce it as a pair. (for if test is extended to include reseg)

          const whichFocus = draftState.testSlice.currentScreen.whichFocus;
          const oldDomino = draftState.testSlice.currentScreen.recall_dominoPointers[whichFocus.pairIndex][whichFocus.leftOrRight];
          // before incrementing whichFocus, set oldDomino.focused to false & oldDomino.thisPairNeedsReinforcement to true. (Once whichFocus is incremented, oldDomino still references the old recall_dominoPointer, but I think it's nice to have oldDomino conceptually over & done with; no more sightings. If the next segment were functions, oldDomino's not an argument.)
          oldDomino.focused = false;
          oldDomino.thisPairNeedsReinforcement = true; // upon a correct submission, it should be changed to false upon leaving that domino. BUT FOR IDK, it gets set true (and for the leftHalf of the pair, the newDomino, too.)

          // 'INCREMENTKEYS' functionality, for IDK
          whichFocus.leftOrRight = 'leftHalf'; // IDK button is only clickable when whichFocus.leftOrRight === 'rightHalf'. So, change it to 'leftHalf'.
          const { dominoResetKeys } = draftState.testSlice.currentScreen.recallPointer; // Reset the recallPointer.dominoResetKeys, for both the old and new domino; (both of them in the pair). (Note: `thisPairNeedsReinforcement:true` is hardcoded, so there are no dependencies on whether the recall_dominoPointer is ready yet.)
          ['leftHalf', 'rightHalf'].forEach((leftOrRight) => {
            dominoResetKeys[oldDomino.pairIndex][leftOrRight] = `leftOrRight:${leftOrRight}-attempt:0-thisPairNeedsReinforcement:true`; // this could also use the whichFocus.pairIndex, since that wasn't changed by "incrementing"
          }); // END OF INCREMENTKEYS FUNCTIONALITY

          derivedKeys.recall({ IDK }, draftState, whichFocus); // whichFocus requires the incremented whichFocus (the one for the new domino).
        }
        else if (!IDK) { // handles correct submissions, not IDK button-clicks
          const whichFocus = draftState.testSlice.currentScreen.whichFocus;
          const oldDomino = draftState.testSlice.currentScreen.recall_dominoPointers[whichFocus.pairIndex][whichFocus.leftOrRight];

          // before incrementing whichFocus, set oldDomino.focused & oldDomino.thisPairNeedsReinforcement to false. (Once whichFocus is incremented, oldDomino still references the old recall_dominoPointer, but I think it's nice to have oldDomino conceptually over & done with; no more sightings. If the next segment were functions, oldDomino's not an argument.)
          oldDomino.focused = false;
          oldDomino.thisPairNeedsReinforcement = false; // upon a correct submission, it should be changed to false upon leaving that domino. BUT FOR IDK, it gets set true.

          // then whichFocus can get incremented, lap (for all recall_dominoPointers) can get incremented, and (if lap changes) recallPointer gets new reset keys (don't worry; no arguments are needed to build them).
          // OR if all laps are complete, currentScreen's time, whichFocus, and attempt are nulled; its counterbalanced & whichScreen are incremented; its recallPointer (comprised of reset keys) is nulled; and its recall_dominoPointers are nulled.
          const returned = incrementKeys.recall(draftState);

          if (returned !== 'complete') { // When this 8th of the test is 'complete', don't try to call derivedKeys. (incrementKeys just set to null all the incrementable and derivable keys. (in echo_dominoPointer and echoPointer). derivedKeys would try to unNull them, but wouldn't have the resources to.)
            derivedKeys.recall({ }, draftState, whichFocus); // an empty {} means this is not init and not IDK. whichFocus requires the incremented whichFocus (the one for the new domino).
          };
        };
      }, false, 'setCorrect.recall'),
    },
    submitBad: {
      echo: ({ submissionType, userEntry }) => set((draftState) => { // submissionType: a string. 'Backspace' or 'Spacebar'. userEntry: an array of character-objects.
        // get echo_dominoPointer, which we'll use to subset results, and then subset results
        const { namesOrObjects, listHalf, lap, pairIndex, rep } = draftState.testSlice.currentScreen.echo_dominoPointer; // These keys are primitives, not objects; that's to indicate I won't be mutating them in draftState.
        const thisRep = draftState.testSlice.results[namesOrObjects][listHalf].echo[lap][pairIndex][rep];
        // update results. First, modify the wrongSubmission parameter-object to include an attemptTime. Then, append wrongSubmission to the wrongSubmissions array.
        const wrongSubmission = {
          submissionType, // submissionType: (space or backspace)
          userEntry, // the array of character-objects that they typed
          attemptTime: Date.now() - draftState.testSlice.currentScreen.time.atLastSubmission,
        };
        thisRep.wrongSubmissions.push(wrongSubmission); // append wrongSubmission to the wrongSubmissions array

        // "incrementKeys & derivedKeys" stuff, to prep the domino for their next attempt
        const { currentScreen } = draftState.testSlice;
        currentScreen.time.atLastSubmission = Date.now(); // reset time
        currentScreen.attempt += 1; // Their attempt was incorrect; don't move them on to their next rep
        // update resetKey, to clear the domino using the incremented attempt.
        currentScreen.echoPointer.dominoResetKey = `lap:${lap}-pairIndex:${pairIndex}-rep:${rep}-attempt:${currentScreen.attempt}`; // Just reset for lap, pairIndex, rep, attempt. // It's nulled after each 8th of the test, so no need to worry about namesOrObjects, listHalf, or echoOrRecall.
      }, false, 'submitBad.echo'),
      recall: ({ submissionType, userEntry }) => set((draftState) => { // submissionType: a string. 'Backspace' or 'Spacebar'. userEntry: an array of character-objects.
        // get the currently focused domino, which we'll use to subset recall_dominoPointers
        const { pairIndex, leftOrRight } = draftState.testSlice.currentScreen.whichFocus; // These keys are primitives, not objects; that's to indicate I won't be mutating them in draftState.
        const { namesOrObjects, listHalf, lap, thisPairNeedsReinforcement } = draftState.testSlice.currentScreen.recall_dominoPointers[pairIndex][leftOrRight];
        // subset results, using some of the above keys
        const resultsPair = draftState.testSlice.results[namesOrObjects][listHalf].recall[lap][pairIndex];
        const pairTier = resultsPair.reinforcement || resultsPair;// if this is a reinforcement rep, then resultsPair.reinforcement will have been initialized by an empty object (and thus will be truthy) (before the user could possibly try to submit anything.)
        // update results. First, modify the wrongSubmission parameter-object to include an attemptTime.
        const wrongSubmission = {
          submissionType, // submissionType: (space or backspace; IDK is now handled by setCorrect.recall)
          userEntry, // the array of character-objects that they typed
          attemptTime: Date.now() - draftState.testSlice.currentScreen.time.atLastSubmission,
        };
        pairTier[leftOrRight].wrongSubmissions.push(wrongSubmission); // append wrongSubmission to the wrongSubmissions array (under leftOrRight)

        // "incrementKeys & derivedKeys" stuff, to prep the domino for their next attempt
        const { currentScreen } = draftState.testSlice;
        currentScreen.time.atLastSubmission = Date.now(); // reset time
        currentScreen.attempt += 1; // Their attempt was incorrect; don't move them on to their next rep or pairIndex. (just increment attempt; don't increment the recall_dominoPointers or whichFocus.)
        // update resetKey, to clear the domino using the incremented attempt.
        currentScreen.recallPointer.dominoResetKeys[pairIndex][leftOrRight] = `leftOrRight:${leftOrRight}-attempt:${currentScreen.attempt}-thisPairNeedsReinforcement:${thisPairNeedsReinforcement}`;
      }, false, 'submitBad.recall'),
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
