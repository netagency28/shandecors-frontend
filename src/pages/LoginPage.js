import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          navigate('/');
        }
      } else {
        const result = await signUp(email, password, name);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Account created! Please check your email to verify your account.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await resetPassword(email);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Password reset link sent! Please check your email.');
        setShowForgotPassword(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1758983304673-5a2d091e43e2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcnRpc3RpYyUyMGxhbXAlMjB3YXJtJTIwbGlnaHR8ZW58MHx8fHwxNzcxNTExNjk0fDA&ixlib=rb-4.1.0&q=85"
          alt="Home decor"
          className="w-full h-full object-cover img-warm"
        />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute bottom-12 left-12 right-12">
          <Link to="/" className="font-display text-4xl text-white">
            Shan Decor
          </Link>
          <p className="mt-4 text-white/80 max-w-md">
            Discover thoughtfully curated home decor pieces that transform your space into a sanctuary.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Link to="/" className="font-display text-2xl">
              Lumière
            </Link>
          </div>

          <h1 className="font-display text-3xl md:text-4xl mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isLogin 
              ? 'Sign in to access your account and orders'
              : 'Join us to start your home decor journey'
            }
          </p>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-sm" data-testid="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 text-green-600 text-sm rounded-sm" data-testid="success-message">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                  Full Name
                </Label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-10 rounded-none"
                    data-testid="name-input"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                Email Address
              </Label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="pl-10 rounded-none"
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pl-10 rounded-none"
                  data-testid="password-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 px-8 py-6 uppercase tracking-widest text-xs font-bold group"
              data-testid="submit-btn"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>

          {/* Forgot Password */}
          {isLogin && !showForgotPassword && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Forgot Password Form */}
          {showForgotPassword && (
            <form onSubmit={handleForgotPassword} className="mt-6 space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium">Reset Password</h3>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <div>
                <Label htmlFor="reset-email" className="text-sm font-medium mb-2 block">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="pl-10 rounded-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="flex-1 rounded-none bg-foreground text-background hover:bg-foreground/90"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="rounded-none"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setShowForgotPassword(false);
                setError('');
                setSuccess('');
              }}
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
              data-testid="toggle-auth-mode"
            >
              {isLogin 
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'
              }
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              Continue as guest
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
