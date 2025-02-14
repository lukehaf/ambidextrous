// test_slice.js

// testSlice consists of 3 datastructures: presentables (for all screens), results (from all screens), and currentScreen (so the currently-rendered screen knows which part of presentables to draw from, and which part of results to write to).
// eventually I could make these 3 datastructures into 3 different slices, I bet. But no need. // results has a group of setters, beneath it. Maybe the other 2 datastructures will too.

// First though, here's a function for initializing the results datastructure. It creates an echo-results-object and a recall-results object, and gets called 4 times. First 2 times are both for names, and require the `names` parameter. Second 2 times are both for objects, and require the `objects` parameter.
const HARD = { // the function requires some hardcoded lengths
  names: { lapsEcho: 2, repsEcho: 2, lapsRecall: 3, dominoHeight: 5 }, // For createQuarterResults(names). also used by currentScreen and updateScreen()
  objects: { lapsEcho: 1, repsEcho: 1, lapsRecall: 3, dominoHeight: 5 }, // For createQuarterResults(objects). also used by currentScreen and updateScreen()
  nthParticipant: null, };
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

// This non-set()-wrapped function mutates the incrementable keys in (draftState..echo_dominoPointer) or (draftState..recallPointer & draftState..recall_dominoPointers).
// It's called synchronously as the penultimate line of setCorrect (once the prior lines have slaked their need for currentScreen.<dominoPointer>'s unmodified base state). Synchronousness (making updateScreen a helper function within a setter, rather than in independent setter) matters since Zustand doesn't guarantee the order of execution for two setters called during the same render cycle of a React component.
// Afterwards, derivedKeys() is called (as the final line of setCorrect) to fill out the rest, based on the incremented keys. Since both are called by setCorrect we know the submission was correct; no need to worry about incrementing/resetting attempt. That's not even in the dominoPointer.
const incrementKeys = {
  // incrementKeys has 6 versions, each with a different increment-logic. (I created a separate version for each context; otherwise I'd have to intermix between-context if statements with within-context if statements, which I find confusing.)
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
      ctb.screenIndex ++;
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
      ctb.screenIndex ++;
      draftState.testSlice.currentScreen.whichScreen = ctb.array[ctb.screenIndex];
      return 'complete';
    },
  },
  recall: (draftState) => { // .recall increments both ..whichFocus and ..recall_dominoPointers (they're complementary)
    const whichFocus = draftState.testSlice.currentScreen.whichFocus;
    const ptr = draftState.testSlice.currentScreen.recall_dominoPointers[whichFocus.pairIndex][whichFocus.leftOrRight];
    ////////////////////////////////////////////////////////////////////////////
    // ok, I have some thinking to do: how to handle the reinforcement rep?
    // correct is always true for submissions that call incrementKeys.recall. Or, IDK was true.
    


    ////////////////////////////////////////////////////////////////////////////
    // incrementable things in whichFocus
    pairIndex
    leftOrRight

    // incrementable things in the dominoPointer
    namesOrObjects // not incrementable, within 1/8th the test
    listHalf // not incrementable, within 1/8th the test
    lap
    pairIndex // not incrementable. dynamically assigned; hardcoded in the ptr.
    leftOrRight // not incrementable. dynamically assigned; hardcoded in the ptr.

    // these ones in the dominoPointer aren't incrementables, but it might make sense to handle them now? rather than when derivedKeys is handling mainly just recallPointer?
    focused: null, // Listened to by dominoes that know they're part of a dominoStack.
    thisPairIsReinforcement: false,
    
            







    ///////////////////////////////////////////////////////////
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
    ctb.screenIndex ++;
    draftState.testSlice.currentScreen.whichScreen = ctb.array[ctb.screenIndex];

    return 'complete'; // Indicates that echo_dominoPointer's keys (& the derived keys in echoPointer) were just set to null. (Don't try to set them like usual by calling derivedKeys.)
  
  },
}; 
 
        ///////////////////////////////////////////////////////////////
        // Increment rep, and potentially all the other keys, before updateDominoResetKey makes use of the new values.
        // Things which updateScreen should increment (case echo):
        //       whichScreen: // whichScreen = 'Results'; or 'echoNames' or 'recall'
        //       echo_dominoPointer
        //       //  namesOrObjects: null, //depends on counterbalanced
        //       //  listHalf: null, // depends on counterbalanced
        //       //  echoOrRecall: 'echo', // (2vs1 space logic depends on this, and whether the domino grabs 2 words or just 1.)
        //       //  lap: null,
        //       //  pairIndex: null, 
        //       //  rep: null,

        //       Save these for last, in case they're useful for subsetting.
        //       // time: {
        //       //   atPairFocus: null, // Store when the screen's active domino focused. // read by setCorrect
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

  

