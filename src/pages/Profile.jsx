import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../creds/api';
import { toast } from '../components/Toast';

const COOLDOWN_DAYS = 60;

const DEFAULT_USER = {
  fullName: 'Asim Raza',
  phoneNumber: '+923001234567',
  email: 'asim.raza@example.com',
  bloodGroup: 'O+',
  address: 'Hussain Chowk, Sargodha',
  lastDonationDate: '2026-08-10',
  isAvailable: true,
  healthStatus: {
    hepB: true,
    hepC: true,
    hiv: true,
  }
};

export const getCooldownInfo = (lastDonationDateStr) => {
  if (!lastDonationDateStr) {
    return { isOnCooldown: false, daysPassed: 0, daysRemaining: 0, reactivationDate: null };
  }
  const lastDate = new Date(lastDonationDateStr);
  if (isNaN(lastDate.getTime())) {
    return { isOnCooldown: false, daysPassed: 0, daysRemaining: 0, reactivationDate: null };
  }
  const currentDate = new Date();
  const diffTime = currentDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 0 && diffDays < COOLDOWN_DAYS) {
    const daysRemaining = COOLDOWN_DAYS - diffDays;
    const reactDate = new Date(lastDate);
    reactDate.setDate(reactDate.getDate() + COOLDOWN_DAYS);
    return {
      isOnCooldown: true,
      daysPassed: diffDays,
      daysRemaining: daysRemaining,
      reactivationDate: reactDate.toISOString().split('T')[0]
    };
  }
  return { isOnCooldown: false, daysPassed: diffDays < 0 ? 0 : diffDays, daysRemaining: 0, reactivationDate: null };
};

