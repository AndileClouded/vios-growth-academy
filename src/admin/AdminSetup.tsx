import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Loader2, CheckCircle, Copy } from 'lucide-react';

export default function AdminSetup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) {
        navigate('/admin/login');
        return;
      }
      setCurrentUser(u);
    });
    return unsub;
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setCreated({ email, password });
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak (min 6 characters)');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  const copyCredentials = () => {
    if (!created) return;
    const text = `Email: ${created.email}\nPassword: ${created.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-sage-soft">
      <header className="bg-emerald-deep text-sage-soft px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="./VIOS_LOGO.jpeg" alt="Logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="font-serif text-lg">Create Client Account</h1>
            <p className="text-[10px] text-sage-soft/50 uppercase tracking-widest">{currentUser?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="text-[10px] uppercase tracking-widest border border-sage-soft/20 px-4 py-2 hover:bg-sage-soft hover:text-emerald-deep transition-all"
          >
            Dashboard
          </button>
          <button
            onClick={handleSignOut}
            className="text-[10px] uppercase tracking-widest text-sage-soft/50 hover:text-sage-soft"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-16">
        {created ? (
          <div className="bg-white border border-emerald-deep/5 p-10 text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-serif text-emerald-deep">Account Created</h2>
            <p className="text-emerald-deep/60 text-sm">
              Share these credentials with the client. They can change their password after first login.
            </p>

            <div className="bg-sage-soft p-6 space-y-3 text-left">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold">Email</span>
                <p className="text-emerald-deep font-mono text-sm break-all">{created.email}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold">Password</span>
                <p className="text-emerald-deep font-mono text-sm break-all">{created.password}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold">Login URL</span>
                <p className="text-emerald-deep font-mono text-sm break-all">{window.location.origin}/admin/login</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={copyCredentials}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-deep text-sage-soft py-3 text-xs uppercase tracking-widest font-bold hover:bg-gold-burnished hover:text-emerald-deep transition-all"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied!' : 'Copy Credentials'}
              </button>
              <button
                onClick={() => setCreated(null)}
                className="flex-1 border border-emerald-deep/20 text-emerald-deep py-3 text-xs uppercase tracking-widest hover:bg-emerald-deep hover:text-sage-soft transition-all"
              >
                Create Another
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-emerald-deep/5 p-10">
            <h1 className="text-2xl font-serif text-emerald-deep mb-2">Create Client Account</h1>
            <p className="text-emerald-deep/50 text-sm mb-8">
              Create a new account so your client can log in and edit website content.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold mb-2">Client Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-sage-soft border border-emerald-deep/10 p-4 text-sm outline-none focus:border-gold-burnished transition-colors"
                  placeholder="client@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-sage-soft border border-emerald-deep/10 p-4 text-sm outline-none focus:border-gold-burnished transition-colors"
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-emerald-deep/40 font-bold mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-sage-soft border border-emerald-deep/10 p-4 text-sm outline-none focus:border-gold-burnished transition-colors"
                  placeholder="Repeat password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-deep text-sage-soft py-4 text-xs uppercase tracking-widest font-bold hover:bg-gold-burnished hover:text-emerald-deep transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-[10px] text-emerald-deep/30 mt-8 uppercase tracking-widest">
          Only create accounts for trusted clients
        </p>
      </div>
    </div>
  );
}
