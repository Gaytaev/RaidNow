import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Phone, AlertCircle } from 'lucide-react';
import { supabase, EmergencyContact } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const EmergencyContacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const { data } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setContacts(data);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.phone || !formData.relationship) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('emergency_contacts').insert({
        user_id: user?.id,
        ...formData,
      });

      if (error) throw error;

      await loadContacts();
      setShowAddForm(false);
      setFormData({ name: '', phone: '', relationship: '' });
    } catch (error) {
      console.error('Error adding contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this emergency contact?')) return;

    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadContacts();
    }
  };

  const handleEmergencyCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-red-200 font-semibold mb-1">Emergency Services</h4>
            <p className="text-red-300 text-sm mb-3">
              In case of emergency, you can quickly contact these numbers
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleEmergencyCall('112')}
                className="w-full flex items-center justify-between bg-red-900/50 hover:bg-red-900 text-red-100 px-4 py-3 rounded-lg transition-colors"
              >
                <span className="font-semibold">Emergency Services</span>
                <span className="font-mono">112</span>
              </button>
              <button
                onClick={() => handleEmergencyCall('102')}
                className="w-full flex items-center justify-between bg-red-900/50 hover:bg-red-900 text-red-100 px-4 py-3 rounded-lg transition-colors"
              >
                <span className="font-semibold">Police</span>
                <span className="font-mono">102</span>
              </button>
              <button
                onClick={() => handleEmergencyCall('103')}
                className="w-full flex items-center justify-between bg-red-900/50 hover:bg-red-900 text-red-100 px-4 py-3 rounded-lg transition-colors"
              >
                <span className="font-semibold">Ambulance</span>
                <span className="font-mono">103</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Personal Emergency Contacts</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Contact</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h4 className="text-white font-semibold mb-4">Add Emergency Contact</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="Contact name"
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Relationship
              </label>
              <input
                type="text"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="e.g., Family, Friend, Colleague"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="flex-1 bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Contact'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-gray-900 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{contact.name}</h4>
                  <p className="text-gray-400 text-sm">{contact.relationship}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEmergencyCall(contact.phone)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-900/50 text-green-200 rounded-lg hover:bg-green-900 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-mono">{contact.phone}</span>
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-2 bg-red-900/50 text-red-200 rounded-lg hover:bg-red-900 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {contacts.length === 0 && !showAddForm && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No emergency contacts</h3>
            <p className="text-gray-400">Add trusted contacts for emergencies</p>
          </div>
        )}
      </div>
    </div>
  );
};
