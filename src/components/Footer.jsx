import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ text = "Are you ready to save lives?", linkText = "Register as a Donor", linkTo = "/sign-up" }) {
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

  return (
    <footer className="w-full bg-[#1d3557] text-white mt-auto pt-10 pb-6 relative overflow-hidden border-t border-slate-800">

      {/* Background Decorative Accent Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e63946]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col gap-8">

        {/* Conditional Banner Box */}
        {isLoggedIn ? (
          /* Motivational Quote Banner for Registered Donors */
          <div className="w-full bg-gradient-to-r from-[#1d3557] via-[#0f172a] to-[#e63946]/30 border border-slate-700/80 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-slate-950/40">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#c1121f] flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Active Donor Hero
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">
                  Thank you for being a registered life-saver!
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-medium italic max-w-xl">
                  “Whoever saves one life — it is as if he saved all of humanity.” Keep your status and contact details updated so patients in need can connect with you.
                </p>
              </div>
            </div>

            <Link
              to="/profile"
              className="px-6 py-3 bg-[#e63946] hover:bg-[#d62828] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-red-500/20 transition-all hover:scale-105 shrink-0 cursor-pointer flex items-center gap-2"
            >
              <span>My Donor Profile & Status</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        ) : (
          /* Registration Call-to-Action Banner for Guests */
          <div className="w-full bg-gradient-to-r from-[#e63946] to-[#c1121f] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-red-950/30">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  {text}
                </h3>
                <p className="text-xs text-red-100 mt-0.5 font-medium max-w-xl">
                  A small act of generosity can make a profound difference. Donate blood, help those in need, and seek the reward of Allah.
                </p>
              </div>
            </div>

            <Link
              to={linkTo}
              className="px-6 py-3 bg-white text-[#e63946] hover:bg-red-50 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-105 shrink-0 cursor-pointer flex items-center gap-2"
            >
              <span>{linkText}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}

        {/* Main Footer Links & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-4 border-b border-slate-700/60 text-xs">

          {/* Col 1: Brand Info */}
          <div className="flex flex-col gap-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-7 bg-[#e63946] rounded-t-full rounded-b-[50%] flex items-center justify-center shadow-xs">
                <div className="w-2 h-2 bg-white/40 rounded-full mb-1"></div>
              </div>
              <span className="text-lg font-extrabold text-white">
                Life <span className="text-[#e63946]">Stream</span>
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed font-medium">
              Connecting voluntary blood donors with patients in urgent need. Built to empower communities with fast, life-saving blood access.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-extrabold uppercase text-slate-400 tracking-wider text-[11px]">Quick Navigation</h4>
            <Link to="/" className="text-slate-300 hover:text-white transition-colors font-medium flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#e63946]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              Search Donors
            </Link>
            {isLoggedIn && (
              <Link to="/profile" className="text-slate-300 hover:text-white transition-colors font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Donor Profile & Cooldown
              </Link>
            )}
            {!isLoggedIn && (
              <>
                <Link to="/sign-in" className="text-slate-300 hover:text-white transition-colors font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                  Account Login
                </Link>
                <Link to="/sign-up" className="text-slate-300 hover:text-white transition-colors font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
                  Register New Donor
                </Link>
              </>
            )}
          </div>

          {/* Col 3: Donor Guidelines & Cooldown */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-extrabold uppercase text-slate-400 tracking-wider text-[11px]">Donation Guidelines</h4>
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              60-Day Recovery Cooldown
            </span>
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Age: 18 - 65 Years
            </span>
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Weight: Minimum 50 KG
            </span>
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Health Screening Check
            </span>
          </div>

          {/* Col 4: Emergency Hotline */}
          <div className="flex flex-col gap-3">
            <h4 className="font-extrabold uppercase text-slate-400 tracking-wider text-[11px]">Emergency Support</h4>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">24/7 Helpline</span>
              <a href="tel:1122" className="text-base font-extrabold text-emerald-400 hover:underline flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <span>Call 1122 / Emergency</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Quote */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} LifeStream Blood Donation App. All rights reserved.</p>
          <p className="italic text-slate-300 font-semibold">
            “And whoever saves one life — it is as if he saved mankind entirely.”
          </p>
        </div>

      </div>
    </footer>
  );
}