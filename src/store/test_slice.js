// test_slice.js
import { HARD, incrementKeys, derivedKeys } from './test_logic';

// testSlice consists of 3 datastructures: results (from all screens), presentables (for all screens), and currentScreen (so the currently-rendered screen knows which part of presentables to draw from, and which part of results to write to). // eventually I could make these 3 datastructures into 3 different slices, I bet. But no need.
// Beneath the 3 datastructures, testSlice also contains 3 setters: setCorrect, submitBad, and nextScreen.

// First though, here's a function for initializing the results datastructure. It creates an echo-results-object and a recall-results object, and gets called 4 times. First 2 times are both for names, and require the `names` parameter. Second 2 times are both for objects, and require the `objects` parameter.
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

export default function createTestSlice(set) {
  return {
    results: { // initialize 4 quarter-results: (2 namesOrObjects x 2 listHalf)
      names: { one: createQuarterResults(HARD.names), two: createQuarterResults(HARD.names) },
      objects: { one: createQuarterResults(HARD.objects), two: createQuarterResults(HARD.objects) },
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
        screenIndex: 0, // increments along the array. The value is sent to whichScreen.
        screenArray: ((nthParticipant) => {
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
          return ['GeneralInstructions', ...order.flat(), 'Results']; // .flat() merges nested arrays into a single-level array, and the spread operator unpacks it into its individual components.
        })(HARD.nthParticipant), // an Immediately Invoked Function Expression. Wrap an arrow function in parentheses, and pass it an argument in parentheses. (()=>{})() runs once and that's it. Great for initializing.
        keysArray: ((nthParticipant) => {
          // where counterbalanced.screenArray holds 'SpecificInstructions', keysArray needs to hold a 3-key object (with which to initialize currentScreen).
          const names1 = [{ namesOrObjects: 'names', listHalf: 'one', echoOrRecall: 'echo' }, null, { namesOrObjects: 'names', listHalf: 'one', echoOrRecall: 'recall' }, null];
          const names2 = [{ namesOrObjects: 'names', listHalf: 'two', echoOrRecall: 'echo' }, null, { namesOrObjects: 'names', listHalf: 'two', echoOrRecall: 'recall' }, null];
          const objects1 = [{ namesOrObjects: 'objects', listHalf: 'one', echoOrRecall: 'echo' }, null, { namesOrObjects: 'objects', listHalf: 'one', echoOrRecall: 'recall' }, null];
          const objects2 = [{ namesOrObjects: 'objects', listHalf: 'two', echoOrRecall: 'echo' }, null, { namesOrObjects: 'objects', listHalf: 'two', echoOrRecall: 'recall' }, null];
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
          return [null, ...order.flat()]; // flatten [names1, names2, objects1, objects2] into a single-level array of nulls and objects. By default, flat() only flattens the top level. It is not capable of flattening an object.
        })(HARD.nthParticipant),
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

    // Below are 3 setters, which act upon the 3 datastructures above (results, presentables, & currentScreen).
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
    nextScreen: () => set((draftState) => {
      // an object ref, whose keys we'll mutate:
      const { counterbalanced: ctb } = draftState.testSlice.currentScreen; // (renamed it ctb for brevity)
      // 4 primitives, which won't be mutated:
      const { namesOrObjects, listHalf, echoOrRecall } = ctb.keysArray[ctb.screenIndex];
      const { whichScreen } = draftState.testSlice.currentScreen;

      if (whichScreen === 'SpecificInstructions') { // it's ok to update the keys. keysArray has values for them, here. Update them for the next 8th of the test.
        ctb.namesOrObjects = namesOrObjects; // if !== 'SpecificInstructions', then nextScreen was triggered by finishing an 8th of the test, and we actually want the ctb keys to persist (so the next SpecificInstructions can read them, and know what was just completed).
        ctb.listHalf = listHalf;
        ctb.echoOrRecall = echoOrRecall;

        // attempt = 0 is conceptually an "incrementKeys" task, not a "derivedKeys" task
        draftState.testSlice.currentScreen.attempt = 0;

        // generic increment logic for whichScreen, using screenIndex to subset screenArray.
        ctb.screenIndex++;
        draftState.testSlice.currentScreen.whichScreen = ctb.screenArray[ctb.screenIndex];

        // call derivedKeys, which contains logic to initialize the rest of the keys
        if (echoOrRecall === 'echo') {
          derivedKeys.echo({ init: true }, draftState);
        }
        else if (echoOrRecall === 'recall') {
          const whichFocus = draftState.testSlice.currentScreen.whichFocus;
          whichFocus.pairIndex = 0;
          whichFocus.leftOrRigh = 'leftHalf';
          derivedKeys.recall({ init: true }, draftState, whichFocus);
        }
      }
    }),

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
