import React, { useState } from "react";
import logo from '/images/turners.png'
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src={logo} alt="My Company" className="logo" />
        <h2>Turners</h2>
      </div>

      <div className="hamburger" onClick={toggleMenu}>
        ☰
      </div>

      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        <li><button className="button">Home</button></li>
        <li><button className="button">About</button></li>
        <li><button className="button">Contact</button></li>
        <li><button className="login">Login</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;