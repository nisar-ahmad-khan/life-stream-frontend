import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../creds/api';
import { toast } from '../components/Toast';

export default function Signin() {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
    rememberMe: true,
  });

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError('');
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const rawPhone = formData.phoneNumber.trim();
    const formattedPhone = rawPhone.startsWith('+')
      ? rawPhone
      : '+92' + rawPhone.replace(/^0+/, '');

    const payload = {
      phoneNumber: formattedPhone,
      phone_number: formattedPhone,
      phone: formattedPhone,
      password: formData.password
    };

    const candidateEndpoints = [
      `${API_BASE_URL}/api/login`,
      `${API_BASE_URL}/login`,
      `/api/login`,
      `/login`
    ];

    try {
      let response = null;
      let lastErr = null;

      for (const url of candidateEndpoints) {
        try {
          response = await axios.post(url, payload, {
            headers: { 'Accept': 'application/json' }
          });
          if (response && response.data) break;
        } catch (err) {
          lastErr = err;
          if (err.response?.status !== 404 && err.response?.status !== 405) {
            throw err;
          }
        }
      }

      if (!response && lastErr) {
        throw lastErr;
      }

      const data = response?.data || {};
      const token = data.token || data.access_token || data.data?.token;
      const userObj = data.user || data.data?.user || data.data;

      if (data.success !== false && (token || data.status === 'success' || userObj)) {
        // Clear all previous local & session storage
        localStorage.clear();
        sessionStorage.clear();

        const storage = formData.rememberMe ? localStorage : sessionStorage;

        if (token) {
          storage.setItem('auth_token', token);
          localStorage.setItem('auth_token', token);
        }

        const formattedUser = {
          id: userObj?.id || 1,
          fullName: userObj?.name || userObj?.fullName || userObj?.full_name || 'Donor',
          phoneNumber: userObj?.phone_number || userObj?.phoneNumber || userObj?.phone || formattedPhone,
          email: userObj?.email || '',
          bloodGroup: userObj?.blood_group || userObj?.bloodGroup || 'O+',
          address: userObj?.address || 'Location not specified',
          lastDonationDate:
            typeof (userObj?.last_donation_date || userObj?.lastDonationDate) === 'string' &&
              (userObj?.last_donation_date || userObj?.lastDonationDate).includes('T')
              ? (userObj?.last_donation_date || userObj?.lastDonationDate).split('T')[0]
              : userObj?.last_donation_date || userObj?.lastDonationDate || '',
          isAvailable: userObj?.is_available ?? userObj?.isAvailable ?? true,
          healthStatus: {
            hepB: Boolean(userObj?.healthStatus?.hepB ?? userObj?.hep_b ?? userObj?.hepB ?? true),
            hepC: Boolean(userObj?.healthStatus?.hepC ?? userObj?.hep_c ?? userObj?.hepC ?? true),
            hiv: Boolean(userObj?.healthStatus?.hiv ?? userObj?.hiv ?? true),
          }
        };

        storage.setItem('auth_user', JSON.stringify(formattedUser));
        localStorage.setItem('user_profile', JSON.stringify(formattedUser));
        localStorage.setItem('auth_user', JSON.stringify(formattedUser));

        // Notify app components (e.g. Header) of auth change
        window.dispatchEvent(new Event('authChange'));

        toast.success(`Welcome back, ${formattedUser.fullName}!`, 'Login Successful');
        navigate('/');
      } else {
        const msg = data.message || 'Login failed. Please verify your credentials.';
        setError(msg);
        toast.error(msg, 'Authentication Error');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data?.errors;
      let finalMsg = '';
      if (typeof serverMsg === 'object') {
        finalMsg = Object.values(serverMsg).flat().join(' ');
      } else {
        finalMsg = serverMsg || 'Login failed. Please check your credentials or backend connection.';
      }
      setError(finalMsg);
      toast.error(finalMsg, 'Login Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fafbfc] flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden">

      {/* Background Glow Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#A61818]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#26282C]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 relative z-10 flex flex-col gap-8">

        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative flex items-center justify-center w-12 h-14 rounded-t-full rounded-b-[50%] bg-gradient-to-b from-[#A61818] to-[#970707] shadow-lg shadow-[#A61818]/20 transition-transform duration-300 hover:scale-105">
            <div className="w-3.5 h-3.5 bg-white/40 rounded-full mb-3"></div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#26282C] tracking-tight mt-2">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Sign in to manage your donor profile
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Phone Number Field */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
            <div className="flex gap-2">
              <span className="flex items-center justify-center px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-extrabold text-sm gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>+92</span>
              </span>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="300 1234567"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#A61818]/20 focus:border-[#A61818] transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#A61818]/20 focus:border-[#A61818] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center justify-center"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.046 10.046 0 013.682-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500 font-medium px-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-slate-300 text-[#A61818] focus:ring-[#A61818] transition-colors cursor-pointer"
              />
              <span className="group-hover:text-slate-800 transition-colors">Remember me</span>
            </label>
            <Link to="/sign-up" className="text-[#A61818] hover:text-[#970707] font-bold transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-4 bg-[#A61818] hover:bg-[#970707] text-white font-black rounded-full text-sm shadow-[0_4px_14px_0_rgba(166,24,24,0.39)] transition-all cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              'SIGN IN TO DASHBOARD'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 font-medium pt-6 border-t border-slate-100">
          Don't have an account yet?{' '}
          <Link to="/sign-up" className="text-[#A61818] hover:text-[#970707] font-black transition-colors ml-1">
            Register as a Donor
          </Link>
        </div>

      </div>
    </div>
  );
}