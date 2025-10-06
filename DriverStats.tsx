import { useState, useEffect } from 'react';
import { TrendingUp, Star, DollarSign, Clock } from 'lucide-react';
import { supabase, DriverProfile } from '../../lib/supabase';

interface DriverStatsProps {
  driverProfile: DriverProfile;
}

export const DriverStats = ({ driverProfile }: DriverStatsProps) => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedRides: 0,
    averageRating: 0,
    todayRides: 0,
  });

  useEffect(() => {
    loadStats();
  }, [driverProfile.id]);

  const loadStats = async () => {
    const { data: completedRides } = await supabase
      .from('rides')
      .select('*')
      .eq('driver_id', driverProfile.id)
      .eq('status', 'completed');

    const totalEarnings = completedRides?.reduce((sum, ride) => sum + (ride.final_price || ride.estimated_price), 0) || 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRides = completedRides?.filter(ride => new Date(ride.completed_at || ride.created_at) >= today).length || 0;

    const ratings = completedRides?.filter(ride => ride.driver_rating).map(ride => ride.driver_rating!) || [];
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    setStats({
      totalEarnings,
      completedRides: completedRides?.length || 0,
      averageRating,
      todayRides,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Your Statistics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold text-white">{stats.totalEarnings.toLocaleString()} ₽</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Completed Rides</p>
              <p className="text-2xl font-bold text-white">{stats.completedRides}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-yellow-900/50 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Average Rating</p>
              <p className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Today's Rides</p>
              <p className="text-2xl font-bold text-white">{stats.todayRides}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h4 className="text-white font-semibold mb-4">Driver Information</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Status</span>
            <span className={`font-medium ${driverProfile.is_available ? 'text-green-400' : 'text-gray-400'}`}>
              {driverProfile.is_available ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Vehicle</span>
            <span className="text-white font-medium">
              {driverProfile.vehicle_make} {driverProfile.vehicle_model}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">License Plate</span>
            <span className="text-white font-mono">{driverProfile.vehicle_plate}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-400">Verification Status</span>
            <span className="px-3 py-1 bg-green-900/50 text-green-200 border border-green-700 rounded-full text-xs font-medium">
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
