// test_logic.js
// contains HARD, incrementKeys, and derivedKeys

export const HARD = { // the function requires some hardcoded lengths
  names: { lapsEcho: 2, repsEcho: 2, lapsRecall: 3, dominoHeight: 5 }, // For createQuarterResults(names). also used by currentScreen and updateScreen()
  objects: { lapsEcho: 1, repsEcho: 1, lapsRecall: 3, dominoHeight: 7 }, // For createQuarterResults(objects). also used by currentScreen and updateScreen()
  nthParticipant: 0 };

// This non-set()-wrapped function mutates the incrementable keys in (draftState..echo_dominoPointer) or (draftState..recallPointer & draftState..recall_dominoPointers).
// It's called synchronously as the penultimate line of setCorrect (once the prior lines have slaked their need for currentScreen.<dominoPointer>'s unmodified base state). Synchronousness (making updateScreen a helper function within a setter, rather than in independent setter) matters since Zustand doesn't guarantee the order of execution for two setters called during the same render cycle of a React component.
// Afterwards, derivedKeys() is called (as the final line of setCorrect) to fill out the rest, based on the incremented keys. Since both are called by setCorrect we know the submission was correct; no need to worry about incrementing/resetting attempt. That's not even in the dominoPointer.
export const incrementKeys = {
  // incrementKeys has 3 versions, each with a different increment-logic. (I created a separate version for each context; otherwise I'd have to intermix between-context if statements with within-context if statements, which I find confusing.)
  echo: { // The .echos only increment ..echo_dominoPointer
    names: (draftState) => { // In javascript, objects are passed by reference; that's how I'm certain that incrementKeys is mutating the setter's draftState, rather than an independent copy (while leaving the setter's draftState untouched (that's what the spread operator's for: creating a copy of the object.)). The setter's draftState is what needs to be mutated, so immer can polish the draft into a full-fledged new state, which can be passed to Zustand and committed/made unmutable.
      const echo_dominoPointer = draftState.testSlice.currentScreen.echo_dominoPointer; // similarly, currentScreen is an object, so the = passes a reference (rather than the object itself). So, mutating currentScreen affects the original object. (This would not work for primitives (e.g., a number, string, or boolean), since those are passed by value (creating an independent copy).)
      const ptr = echo_dominoPointer; // for brevity

      // increment (nestedly) rep, pairIndex, and lap
      if (++ptr.rep < HARD.names.repsEcho) return; // this is called an "early return pattern", where () true triggers the return. The remaining lines are the else block.
      ptr.rep = 0; // say repsEcho is 2, and (0-indexed) ptr.rep is 0. They still need a second rep. So, increment (0-indexed) ptr.rep to 1, and the () evaluates true, and the early return executes. // now say ptr.rep, upon submission of the 1th (second) rep, gets incremented to 2. () evaluates false; no execution of the early return, and the next line executes, resetting ptr.rep.

      if (++ptr.pairIndex < HARD.names.dominoHeight) return;
      ptr.pairIndex = 0;

      if (++ptr.lap < HARD.names.lapsEcho) return;

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
      draftState.testSlice.currentScreen.whichScreen = ctb.screenArray[ctb.screenIndex];

      return 'complete'; // Indicates that echo_dominoPointer's keys (& the derived keys in echoPointer) were just set to null. (Don't try to set them like usual by calling derivedKeys.)
    },
    objects: (draftState) => { // incrementKeys.echo.objects uses scrambled order. (That's the only difference from incrementKeys.echo.names above.)
      const echo_dominoPointer = draftState.testSlice.currentScreen.echo_dominoPointer;
      const ptr = echo_dominoPointer;
      // nested incrementing: rep, pairIndex, lap.
      if (++ptr.rep < HARD.objects.repsEcho) return;
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
      if (++ptr.lap < HARD.names.lapsEcho) return;

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
      draftState.testSlice.currentScreen.whichScreen = ctb.screenArray[ctb.screenIndex];
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
      if (whichFocus.pairIndex + 1 < ((HARD.names.dominoHeight === HARD.objects.dominoHeight) ? HARD.names.dominoHeight : (console.error('HARD.names & HARD.objects are different heights'), 0))) {
        whichFocus.pairIndex++;
      }
      else if (whichFocus.pairIndex + 1 >= ((HARD.names.dominoHeight === HARD.objects.dominoHeight) ? HARD.names.dominoHeight : (console.error('HARD.names & HARD.objects are different heights'), 0))) {
        whichFocus.pairIndex = 0;

        // increment lap, or if they're all out of laps, move on to the next instructions screen.
        if (oldDominosLap + 1 < ((HARD.names.lapsRecall === HARD.objects.lapsRecall) ? HARD.names.lapsRecall : (console.error('HARD.names & HARD.objects have different lapsRecall'), 0))) { // A NEW LAP IS BEGUN. increment lap for all recall_dominoPointers, reset all recallPointer.dominoResetKeys, and increment recallPointer.stackResetKey
          // Increment lap in all the recall_dominoPointers (they need it for their submission-logic)
          const { recall_dominoPointers } = draftState.testSlice.currentScreen;
          recall_dominoPointers.forEach((_, pairIndex) => { // .forEach operates upon arrays
            ['leftHalf', 'rightHalf'].forEach(leftOrRight => {
              recall_dominoPointers[pairIndex][leftOrRight].lap++;
            });
          });

          // Reset all recallPointer.dominoResetKeys; they don't contain lap, so they have to restart at attempt 0 for each lap.
          const { dominoResetKeys } = draftState.testSlice.currentScreen.recallPointer;
          dominoResetKeys.forEach((_, pairIndex) => {
            ['leftHalf', 'rightHalf'].forEach(leftOrRight => {
              dominoResetKeys[pairIndex][leftOrRight] = `leftOrRight:${leftOrRight}-attempt:0-thisPairNeedsReinforcement:false`;
            });
          });

          // Increment recallPointer.stackResetKey
          draftState.testSlice.currentScreen.recallPointer.stackResetKey++; // it's an integer. Always has same value as lap. Initialized to 0 for each 8th of the test.
        }
        else if (oldDominosLap + 1 >= ((HARD.names.lapsRecall === HARD.objects.lapsRecall) ? HARD.names.lapsRecall : (console.error('HARD.names & HARD.objects have different lapsRecall'), 0))) { // ALL LAPS ARE COMPLETE. // currentScreen's time, whichFocus, and attempt are nulled; its counterbalanced & whichScreen are incremented; its recallPointer (comprised of reset keys) is nulled; and its recall_dominoPointers are nulled.
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
          draftState.testSlice.currentScreen.whichScreen = ctb.screenArray[ctb.screenIndex];

          // Null the reset keys. All are reinitialized by InstructionsScreen.
          const { recallPointer } = draftState.testSlice.currentScreen;
          draftState.testSlice.currentScreen.recallPointer.stackResetKey = null;
          recallPointer.dominoResetKeys.forEach((_, pairIndex) => {
            ['leftHalf', 'rightHalf'].forEach(leftOrRight => {
              recallPointer.dominoResetKeys[pairIndex][leftOrRight] = null;
            });
          });

          // Null lap, listHalf, namesOrObjects, focused, and thisPairNeedsReinforcement in all the recall_dominoPointers. Lap is the incrementable one; all 5 are initialized by InstructionsScreen.
          const { recall_dominoPointers } = draftState.testSlice.currentScreen;
          recall_dominoPointers.forEach((_, pairIndex) => { // .forEach operates upon arrays
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

export const derivedKeys = { // update all keys, in the order they occur in currentScreen
  echo: (draftState, { init }) => { // two versions: First version (init) is called by InstructionsScreen. Second is called in setCorrect, to prepare the next domino.
    // get refs to all the currentScreen objects we'll be updating
    const { time, whichFocus, echoPointer, echo_dominoPointer } = draftState.testSlice.currentScreen;

    // initialize time, for this domino
    time.atLastSubmission = Date.now();
    time.atPairFocus = Date.now();

    // whichFocus is not used by echo; initialize it to null
    whichFocus.pairIndex = null;
    whichFocus.leftOrRight = null;
    // attempt was already reset to 0; that conceptually belongs in "incrementKeys", even though it could be set here in derivedKeys, and that would save the InstructionsScreen from having to initialize it to 0.
    // counterbalanced's 3 keys (namesOrObjects, listHalf, and echoOrRecall) do not need incrementing. InstructionsScreen does so before calling derivedKeys, so they can be used in derivedKeys. incrementKeys does the same.
    // whichScreen & counterbalanced.screenIndex: InstructionsScreen increments these after calling derivedKeys, b/c that's a nice conceptual order. incrementKeys increments them only in the 'completed' case, where it does NOT also call derivedKeys.

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
    const presentablesPair = draftState.testSlice.presentables.targetPairs[namesOrObjects][listHalf][pairIndex]; // the correct answer, from presentables
    echoPointer.storyText = presentablesPair.storyText;
    echoPointer.storyTime = presentablesPair.storyTime;

    // results
    // Go put the correct answer (from above step) in resultsPair.
    const resultsPair = draftState.testSlice.results[namesOrObjects][listHalf].echo[lap][pairIndex][rep]; // the submission location, in results
    resultsPair.targetPair.leftHalf = presentablesPair.leftHalf;
    resultsPair.targetPair.rightHalf = presentablesPair.rightHalf;
  },
  recall: ( // update all keys, in the order they occur in currentScreen
    draftState, // draftState.testSlice.currentScreen is what they all operate upon.
    whichFocus, // whichFocus has been incremented (or initialized) already; it's for the new domino.
    { init, IDK }, // 3 versions: First version (init) is called by InstructionsScreen. Second and third versions (IDK and correct (the default; empty object)) are called in setCorrect, to prepare the next domino.
  ) => {
    // get refs to all the currentScreen objects we'll be updating
    const { time, recallPointer, recall_dominoPointers } = draftState.testSlice.currentScreen;

    // initialize time, for this domino
    time.atLastSubmission = Date.now();
    if (whichFocus.leftOrRight === 'leftHalf') {
      time.atPairFocus = Date.now(); // time.atPairFocus only gets initialized by a leftHalf domino. (also handles IDK case; whenever IDK is clicked, the new domino is ALWAYS the leftHalf of the pair)
    }

    // whichFocus has already been updated (or initialized); it's part of the "incrementKeys" logic
    // attempt was already reset to 0; that conceptually belongs in "incrementKeys", even though it could be set here in derivedKeys, and that would save the InstructionsScreen from having to initialize it to 0.
    // counterbalanced's 3 keys (namesOrObjects, listHalf, and echoOrRecall) do not need incrementing. InstructionsScreen does so before calling derivedKeys, so they can be used in derivedKeys. incrementKeys does the same.
    // whichScreen & counterbalanced.screenIndex: InstructionsScreen increments these after calling derivedKeys, b/c that's a nice conceptual order. incrementKeys increments them only in the 'completed' case, where it does NOT also call derivedKeys.

    // recallPointer's reset keys have already been incremented (for IDK and correct)
    // // (for init, initialize all of recallPointer's reset keys:)
    if (init) {
      recallPointer.stackResetKey = 0; // it's an integer. Always has same value as lap. Initialized to 0 for each 8th of the test.
      recallPointer.dominoResetKeys.forEach((_, pairIndex) => {
        ['leftHalf', 'rightHalf'].forEach(leftOrRight => {
          recallPointer.dominoResetKeys[pairIndex][leftOrRight] = `leftOrRight:${leftOrRight}-attempt:0-thisPairNeedsReinforcement:false`; // they don't contain lap, so they have to restart at attempt 0 for each lap.
        });
      });
    };

    // recall_dominoPointers
    if (init) {
      recall_dominoPointers.forEach((_, pairIndex) => {
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
