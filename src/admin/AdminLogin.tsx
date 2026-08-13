import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.');
      } else {
        setError('Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-deep flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-sage-soft p-10 shadow-2xl border border-gold-burnished/20">
        <div className="text-center mb-10">
          <img src="./VIOS_LOGO.jpeg" alt="Vios Logo" className="w-20 h-20 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-emerald-deep">Admin Login</h1>
          <p className="text-emerald-deep/50 text-sm mt-2">Sign in to manage website content</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-emerald-deep/10 p-4 text-sm focus:border-gold-burnished outline-none transition-colors"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-emerald-deep/10 p-4 text-sm focus:border-gold-burnished outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-deep text-sage-soft py-4 text-xs uppercase tracking-widest font-bold hover:bg-gold-burnished hover:text-emerald-deep transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[10px] text-emerald-deep/30 mt-8 uppercase tracking-widest">
          Vios Growth Academy
        </p>
      </div>
    </div>
  );
}
