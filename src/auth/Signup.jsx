import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../creds/api';
import { toast } from '../components/Toast';

const BLOOD_GROUPS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
const POPULAR_CITIES = ['Sargodha', 'Lahore', 'Faisalabad', 'Islamabad', 'Rawalpindi', 'Multan'];

export default function Registration() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    bloodGroup: 'O+',
    address: 'Sargodha',
    gender: 'Male',
    hasDonatedBefore: false,
    lastDonationDate: '',
    isAvailable: true,
    healthStatus: {
      hepB: true,
      hepC: true,
      hiv: true,
      generalEligible: true,
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError('');

    if (name.startsWith('health_')) {
      const field = name.replace('health_', '');
      setFormData((prev) => ({
        ...prev,
        healthStatus: { ...prev.healthStatus, [field]: checked }
      }));
    } else {
      setFormData((prev) => ({
        ...prev, [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleBloodSelect = (bg) => setFormData((prev) => ({ ...prev, bloodGroup: bg }));
  const handleCitySelect = (city) => setFormData((prev) => ({ ...prev, address: city }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) return setError('Please provide your full name.');
    const rawPhone = formData.phoneNumber.trim();
    if (!rawPhone) return setError('Please provide a valid phone number.');
    if (formData.password.length < 8) return setError('Password must be at least 8 characters long.');
    if (!formData.healthStatus.generalEligible) {
      return setError('You must confirm basic eligibility (18+ years old, healthy weight >50kg) to register.');
    }

    setIsSubmitting(true);
    const formattedPhone = rawPhone.startsWith('+') ? rawPhone : '+92' + rawPhone.replace(/^0+/, '');
    const donationDateValue = formData.hasDonatedBefore && formData.lastDonationDate ? formData.lastDonationDate : null;

    const payload = {
      fullName: formData.fullName.trim(), name: formData.fullName.trim(), full_name: formData.fullName.trim(),
      phoneNumber: formattedPhone, phone_number: formattedPhone, phone: formattedPhone,
      password: formData.password,
      bloodGroup: formData.bloodGroup, blood_group: formData.bloodGroup,
      address: formData.address.trim() || 'Location not specified',
      gender: formData.gender,
      lastDonationDate: donationDateValue, last_donation_date: donationDateValue,
      isAvailable: formData.isAvailable, is_available: formData.isAvailable,
      hepB: formData.healthStatus.hepB, hep_b: formData.healthStatus.hepB,
      hepC: formData.healthStatus.hepC, hep_c: formData.healthStatus.hepC,
      hiv: formData.healthStatus.hiv,
    };

    const candidateEndpoints = [`${API_BASE_URL}/api/register`, `/api/register`, `${API_BASE_URL}/register`, `/register`];

    try {
      let response = null;
      let lastErr = null;
      for (const url of candidateEndpoints) {
        try {
          response = await axios.post(url, payload, { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, timeout: 8000 });
          if (response && response.data) break;
        } catch (err) {
          lastErr = err;
          if (err.response?.status !== 404 && err.response?.status !== 405) throw err;
        }
      }

      if (!response && lastErr) throw lastErr;

      const data = response?.data || {};
      const token = data.token || data.access_token || data.data?.token;
      const userObj = data.user || data.data?.user || data.data;

      if (data.success !== false) {
        localStorage.clear(); sessionStorage.clear();
        if (token) localStorage.setItem('auth_token', token);

        const formattedUser = {
          id: userObj?.id || 1,
          fullName: userObj?.fullName || userObj?.name || userObj?.full_name || formData.fullName.trim(),
          phoneNumber: userObj?.phoneNumber || userObj?.phone_number || userObj?.phone || formattedPhone,
          email: userObj?.email || '',
          bloodGroup: userObj?.bloodGroup || userObj?.blood_group || formData.bloodGroup,
          address: userObj?.address || formData.address.trim() || 'Location not specified',
          gender: userObj?.gender || formData.gender,
          lastDonationDate: userObj?.lastDonationDate || userObj?.last_donation_date || (donationDateValue || ''),
          isAvailable: userObj?.isAvailable ?? userObj?.is_available ?? formData.isAvailable,
          healthStatus: {
            hepB: Boolean(userObj?.healthStatus?.hepB ?? userObj?.hep_b ?? formData.healthStatus.hepB),
            hepC: Boolean(userObj?.healthStatus?.hepC ?? userObj?.hep_c ?? formData.healthStatus.hepC),
            hiv: Boolean(userObj?.healthStatus?.hiv ?? userObj?.hiv ?? formData.healthStatus.hiv),
          }
        };

        localStorage.setItem('auth_user', JSON.stringify(formattedUser));
        localStorage.setItem('user_profile', JSON.stringify(formattedUser));
        window.dispatchEvent(new Event('authChange'));

        toast.success(`Welcome to the network, ${formattedUser.fullName}.`, 'Registration Successful');
        navigate('/');
      } else {
        const msg = data.message || 'Registration failed. Please check your information.';
        setError(msg); toast.error(msg);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data?.errors;
      let finalMsg = typeof serverMsg === 'object' ? Object.values(serverMsg).flat().join(' ') : (serverMsg || 'Registration failed. Please verify your details.');
      setError(finalMsg); toast.error(finalMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fafbfc] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">

      {/* Background Ambience & Floating Life-Saving Particles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[520px] bg-gradient-to-b from-[#fff0f3] via-[#ffe5e9]/50 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating decorative elements */}
      <div className="absolute top-16 left-[8%] sm:left-[14%] w-16 h-16 rounded-full bg-red-100/60 blur-xl pointer-events-none animate-float"></div>
      <div className="absolute top-36 right-[8%] sm:right-[15%] w-20 h-20 rounded-full bg-rose-200/50 blur-xl pointer-events-none animate-float-reverse"></div>
      <div className="absolute bottom-24 left-[10%] w-14 h-14 rounded-full bg-red-50 blur-lg pointer-events-none animate-float"></div>

      {/* Ambient Heartbeat / Life Pulse SVG Line */}
      <div className="absolute top-8 w-full max-w-5xl opacity-[0.07] pointer-events-none flex justify-center overflow-hidden">
        <svg className="w-full h-24" viewBox="0 0 900 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 50 L200 50 L220 50 L235 20 L250 85 L265 10 L280 65 L295 50 L310 50 L500 50 L520 50 L535 20 L550 85 L565 10 L580 65 L595 50 L900 50" stroke="#e63946" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="w-full max-w-3xl bg-white/95 backdrop-blur-sm rounded-[40px] shadow-[0_12px_40px_rgb(0,0,0,0.05)] border border-slate-100/90 p-8 sm:p-12 relative z-10 my-8 animate-fade-in-up">

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          {/* Pulsing Blood Drop Logo with Ripple Ring */}
          <div className="relative mb-2 flex items-center justify-center">
            <span className="absolute w-20 h-20 rounded-full bg-red-500/20 animate-pulse-ring pointer-events-none"></span>
            <Link
              to="/"
              className="relative flex items-center justify-center w-14 h-16 rounded-t-full rounded-b-[50%] bg-gradient-to-b from-[#e63946] to-[#c1121f] shadow-lg shadow-red-500/30 transition-transform duration-300 hover:scale-110 active:scale-95 animate-heartbeat"
              title="Return to LifeStream Home"
            >
              <div className="w-4 h-4 bg-white/40 rounded-full mb-3"></div>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#e63946] bg-red-50/90 border border-red-100/80 px-3.5 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#e63946] animate-ping"></span>
            <span>Life Saviour Registration</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">
            Become a Life Saviour
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-md mt-1 leading-relaxed">
            Step forward into the donor registry so emergency patients and hospitals can reach you when every second counts.
          </p>

          {/* Inspirational Life-Saver Banner */}
          <div className="w-full max-w-md mt-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-50 via-rose-50/70 to-red-50 border border-red-100/70 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2.5 shadow-xs">
            <svg className="w-4 h-4 text-[#e63946] shrink-0 animate-heartbeat" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-slate-600">
              <strong className="text-red-700 font-bold">1 Donation</strong> can save up to <strong className="text-[#0f172a] font-bold">3 lives</strong>. Thank you for answering the call!
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-bold flex items-center gap-3 animate-fade-in-up">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">

          {/* SECTION 1: Personal Details */}
          <section className="transition-all duration-300">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-[#e63946] uppercase tracking-widest inline-block mb-1 bg-red-50 px-2.5 py-0.5 rounded-md">Step 1</span>
                <h2 className="text-xl font-black text-[#0f172a]">Account Credentials</h2>
              </div>
              <span className="text-xs font-bold text-slate-400">Personal Info</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <svg className="w-5 h-5 text-slate-400 group-focus-within:text-[#e63946] transition-colors absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <input type="text" name="fullName" placeholder="e.g. Asim Raza" value={formData.fullName} onChange={handleInputChange} required className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946] focus:bg-white transition-all duration-200" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number <span className="text-red-500">*</span></label>
                <div className="flex bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#e63946]/20 focus-within:border-[#e63946] focus-within:bg-white transition-all duration-200">
                  <span className="flex items-center justify-center px-4 bg-slate-100/60 border-r border-slate-200 text-slate-600 font-bold text-sm select-none">
                    +92
                  </span>
                  <input type="tel" name="phoneNumber" placeholder="300 1234567" value={formData.phoneNumber} onChange={handleInputChange} required className="w-full px-4 py-3.5 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Password <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="Min. 8 characters" value={formData.password} onChange={handleInputChange} minLength={8} required className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946] focus:bg-white transition-all duration-200" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0f172a] transition-colors cursor-pointer">
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.046 10.046 0 013.682-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* SECTION 2: Medical & Location */}
          <section className="transition-all duration-300">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-[#e63946] uppercase tracking-widest inline-block mb-1 bg-red-50 px-2.5 py-0.5 rounded-md">Step 2</span>
                <h2 className="text-xl font-black text-[#0f172a]">Medical & Location Profile</h2>
              </div>
              <span className="text-xs font-bold text-slate-400">Match Accuracy</span>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Blood Group <span className="text-red-500">*</span></label>
                  <span className="text-[10px] font-black bg-[#0f172a] text-white px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e63946]"></span>
                    Selected: {formData.bloodGroup}
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {BLOOD_GROUPS.map((bg) => {
                    const isSelected = formData.bloodGroup === bg;
                    return (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => handleBloodSelect(bg)}
                        className={`py-3.5 rounded-2xl font-black text-sm transition-all duration-200 cursor-pointer ${isSelected
                          ? 'bg-gradient-to-b from-[#e63946] to-[#c1121f] text-white shadow-lg shadow-red-500/30 scale-105 ring-2 ring-red-400'
                          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:-translate-y-0.5 active:scale-95'
                          }`}
                      >
                        {bg}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">City / Residential Address <span className="text-red-500">*</span></label>
                <input type="text" name="address" placeholder="e.g. Sillanwali Road, Hussain Chowk, Sargodha" value={formData.address} onChange={handleInputChange} required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946] focus:bg-white transition-all duration-200" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946] focus:bg-white transition-all cursor-pointer appearance-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all duration-200 h-[50px] group">
                    <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-300 text-[#e63946] focus:ring-[#e63946] cursor-pointer" />
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${formData.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      {formData.isAvailable ? 'Available for emergency requests' : 'Currently On Hold'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-4 mt-2 transition-all">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="hasDonatedBefore" checked={formData.hasDonatedBefore} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-300 text-[#e63946] focus:ring-[#e63946] cursor-pointer" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">Have you donated blood before?</span>
                    <span className="text-xs text-slate-500 font-medium mt-0.5">Enables tracking of your 60-day recovery cooldown period.</span>
                  </div>
                </label>

                {formData.hasDonatedBefore && (
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in-up">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Date of Last Donation</label>
                    <input type="date" name="lastDonationDate" value={formData.lastDonationDate} onChange={handleInputChange} max={new Date().toISOString().split('T')[0]} className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946]" />
                  </div>
                )}
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* SECTION 3: Health Clearance */}
          <section className="transition-all duration-300">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-[#e63946] uppercase tracking-widest inline-block mb-1 bg-red-50 px-2.5 py-0.5 rounded-md">Step 3</span>
                <h2 className="text-xl font-black text-[#0f172a]">Health & Safety Clearance</h2>
              </div>
              <span className="text-xs font-bold text-emerald-600">Patient Protection</span>
            </div>
            <p className="text-sm text-slate-500 font-medium -mt-3 mb-5">Recipient safety is paramount. Please confirm standard medical screenings.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {[
                { name: 'health_hepB', label: 'Hepatitis B' },
                { name: 'health_hepC', label: 'Hepatitis C' },
                { name: 'health_hiv', label: 'HIV / AIDS' }
              ].map(test => {
                const isCleared = formData.healthStatus[test.name.replace('health_', '')];
                return (
                  <label key={test.name} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${isCleared ? 'bg-emerald-50/70 border-emerald-300 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                    <input type="checkbox" name={test.name} checked={isCleared} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      {isCleared && <span className="text-emerald-600 text-xs">✓</span>}
                      {test.label} Negative
                    </span>
                  </label>
                );
              })}
            </div>

            <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" name="health_generalEligible" checked={formData.healthStatus.generalEligible} onChange={handleInputChange} required className="w-5 h-5 rounded border-slate-300 text-[#e63946] focus:ring-[#e63946] mt-0.5 shrink-0 cursor-pointer" />
              <span className="text-sm font-medium text-slate-700 leading-relaxed">
                I confirm that I am between <strong className="text-slate-900">18–65 years old</strong>, weigh at least <strong className="text-slate-900">50 kg</strong>, have no active fever or transmissible blood infections, and voluntarily register as a life-saving donor.
              </span>
            </label>
          </section>

          {/* Submit Action */}
          <div className="mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4.5 bg-gradient-to-r from-[#e63946] via-[#d62828] to-[#c1121f] text-white font-black rounded-full text-sm sm:text-base tracking-wide shadow-[0_8px_25px_rgba(230,57,70,0.35)] transition-all duration-200 cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2.5 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(230,57,70,0.5)] active:translate-y-0 active:scale-[0.99] animate-shimmer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>CREATING LIFE SAVIOUR PROFILE...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 fill-current animate-heartbeat shrink-0" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>REGISTER AS LIFE SAVIOUR</span>
                </>
              )}
            </button>
            <div className="text-center text-sm text-slate-500 font-medium mt-6 flex items-center justify-center gap-1.5">
              <span>Already part of the network?</span>
              <Link to="/sign-in" className="text-[#0f172a] font-bold hover:text-[#e63946] hover:underline transition-colors">
                Sign in securely
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}