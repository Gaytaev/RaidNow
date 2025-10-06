import { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Smartphone } from 'lucide-react';
import { supabase, PaymentMethod } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const PaymentMethods = () => {
  const { user } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<'card' | 'cash' | 'apple_pay' | 'google_pay'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_default', { ascending: false });

    if (data) setMethods(data);
  };

  const handleAddMethod = async () => {
    if (selectedType === 'card' && cardNumber.length < 16) {
      alert('Please enter a valid card number');
      return;
    }

    setLoading(true);
    try {
      const lastFour = selectedType === 'card' ? cardNumber.slice(-4) : undefined;

      const { error } = await supabase.from('payment_methods').insert({
        user_id: user?.id,
        type: selectedType,
        card_last_four: lastFour,
        card_brand: selectedType === 'card' ? 'Visa' : undefined,
        is_default: methods.length === 0,
      });

      if (error) throw error;

      await loadPaymentMethods();
      setShowAddForm(false);
      setCardNumber('');
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this payment method?')) return;

    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadPaymentMethods();
    }
  };

  const handleSetDefault = async (id: string) => {
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', user?.id);

    await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', id);

    await loadPaymentMethods();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="w-6 h-6" />;
      case 'apple_pay':
      case 'google_pay': return <Smartphone className="w-6 h-6" />;
      default: return <CreditCard className="w-6 h-6" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'card': return 'Credit/Debit Card';
      case 'cash': return 'Cash';
      case 'apple_pay': return 'Apple Pay';
      case 'google_pay': return 'Google Pay';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Payment Methods</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Method</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h4 className="text-white font-semibold mb-4">Add Payment Method</h4>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { type: 'card' as const, label: 'Card', icon: CreditCard },
              { type: 'cash' as const, label: 'Cash', icon: CreditCard },
              { type: 'apple_pay' as const, label: 'Apple Pay', icon: Smartphone },
              { type: 'google_pay' as const, label: 'Google Pay', icon: Smartphone },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.type}
                  onClick={() => setSelectedType(option.type)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedType === option.type
                      ? 'bg-gray-700 border-white'
                      : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <Icon className="w-6 h-6 text-white mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">{option.label}</p>
                </button>
              );
            })}
          </div>

          {selectedType === 'card' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="1234 5678 9012 3456"
                maxLength={16}
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAddMethod}
              disabled={loading}
              className="flex-1 bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Method'}
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
        {methods.map((method) => (
          <div
            key={method.id}
            className={`bg-gray-900 rounded-lg p-4 border ${
              method.is_default ? 'border-white' : 'border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white">
                  {getIcon(method.type)}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{getTypeName(method.type)}</h4>
                  {method.card_last_four && (
                    <p className="text-gray-400 text-sm">•••• {method.card_last_four}</p>
                  )}
                  {method.is_default && (
                    <span className="text-xs text-gray-400">Default</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!method.is_default && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="px-3 py-1 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(method.id)}
                  className="p-2 bg-red-900/50 text-red-200 rounded-lg hover:bg-red-900 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {methods.length === 0 && !showAddForm && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No payment methods</h3>
            <p className="text-gray-400">Add a payment method to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
