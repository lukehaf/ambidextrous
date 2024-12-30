// routing.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Welcome from './welcome.jsx';
import Domino from './domino.jsx';

const Nav = (props) => {
  return (
    <nav>
      <div>Memory Test Website (under construction)</div>
      <ul>
        <li><NavLink to="/">Info about Memory Test</NavLink></li>
        <li><NavLink to="/domino">domino UI component</NavLink></li>
      </ul>
    </nav>
  );
};

const FallBack = (props) => {
  return <div>URL Not Found</div>;
};

const NavbarAndPage = (props) => {
  return (
    <div>
      <BrowserRouter>
        <div>
          <Nav />
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/domino" element={<Domino />} />
            <Route path="*" element={<FallBack />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default NavbarAndPage;
