import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { SignedIn, UserButton, useUser } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import { addUser, removeUser } from '../utils/userSlice';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { user, isSignedIn } = useUser();
  const role = useSelector((store) => store.user?.role);

  // Sync Clerk / localStorage user data into Redux
  useEffect(() => {
    if (!isSignedIn) {
      const stored = localStorage.getItem('campusfixStaff');
      if (stored) {
        try {
          const staff = JSON.parse(stored);
          dispatch(addUser(staff));
          return;
        } catch {
          localStorage.removeItem('campusfixStaff');
        }
      }

      // Signed out and no staff session — clear user
      dispatch(removeUser());
      return;
    }

    const derivedRole = user?.publicMetadata?.role || 'student';
    dispatch(
      addUser({
        id: user?.id,
        role: derivedRole,
        name: user?.firstName || user?.fullName || user?.username || null,
      }),
    );
  }, [dispatch, isSignedIn, user]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Determine which nav links to show based on role
  const isLoggedIn = !!role; // role is null when signed out
  const normalizedRole = role || 'student';
  const isAdmin = normalizedRole === 'admin';
  const isWorker = normalizedRole === 'worker';

  const navLinks = isAdmin
    ? [{ to: '/admin', label: 'Facilities Manager' }]
    : isWorker
      ? [{ to: '/worker', label: 'Maintenance Staff' }]
      : [
          { to: '/', label: 'Student/Faculty View' },
          { to: '/tickets/submit', label: 'Submit Ticket' },
          { to: '/tickets', label: 'Ticket Feed' },
          { to: '/my-tickets', label: 'My Tickets' },
        ];

  // Common Tailwind classes for standardizing the design
  const navItemClasses = "relative pb-1 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 after:content-[''] after:absolute after:w-0 after:h-[2px] after:bottom-0 after:left-0 after:bg-blue-400 after:transition-[width] after:duration-300 hover:after:w-full";
  const mobileNavItemClasses = "block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors duration-200";

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-900/80 border-b border-white/10 shadow-lg" data-purpose="main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo and Title */}
          <div className="flex items-center flex-shrink-0" data-purpose="brand-identity">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              CF
            </div>
            <div className="ml-3 flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-tight">Campus Facility</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-medium">Maintenance Helpdesk</span>
            </div>
          </div>

          {/* Desktop Navigation Menu — only shown when logged in */}
          {isLoggedIn && (
            <nav className="hidden lg:flex items-center gap-8" data-purpose="desktop-nav-links">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navItemClasses}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* User Profile & Mobile Toggle */}
          <div className="flex items-center space-x-4" data-purpose="header-actions">
            
            {/* Auth Actions */}
            {!isLoggedIn && (
              <NavLink to="/login" className="rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-400 transition hover:bg-slate-800">
                Login
              </NavLink>
            )}
            <SignedIn>
              <UserButton />
            </SignedIn>

            {/* Mobile Menu Button — only shown when logged in */}
            {isLoggedIn && (
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                {/* Menu icon */}
                <svg className={`block h-6 w-6 ${isMobileMenuOpen ? 'hidden' : 'block'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path>
                </svg>
                {/* Close icon */}
                <svg className={`block h-6 w-6 ${isMobileMenuOpen ? 'block' : 'hidden'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown — only shown when logged in */}
      {isLoggedIn && (
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'block opacity-100' : 'hidden opacity-0'}`} id="mobile-menu" data-purpose="mobile-dropdown">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-900/95 border-b border-white/10 backdrop-blur-md shadow-xl">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={mobileNavItemClasses} onClick={toggleMobileMenu}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
