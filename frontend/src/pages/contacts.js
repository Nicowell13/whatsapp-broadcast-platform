import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import { contactsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Upload, Trash2 } from 'lucide-react';

export default function Contacts() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const { data: contacts, isLoading } = useQuery('contacts', contactsAPI.getAll);

  const createMutation = useMutation(contactsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('contacts');
      toast.success('Contact added!');
      setShowModal(false);
      setFormData({ name: '', phone: '', email: '' });
    },
  });

  const deleteMutation = useMutation(contactsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('contacts');
      toast.success('Contact deleted!');
    },
  });

  const importMutation = useMutation(contactsAPI.importCsv, {
    onSuccess: (response) => {
      queryClient.invalidateQueries('contacts');
      toast.success(`Imported ${response.data.imported} contacts!`);
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this contact?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    importMutation.mutate(formData);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <div className="flex space-x-3">
            <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer">
              <Upload className="mr-2 h-5 w-5" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImport}
              />
            </label>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Contact List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts?.data?.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contact.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-600 hover:text-red-900"
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
              <h2 className="text-2xl font-bold mb-4">Add Contact</h2>
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
                  <label className="block text-sm font-medium text-gray-700">Phone (628xxx)</label>
                  <input
                    type="text"
                    required
                    placeholder="628123456789"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
                  <input
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Add
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
