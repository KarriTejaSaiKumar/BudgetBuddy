import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PrimaryButton from '../components/PrimaryButton';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Rocket, Sun, Moon, ArrowRight } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match. Please verify your entries.');
    }

    setLoading(true);

    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'object') {
          const firstKey = Object.keys(err.response.data)[0];
          const val = err.response.data[firstKey];
          setError(`${firstKey}: ${Array.isArray(val) ? val.join(' ') : val}`);
        } else {
          setError(String(err.response.data));
        }
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#0B0B0B] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Header Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl border transition-all duration-200 ${
            isDark 
              ? 'bg-[#181818] border-[#262626] text-amber-400 hover:border-amber-400/50 hover:bg-[#202020]' 
              : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100'
          }`}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Authentication Card */}
      <div className={`w-full max-w-md rounded-2xl p-8 border shadow-2xl relative z-10 space-y-6 transition-all duration-300 ${
        isDark ? 'bg-[#181818] border-[#262626] shadow-orange-500/5' : 'bg-white border-slate-200 shadow-slate-200'
      }`}>
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-extrabold mx-auto shadow-lg shadow-orange-500/25">
            <Rocket className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Create Your Account</h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Track your income, expenses, budgets, and financial health in one place.
          </p>
        </div>

        {/* Reusable Error Alert Banner */}
        {error && (
          <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name / Username Input */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Full Name or Username *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="commander_astro"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 ${
                  isDark 
                    ? 'bg-[#0B0B0B] border-[#262626] text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                required
                aria-label="Full Name or Username"
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 ${
                  isDark 
                    ? 'bg-[#0B0B0B] border-[#262626] text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                required
                aria-label="Email Address"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 ${
                  isDark 
                    ? 'bg-[#0B0B0B] border-[#262626] text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                required
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 ${
                  isDark 
                    ? 'bg-[#0B0B0B] border-[#262626] text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                required
                aria-label="Confirm Password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition cursor-pointer"
                title={showConfirmPassword ? "Hide password" : "Show password"}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Action Button (NASA Orange) */}
          <div className="pt-2">
            <PrimaryButton
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold shadow-lg shadow-orange-500/20"
              icon={ArrowRight}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </PrimaryButton>
          </div>
        </form>

        {/* Footer Navigation Link */}
        <div className={`text-center pt-3 border-t text-xs ${
          isDark ? 'border-[#262626] text-slate-400' : 'border-slate-200 text-slate-600'
        }`}>
          Already have an account?{' '}
          <Link to="/login" className="text-orange-500 hover:underline font-bold transition">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

