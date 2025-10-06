import { useState } from 'react';
import { Car, Save } from 'lucide-react';
import { supabase, DriverProfile } from '../../lib/supabase';

interface DriverSettingsProps {
  driverProfile: DriverProfile;
  onUpdate: () => void;
}

export const DriverSettings = ({ driverProfile, onUpdate }: DriverSettingsProps) => {
  const [formData, setFormData] = useState({
    vehicle_make: driverProfile.vehicle_make,
    vehicle_model: driverProfile.vehicle_model,
    vehicle_year: driverProfile.vehicle_year,
    vehicle_color: driverProfile.vehicle_color,
    vehicle_plate: driverProfile.vehicle_plate,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('driver_profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverProfile.id);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onUpdate();
    } catch (error) {
      console.error('Error updating driver profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Driver Settings</h3>

      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Car className="w-5 h-5" />
          Vehicle Information
        </h4>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Make
              </label>
              <input
                type="text"
                value={formData.vehicle_make}
                onChange={(e) => setFormData({ ...formData, vehicle_make: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model
              </label>
              <input
                type="text"
                value={formData.vehicle_model}
                onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year
              </label>
              <input
                type="number"
                value={formData.vehicle_year}
                onChange={(e) => setFormData({ ...formData, vehicle_year: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <input
                type="text"
                value={formData.vehicle_color}
                onChange={(e) => setFormData({ ...formData, vehicle_color: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                License Plate
              </label>
              <input
                type="text"
                value={formData.vehicle_plate}
                onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg">
              Profile updated successfully!
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h4 className="text-white font-semibold mb-4">License Information</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">License Number</span>
            <span className="text-white font-mono">{driverProfile.license_number}</span>
          </div>
          <p className="text-gray-500 text-sm">
            Contact support to update your license information
          </p>
        </div>
      </div>
    </div>
  );
};
