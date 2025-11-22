import { useQuery } from 'react-query';
import Layout from '@/components/Layout';
import { dashboardAPI, messagesAPI } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery('dashboard-stats', dashboardAPI.getStats);
  const { data: activity } = useQuery('dashboard-activity', dashboardAPI.getActivity);

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  const chartData = stats?.data?.messages
    ? [
        { name: 'Sent', value: stats.data.messages.sent },
        { name: 'Delivered', value: stats.data.messages.delivered },
        { name: 'Failed', value: stats.data.messages.failed },
      ]
    : [];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Campaigns</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats?.data?.campaigns?.total || 0}
            </p>
            <p className="mt-2 text-sm text-green-600">
              {stats?.data?.campaigns?.active || 0} active
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Messages</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats?.data?.messages?.total || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Delivered</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats?.data?.messages?.delivered || 0}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {stats?.data?.messages?.successRate || 0}% success rate
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Contacts</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats?.data?.contacts?.total || 0}
            </p>
          </div>
        </div>

        {/* Message Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Message Statistics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Campaigns</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {activity?.data?.recentCampaigns?.slice(0, 5).map((campaign) => (
              <div key={campaign.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                    <p className="text-sm text-gray-500">
                      {campaign.sentCount}/{campaign.totalRecipients} sent
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                    campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