export default function Account() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ message: '', isError: false });

  const [user, setUser] = useState(DEFAULT_USER);
  const [formData, setFormData] = useState(DEFAULT_USER);

  const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const savedAuthUser = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
      const savedProfile = localStorage.getItem('user_profile');
      let initialUser = DEFAULT_USER;

      if (savedAuthUser) {
        try {
          const parsed = JSON.parse(savedAuthUser);
          initialUser = {
            ...DEFAULT_USER,
            ...parsed,
            fullName: parsed.name || parsed.fullName || parsed.full_name || DEFAULT_USER.fullName,
            phoneNumber: parsed.phone_number || parsed.phoneNumber || parsed.phone || DEFAULT_USER.phoneNumber,
          };
        } catch (e) {
          console.error('Error parsing auth_user:', e);
        }
      } else if (savedProfile) {
        try { initialUser = JSON.parse(savedProfile); }
        catch (e) { console.error('Error parsing user_profile:', e); }
      }

      setUser(initialUser);
      setFormData(initialUser);

      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) { setIsLoading(false); return; }

      try {
        let response = null;
        const candidateEndpoints = [
          `${API_BASE_URL}/api/profile`, `${API_BASE_URL}/api/user`,
          `${API_BASE_URL}/api/user/profile`, `${API_BASE_URL}/api/me`,
          `/api/profile`, `/api/user`
        ];

        for (const endpoint of candidateEndpoints) {
          try {
            response = await axios.get(endpoint, { headers: { 'Accept': 'application/json', ...getAuthHeader() } });
            if (response && response.data) break;
          } catch (err) { /* ignore */ }
        }

        if (response && response.data) {
          const data = response.data;
          const dbUser = data.user || data.data || data;

          if (dbUser && typeof dbUser === 'object') {
            const mappedUser = {
              id: dbUser.id || initialUser.id,
              fullName: dbUser.name || dbUser.fullName || dbUser.full_name || initialUser.fullName,
              phoneNumber: dbUser.phone_number || dbUser.phoneNumber || dbUser.phone || initialUser.phoneNumber,
              email: dbUser.email || initialUser.email,
              bloodGroup: dbUser.blood_group || dbUser.bloodGroup || initialUser.bloodGroup,
              address: dbUser.address || initialUser.address,
              lastDonationDate: dbUser.last_donation_date || dbUser.lastDonationDate || initialUser.lastDonationDate,
              isAvailable: dbUser.is_available ?? dbUser.isAvailable ?? initialUser.isAvailable,
              healthStatus: {
                hepB: Boolean(dbUser.hep_b ?? dbUser.hepB ?? dbUser.healthStatus?.hepB ?? initialUser.healthStatus.hepB),
                hepC: Boolean(dbUser.hep_c ?? dbUser.hepC ?? dbUser.healthStatus?.hepC ?? initialUser.healthStatus.hepC),
                hiv: Boolean(dbUser.hiv ?? dbUser.healthStatus?.hiv ?? initialUser.healthStatus.hiv),
              }
            };
            setUser(mappedUser);
            setFormData(mappedUser);
            localStorage.setItem('user_profile', JSON.stringify(mappedUser));
            localStorage.setItem('auth_user', JSON.stringify(mappedUser));
          }
        }
      } catch (error) {
        console.warn('Backend profile fetch note:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const cooldownInfo = getCooldownInfo(user.lastDonationDate);
  const isCurrentlyAvailable = user.isAvailable && !cooldownInfo.isOnCooldown;
  const formCooldownInfo = getCooldownInfo(formData.lastDonationDate);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSaveStatus({ message: '', isError: false });

    if (['hepB', 'hepC', 'hiv'].includes(name)) {
      setFormData((prev) => ({
        ...prev, healthStatus: { ...prev.healthStatus, [name]: checked }
      }));
    } else {
      setFormData((prev) => ({
        ...prev, [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveStatus({ message: '', isError: false });

    const updatePayload = {
      name: formData.fullName, fullName: formData.fullName, full_name: formData.fullName,
      email: formData.email,
      phone_number: formData.phoneNumber, phoneNumber: formData.phoneNumber, phone: formData.phoneNumber,
      blood_group: formData.bloodGroup, bloodGroup: formData.bloodGroup,
      address: formData.address,
      last_donation_date: formData.lastDonationDate, lastDonationDate: formData.lastDonationDate,
      is_available: formData.isAvailable, isAvailable: formData.isAvailable,
      hep_b: formData.healthStatus.hepB, hepC: formData.healthStatus.hepC, hiv: formData.healthStatus.hiv,
    };

    let backendSaved = false;
    try {
      const candidateUpdates = [
        { method: 'put', url: `${API_BASE_URL}/api/profile` }, { method: 'post', url: `${API_BASE_URL}/api/profile` },
        { method: 'put', url: `${API_BASE_URL}/api/user` }, { method: 'post', url: `${API_BASE_URL}/api/user` },
        { method: 'put', url: `${API_BASE_URL}/api/user/profile` },
      ];

      for (const req of candidateUpdates) {
        try {
          const res = req.method === 'put'
            ? await axios.put(req.url, updatePayload, { headers: getAuthHeader() })
            : await axios.post(req.url, updatePayload, { headers: getAuthHeader() });
          if (res && res.data && res.data.success !== false) {
            backendSaved = true; break;
          }
        } catch (err) { /* ignore */ }
      }
    } catch (error) { console.warn('Backend save note:', error.message); }

    setUser(formData);
    localStorage.setItem('user_profile', JSON.stringify(formData));
    localStorage.setItem('auth_user', JSON.stringify(formData));
    setIsEditing(false);

    const msg = backendSaved ? 'Profile updated and saved to server successfully!' : 'Profile details updated locally!';
    setSaveStatus({ message: msg, isError: false });
    toast.success(msg);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setSaveStatus({ message: '', isError: false });

    try {
      const candidateDeletes = [`${API_BASE_URL}/api/profile`, `${API_BASE_URL}/api/user`, `${API_BASE_URL}/api/user/profile`];
      for (const endpoint of candidateDeletes) {
        try {
          await axios.delete(endpoint, { headers: getAuthHeader() });
          break;
        } catch (err) { if (err.response?.status !== 404 && err.response?.status !== 405) break; }
      }
    } catch (error) {
      console.warn('Backend delete note:', error.message);
    } finally {
      localStorage.clear(); sessionStorage.clear();
      window.dispatchEvent(new Event('authChange'));
      setIsDeleting(false); setShowDeleteModal(false);
      toast.warning('Your donor account has been removed.');
      navigate('/sign-up');
    }
  };

  const handleLogout = () => {
    localStorage.clear(); sessionStorage.clear();
    window.dispatchEvent(new Event('authChange'));
    toast.info('You have been logged out safely.');
    navigate('/sign-in');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#fafbfc] text-slate-600 font-bold text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-[#A61818] border-t-transparent animate-spin"></div>
          <span>Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] font-sans pb-20">

      {/* TOP HEADER BAR */}
      <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <h1 className="text-xl font-black text-[#26282C] tracking-tight">
              Donor <span className="text-[#A61818]">Profile</span>
            </h1>
          </div>

          <button
            onClick={() => { setIsEditing(!isEditing); setSaveStatus({ message: '', isError: false }); }}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${isEditing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-red-50 text-[#A61818] hover:bg-[#A61818] hover:text-white'
              }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 mt-4 flex flex-col gap-8">

        {/* NOTIFICATION BANNER */}
        {saveStatus.message && (
          <div className={`p-4 rounded-2xl border text-sm font-bold shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${saveStatus.isError ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{saveStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Profile Identity & Cooldown */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Profile Avatar Card */}
            <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-slate-50 to-white"></div>

              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#3A3D42] to-[#26282C] text-white flex items-center justify-center text-4xl font-black shadow-lg relative z-10 border-4 border-white mb-4">
                {user.bloodGroup || '?'}
              </div>

              <h2 className="text-2xl font-black text-[#26282C] tracking-tight relative z-10">{user.fullName || 'Anonymous User'}</h2>

              <div className="flex flex-col gap-2 mt-4 w-full relative z-10">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium bg-slate-50 py-2 rounded-xl">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span>{user.phoneNumber || 'No phone set'}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium bg-slate-50 py-2 rounded-xl">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="truncate max-w-[200px]">{user.address || 'Location not specified'}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-6 w-full pt-6 border-t border-slate-100 flex justify-center">
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold ${isCurrentlyAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  <div className={`w-2 h-2 rounded-full ${isCurrentlyAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  {isCurrentlyAvailable ? 'Active & Eligible Donor' : `Cooldown Active (${cooldownInfo.daysRemaining}d left)`}
                </span>
              </div>
            </div>

            {/* Premium Dark Cooldown Widget */}
            <div className="bg-[#26282C] text-white p-8 rounded-[32px] shadow-[0_10px_30px_rgba(38,40,44,0.15)] relative overflow-hidden group">
              {/* Background Accent */}
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transition-transform duration-700 group-hover:scale-110">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
              </div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Recovery Status</h3>
                  <div className="text-xl font-bold">60-Day Cooldown</div>
                </div>
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${cooldownInfo.isOnCooldown ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {cooldownInfo.isOnCooldown ? 'Active' : 'Eligible'}
                </span>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-4">
                  <span className="text-slate-400 font-medium text-sm">Last Donated:</span>
                  <span className="font-bold text-white bg-slate-800/50 px-3 py-1 rounded-lg">{user.lastDonationDate || 'No record'}</span>
                </div>

                {cooldownInfo.isOnCooldown ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-300">Progress</span>
                      <span className="text-amber-400">{cooldownInfo.daysPassed} / {COOLDOWN_DAYS} Days</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, (cooldownInfo.daysPassed / COOLDOWN_DAYS) * 100))}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed pt-2">
                      Eligible to donate again on <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded">{cooldownInfo.reactivationDate}</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 font-medium leading-relaxed flex gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Recovery period completed. You are fully eligible to donate blood and save a life today!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button onClick={handleLogout} className="flex-1 py-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-sm transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign Out
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Profile Details & Edit Form */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <div className="mb-8">
                <h3 className="text-[11px] font-black text-[#A61818] uppercase tracking-widest mb-2">Personal Information</h3>
                <h2 className="text-2xl font-black text-[#26282C]">{isEditing ? 'Update Your Details' : 'Profile Overview'}</h2>
              </div>

              {!isEditing ? (
                /* VIEW MODE */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</span>
                      <span className="font-bold text-slate-800">{user.fullName}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</span>
                      <span className="font-bold text-slate-800">{user.phoneNumber}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</span>
                      <span className="font-bold text-slate-800">{user.email || '—'}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                      <span className="block text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Blood Group</span>
                      <span className="font-black text-[#A61818] text-lg">{user.bloodGroup || '—'}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Complete Address</span>
                    <span className="font-bold text-slate-800">{user.address || '—'}</span>
                  </div>
                </div>
              ) : (
                /* EDIT MODE FORM */
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#A61818]/20 focus:border-[#A61818] transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                      <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#A61818]/20 focus:border-[#A61818] transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#A61818]/20 focus:border-[#A61818] transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Group</label>
                      <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#A61818]/20 focus:border-[#A61818] transition-all appearance-none cursor-pointer">
                        <option value="">Select Group</option>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Address / Location</label>
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#A61818]/20 focus:border-[#A61818] transition-all" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Last Donated Date</label>
                      <input type="date" name="lastDonationDate" value={formData.lastDonationDate} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#A61818]/20 focus:border-[#A61818] transition-all cursor-pointer" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-300 text-[#A61818] focus:ring-[#A61818]" />
                      <div>
                        <div className="font-bold text-slate-800 text-sm">Available for Emergency Donations</div>
                        <div className="text-xs text-slate-500 font-medium">Allow people to contact you when they need blood urgently.</div>
                      </div>
                    </label>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Health Clearances (Check if Negative/Safe)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { name: 'hepB', label: 'Hepatitis B' },
                        { name: 'hepC', label: 'Hepatitis C' },
                        { name: 'hiv', label: 'HIV / AIDS' }
                      ].map(test => (
                        <label key={test.name} className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                          <input type="checkbox" name={test.name} checked={formData.healthStatus[test.name] || false} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-300 text-[#A61818] focus:ring-[#A61818]" />
                          <span className="font-bold text-slate-700 text-xs">{test.label} Negative</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button type="submit" className="flex-1 py-4 bg-[#A61818] hover:bg-[#970707] text-white font-bold rounded-full text-sm shadow-md shadow-[#A61818]/20 transition-colors">
                      Save Profile Changes
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-full text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Health Screening Records - View Mode Only */}
            {!isEditing && (
              <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
                <div className="mb-6">
                  <h3 className="text-[11px] font-black text-[#A61818] uppercase tracking-widest mb-2">Medical Verification</h3>
                  <h2 className="text-xl font-black text-[#26282C]">Health Screening Records</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Self-declared medical safety clearances for recipient protection.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Hepatitis B', status: user.healthStatus.hepB },
                    { label: 'Hepatitis C', status: user.healthStatus.hepC },
                    { label: 'HIV / AIDS', status: user.healthStatus.hiv }
                  ].map((test, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-3">
                      <span className="font-bold text-slate-700 text-sm">{test.label} Clearance</span>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold w-fit ${test.status ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {test.status ? (
                          <><svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> Verified Safe</>
                        ) : (
                          <><svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Pending Verification</>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {!isEditing && (
              <div className="flex justify-end mt-2">
                <button onClick={() => setShowDeleteModal(true)} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                  Delete Account Permanently
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Delete Account Modal - Modernized */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl flex flex-col gap-5 border border-slate-100 text-center relative">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors">✕</button>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center font-extrabold mx-auto mb-2">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h3 className="font-black text-[#26282C] text-xl tracking-tight">Delete Account?</h3>
              <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                This action is permanent. It will completely remove your donor record and health clearances from the system.
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={isDeleting} className="flex-1 py-3.5 bg-[#A61818] hover:bg-[#970707] text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-[#A61818]/20">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}