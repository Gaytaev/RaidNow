import { useState, useEffect } from 'react';
import { LifeBuoy, Plus, MessageCircle, Clock } from 'lucide-react';
import { supabase, SupportTicket } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const SupportTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setTickets(data);
  };

  const handleCreate = async () => {
    if (!formData.subject || !formData.description) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user?.id,
        ...formData,
      });

      if (error) throw error;

      await loadTickets();
      setShowCreateForm(false);
      setFormData({ subject: '', description: '', priority: 'medium' });
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-900/50 text-blue-200 border-blue-700';
      case 'in_progress': return 'bg-yellow-900/50 text-yellow-200 border-yellow-700';
      case 'resolved': return 'bg-green-900/50 text-green-200 border-green-700';
      case 'closed': return 'bg-gray-700 text-gray-300 border-gray-600';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Support Tickets</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Ticket</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h4 className="text-white font-semibold mb-4">Create Support Ticket</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white resize-none"
                placeholder="Detailed description of your issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setFormData({ ...formData, priority })}
                    className={`py-2 px-4 rounded-lg border-2 transition-all capitalize ${
                      formData.priority === priority
                        ? 'bg-gray-700 border-white text-white'
                        : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-gray-900 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-white font-semibold">{ticket.subject}</h4>
                  <span className={`text-xs font-medium uppercase ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{ticket.description}</p>
                <p className="text-gray-500 text-xs">
                  Created {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
              <MessageCircle className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">View messages</span>
            </div>
          </div>
        ))}

        {tickets.length === 0 && !showCreateForm && (
          <div className="text-center py-12">
            <LifeBuoy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No support tickets</h3>
            <p className="text-gray-400">Need help? Create a support ticket</p>
          </div>
        )}
      </div>
    </div>
  );
};
