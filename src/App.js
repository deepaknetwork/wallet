import React, { useContext, useState, useRef, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Summary from "./pages/summary";
import Profile from "./pages/profile";
import { AuthContext } from "./data";
import "./index.css";

function Navigation() {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Refs for navigation containers
  const mobileNavRef = useRef(null);
  const desktopNavRef = useRef(null);
  
  // Refs for navigation links
  const mobileHomeRef = useRef(null);
  const mobileSummaryRef = useRef(null);
  const mobileProfileRef = useRef(null);
  const desktopHomeRef = useRef(null);
  const desktopSummaryRef = useRef(null);
  const desktopProfileRef = useRef(null);
  
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const shouldHighlight = (path) => {
    // Highlight if hovering over this item
    if (hoveredItem === path) {
      return true;
    }
    // Highlight if this is the active item and nothing is being hovered
    if (hoveredItem === null && isActive(path)) {
      return true;
    }
    return false;
  };

  const updateSliderPosition = (navRef, linkRef) => {
    if (navRef.current && linkRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = linkRef.current.getBoundingClientRect();
      
      const left = linkRect.left - navRect.left;
      const width = linkRect.width;
      
      navRef.current.style.setProperty('--slider-left', `${left}px`);
      navRef.current.style.setProperty('--slider-width', `${width}px`);
    }
  };

  const getCurrentActiveItem = () => {
    return hoveredItem || (isActive("/") ? "/" : isActive("/summary") ? "/summary" : isActive("/profile") ? "/profile" : null);
  };

  useEffect(() => {
    const currentItem = getCurrentActiveItem();
    
    if (currentItem) {
      // Update mobile nav
      let mobileRef = null;
      if (currentItem === "/") mobileRef = mobileHomeRef;
      else if (currentItem === "/summary") mobileRef = mobileSummaryRef;
      else if (currentItem === "/profile") mobileRef = mobileProfileRef;
      
      if (mobileRef) {
        updateSliderPosition(mobileNavRef, mobileRef);
      }
      
      // Update desktop nav
      let desktopRef = null;
      if (currentItem === "/") desktopRef = desktopHomeRef;
      else if (currentItem === "/summary") desktopRef = desktopSummaryRef;
      else if (currentItem === "/profile") desktopRef = desktopProfileRef;
      
      if (desktopRef) {
        updateSliderPosition(desktopNavRef, desktopRef);
      }
    }
  }, [hoveredItem, location.pathname]);

  const handleMouseEnter = (path) => {
    setHoveredItem(path);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const hasActiveItem = getCurrentActiveItem() !== null;

  return (
    <>
      <div className="mbl_router">
        <ul 
          ref={mobileNavRef}
          className={`menu-bar ${hasActiveItem ? "nav-active" : ""}`}
        >
          <Link 
            ref={mobileHomeRef}
            className={`li ${shouldHighlight("/") ? "nav-highlight" : ""}`}
            to="/"
            onMouseEnter={() => handleMouseEnter("/")}
            onMouseLeave={handleMouseLeave}
          >
            Home
          </Link>
          <Link 
            ref={mobileSummaryRef}
            className={`li ${shouldHighlight("/summary") ? "nav-highlight" : ""}`}
            to="/summary"
            onMouseEnter={() => handleMouseEnter("/summary")}
            onMouseLeave={handleMouseLeave}
          >
            Summary
          </Link>
          <Link 
            ref={mobileProfileRef}
            className={`li ${shouldHighlight("/profile") ? "nav-highlight" : ""}`}
            to="/profile"
            onMouseEnter={() => handleMouseEnter("/profile")}
            onMouseLeave={handleMouseLeave}
          >
            Profile
          </Link>
          {/* <Link className="li" to="/logout">Logout</Link> */}
        </ul>
      </div>
      <div className="row sys_router">
        <div className="col-lg-3 sys_router_title">
          <span>Dark Wallet</span>
        </div>
        <div className="col-lg-9 sys_router_nav">
          <ul 
            ref={desktopNavRef}
            className={`menu-bar ${hasActiveItem ? "nav-active" : ""}`}
          >
            <Link 
              ref={desktopHomeRef}
              className={`li ${shouldHighlight("/") ? "nav-highlight" : ""}`}
              to="/"
              onMouseEnter={() => handleMouseEnter("/")}
              onMouseLeave={handleMouseLeave}
            >
              Home
            </Link>
            <Link 
              ref={desktopSummaryRef}
              className={`li ${shouldHighlight("/summary") ? "nav-highlight" : ""}`}
              to="/summary"
              onMouseEnter={() => handleMouseEnter("/summary")}
              onMouseLeave={handleMouseLeave}
            >
              Summary
            </Link>
            <Link 
              ref={desktopProfileRef}
              className={`li ${shouldHighlight("/profile") ? "nav-highlight" : ""}`}
              to="/profile"
              onMouseEnter={() => handleMouseEnter("/profile")}
              onMouseLeave={handleMouseLeave}
            >
              Profile
            </Link>
            {/* <Link className="li" to="/logout">Logout</Link> */}
          </ul>
        </div>
      </div>
    </>
  );
}

export default function App() {

  const { loggedin, login, logout, user } = useContext(AuthContext);

  // Debug effect to track authentication state changes
  useEffect(() => {
    console.log("App component - Authentication state changed:");
    console.log("  loggedin:", loggedin);
    console.log("  user:", user);
    console.log("  localStorage user name:", localStorage.getItem("wallet.user.name"));
  }, [loggedin, user]);


  return (
    <Router>
      {loggedin && <Navigation />}
      <Routes>
        {loggedin ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="*" element={<Navigate to="/" replace/>} /> 
          </>
        ) : (
          <Route path="*" element={<Login />} />
          

        )}
        {/* <Route path="*" element={<Navigate to="/"replace />} />  */}
      </Routes>
    </Router>
  )
}