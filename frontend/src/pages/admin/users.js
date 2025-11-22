import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Download, Calendar } from 'lucide-react';
import axios from 'axios';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  // Get all users
  const { data: users, isLoading } = useQuery('admin-users', async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  });

  // Create user mutation
  const createMutation = useMutation(authAPI.register, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-users');
      toast.success('Client created successfully!');
      setShowModal(false);
      setFormData({ email: '', password: '', name: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create client');
    }
  });

  // Delete user mutation
  const deleteMutation = useMutation(
    async (userId) => {
      const token = localStorage.getItem('token');
      return axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('Client deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete client');
      }
    }
  );

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleDelete = (user) => {
    if (confirm(`Delete client "${user.name}"? This will delete ALL their data (contacts, campaigns, messages).`)) {
      deleteMutation.mutate(user.id);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage client accounts and subscriptions</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Client
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDelete(user)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete client & all data"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Add New Client</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="PT. Client Company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    disabled={createMutation.isLoading}
                  >
                    {createMutation.isLoading ? 'Creating...' : 'Create Client'}
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
