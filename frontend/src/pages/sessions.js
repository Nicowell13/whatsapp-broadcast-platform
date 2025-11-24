import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import { wahaAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, QrCode, Trash2 } from 'lucide-react';

export default function Sessions() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [qrCode, setQrCode] = useState(null);

  const { data: sessions, isLoading, error } = useQuery('waha-sessions', wahaAPI.getSessions, {
    refetchInterval: 5000, // Auto refresh every 5s
    onSuccess: (data) => {
      console.log('Sessions data:', data);
    },
  });

  const createMutation = useMutation(wahaAPI.createSession, {
    onSuccess: () => {
      queryClient.invalidateQueries('waha-sessions');
      toast.success('Session created! Scan QR code to connect.');
      setShowModal(false);
      setSessionName('');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Failed to create session';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation(wahaAPI.deleteSession, {
    onSuccess: () => {
      queryClient.invalidateQueries('waha-sessions');
      toast.success('Session deleted!');
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(sessionName);
  };

  const handleShowQR = async (name) => {
    try {
      const response = await wahaAPI.getQR(name);
      setQrCode(response.data);
    } catch (error) {
      toast.error('Failed to get QR code');
    }
  };

  const handleDelete = (name) => {
    if (confirm(`Delete session "${name}"?`)) {
      deleteMutation.mutate(name);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Sessions</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Session
          </button>
        </div>

        {/* Session List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && (
            <div className="col-span-full text-center py-8 text-gray-500">
              Loading sessions...
            </div>
          )}
          
          {error && (
            <div className="col-span-full text-center py-8 text-red-500">
              Error loading sessions: {error.message}
            </div>
          )}
          
          {!isLoading && !error && (!sessions?.data || sessions.data.length === 0) && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No sessions found. Create a new session to get started.
            </div>
          )}
          
          {sessions?.data?.map((session) => (
            <div key={session.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{session.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  session.status === 'WORKING' ? 'bg-green-100 text-green-800' :
                  session.status === 'SCAN_QR_CODE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {session.status}
                </span>
              </div>
              
              {session.me && (
                <p className="text-sm text-gray-600 mb-4">
                  Connected: {session.me.pushName || session.me.id}
                </p>
              )}

              <div className="flex space-x-2">
                {session.status === 'SCAN_QR_CODE' && (
                  <button
                    onClick={() => handleShowQR(session.name)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Show QR
                  </button>
                )}
                <button
                  onClick={() => handleDelete(session.name)}
                  className="flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">New Session</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Session Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., default, session1"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
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

        {/* QR Code Modal */}
        {qrCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
              <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
              {qrCode.qr && (
                <img src={qrCode.qr} alt="QR Code" className="mx-auto mb-4" />
              )}
              <button
                onClick={() => setQrCode(null)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
