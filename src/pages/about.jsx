import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] font-sans pb-20">

      {/* HERO SECTION */}
      <section className="relative w-full pt-20 pb-16 px-4 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-b from-red-50 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center flex flex-col items-center">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#e63946] bg-red-50 px-4 py-1.5 rounded-full border border-red-100 shadow-sm mb-6">
            Our Story & Mission
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0f172a] tracking-tight mb-6 leading-tight">
            Bridging the gap between <br className="hidden sm:block" />
            <span className="text-[#e63946]">hope and healing.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
            LifeStream was born out of a simple, urgent need in our community: to make finding blood donors faster, safer, and completely frictionless during the moments that matter most.
          </p>
        </div>
      </section>

      {/* MISSION & VISION (Split Layout) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center relative overflow-hidden">

          {/* Decorative subtle background icon */}
          <div className="absolute -right-20 -bottom-20 text-slate-50 opacity-50 pointer-events-none">
            <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
          </div>

          {/* Left: Text */}
          <div className="flex-1 relative z-10">
            <h2 className="text-3xl font-black text-[#0f172a] tracking-tight mb-6">
              The Problem We're Solving
            </h2>
            <div className="space-y-5 text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
              <p>
                Every day, hundreds of families face the terrifying reality of a medical emergency requiring immediate blood transfusions. Social media feeds are filled with desperate requests, but matching the right blood type in the right location takes critical time.
              </p>
              <p>
                <strong className="text-[#0f172a] font-bold">LifeStream eliminates the panic.</strong> We provide a centralized, verified database of voluntary blood donors. By giving users the ability to filter by blood group, location, and real-time eligibility (tracking the 60-day recovery cooldown), we ensure that when you reach out to a donor, they are ready and able to help.
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-[#e63946]">100%</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Free & Voluntary</span>
              </div>
              <div className="w-px bg-slate-200 mx-2"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-[#e63946]">24/7</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Direct Access</span>
              </div>
            </div>
          </div>

          {/* Right: Image Frame */}
          <div className="flex-1 w-full relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 shadow-inner relative z-10">
              <img
                src="https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?auto=format&fit=crop&q=80"
                alt="Medical community support"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Soft decorative blob behind image */}
            <div className="absolute -top-6 -right-6 w-full h-full bg-red-50 rounded-3xl z-0"></div>
          </div>
        </div>
      </section>

      {/* CORE VALUES GRID */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">Our Core Values</h2>
          <p className="text-slate-500 font-medium mt-3">The principles that guide everything we build.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Value 1 */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#e63946] flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-lg font-black text-[#0f172a] mb-3">Radical Accessibility</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Finding blood shouldn't depend on who you know. We are democratizing access to lifesaving donors so that everyone, regardless of their background, can find help in minutes.
            </p>
          </div>

          {/* Value 2 */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-lg font-black text-[#0f172a] mb-3">Trust & Safety</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Recipient safety is non-negotiable. We encourage self-declared medical clearances (Hep-B, Hep-C, HIV) and actively track the 60-day recovery cooldown to protect both donors and patients.
            </p>
          </div>

          {/* Value 3 */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-lg font-black text-[#0f172a] mb-3">Community Driven</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              LifeStream is powered by human kindness. We are simply the bridge; the true heroes are the individuals who volunteer to step up, roll up their sleeves, and save a stranger's life.
            </p>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#0f172a] rounded-[40px] p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          {/* Background pattern */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              Ready to make an impact?
            </h2>
            <p className="text-slate-400 font-medium text-sm sm:text-base max-w-xl mx-auto mb-8">
              Join our growing network of verified blood donors. It takes less than 2 minutes to register, and your profile could be the exact match someone is praying for today.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/sign-up"
                className="w-full sm:w-auto px-8 py-4 bg-[#e63946] hover:bg-[#d62828] text-white font-black rounded-full shadow-[0_4px_14px_0_rgb(230,57,70,0.39)] transition-all hover:-translate-y-0.5"
              >
                Register as a Donor
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full backdrop-blur-sm transition-colors"
              >
                Find Blood Now
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default About;