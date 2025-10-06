import { useState } from 'react';
import { MapPin, CreditCard, Clock, User, Shield, LifeBuoy, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RideBooking } from './RideBooking';
import { RideHistory } from './RideHistory';
import { PaymentMethods } from './PaymentMethods';
import { EmergencyContacts } from './EmergencyContacts';
import { SupportTickets } from './SupportTickets';
import { ProfileSettings } from './ProfileSettings';

type Tab = 'booking' | 'history' | 'payment' | 'emergency' | 'support' | 'profile';

export const PassengerDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('booking');
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
              <p className="text-gray-400 text-sm">{profile?.phone}</p>
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
          <div className="flex overflow-x-auto border-b border-gray-700">
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'booking'
                  ? 'bg-gray-700 text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span>Book Ride</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-gray-700 text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>History</span>
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'payment'
                  ? 'bg-gray-700 text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Payment</span>
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'emergency'
                  ? 'bg-gray-700 text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Emergency</span>
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'support'
                  ? 'bg-gray-700 text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <LifeBuoy className="w-5 h-5" />
              <span>Support</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-gray-700 text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'booking' && <RideBooking />}
            {activeTab === 'history' && <RideHistory />}
            {activeTab === 'payment' && <PaymentMethods />}
            {activeTab === 'emergency' && <EmergencyContacts />}
            {activeTab === 'support' && <SupportTickets />}
            {activeTab === 'profile' && <ProfileSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};
