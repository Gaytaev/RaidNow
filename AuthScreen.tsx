import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Car, Shield, Clock, CreditCard } from 'lucide-react';

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
      } else {
        if (!formData.fullName || !formData.phone) {
          throw new Error('Please fill in all fields');
        }
        await signUp(formData.email, formData.password, formData.fullName, formData.phone, role);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Car className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">RideNow</h1>
              <p className="text-gray-400">Your reliable taxi service in Grozny</p>
            </div>

            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    isLogin
                      ? 'bg-white text-gray-900'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    !isLogin
                      ? 'bg-white text-gray-900'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {!isLogin && (
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setRole('passenger')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      role === 'passenger'
                        ? 'bg-gray-700 text-white border-2 border-white'
                        : 'bg-gray-700 text-gray-400 border-2 border-gray-600'
                    }`}
                  >
                    Passenger
                  </button>
                  <button
                    onClick={() => setRole('driver')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      role === 'driver'
                        ? 'bg-gray-700 text-white border-2 border-white'
                        : 'bg-gray-700 text-gray-400 border-2 border-gray-600'
                    }`}
                  >
                    Driver
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                        placeholder="Enter your full name"
                        required={!isLogin}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                        placeholder="+7 (XXX) XXX-XX-XX"
                        required={!isLogin}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
                </button>
              </form>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <Shield className="w-8 h-8 text-white mb-2" />
                <h3 className="text-white font-semibold mb-1">Safe</h3>
                <p className="text-gray-400 text-sm">Verified drivers</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <Clock className="w-8 h-8 text-white mb-2" />
                <h3 className="text-white font-semibold mb-1">Fast</h3>
                <p className="text-gray-400 text-sm">Quick pickup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
