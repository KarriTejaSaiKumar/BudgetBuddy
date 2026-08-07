import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { Alert, Button, Field, Input, Separator } from '@/components/ui';
import AuthShell from '../components/landing/AuthShell';

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
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where your money left off."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-primary transition-colors duration-200 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {error && (
        <Alert variant="error" className="mb-5">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email address or username" required>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              autoComplete="username"
              className="pl-10"
              required
            />
          </div>
        </Field>

        <Field label="Password" required>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between pt-1 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-muted-foreground transition-colors duration-200 hover:text-foreground">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded border-input accent-[var(--color-primary)]"
            />
            Remember me
          </label>
          <a
            href="#forgot"
            onClick={(e) => e.preventDefault()}
            className="font-medium text-primary transition-colors duration-200 hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs uppercase tracking-wide text-muted-foreground">
          or
        </span>
      </div>

      <Button type="button" variant="secondary" size="lg" className="w-full" disabled title="Coming soon">
        <span
          aria-hidden="true"
          className="grid size-4 place-items-center rounded-full border border-current text-[0.6rem] font-bold"
        >
          G
        </span>
        Continue with Google
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">Google sign-in is not enabled yet.</p>
    </AuthShell>
  );
};

export default Login;
