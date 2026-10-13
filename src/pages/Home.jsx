import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

import API_BASE_URL from '../creds/api';
import { fetchAllDonors } from '../creds/donorService';
import { toast } from '../components/Toast';
import WelcomeModal from '../components/WelcomeModal';

const DEFAULT_DONORS = [
  { id: 1, name: 'Asim Raza', bloodGroup: 'O+', address: 'Sillanwali Road, Hussain Chowk, Sargodha', phone: '0300 - 1234567', lastDonationDate: '2026-08-10', isAvailable: true },
  { id: 2, name: 'Zeeshan Haider', bloodGroup: 'A+', address: 'University Road, Sargodha', phone: '0301 - 9876543', lastDonationDate: '2026-07-01', isAvailable: true },
  { id: 3, name: 'Usman Ali', bloodGroup: 'B+', address: 'Lahore Road, Sargodha', phone: '0302 - 5554433', lastDonationDate: '2025-11-15', isAvailable: false },
  { id: 4, name: 'Bilal Ahmed', bloodGroup: 'AB+', address: 'Club Road, Sargodha', phone: '0303 - 7788990', lastDonationDate: '2025-10-10', isAvailable: true },
  { id: 5, name: 'Hamza Malik', bloodGroup: 'O-', address: 'Satellite Town, Sargodha', phone: '0304 - 1122334', lastDonationDate: '2026-04-12', isAvailable: true },
  { id: 6, name: 'Tariq Mehmood', bloodGroup: 'A-', address: 'Civil Lines, Sargodha', phone: '0305 - 6677889', lastDonationDate: '2026-08-25', isAvailable: true }
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('ALL');
  const [eligibilityFilter, setEligibilityFilter] = useState('ALL');
  const [radius, setRadius] = useState(20);

  const [donors, setDonors] = useState(DEFAULT_DONORS);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);


  const educationalSlides = [
    {
      id: 1,
      badge: "Divine Guidance",
      quote: "“And whoever saves one — it is as if he had saved mankind entirely.”",
      reference: "— Al-Quran (Surah Al-Ma'idah, 5:32)",
      bg: "bg-gradient-to-r from-[#1d3557] to-[#0f172a]"
    },
    {
      id: 2,
      badge: "Prophetic Tradition",
      quote: "“The most beloved of people to Allah are those who are most beneficial to people.”",
      reference: "— Al-Mu'jam Al-Awsat (Hadith)",
      bg: "bg-gradient-to-r from-[#e63946] to-[#b71c1c]"
    },
    {
      id: 3,
      badge: "Community Duty",
      quote: "“Help you one another in righteousness and piety, but do not help one another in sin and aggression.”",
      reference: "— Al-Quran (Surah Al-Ma'idah, 5:2)",
      bg: "bg-gradient-to-r from-[#0f172a] to-[#1e293b]"
    },
    {
      id: 4,
      badge: "The Power of Charity",
      quote: "“Charity does not decrease wealth.”",
      reference: "— Sahih Muslim, 2588",
      bg: "bg-gradient-to-r from-[#065f46] to-[#022c22]"
    },
    {
      id: 5,
      badge: "Kindness to Others",
      quote: "“Whoever is not merciful to people, Allah will not be merciful to him.”",
      reference: "— Sahih al-Bukhari, 7376; Sahih Muslim, 2319",
      bg: "bg-gradient-to-r from-[#7c2d12] to-[#431407]"
    },
    {
      id: 6,
      badge: "A Lifeline of Hope",
      quote: "“And whoever saves a life, it is as if he had saved all of mankind.”",
      reference: "— Al-Quran (Surah Al-Ma'idah, 5:32)",
      bg: "bg-gradient-to-r from-[#155e75] to-[#082f49]"
    },
    {
      id: 7,
      badge: "The Reward of Giving",
      quote: "“The example of those who spend their wealth in the way of Allah is like a seed that grows seven ears; in every ear there are a hundred grains.”",
      reference: "— Al-Quran (Surah Al-Baqarah, 2:261)",
      bg: "bg-gradient-to-r from-[#854d0e] to-[#422006]"
    },
    {
      id: 8,
      badge: "Care for the Needy",
      quote: "“So as for the orphan, do not oppress him. And as for the petitioner, do not repel him.”",
      reference: "— Al-Quran (Surah Ad-Duha, 93:9–10)",
      bg: "bg-gradient-to-r from-[#6b21a8] to-[#3b0764]"
    },
    {
      id: 9,
      badge: "A Small Act, Great Reward",
      quote: "“Do not belittle any good deed, even meeting your brother with a cheerful face.”",
      reference: "— Sahih Muslim, 2626",
      bg: "bg-gradient-to-r from-[#be123c] to-[#4c0519]"
    },
    {
      id: 10,
      badge: "Faith Through Action",
      quote: "“Righteousness is in one who believes in Allah, the Last Day, the angels, the Book, and the prophets, and gives wealth, in spite of love for it, to relatives, orphans, the needy, and the traveler.”",
      reference: "— Al-Quran (Surah Al-Baqarah, 2:177)",
      bg: "bg-gradient-to-r from-[#166534] to-[#052e16]"
    },
    {
      id: 11,
      badge: "The Gift of Water",
      quote: "“The best charity is giving water to drink.”",
      reference: "— Sunan Abi Dawud, 1679",
      bg: "bg-gradient-to-r from-[#0369a1] to-[#172554]"
    },
    {
      id: 12,
      badge: "Compassion for Humanity",
      quote: "“And they give food in spite of love for it to the needy, the orphan, and the captive.”",
      reference: "— Al-Quran (Surah Al-Insan, 76:8)",
      bg: "bg-gradient-to-r from-[#9a3412] to-[#431407]"
    },
    {
      id: 13,
      badge: "Unity in Goodness",
      quote: "“The believers are but brothers, so make settlement between your brothers.”",
      reference: "— Al-Quran (Surah Al-Hujurat, 49:10)",
      bg: "bg-gradient-to-r from-[#4338ca] to-[#1e1b4b]"
    },
    {
      id: 14,
      badge: "Sincerity in Giving",
      quote: "“You will never attain righteousness until you spend from that which you love.”",
      reference: "— Al-Quran (Surah Aal-e-Imran, 3:92)",
      bg: "bg-gradient-to-r from-[#a16207] to-[#292524]"
    },
    {
      id: 15,
      badge: "Be a Source of Ease",
      quote: "“Whoever relieves a believer of a hardship from the hardships of this world, Allah will relieve him of a hardship from the hardships of the Day of Resurrection.”",
      reference: "— Sahih Muslim, 2699",
      bg: "bg-gradient-to-r from-[#0f766e] to-[#134e4a]"
    }
  ];


  const checkCooldownActive = useCallback((lastDateStr) => {
    if (!lastDateStr) return false;
    const lastDate = new Date(lastDateStr);
    if (isNaN(lastDate.getTime())) return false;
    const diffDays = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays < 60;
  }, []);

  const fetchDonors = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchAllDonors({ bloodGroup: selectedBloodGroup, status: eligibilityFilter, search: searchTerm, radius });
    setApiConnected(result.isConnected);
    let rawList = (result.isConnected && result.success && Array.isArray(result.donors) && result.donors.length > 0) ? result.donors : [...DEFAULT_DONORS];
    setDonors(rawList);
    setIsLoading(false);
  }, [selectedBloodGroup, eligibilityFilter, searchTerm, radius]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const filteredDonors = donors.filter((donor) => {
    const isOnCooldown = checkCooldownActive(donor.lastDonationDate);
    const matchesBlood = selectedBloodGroup === 'ALL' || donor.bloodGroup === selectedBloodGroup;
    let matchesEligibility = true;
    if (eligibilityFilter === 'AVAILABLE') matchesEligibility = !isOnCooldown && donor.isAvailable;
    else if (eligibilityFilter === 'COOLDOWN') matchesEligibility = isOnCooldown;

    let matchesSearch = true;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      matchesSearch = donor.name.toLowerCase().includes(term) || donor.address.toLowerCase().includes(term) || donor.phone.toLowerCase().includes(term);
    }
    return matchesBlood && matchesEligibility && matchesSearch;
  });

  const copyPhoneNumber = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    toast.info(`Copied ${phone} to clipboard!`);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] font-sans flex flex-col pb-20">
      <WelcomeModal />

      {/* HERO SECTION */}
      <section className="relative w-full pt-16 pb-12 px-4 overflow-hidden bg-gradient-to-b from-[#fff0f3]/60 to-transparent">
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
          <div className="w-full max-w-4xl text-center mb-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-red-100 shadow-sm text-xs font-bold text-[#e63946] mb-6">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
              LifeStream, the smarter way
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0f172a] mb-2">
              Discover Lifesaving
            </h1>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#e63946] mb-5">
              Donors & Communities
            </h1>

            {/* Added Meta Content / Paragraph Area */}
            <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-5 leading-relaxed">
              Connect with local heroes in your area. Browse verified profiles, check 60-day recovery statuses, and reach out instantly to save a life today.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 text-[11px] sm:text-xs font-bold text-slate-600 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-full px-5 py-2 shadow-sm mb-4">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified Profiles</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Live Cooldowns</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Direct WhatsApp</span>
            </div>
            {/* End Meta Content */}

          </div>

          <div className="w-full bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-2.5 flex flex-col md:flex-row items-center gap-2 relative z-20">
            <div className="flex-1 w-full flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100">
              <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <div className="flex flex-col w-full">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</label>
                <input
                  type="text"
                  placeholder="Name, Location, Phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent"
                />
              </div>
            </div>
            <div className="flex-1 w-full flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100">
              <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div className="flex flex-col w-full">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eligibility</label>
                <select
                  value={eligibilityFilter}
                  onChange={(e) => setEligibilityFilter(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 focus:outline-none bg-transparent appearance-none cursor-pointer"
                >
                  <option value="ALL">All Donors</option>
                  <option value="AVAILABLE">Eligible Now</option>
                  <option value="COOLDOWN">On Cooldown</option>
                </select>
              </div>
            </div>
            <button onClick={() => fetchDonors()} disabled={isLoading} className="w-full md:w-auto px-8 py-4 bg-[#e63946] hover:bg-[#d62828] text-white rounded-full font-bold text-sm shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
              {isLoading ? 'SEARCHING...' : 'Find Donors'}
            </button>
          </div>
        </div>
      </section>

      {/* EDUCATIONAL SLIDER */}
      <section className="w-full px-4 mb-16">
        <div className="max-w-6xl mx-auto rounded-[32px] overflow-hidden shadow-2xl relative group">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            navigation={true}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            className="w-full"
          >
            {educationalSlides.map((slide) => (
              <SwiperSlide key={slide.id} className="!h-auto !flex flex-col">
                <div className={`w-full flex-1 min-h-[320px] md:min-h-[360px] flex flex-col items-center justify-center p-8 md:p-12 pb-14 md:pb-16 text-center text-white relative ${slide.bg}`}>
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                  </div>
                  <span className="text-[10px] md:text-xs uppercase tracking-widest bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full font-extrabold border border-white/20 shadow-sm mb-6 z-10">
                    {slide.badge}
                  </span>
                  <p className="text-xl md:text-3xl font-semibold italic leading-relaxed tracking-wide text-white/95 max-w-3xl z-10">
                    {slide.quote}
                  </p>
                  <p className="text-sm md:text-base text-white/70 font-bold mt-6 z-10">
                    {slide.reference}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <style dangerouslySetInnerHTML={{
            __html: `
            .swiper-wrapper { display: flex !important; align-items: stretch !important; }
            .swiper-slide { display: flex !important; height: auto !important; }
            .swiper-slide > div { width: 100% !important; flex: 1 1 auto !important; }
            .swiper-button-next, .swiper-button-prev { color: white !important; background: rgba(255,255,255,0.1); backdrop-filter: blur(4px); width: 44px !important; height: 44px !important; border-radius: 50%; transition: all 0.3s ease; opacity: 0; }
            .group:hover .swiper-button-next, .group:hover .swiper-button-prev { opacity: 1; }
            .swiper-button-next:hover, .swiper-button-prev:hover { background: rgba(255,255,255,0.25); }
            .swiper-button-next:after, .swiper-button-prev:after { font-size: 18px !important; font-weight: bold; }
            .swiper-pagination { bottom: 18px !important; }
            .swiper-pagination-bullet { background: white !important; opacity: 0.5; }
            .swiper-pagination-bullet-active { opacity: 1; }
          `}} />
        </div>
      </section>

      {/* DONOR GRID RESULTS */}
      <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="mb-10 w-full">
          <h4 className="text-[11px] font-black text-[#e63946] uppercase tracking-widest mb-3">AVAILABLE DONORS</h4>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f172a] mb-4 tracking-tight">Discover Donors Near You</h2>
          <p className="text-base text-slate-500 font-medium max-w-2xl mb-8 leading-relaxed">
            Find eligible blood donors in your area. Browse profiles, check availability, and connect instantly to save a life today.
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-slate-200">
            {['ALL', 'O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((group) => (
              <button
                key={group}
                onClick={() => setSelectedBloodGroup(group)}
                className={`flex items-center gap-2 text-[13px] font-bold pb-4 -mb-[1px] border-b-2 transition-colors cursor-pointer ${selectedBloodGroup === group
                  ? 'border-[#e63946] text-[#e63946]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                {group === 'ALL' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                )}
                {group === 'ALL' ? 'All Groups' : group}
              </button>
            ))}
          </div>
        </div>

        {filteredDonors.length === 0 ? (
          <div className="bg-white p-16 rounded-[32px] border border-slate-100 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-[#e63946] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
            </div>
            <h4 className="text-xl font-bold text-slate-800">No Donors Found</h4>
            <p className="text-slate-500 font-medium max-w-md text-sm">
              We couldn't find any donors matching your criteria. Try adjusting your search or becoming the first to register in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map((donor, idx) => {
              const isOnCooldown = checkCooldownActive(donor.lastDonationDate);
              const cardBg = educationalSlides[idx % educationalSlides.length].bg;

              return (
                <div
                  key={donor.id}
                  onClick={() => { setSelectedDonor(donor); setShowDetailModal(true); }}
                  className="bg-white rounded-[20px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className={`h-48 ${cardBg} relative flex items-center justify-center p-4`}>
                    <div className="absolute top-4 left-4 bg-white/95 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                      <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                      Blood Donor
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${donor.phone.replace(/[^0-9+]/g, '')}`, '_self'); }} className="w-8 h-8 rounded-full bg-slate-900/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#e63946] transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${donor.phone.replace(/[^0-9]/g, '')}`, '_blank'); }} className="w-8 h-8 rounded-full bg-slate-900/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#25D366] transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.146 4.186 4.269-1.119z" /></svg>
                      </button>
                    </div>
                    <h2 className="text-[72px] font-black text-white/95 tracking-tighter drop-shadow-md">{donor.bloodGroup}</h2>
                    <div className={`absolute bottom-4 left-4 text-[10px] font-black px-3 py-1.5 rounded-md uppercase tracking-wider ${isOnCooldown ? 'bg-[#f39c12] text-white' : 'bg-[#00b894] text-white'}`}>
                      {isOnCooldown ? 'ON COOLDOWN' : 'AVAILABLE NOW'}
                    </div>
                  </div>

                  <div className="flex border-b border-slate-100 p-4 gap-4 text-xs">
                    <div className="flex-1 flex items-start gap-2">
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">Last Donated</div>
                        <div className="text-slate-500 font-medium mt-0.5">{donor.lastDonationDate || 'First Time'}</div>
                      </div>
                    </div>
                    <div className="w-px bg-slate-100"></div>
                    <div className="flex-1 flex items-start gap-2">
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">Location</div>
                        <div className="text-slate-500 font-medium mt-0.5 line-clamp-1" title={donor.address}>{donor.address.split(',')[0]}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex-1">
                    <h3 className="text-[19px] font-bold text-slate-900 mb-2 truncate">{donor.name}</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-3 font-medium">
                      A registered and willing donor from {donor.address.split(',')[0] || 'the community'}. Reach out to {donor.name.split(' ')[0]} to coordinate a potential blood donation and make a lifesaving impact today. Your call could save a life.
                    </p>
                  </div>

                  <div className="px-5 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-[#e63946] flex items-center justify-center">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">Verified Profile</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {donor.phone.substring(0, 7)}...
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedDonor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 flex flex-col gap-6 relative">
            <button onClick={() => setShowDetailModal(false)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer">✕</button>

            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-red-50 border-4 border-white shadow-md text-[#e63946] flex items-center justify-center font-black text-2xl">
                {selectedDonor.bloodGroup}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{selectedDonor.name}</h3>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase mt-2 inline-block ${checkCooldownActive(selectedDonor.lastDonationDate) ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-[#e63946]'}`}>
                  {checkCooldownActive(selectedDonor.lastDonationDate) ? 'Recovery Period' : 'Ready to Donate'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 space-y-4 text-sm border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Phone</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{selectedDonor.phone}</span>
                  <button onClick={() => copyPhoneNumber(selectedDonor.phone)} className="text-[10px] font-bold text-[#e63946] hover:underline cursor-pointer">
                    {copiedPhone ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Last Donation</span>
                <span className="font-bold text-slate-800">{selectedDonor.lastDonationDate || 'N/A'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <a href={`tel:${selectedDonor.phone.replace(/[^0-9+]/g, '')}`} className="py-3.5 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                Call
              </a>
              <a href={`https://wa.me/${selectedDonor.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedDonor.name)}`} target="_blank" rel="noreferrer" className="py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}