import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import { campaignsAPI, contactsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Send } from 'lucide-react';

export default function Campaigns() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    message: '', 
    sessionId: 'default',
    imageUrl: '',
    buttons: [{ text: '', url: '' }, { text: '', url: '' }]
  });

  const { data: campaigns, isLoading } = useQuery('campaigns', campaignsAPI.getAll);
  const { data: contacts } = useQuery('contacts', contactsAPI.getAll);

  const createMutation = useMutation(campaignsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('campaigns');
      toast.success('Campaign created!');
      setShowModal(false);
      setFormData({ 
        name: '', 
        message: '', 
        sessionId: 'default',
        imageUrl: '',
        buttons: [{ text: '', url: '' }, { text: '', url: '' }]
      });
    },
  });

  const sendMutation = useMutation(
    ({ id, contactIds }) => campaignsAPI.send(id, contactIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('campaigns');
        toast.success('Campaign queued for sending!');
        setSelectedCampaign(null);
      },
    }
  );

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleSend = (campaignId) => {
    const allContactIds = contacts?.data?.map((c) => c.id) || [];
    if (allContactIds.length === 0) {
      toast.error('No contacts available');
      return;
    }
    if (confirm(`Send to ${allContactIds.length} contacts?`)) {
      sendMutation.mutate({ id: campaignId, contactIds: allContactIds });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Campaign
          </button>
        </div>

        {/* Campaign List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns?.data?.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {campaign.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                      campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.totalRecipients}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.sentCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {campaign.deliveredCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {campaign.failedCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => handleSend(campaign.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">New Campaign</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    required
                    rows="4"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Use {{name}} for contact name"
                  />
                </div>
                
                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.imageUrl && (
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="mt-2 h-32 object-cover rounded"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>

                {/* Buttons (Max 2) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buttons <span className="text-gray-400">(max 2, optional)</span>
                  </label>
                  
                  {/* Button 1 */}
                  <div className="space-y-2 p-3 bg-gray-50 rounded-md mb-3">
                    <p className="text-xs font-semibold text-gray-600">Button 1</p>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={formData.buttons[0].text}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        buttons: [
                          { ...formData.buttons[0], text: e.target.value },
                          formData.buttons[1]
                        ]
                      })}
                      placeholder="Button text (e.g., 'Ini Link GACOR')"
                    />
                    <input
                      type="url"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={formData.buttons[0].url}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        buttons: [
                          { ...formData.buttons[0], url: e.target.value },
                          formData.buttons[1]
                        ]
                      })}
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Button 2 */}
                  <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs font-semibold text-gray-600">Button 2</p>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={formData.buttons[1].text}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        buttons: [
                          formData.buttons[0],
                          { ...formData.buttons[1], text: e.target.value }
                        ]
                      })}
                      placeholder="Button text (e.g., 'Ini juga')"
                    />
                    <input
                      type="url"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={formData.buttons[1].url}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        buttons: [
                          formData.buttons[0],
                          { ...formData.buttons[1], url: e.target.value }
                        ]
                      })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Session ID</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.sessionId}
                    onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