// CHANGE THIS INTO A NON-SETTER FUNCTION WITH 2 VERSIONS. it's called by submitBad, and at the end of derivedKeys.
updateDominoResetKey: {
  echo: () => set((draftState) => { // MAKE THIS NOT BE A SETTER
    // get echo_dominoPointer. Concatenate its properties to create a unique reset key.
    const { namesOrObjects, listHalf, lap, pairIndex, rep, attempt } = draftState.testSlice.currentScreen.echo_dominoPointer; // ATTEMPT IS NOW LOCATED DIRECTLY UNDER CURRENTSCREEN
    draftState.testSlice.currentScreen.echoPointer.dominoResetKey = `${namesOrObjects}-${listHalf}-${lap}-${pairIndex}-${rep}-${attempt}`; // 1ST TWO ARE UNNECESSARY. THE ECHONAMES OR ECHOOBJECTS UNMOUNTS TO SHOW AN INSTRUCTIONSSCREEN, AND UNMOUNTING RESETS THE STATE OF EVERYTHING INSIDE, INCLUDING THE DOMINO. SO LONG AS THE KEYS ARE RESET TO NULL EACH TIME LAP + HIGHER CHANGES.
  }, false, 'updateDominoResetKey.echo'),
  /// ///////// CALL ^^ USING GET() WHENEVER ONE OF THE DEPENDENCIES CHANGES
  recall: () => set((draftState) => {
    // get the currently focused domino, which we'll use to subset recall_dominoPointers
    const { pairIndex, leftOrRight } = draftState.testSlice.currentScreen.whichFocus;
    // get the correct dominoPointer from recall_dominoPointers. Concatenate its properties to create a unique reset key.
    const { namesOrObjects, listHalf, lap, attempt } = draftState.testSlice.currentScreen.recall_dominoPointers[pairIndex][leftOrRight];
    draftState.testSlice.currentScreen.recallPointer.dominoResetKeys[pairIndex][leftOrRight] = `${namesOrObjects}-${listHalf}-${lap}-${leftOrRight}-${attempt}`; // NO NEED TO HAVE THE FIRST 3. THE WHOLE STACK GETS RESET EACH LAP, SO NOTHING COULD PERSIST BETWEEN LAPS. // DO, HOWEVER, ADD ${thisPairIsReinforcement}
  }, false, 'updateDominoResetKey.recall'),
  /// ///////// CALL ^^ USING GET() WHENEVER ONE OF THE DEPENDENCIES CHANGES
}

