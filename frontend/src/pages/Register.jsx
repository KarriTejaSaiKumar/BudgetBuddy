import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Rocket } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0B0B0B] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Space Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-[#181818] border border-[#262626] rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 text-white flex items-center justify-center font-extrabold mx-auto shadow-lg shadow-orange-500/20">
            <Rocket className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-xs text-slate-400">Join the mission to financial telemetry and management.</p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Username / Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="commander_astro"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B0B0B] border border-[#262626] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B0B0B] border border-[#262626] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0B0B0B] border border-[#262626] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0B0B0B] border border-[#262626] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <PrimaryButton
              type="submit"
              disabled={loading}
              className="w-full py-3"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </PrimaryButton>
          </div>
        </form>

        {/* Footer Redirect Link */}
        <div className="text-center pt-2 border-t border-[#262626] text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-400 hover:underline font-bold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
