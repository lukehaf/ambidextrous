import React from 'react';

const Test = () => {
  return (
    <div>
      Here is the test!
    </div>
  );
};

export default Test;

// // test.jsx
// const ThreeUIs = () => {
//   return (
//     <nav>
//         <p>
//             The Test will have 3 user interfaces:
//         </p>
//       <ul>
//         <li><NavLink to="/test/EchoNames_UI">Domino Echo UI (for names)</NavLink></li>
//         <li><NavLink to="/test/EchoObjects_UI">Domino Echo UI (for objects)</NavLink></li>
//         <li><NavLink to="/test/Recall_UI">Dominoes Recall-Test (works for both names & objects)</NavLink></li>
//       </ul>
//     </nav>
//   );
// };

// // here's the conditional rendering secret sauce. Have clicking the above navlinks set state and also change the route?
// <div>
// {currentScreen === 'EchoNames' && <EchoNames />}
// {currentScreen === 'EchoObjects' && <EchoObjects />}
// {currentScreen === 'Recall' && <Recall />}
// </div>

// // Here's some routing stuff from Welcome which might come in handy

// const Welcome = () => {
//   return (
//     <div>
//       <BrowserRouter>
//         <div>
//           <Nav />
//           <Routes>
//             <Route path="/" element={<Welcome />} />
//             <Route path="/domino" element={<Domino />} />
//             <Route path="*" element={<FallBack />} />
//           </Routes>
//         </div>
//       </BrowserRouter>
//     </div>
//   );
// };

// export default Welcome;
