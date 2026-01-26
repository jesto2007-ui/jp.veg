import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, User, Phone, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type AuthMode = 'signin' | 'signup' | 'forgot';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword, loading: authLoading } = useAuthContext();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = signInSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = signUpSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.phone
      );

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Account created successfully! Welcome!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.email) {
        toast.error('Please enter your email address');
        return;
      }

      const { error } = await resetPassword(formData.email);
      
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Password reset link sent to your email!');
      setMode('signin');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back to Home */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="bg-card rounded-2xl shadow-card p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-fresh flex items-center justify-center">
              <Leaf className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">JP.Vegetables</h1>
              <p className="text-sm text-muted-foreground">& Fruits</p>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            {mode === 'signin' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            {mode === 'signin' && 'Sign in to continue shopping'}
            {mode === 'signup' && 'Join us for fresh groceries'}
            {mode === 'forgot' && 'Enter your email to reset password'}
          </p>

          {/* Form */}
          <form onSubmit={
            mode === 'signin' ? handleSignIn : 
            mode === 'signup' ? handleSignUp : 
            handleForgotPassword
          }>
            <div className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                        className="h-12 pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        className="h-12 pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="h-12 pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      className="h-12 pl-10 pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signin' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-fresh text-base"
              >
                {loading ? 'Please wait...' : 
                  mode === 'signin' ? 'Sign In' :
                  mode === 'signup' ? 'Create Account' :
                  'Send Reset Link'
                }
              </Button>
            </div>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            {mode === 'signin' && (
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary font-medium hover:underline"
                >
                  Sign Up
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-primary font-medium hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <p className="text-muted-foreground">
                Remember your password?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-primary font-medium hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
