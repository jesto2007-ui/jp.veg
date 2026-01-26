import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface AdminAuthProps {
  onSuccess: () => void;
}

export const AdminAuth = ({ onSuccess }: AdminAuthProps) => {
  const { signIn, user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error('Invalid credentials');
        return;
      }

      // Re-check admin status after login
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store
          </Button>
        </Link>

        <div className="bg-card rounded-2xl shadow-card p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-fresh flex items-center justify-center">
              <Leaf className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">JP.Vegetables & Fruits</p>
            </div>
          </div>

          {user ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You are logged in but don't have admin access.
              </p>
              <p className="text-sm text-muted-foreground">
                Please contact the shop owner to get admin privileges.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground text-center mb-2">
                Admin Login
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                Sign in with your admin account
              </p>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className="h-12 pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-fresh text-base"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
