import { useState, useEffect } from 'react';
import { Car, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, DriverProfile } from '../../lib/supabase';
import { DriverRegistration } from './DriverRegistration';
import { ActiveRides } from './ActiveRides';
import { DriverStats } from './DriverStats';
import { DriverSettings } from './DriverSettings';

type Tab = 'rides' | 'stats' | 'settings';

export const DriverDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('rides');
  const { profile, signOut, user } = useAuth();
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDriverProfile();
  }, []);

  const loadDriverProfile = async () => {
    try {
      const { data } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      setDriverProfile(data);
    } catch (error) {
      console.error('Error loading driver profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileCreated = () => {
    loadDriverProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!driverProfile) {
    return <DriverRegistration onComplete={handleProfileCreated} />;
  }

  if (!driverProfile.is_verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <Car className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Verification Pending</h2>
              <p className="text-gray-400 mb-6">
                Your driver profile is under review. You will be notified once your account is verified.
                This process typically takes 24-48 hours.
              </p>
              <button
                onClick={handleSignOut}
                className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile?.full_name}</h2>
              <p className="text-gray-400 text-sm">
                {driverProfile.vehicle_make} {driverProfile.vehicle_model} • {driverProfile.vehicle_plate}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('rides')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'rides'
                  ? 'bg-gray-700 text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <Car className="w-5 h-5" />
              <span>Active Rides</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-gray-700 text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Statistics</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-gray-700 text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'rides' && <ActiveRides driverProfile={driverProfile} onUpdate={loadDriverProfile} />}
            {activeTab === 'stats' && <DriverStats driverProfile={driverProfile} />}
            {activeTab === 'settings' && <DriverSettings driverProfile={driverProfile} onUpdate={loadDriverProfile} />}
          </div>
        </div>
      </div>
    </div>
  );
};
