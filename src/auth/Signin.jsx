import React, { useState } from 'react';
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
    <div className="min-h-screen w-full bg-slate-50/70 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Background Glow Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#e63946]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 relative z-10 flex flex-col gap-6">
        
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="relative flex items-center justify-center w-10 h-11 rounded-t-full rounded-b-[50%] bg-gradient-to-b from-[#e63946] to-[#c1121f] shadow-md shadow-red-500/25">
            <div className="w-3 h-3 bg-white/40 rounded-full mb-2"></div>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1d3557] tracking-tight">
            Welcome to Life <span className="text-[#e63946]">Stream</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            Sign in with your phone number & password
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200/80 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
            <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Phone Number Field */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700">Phone Number</label>
            <div className="flex gap-2">
              <span className="flex items-center justify-center px-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-extrabold text-xs gap-1">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <span>+92</span>
              </span>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="300 1234567"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946] transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.046 10.046 0 013.682-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"/></svg>
                ) : (
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-slate-300 text-[#e63946] focus:ring-[#e63946]"
              />
              <span>Remember me</span>
            </label>
            <Link to="/sign-up" className="text-[#e63946] hover:underline font-bold">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 bg-[#e63946] hover:bg-[#d62828] text-white font-extrabold rounded-xl text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>LOGGING IN...</span>
              </>
            ) : (
              'LOG IN TO ACCOUNT'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-600 font-semibold pt-2 border-t border-slate-100">
          Don't have an account yet?{' '}
          <Link to="/sign-up" className="text-[#e63946] font-extrabold hover:underline">
            Register as Donor
          </Link>
        </div>

      </div>
    </div>
  );
}
