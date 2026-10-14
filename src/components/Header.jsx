import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header({ title = "LifeStream", showBack = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const checkAuthStatus = () => {
    return Boolean(
      localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    );
  };

  const [isLoggedIn, setIsLoggedIn] = useState(checkAuthStatus);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(checkAuthStatus());
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.dispatchEvent(new Event('authChange'));
    navigate('/sign-in');
  };

  const isHome = location.pathname === '/';
  const isProfile = location.pathname === '/profile';

  return (
    <header className="w-full bg-white  border-slate-100 sticky top-0 z-50 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

        {/* Left Section: Brand Logo */}
        <div className="flex items-center">
          <Link
            to="/"
            className="flex items-center group cursor-pointer select-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src="/logo.png"
              alt="LifeStream - Donate Blood, Save Lives"
              className="h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Center Section: Desktop Navigation Links (Optional/Hidden for now) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-500">
        </nav>

        {/* Right Section: Actions (Desktop) */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold transition-all shadow-sm ${isProfile
                  ? 'bg-red-50 border-red-200 text-[#A61818]'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>Profile</span>
              </Link>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/sign-in"
                className="text-sm font-bold text-slate-600 hover:text-[#26282C] px-4 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="text-sm font-bold text-white bg-[#A61818] hover:bg-[#970707] px-6 py-3 rounded-full shadow-[0_4px_14px_0_rgba(166,24,24,0.39)] transition-all hover:-translate-y-0.5"
              >
                Register as Donor
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`sm:hidden p-2.5 rounded-full transition-colors ${mobileMenuOpen ? 'bg-slate-100 text-[#26282C]' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 px-4 py-6 flex flex-col gap-3 animate-in slide-in-from-top-4 duration-200 shadow-2xl z-40 rounded-b-3xl">

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`p-4 rounded-2xl text-base font-bold flex items-center gap-3 ${isHome ? 'bg-red-50 text-[#A61818]' : 'text-slate-700 hover:bg-slate-50 border border-slate-100'}`}
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <span>Find Donors</span>
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-4 rounded-2xl text-base font-bold flex items-center gap-3 ${isProfile ? 'bg-red-50 text-[#A61818]' : 'text-slate-700 hover:bg-slate-50 border border-slate-100'}`}
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <span>My Dashboard</span>
              </Link>

              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left p-4 rounded-2xl text-base font-bold text-red-600 bg-red-50/50 hover:bg-red-50 flex items-center gap-3 mt-2"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-red-500">
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link
                to="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 text-center bg-[#A61818] text-white font-bold rounded-full text-base shadow-[0_4px_14px_0_rgba(166,24,24,0.39)]"
              >
                Register as Donor
              </Link>
              <Link
                to="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 text-center bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-full text-base"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}