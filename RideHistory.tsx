import { useState, useEffect } from 'react';
import { Clock, MapPin, Car, Star } from 'lucide-react';
import { supabase, Ride } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const RideHistory = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('passenger_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRides(data || []);
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900/50 text-green-200 border-green-700';
      case 'in_progress': return 'bg-blue-900/50 text-blue-200 border-blue-700';
      case 'pending': return 'bg-yellow-900/50 text-yellow-200 border-yellow-700';
      case 'cancelled': return 'bg-red-900/50 text-red-200 border-red-700';
      default: return 'bg-gray-700 text-gray-200 border-gray-600';
    }
  };

  const getServiceName = (type: string) => {
    switch (type) {
      case 'comfort': return 'Comfort';
      case 'comfort_plus': return 'Comfort+';
      case 'business': return 'Business';
      default: return type;
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400 py-8">Loading rides...</div>;
  }

  if (rides.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No rides yet</h3>
        <p className="text-gray-400">Your ride history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Ride History</h3>
      {rides.map((ride) => (
        <div key={ride.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold">{getServiceName(ride.service_type)}</h4>
                <p className="text-gray-400 text-sm">{new Date(ride.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ride.status)}`}>
              {ride.status}
            </span>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
              <span className="text-gray-300 text-sm">{ride.pickup_address}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
              <span className="text-gray-300 text-sm">{ride.dropoff_address}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">{ride.distance_km} km</span>
              <span className="text-gray-400">{ride.duration_minutes} min</span>
            </div>
            <span className="text-white font-bold">{ride.final_price || ride.estimated_price} ₽</span>
          </div>

          {ride.driver_rating && (
            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-800">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-gray-300 text-sm">You rated: {ride.driver_rating}/5</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
