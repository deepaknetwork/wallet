import React, { useContext, useState, useRef, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Summary from "./pages/summary";
import Profile from "./pages/profile";
import { AuthContext } from "./data";
import "./index.css";

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showMobileTitle, setShowMobileTitle] = useState(false);
  const [isButtonTransitioning, setIsButtonTransitioning] = useState(false);
  const [buttonNextPage, setButtonNextPage] = useState(null);
  
  // Refs for navigation containers
  const mobileNavRef = useRef(null);
  const desktopNavRef = useRef(null);

  // Scroll to top when navigating to any page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
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

  // Force navigation update when location changes via swipe
  useEffect(() => {
    // Small delay to ensure DOM has updated after navigation
    const timer = setTimeout(() => {
      const currentItem = getCurrentActiveItem();
      if (currentItem) {
        // Trigger nav update for mobile
        let mobileRef = null;
        if (currentItem === "/") mobileRef = mobileHomeRef;
        else if (currentItem === "/summary") mobileRef = mobileSummaryRef;
        else if (currentItem === "/profile") mobileRef = mobileProfileRef;
        
        if (mobileRef) {
          updateSliderPosition(mobileNavRef, mobileRef);
        }
        
        // Trigger nav update for desktop
        let desktopRef = null;
        if (currentItem === "/") desktopRef = desktopHomeRef;
        else if (currentItem === "/summary") desktopRef = desktopSummaryRef;
        else if (currentItem === "/profile") desktopRef = desktopProfileRef;
        
        if (desktopRef) {
          updateSliderPosition(desktopNavRef, desktopRef);
        }
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Mobile title animation effect - shows for 2 seconds every 8 seconds
  useEffect(() => {
    const animateTitle = () => {
      setShowMobileTitle(true);
      // Hide after 2 seconds (visible duration)
      setTimeout(() => {
        setShowMobileTitle(false);
      }, 3000);
    };

    // Show initially after a small delay
    const initialTimer = setTimeout(animateTitle, 500);
    
    // Repeat every 8 seconds
    const interval = setInterval(animateTitle, 9000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const handleMouseEnter = (path) => {
    setHoveredItem(path);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const handleNavClick = (path, event) => {
    // Don't transition if already on the same page or already transitioning
    if (location.pathname === path || isButtonTransitioning) return;
    
    // Prevent immediate navigation for transition effect
    event.preventDefault();
    
    // Clear hover states
    setHoveredItem(null);
    
    // Determine transition direction based on page order
    const pages = ['/', '/summary', '/profile'];
    const currentIndex = pages.indexOf(location.pathname);
    const targetIndex = pages.indexOf(path);
    const isMovingRight = targetIndex > currentIndex;
    
    // Start button transition
    setIsButtonTransitioning(true);
    setButtonNextPage(path);
    
    // Create transition container for both pages
    const transitionContainer = document.createElement('div');
    transitionContainer.className = 'button-nav-transition-container';
    transitionContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      z-index: 10000;
      background: var(--theme);
      overflow: hidden;
    `;
    
    // Clone current page
    const currentPageContent = document.querySelector('.home, .summary, .profile');
    const currentPageClone = currentPageContent.cloneNode(true);
    currentPageClone.className += ' current-page-clone';
    currentPageClone.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform: translateX(0);
      transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      will-change: transform;
    `;
    
    transitionContainer.appendChild(currentPageClone);
    document.body.appendChild(transitionContainer);
    
    // Navigate to new page
    navigate(path);
    
    // Wait for new page to render, then start animation
    setTimeout(() => {
      const newPageContent = document.querySelector('.home, .summary, .profile');
      const newPageClone = newPageContent.cloneNode(true);
      newPageClone.className += ' new-page-clone';
      newPageClone.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: translateX(${isMovingRight ? '100%' : '-100%'});
        transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        will-change: transform;
      `;
      
      transitionContainer.appendChild(newPageClone);
      
      // Start animations
      setTimeout(() => {
        currentPageClone.style.transform = `translateX(${isMovingRight ? '-100%' : '100%'})`;
        newPageClone.style.transform = 'translateX(0)';
        
        // Clean up after animation
        setTimeout(() => {
          document.body.removeChild(transitionContainer);
          setIsButtonTransitioning(false);
          setButtonNextPage(null);
        }, 350);
      }, 10);
    }, 10);
    
    // Update navigation sliders immediately
    let mobileRef = null;
    if (path === "/") mobileRef = mobileHomeRef;
    else if (path === "/summary") mobileRef = mobileSummaryRef;
    else if (path === "/profile") mobileRef = mobileProfileRef;
    
    if (mobileRef) {
      setTimeout(() => updateSliderPosition(mobileNavRef, mobileRef), 10);
    }
    
    let desktopRef = null;
    if (path === "/") desktopRef = desktopHomeRef;
    else if (path === "/summary") desktopRef = desktopSummaryRef;
    else if (path === "/profile") desktopRef = desktopProfileRef;
    
    if (desktopRef) {
      setTimeout(() => updateSliderPosition(desktopNavRef, desktopRef), 10);
    }
  };

  const hasActiveItem = getCurrentActiveItem() !== null;

  return (
    <>
      {/* Mobile-only Dark Wallet title */}
      <div className="mobile_title d-lg-none">
        <h1 className={`mobile_wallet_title ${showMobileTitle ? 'show' : ''}`}>Dark Wallet</h1>
      </div>
      <div className="mbl_router">
        <ul 
          ref={mobileNavRef}
          className={`menu-bar ${hasActiveItem ? "nav-active" : ""}`}
        >
          <Link 
            ref={mobileHomeRef}
            className={`li ${shouldHighlight("/") ? "nav-highlight" : ""}`}
            to="/"
            onClick={(e) => handleNavClick("/", e)}
            onMouseEnter={() => handleMouseEnter("/")}
            onMouseLeave={handleMouseLeave}
          >
            Home
          </Link>
          <Link 
            ref={mobileSummaryRef}
            className={`li ${shouldHighlight("/summary") ? "nav-highlight" : ""}`}
            to="/summary"
            onClick={(e) => handleNavClick("/summary", e)}
            onMouseEnter={() => handleMouseEnter("/summary")}
            onMouseLeave={handleMouseLeave}
          >
            Summary
          </Link>
          <Link 
            ref={mobileProfileRef}
            className={`li ${shouldHighlight("/profile") ? "nav-highlight" : ""}`}
            to="/profile"
            onClick={(e) => handleNavClick("/profile", e)}
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
              onClick={(e) => handleNavClick("/", e)}
              onMouseEnter={() => handleMouseEnter("/")}
              onMouseLeave={handleMouseLeave}
            >
              Home
            </Link>
            <Link 
              ref={desktopSummaryRef}
              className={`li ${shouldHighlight("/summary") ? "nav-highlight" : ""}`}
              to="/summary"
              onClick={(e) => handleNavClick("/summary", e)}
              onMouseEnter={() => handleMouseEnter("/summary")}
              onMouseLeave={handleMouseLeave}
            >
              Summary
            </Link>
            <Link 
              ref={desktopProfileRef}
              className={`li ${shouldHighlight("/profile") ? "nav-highlight" : ""}`}
              to="/profile"
              onClick={(e) => handleNavClick("/profile", e)}
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

// Swipe Navigation Component
function SwipeNavigationWrapper({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  
  // Page order for swipe navigation
  const pages = ['/', '/summary', '/profile'];
  const currentIndex = pages.indexOf(location.pathname);

  // Scroll to top when navigating to any page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Touch event states
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  const minSwipeThreshold = 0.40; // 40% of screen width
  const initialDetectionThreshold = 50; // Increased from 10px to prevent scroll interference

  // Preload components
  useEffect(() => {
    // Map pages to their actual component files
    const pageComponents = {
      '/': () => import('./pages/home'),
      '/summary': () => import('./pages/summary'),
      '/profile': () => import('./pages/profile')
    };
    
    // Preload next and previous pages
    const nextIndex = (currentIndex + 1) % pages.length;
    const prevIndex = (currentIndex - 1 + pages.length) % pages.length;
    
    // Preload components for better performance
    if (pages[nextIndex] && pageComponents[pages[nextIndex]]) {
      pageComponents[pages[nextIndex]]().catch(() => {});
    }
    if (pages[prevIndex] && pageComponents[pages[prevIndex]]) {
      pageComponents[pages[prevIndex]]().catch(() => {});
    }
  }, [currentIndex]);

  const handleTouchStart = (e) => {
    // Only on mobile screens
    if (window.innerWidth >= 992 || isTransitioning) return;
    
    // Don't interfere with form elements and specific inputs
    const target = e.target;
    if (target.tagName === 'INPUT' || 
        target.tagName === 'SELECT' || 
        target.tagName === 'TEXTAREA' ||
        target.closest('.home_form_input') ||
        target.closest('.pro_in')) {
      return;
    }
    
    // Initialize touch tracking
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
    isDragging.current = false;
    // Debug: console.log('Touch start at:', touchStartX.current, 'Current page:', location.pathname, 'Index:', currentIndex);
  };

  const handleTouchMove = (e) => {
    if (window.innerWidth >= 992 || isTransitioning) return;
    
    // Don't interfere with form elements and specific inputs
    const target = e.target;
    if (target.tagName === 'INPUT' || 
        target.tagName === 'SELECT' || 
        target.tagName === 'TEXTAREA' ||
        target.closest('.home_form_input') ||
        target.closest('.pro_in')) {
      return;
    }
    
    touchEndX.current = e.targetTouches[0].clientX;
    const swipeDistance = touchStartX.current - touchEndX.current;
    const progress = Math.abs(swipeDistance) / window.innerWidth;
    
    // Start showing preview if swipe is significant
    if (Math.abs(swipeDistance) > initialDetectionThreshold && !isDragging.current) {
      // Check if we can actually navigate in this direction
      const canSwipeLeft = swipeDistance > 0 && currentIndex < pages.length - 1;
      const canSwipeRight = swipeDistance < 0 && currentIndex > 0;
      
      // Debug: console.log('Swipe move detected:', { swipeDistance, currentIndex, currentPath: location.pathname, canSwipeLeft, canSwipeRight, pages });
      
      if (canSwipeLeft || canSwipeRight) {
        isDragging.current = true;
        
                  if (canSwipeLeft) {
            // Swiping left (finger moves left) - show next page
            setSwipeDirection('left');
            setNextPage(pages[currentIndex + 1]);
          } else if (canSwipeRight) {
            // Swiping right (finger moves right) - show previous page
            setSwipeDirection('right');
            setNextPage(pages[currentIndex - 1]);
          }
      }
    }
    
    // Update progress for smooth transition
    if (isDragging.current) {
      setSwipeProgress(Math.min(progress * 0.8, 0.8)); // Cap at 80%
    }
  };

  const handleTouchEnd = (e) => {
    if (window.innerWidth >= 992 || isTransitioning) return;
    
    // Don't interfere with form elements and specific inputs
    if (e && e.target) {
      const target = e.target;
      if (target.tagName === 'INPUT' || 
          target.tagName === 'SELECT' || 
          target.tagName === 'TEXTAREA' ||
          target.closest('.home_form_input') ||
          target.closest('.pro_in')) {
        return;
      }
    }
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const swipePercentage = Math.abs(swipeDistance) / window.innerWidth;
    const isLeftSwipe = swipeDistance > 0 && swipePercentage >= minSwipeThreshold;
    const isRightSwipe = swipeDistance < 0 && swipePercentage >= minSwipeThreshold;

    if (isLeftSwipe && currentIndex < pages.length - 1) {
      // Complete swipe left - go to next page
      setIsTransitioning(true);
      setSwipeProgress(1);
      setTimeout(() => {
        navigate(pages[currentIndex + 1]);
        setTimeout(() => {
          resetSwipeState();
        }, 100);
      }, 50);
    } else if (isRightSwipe && currentIndex > 0) {
      // Complete swipe right - go to previous page
      setIsTransitioning(true);
      setSwipeProgress(1);
      setTimeout(() => {
        navigate(pages[currentIndex - 1]);
        setTimeout(() => {
          resetSwipeState();
        }, 100);
      }, 50);
    } else {
      // Reset if swipe wasn't far enough
      resetSwipeState();
    }
  };

  const resetSwipeState = () => {
    setIsTransitioning(false);
    setSwipeDirection(null);
    setNextPage(null);
    setSwipeProgress(0);
    isDragging.current = false;
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Render next page component during swipe
  const renderNextPage = () => {
    if (!nextPage) return null;
    
    switch (nextPage) {
      case '/':
        return <Home key="next-home" />;
      case '/summary':
        return <Summary key="next-summary" />;
      case '/profile':
        return <Profile key="next-profile" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`swipe-container ${isTransitioning ? 'transitioning' : ''} ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={resetSwipeState}
      style={{ 
        touchAction: 'manipulation',
        userSelect: 'none',
        '--swipe-progress': swipeProgress
      }}
    >
      <div className="page-current" style={{
        transform: swipeDirection === 'left' 
          ? `translateX(-${swipeProgress * 100}%)` 
          : swipeDirection === 'right'
          ? `translateX(${swipeProgress * 100}%)`
          : 'translateX(0)',
        transition: isTransitioning ? 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
      }}>
        {children}
      </div>
      
      {nextPage && (
        <div className="page-next" style={{
          transform: swipeDirection === 'left' 
            ? `translateX(${100 - (swipeProgress * 100)}%)` 
            : swipeDirection === 'right'
            ? `translateX(-${100 - (swipeProgress * 100)}%)`
            : 'translateX(100%)',
          transition: isTransitioning ? 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
        }}>
          {renderNextPage()}
        </div>
      )}
    </div>
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
      <SwipeNavigationWrapper>
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
      </SwipeNavigationWrapper>
    </Router>
  )
}