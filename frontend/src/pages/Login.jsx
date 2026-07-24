import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Rocket } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          setError(err.response.data.detail);
        } else if (err.response.data.error) {
          setError(err.response.data.error);
        } else if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else {
          setError(JSON.stringify(err.response.data));
        }
      } else {
        setError('Failed to log in. Please verify your credentials and network connection.');
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-400">Enter your credentials to access your financial telemetry.</p>
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
          {/* Email or Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address or Username *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com or username"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B0B0B] border border-[#262626] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                required
              />
            </div>
          </div>

          {/* Password Input with Visibility Toggle */}
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

          {/* Options: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-[#0B0B0B] border-[#262626] text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
              />
              <span>Remember Me</span>
            </label>

            <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-orange-400 hover:underline font-semibold">
              Forgot Password?
            </a>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <PrimaryButton
              type="submit"
              disabled={loading}
              className="w-full py-3"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </PrimaryButton>
          </div>
        </form>

        {/* Footer Redirect Link */}
        <div className="text-center pt-2 border-t border-[#262626] text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-orange-400 hover:underline font-bold">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
