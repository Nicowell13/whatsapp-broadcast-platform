import { useQuery } from 'react-query';
import Layout from '@/components/Layout';
import { messagesAPI } from '@/lib/api';

export default function Messages() {
  const { data: messages, isLoading } = useQuery('messages', messagesAPI.getAll);
  const { data: stats } = useQuery('message-stats', messagesAPI.getStats);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{stats?.data?.total || 0}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-600">Pending</p>
            <p className="text-2xl font-bold text-blue-600">{stats?.data?.pending || 0}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-600">Sent</p>
            <p className="text-2xl font-bold text-yellow-600">{stats?.data?.sent || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-600">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{stats?.data?.delivered || 0}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4">
            <p className="text-sm text-red-600">Failed</p>
            <p className="text-2xl font-bold text-red-600">{stats?.data?.failed || 0}</p>
          </div>
        </div>

        {/* Message List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages?.data?.map((message) => (
                <tr key={message.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {message.recipientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {message.recipientPhone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      message.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      message.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                      message.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {message.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {message.sentAt ? new Date(message.sentAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