//////////////////////////
export default function createTestSlice(set) {
  return {
    // MOVE CURRENTSCREEN TO BE BELOW SUBMITBAD, ONCE DONE CREATING UPDATESCREEN()
    currentScreen: {
      // This section of currentScreen is ONLY LISTENED TO BY setCorrect() and submitBad(). incrementKeys.recall resets/increments whichFocus, and derivedKeys resets time. Not listened to by any components.
      time: {
        atPairFocus: null, // Store when the screen's active domino focused. // read by setCorrect
        atLastSubmission: null, // read by submitBad
      },
      whichFocus: { pairIndex: null, leftOrRight: null, }, // read by setCorrect.recall. // eg { pairIndex: 0, leftOrRight: 'rightHalf' }
      // This section of currentScreen is ONLY LISTENED TO BY newDominoResetKey. // incremented at end of submitBad, before it calls newDominoResetKey; reset at end of setCorrect, before it calls incrementKeys, then derivedKeys, then newDominoResetKey.
      attempt: null,
      // this section of currentScreen is ONLY LISTENED TO BY InstructionsScreen (and derivedKeys or newDominoResetKey?) (probably it should get relabeled as a pointer.). incrementKeys advances screenIndex (and updates whichScreen) in the event of completing an 8th of the test, but should not re-null anything. InstructionsScreen wants to know what just got completed, before updating them (upon click of nextScreen button).
      counterbalanced: {
        // these three keys are incremented by incrementKeys, to indicate the current eighth of the test.
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
        dominoResetKey: null, // set by updateDominoResetKey.echo()
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
              // keys for subsetting (and for reset key):
              namesOrObjects: null,
              listHalf: null,
              lap: null,
              pairIndex, // dynamically assigned by Array.from()
              leftOrRight: key, // dynamically assigned by map // (also controls display: whether the grey text is shown, and submission-logic (IDK button).)
              // keys for display-type & submission-logic:
              echoOrRecall: 'recall', // (2vs1 space logic depends on this, and whether the domino grabs 2 words or just 1.)
              focused: null, // Listened to by dominoes that know they're part of a dominoStack.
              thisPairIsReinforcement: false, // listened to by domino-pairs that know they're part of a dominoStack. // is set to true following an IDK-button submission. // decides whether to show grey remainderString & red highlights for rightHalf = true dominoes. // is NOT used to decide submission location, actually. // IS part of the reset key.
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
        // mutate results
        thisRep.completed = true;
        thisRep.repTime = Date.now() - draftState.currentScreen.time.atPairFocus; // Calculate elapsed time, from when this domino first focused to when it received this correct submission
        // mutate currentScreen. (Their attempt was correct-- move them on to their next rep or pairIndex.)
        // (reset attempt, then increment the echo_dominoPointer within currentScreen now that setCorrect's done using its base state.)
        draftState.testSlice.currentScreen.attempt = 0;
        // increment rep, pairIndex, and lap (until this 8th of the test is finished)
        const returned = incrementKeys.echo[namesOrObjects](draftState); // a 3-version helper function
        if (returned !== 'complete') { // When this 8th of the test is 'complete', don't try to call derivedKeys. (incrementKeys just set to null all the incrementable and derivable keys. (in echo_dominoPointer and echoPointer). Don't try to call derivedKeys.)
          derivedKeys.echo(draftState);
        };
      }, false, 'setCorrect.echo'),
      recall: (IDK) => set((draftState) => {
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
        if (leftOrRight === 'rightHalf') { // the whole pair's complete only when the rightHalf's complete. // no need to submit a time upon correct for the left half. (Do reset the currentScreen.time.atLastSubmission, though.)
          pairTier.dominoPairTime = Date.now() - draftState.currentScreen.time.atFocus;
        }
        // mutate currentScreen. (Their attempt was correct-- move them on to their next leftOrRight, or their reinforcement rep)
        // (reset attempt, then increment the (whichFocus & recall_dominoPointers) within currentScreen now that setCorrect's done using its base state.)
        draftState.testSlice.currentScreen.attempt = 0;
         // increment leftOrRight, pairIndex, and lap (until this 8th of the test is finished)
         const returned = incrementKeys.recall(draftState); // a 3-version helper function
         if (returned !== 'complete') { // When this 8th of the test is 'complete', don't try to call derivedKeys. (incrementKeys just set to null all the incrementable and derivable keys. (in echo_dominoPointer and echoPointer). derivedKeys would try to unNull them, but wouldn't have the resources to.)
           derivedKeys.recall(draftState);
         };
        }, false, 'setCorrect.recall'),

      ////////////////////////////////////////////////////////////////////
      // REFACTORED VERSION, JUST FOR CORRECT (NOT IDK), WHERE I WRITE OUT WHAT INCREMENTKEYS & DERIVEDKEYS WOULD DO, ALL SYNCHRONOUSLY.
      recall: () => set((draftState) => {
        // get the currently focused domino, which we'll use to subset recall_dominoPointers
        const { pairIndex, leftOrRight } = draftState.testSlice.currentScreen.whichFocus;
        // get recall_dominoPointers, which we'll use to subset results, and then subset results
        const { namesOrObjects, listHalf, lap } = draftState.testSlice.currentScreen.recall_dominoPointers[pairIndex][leftOrRight];
        const thisPair = draftState.testSlice.results[namesOrObjects][listHalf].recall[lap][pairIndex];
        // if this is a reinforcement rep, then thisPair.reinforcement will have been initialized by an empty object (and thus will be truthy) (before the user could possibly try to submit anything.)
        const pairTier = thisPair.reinforcement || thisPair;

        // submit completed
        pairTier[leftOrRight].completed = true;
        // submit dominoPairTime, if the pair is complete (so, only for rightHalf dominoes) 
        if (leftOrRight === 'rightHalf') {
          pairTier.dominoPairTime = Date.now() - draftState.currentScreen.time.atPairFocus; //from when this domino first focused to when it received this correct submission. (a reinforcement correct submission will have a longer elapsed time than the initial correct submission)
        }
        // Reset attempt (for an impending newDominoResetKey). Their attempt was correct, and we'll be moving them on to their next leftOrRight.
        draftState.testSlice.currentScreen.attempt = 0;


        // // // incrementKeys (leftOrRight, pairIndex, lap (the first two are in whichFocus))
        const whichFocus = draftState.testSlice.currentScreen.whichFocus;
        const baseDomino = draftState.testSlice.currentScreen.recall_dominoPointers[whichFocus.pairIndex][whichFocus.leftOrRight]; // if later code increments pairIndex or leftOrRight, will the baseDomino change?

        if (whichFocus.leftOrRight === 'leftHalf') {
          whichFocus.leftOrRight = 'rightHalf';
        } else if (whichFocus.leftOrRight === 'rightHalf') {
          whichFocus.leftOrRight = 'leftHalf';

          if (whichFocus.pairIndex +1 < ((HARD.names.dominoHeight === HARD.objects.dominoHeight) ? HARD.names.dominoHeight : null)) {
            whichFocus.pairIndex++;
            // I also need to thoughtfully change focused. recall_dominoPointers..focused needs to be set to false in the old one, and set to true in the new one. (this is starting to feel like a derived keys thing. But note that it's not getting reset. So no need for that.)
          } else if (whichFocus.pairIndex +1 >= ((HARD.names.dominoHeight === HARD.objects.dominoHeight) ? HARD.names.dominoHeight : null)) {
            whichFocus.pairIndex = 0;

            if (baseDomino.lap +1 < ((HARD.names.lapsRecall === HARD.objects.lapsRecall) ? HARD.names.lapsRecall : null)) {
              baseDomino.lap ++;
              // I have to increment lap in all the other recall_dominoPointers, too. What would be a fast way to access/index it in them all?

              // set a new stackResetKey, once all its constituent pieces are ready. 
              // // draftState.testSlice.currentScreen.recallPointer.stackResetKey = `${namesOrObjects}-${listHalf}-${lap}`

              // should I also reset the dominoKeys, when lap changes?
              // if lap is included in their key, they would have to be reset to include the new lap, and then nulled when all laps are complete.
              // if lap is not included in their key, they would have to be reset for the new lap, and then nulled when all laps are complete.
            } else if (baseDomino.lap +1 >= ((HARD.names.lapsRecall === HARD.objects.lapsRecall) ? HARD.names.lapsRecall : null)) {
              
              // there are no more laps left to go! set laps to null, and everything else to null, too? Check incrementKeys.echo for inspiration.
// should I be incrementing in other dominoes too?

              // set the incrementable keys to null: 
              // whichFocus.pairIndex & whichFocus.leftOrRight? sure. InstructionsScreen can reinitialize them.
              // lap, listHalf, and namesOrObjects, in all the recall_dominoPointers? sure. Then InstructionsScreen can reinitialize them all.


              // increment counterbalanced/whichscreen
              // hit the stack reset key.
              // then the only other thing to be handled is this:
              // time: {
              //   atPairFocus: null, // Store when the screen's active domino focused. // read by setCorrect
              //   atLastSubmission: null, // read by submitBad
              // },

              // AND BOOM! THERE'S ALL THE KEYS THAT WOULD NEED TO BE INCREMENTED FOR RECALL. AND IT'S ALL RIGHT HERE IN SETCORRECT.RECALL, RATHER THAN HAVING AN INDEPENDENT INCREMENTKEYS AND DERIVEDKEYS FOR RECALL.  MAYBE THAT'S BETTER? ESPECIALLY IF RECALL PAIRS PRECLUDES THE COOL INCREMENTKEYS EARLY RETURN SYNTAX?
        }}}

        ////////////////////////////////
      
        ////////////////////////////////////////////////////////////////////

        // clicking IDK button can use the setCorrect hook. 
        // // here's setCorrect functionality which is same for correct and IDK:
        // // // .completed = true; (including for IDK; the next submission will go 1 tier deeper.)
        // // // submit dominoPairTime, IF it was the rightHalf. (leftHalf gets no time-submission upon correct; that's fine.) (Also holds for IDK.) (Time-reset logic is independent.)
        // // // attempt = 0 (including for IDK; since you moved back one domino; treat it as a fresh set of attempts)
        // // here's setCorrect functionality just for correct:
        // // // incrementKeys (leftOrRight, pairIndex, lap (the first two are in whichFocus))

        // RESUME HERE! (THE STEPS BELOW. WORK THEM INTO THE REFACTORED VERSION ABOVE, INSIDE THAT GROSS NESTED IF.)
        // // // derived keys (resets both times, calls newResetKey, changes recall_dominoPointers (focused))
        // // // Reinforcement now, attempt = 0 could happen twice for the left domino. The newResetKey needs to incorporate "thisPairIsReinforcement: false" 
        // // //  -> Just make sure that for leftHalf correct, derivedKeys still resets time.sinceLastSubmission, and does NOT reset time.sinceFocus)  // (Time-reset logic is independent. time.sincePairFocus is only reset upon right-half correct submissions; time.sinceLastSubmission is reset for the pair upon wrongSubmissions, IDK, and correct.)
          // derivedKeys.recall: leftHalf correct should only reset attemptTime, not pairtime. Also check that submitBad.recall is differentially handling the leftHalf? Actually IDK if it needs to?
        // (Do reset the currentScreen.time.atLastSubmission, though, for both halfs

        // WRITE CODE FOR SETCORRECT (JUST FOR CORRECT); WRITE IT SYNCHRONOUSLY AS ONE FUNCTION. LATER I'LL SEE IF IT DESERVES BEING SPLIT UP INTO INCREMENTKEYS & DERIVEDKEYS. THEN SEE WHAT CAN BE SHARED BY THE BELOW IDK.
        // // here's setCorrect functionality just for IDK: 
        // // // DON'T incrementKeys (pairIndex or lap); DO reset leftOrRight to "leftHalf", in whichFocus; do set thisPairIsReinforcement = true for both dominoes in the pair.
        // // // Do initialize the deeper results structure (which automatically will receive the next wrongSubmission or setCorrect?) Do reset both times. Do call newResetKey, once thisPairIsReinforcement has been updated. Do change "focused" key in the 2 dominoPointers, back to the left one..
        // Only give them a reinforcement rep if they click the IDK button. Don't give them a reinforcement rep if they type it wrong but then do type it correctly all by themselves. (This makes it easier to score; Currently a reinforcement = null structure in the results means they got it correct all by themselves; IDK button initializes it and makes it non null. Giving them reinforcement rep after typing it correctly should be scored correct, but would unnull it.)
        // when it resets, does it reset the whole pair? do you have to type the whole pair again? Yes. You're wanting to reinforce them as a pair.
       
        // RESUME WITH THE ABOVE
        //                    -> sweet! now Domino display logic utilizes thisPairIsReinforcement.
        //                    -> and now there's a cute little button for the recall dominoes. onClick triggers setCorrect, with an IDK argument.

      
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
        // mutate currentScreen. (Their attempt was incorrect; don't move them on to their next rep or pairIndex.)
        // (just increment attempt; no need to increment the echo_dominoPointer.)
        draftState.testSlice.currentScreen.attempt += 1;
        // (do, however, call updateDominoResetKey, to clear the domino using the incremented attempt.)
        updateDominoResetKey.echo(draftState);
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
          submissionType, // submissionType: (space or backspace; IDK is now handled by setCorrect.recall)
          userEntry, // the array of character-objects that they typed
          attemptTime: Date.now() - draftState.currentScreen.time.atLastSubmission,
        };
        // append wrongSubmission to the wrongSubmissions array (under leftOrRight)
        pairTier[leftOrRight].wrongSubmissions.push(wrongSubmission);
        // Their attempt was incorrect; don't move them on to their next rep or pairIndex.
        // (just increment attempt; no need to increment the recall_dominoPointers or whichFocus.) (incrementing attempt mutates currentScreen)
        draftState.testSlice.currentScreen.attempt += 1;
        // (do, however, call updateDominoResetKey, to clear the domino using the incremented attempt.)
        updateDominoResetKey.recall(draftState);
        /////////////////////////////////////////////////////////
        // ok. submitBad.recall needs some additional logic, to handle IDK?? No. It's good. IDK is handled by setCorrect, now. Just check that it can handle the new IDK submission logic.
         // backspace & space-submit (incorrect): keep giving them more attempts. (increment attempt & call the resetKey; do nothing else. My current code is sufficient.)
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
