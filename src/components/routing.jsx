// routing.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useParams } from 'react-router-dom';

const Test = (props) => {
  const { id } = useParams();
  return <div> ID: {id} </div>;
};

const About = (props) => {
  return <div> All there is to know about me </div>;
};

const Welcome = (props) => {
  return <div>Welcome</div>;
};

const Nav = (props) => {
  return (
    <nav>
      <ul>
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/about">About</NavLink></li>

        {/* the "payload" is whatever special sauce they've typed into the url bar, or edit it into.
        The orange text is just what it starts as */}
        <li><NavLink to="/test/payload">test id1</NavLink></li>
        <li><NavLink to="/test/id2">test id2</NavLink></li>
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
            <Route path="/about" element={<About />} />
            <Route path="/test/:id" element={<Test />} />
            <Route path="*" element={<FallBack />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default NavbarAndPage;
