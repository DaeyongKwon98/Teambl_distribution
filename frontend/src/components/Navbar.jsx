import React from 'react';

const Navbar = ({ activeNav, handleNavClick }) => {
  return (
    <nav className="home-navbar">
      {['홈', '1촌', '초대'].map((item) => (
        <span
          key={item}
          className={`home-nav-item ${activeNav === item ? 'home-active' : ''}`}
          onClick={() => handleNavClick(item)}
        >
          {item}
        </span>
      ))}
    </nav>
  );
};

export default Navbar;
