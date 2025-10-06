import { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Check, X } from 'lucide-react';
import { supabase, Ride, DriverProfile } from '../../lib/supabase';

interface ActiveRidesProps {
  driverProfile: DriverProfile;
  onUpdate: () => void;
}

export const ActiveRides = ({ driverProfile, onUpdate }: ActiveRidesProps) => {
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [isAvailable, setIsAvailable] = useState(driverProfile.is_available);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRides();
    const interval = setInterval(loadRides, 5000);
    return () => clearInterval(interval);
  }, [driverProfile.id]);

  const loadRides = async () => {
    const { data: available } = await supabase
      .from('rides')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: my } = await supabase
      .from('rides')
      .select('*')
      .eq('driver_id', driverProfile.id)
      .in('status', ['accepted', 'in_progress'])
      .order('created_at', { ascending: false });

    if (available) setAvailableRides(available);
    if (my) setMyRides(my);
  };

  const toggleAvailability = async () => {
    setLoading(true);
    try {
      const newStatus = !isAvailable;
      const { error } = await supabase
        .from('driver_profiles')
        .update({ is_available: newStatus })
        .eq('id', driverProfile.id);

      if (error) throw error;

      setIsAvailable(newStatus);
      onUpdate();
    } catch (error) {
      console.error('Error toggling availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptRide = async (rideId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('rides')
        .update({
          driver_id: driverProfile.id,
          status: 'accepted',
        })
        .eq('id', rideId)
        .eq('status', 'pending');

      if (error) throw error;

      await loadRides();
    } catch (error) {
      console.error('Error accepting ride:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRide = async (rideId: string) => {
    const { error } = await supabase
      .from('rides')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('id', rideId);

    if (!error) await loadRides();
  };

  const completeRide = async (rideId: string) => {
    const { error } = await supabase
      .from('rides')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        payment_status: 'completed',
      })
      .eq('id', rideId);

    if (!error) {
      await supabase
        .from('driver_profiles')
        .update({
          total_rides: driverProfile.total_rides + 1,
        })
        .eq('id', driverProfile.id);

      await loadRides();
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold mb-1">Availability Status</h3>
            <p className="text-gray-400 text-sm">
              {isAvailable ? 'You are online and receiving ride requests' : 'You are offline'}
            </p>
          </div>
          <button
            onClick={toggleAvailability}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isAvailable
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isAvailable ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {myRides.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Your Active Rides</h3>
          <div className="space-y-3">
            {myRides.map((ride) => (
              <div key={ride.id} className="bg-gray-900 rounded-lg p-4 border border-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-blue-900/50 text-blue-200 border border-blue-700 rounded-full text-sm font-medium">
                    {ride.status === 'accepted' ? 'Accepted' : 'In Progress'}
                  </span>
                  <span className="text-white font-bold">{ride.estimated_price} ₽</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{ride.pickup_address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{ride.dropoff_address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{ride.distance_km} km • {ride.duration_minutes} min</span>
                </div>

                <div className="flex gap-2">
                  {ride.status === 'accepted' && (
                    <button
                      onClick={() => startRide(ride.id)}
                      className="flex-1 bg-white text-gray-900 py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Start Ride
                    </button>
                  )}
                  {ride.status === 'in_progress' && (
                    <button
                      onClick={() => completeRide(ride.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Complete Ride
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAvailable && myRides.length === 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Available Rides</h3>
          {availableRides.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
              <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No rides available</h3>
              <p className="text-gray-400">Waiting for ride requests...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableRides.map((ride) => (
                <div key={ride.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-yellow-900/50 text-yellow-200 border border-yellow-700 rounded-full text-sm font-medium">
                      New Request
                    </span>
                    <span className="text-white font-bold">{ride.estimated_price} ₽</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{ride.pickup_address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{ride.dropoff_address}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{ride.distance_km} km • {ride.duration_minutes} min</span>
                  </div>

                  <button
                    onClick={() => acceptRide(ride.id)}
                    disabled={loading}
                    className="w-full bg-white text-gray-900 py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    Accept Ride
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isAvailable && (
        <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">You are offline</h3>
          <p className="text-gray-400">Go online to start receiving ride requests</p>
        </div>
      )}
    </div>
  );
};
