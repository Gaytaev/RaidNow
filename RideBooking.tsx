import { useState, useEffect } from 'react';
import { MapPin, Navigation, DollarSign, Clock, User, Car } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type ServiceType = 'comfort' | 'comfort_plus' | 'business';

interface PricingConfig {
  service_type: ServiceType;
  base_price: number;
  price_per_km: number;
  price_per_minute: number;
  surge_multiplier_low: number;
  surge_multiplier_high: number;
}

export const RideBooking = () => {
  const { user } = useAuth();
  const [serviceType, setServiceType] = useState<ServiceType>('comfort');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [distance, setDistance] = useState(5);
  const [duration, setDuration] = useState(15);
  const [pricing, setPricing] = useState<PricingConfig[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState(15);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPricing();
    loadAvailableDrivers();
  }, []);

  const loadPricing = async () => {
    const { data } = await supabase.from('pricing_config').select('*');
    if (data) setPricing(data);
  };

  const loadAvailableDrivers = async () => {
    const { count } = await supabase
      .from('driver_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true)
      .eq('is_verified', true);

    setAvailableDrivers(count || 0);
  };

  const calculatePrice = () => {
    const config = pricing.find(p => p.service_type === serviceType);
    if (!config) return 0;

    let basePrice = config.base_price + (config.price_per_km * distance) + (config.price_per_minute * duration);

    let surgeMultiplier = 1;
    if (availableDrivers > 20) {
      surgeMultiplier = config.surge_multiplier_low;
    } else if (availableDrivers < 5) {
      surgeMultiplier = config.surge_multiplier_high;
    }

    return Math.round(basePrice * surgeMultiplier);
  };

  const handleBookRide = async () => {
    if (!pickupAddress || !dropoffAddress) {
      alert('Please enter both pickup and dropoff addresses');
      return;
    }

    setLoading(true);
    try {
      const estimatedPrice = calculatePrice();

      const { error } = await supabase.from('rides').insert({
        passenger_id: user?.id,
        service_type: serviceType,
        pickup_address: pickupAddress,
        pickup_lat: 43.3169 + (Math.random() - 0.5) * 0.1,
        pickup_lng: 45.6981 + (Math.random() - 0.5) * 0.1,
        dropoff_address: dropoffAddress,
        dropoff_lat: 43.3169 + (Math.random() - 0.5) * 0.1,
        dropoff_lng: 45.6981 + (Math.random() - 0.5) * 0.1,
        estimated_price: estimatedPrice,
        distance_km: distance,
        duration_minutes: duration,
        payment_method: 'cash',
        status: 'pending',
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPickupAddress('');
        setDropoffAddress('');
      }, 3000);
    } catch (error) {
      console.error('Error booking ride:', error);
      alert('Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const serviceOptions = [
    { type: 'comfort' as ServiceType, name: 'Comfort', icon: Car, description: 'Standard rides' },
    { type: 'comfort_plus' as ServiceType, name: 'Comfort+', icon: Car, description: 'Premium cars' },
    { type: 'business' as ServiceType, name: 'Business', icon: Car, description: 'Luxury vehicles' },
  ];

  const estimatedPrice = calculatePrice();

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-6 h-6 text-white" />
          <h3 className="text-xl font-bold text-white">Book Your Ride</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Available drivers:</span>
                <span className="text-white font-semibold">{availableDrivers}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    availableDrivers > 20 ? 'bg-green-500' : availableDrivers > 10 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((availableDrivers / 30) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {availableDrivers > 20 ? 'Low demand - Lower prices' :
                 availableDrivers > 10 ? 'Normal demand' :
                 'High demand - Higher prices'}
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pickup Location
            </label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="Enter pickup address"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dropoff Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="Enter dropoff address"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select Service
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {serviceOptions.map((option) => {
              const Icon = option.icon;
              const config = pricing.find(p => p.service_type === option.type);
              const price = config ? Math.round((config.base_price + (config.price_per_km * distance) + (config.price_per_minute * duration)) * (availableDrivers > 20 ? config.surge_multiplier_low : availableDrivers < 5 ? config.surge_multiplier_high : 1)) : 0;

              return (
                <button
                  key={option.type}
                  onClick={() => setServiceType(option.type)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    serviceType === option.type
                      ? 'bg-gray-700 border-white'
                      : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <Icon className="w-8 h-8 text-white mb-2" />
                  <h4 className="text-white font-semibold mb-1">{option.name}</h4>
                  <p className="text-gray-400 text-xs mb-2">{option.description}</p>
                  <p className="text-white font-bold">{price} ₽</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Distance:</span>
            <span className="text-white font-semibold">{distance} km</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Duration:</span>
            <span className="text-white font-semibold">{duration} min</span>
          </div>
          <div className="border-t border-gray-700 my-3"></div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">Estimated Price:</span>
            <span className="text-white text-2xl font-bold">{estimatedPrice} ₽</span>
          </div>
        </div>

        {success && (
          <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-4">
            Ride booked successfully! Looking for a driver...
          </div>
        )}

        <button
          onClick={handleBookRide}
          disabled={loading || !pickupAddress || !dropoffAddress}
          className="w-full bg-white text-gray-900 py-4 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? 'Booking...' : 'Book Ride'}
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <h4 className="text-white font-semibold mb-4">Map View</h4>
        <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center border border-gray-600">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">Interactive map view</p>
            <p className="text-gray-500 text-sm">Grozny, Chechen Republic</p>
          </div>
        </div>
      </div>
    </div>
  );
};
