import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ text = "Are you ready to save lives?", linkText = "Register as a Donor", linkTo = "/sign-up" }) {
  return (
    <footer className="w-full bg-[#1A1C1F] text-white mt-auto pt-10 pb-6 relative overflow-hidden border-t border-white/5">

      {/* Background Decorative Accent Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#A61818]/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#26282C]/50 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col gap-8">

        {/* Call-to-Action Banner Box */}
        <div className="w-full bg-gradient-to-r from-[#A61818] to-[#970707] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_10px_40px_rgba(166,24,24,0.2)]">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {text}
              </h3>
              <p className="text-sm text-white/80 mt-1 font-medium">
                Your single donation can save up to 3 lives in emergency situations.
              </p>
            </div>
          </div>

          <Link
            to={linkTo}
            className="px-7 py-3.5 bg-white text-[#A61818] hover:bg-slate-50 font-black text-sm rounded-2xl shadow-lg shadow-black/10 transition-all hover:-translate-y-1 hover:shadow-xl shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>{linkText}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Main Footer Links & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-6 border-b border-white/10 text-sm">

          {/* Col 1: Brand Info */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-9 bg-gradient-to-b from-[#A61818] to-[#970707] rounded-t-full rounded-b-[50%] flex items-center justify-center shadow-lg shadow-[#A61818]/20">
                <div className="w-2.5 h-2.5 bg-white/40 rounded-full mb-1"></div>
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Life<span className="text-[#A61818]">Stream</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium text-xs">
              Connecting voluntary blood donors with patients in urgent need. Built to empower communities with fast, life-saving blood access.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-black uppercase text-slate-500 tracking-widest text-[10px]">Quick Navigation</h4>
            <Link to="/" className="text-slate-300 hover:text-white transition-colors font-semibold flex items-center gap-2 text-xs">
              <svg className="w-4 h-4 text-[#A61818]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
              Search Donors
            </Link>
            <Link to="/profile" className="text-slate-300 hover:text-white transition-colors font-semibold flex items-center gap-2 text-xs">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Donor Profile & Cooldown
            </Link>
            <Link to="/sign-in" className="text-slate-300 hover:text-white transition-colors font-semibold flex items-center gap-2 text-xs">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
              Account Login
            </Link>
            <Link to="/sign-up" className="text-slate-300 hover:text-white transition-colors font-semibold flex items-center gap-2 text-xs">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Register New Donor
            </Link>
          </div>

          {/* Col 3: Donor Guidelines & Cooldown */}
          <div className="flex flex-col gap-3">
            <h4 className="font-black uppercase text-slate-500 tracking-widest text-[10px]">Donation Guidelines</h4>
            <span className="text-slate-300 font-semibold flex items-center gap-2 text-xs">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              60-Day Recovery Cooldown
            </span>
            <span className="text-slate-300 font-semibold flex items-center gap-2 text-xs">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Age: 18 - 45 Years
            </span>
            <span className="text-slate-300 font-semibold flex items-center gap-2 text-xs">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Weight: Minimum 50 KG
            </span>
            <span className="text-slate-300 font-semibold flex items-center gap-2 text-xs">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Health Screening Check
            </span>
          </div>

          {/* Col 4: Emergency Hotline */}
          <div className="flex flex-col gap-3">
            <h4 className="font-black uppercase text-slate-500 tracking-widest text-[10px]">Emergency Support</h4>
            <div className="bg-[#26282C] p-4 rounded-2xl border border-white/5 flex flex-col gap-1.5 shadow-inner">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">24/7 Helpline</span>
              <a href="tel:1122" className="text-base font-black text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>Call 1122 / Emergency</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Quote */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium pb-2">
          <p>© {new Date().getFullYear()} LifeStream Blood Donation App. All rights reserved.</p>
          <p className="italic text-slate-400 font-semibold text-center sm:text-right">
            “And whoever saves one life — it is as if he saved mankind entirely.”
          </p>
        </div>

      </div>
    </footer>
  );
}