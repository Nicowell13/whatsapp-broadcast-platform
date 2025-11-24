import { useState } from 'react';
import { useMutation } from 'react-query';
import Layout from '@/components/Layout';
import { wahaAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Play } from 'lucide-react';

export default function Sessions() {
  const [isStarting, setIsStarting] = useState(false);

  const createMutation = useMutation(wahaAPI.createSession, {
    onSuccess: () => {
      toast.success('Default session started! Lihat QR di log WAHA.');
      setIsStarting(false);
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Failed to create session';
      toast.error(message);
      setIsStarting(false);
    },
  });

  const handleStartDefault = () => {
    if (isStarting) return;
    setIsStarting(true);
    createMutation.mutate('default');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Session (Default)</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Default Session</h3>
            <p className="text-sm text-gray-600 mb-4">
              WAHA Free biasanya tidak mengembalikan daftar / status session lewat API.
              Gunakan tombol di bawah untuk memulai / restart session <code>default</code>,
              lalu lihat QR code di log container WAHA dan scan dengan WhatsApp.
            </p>

            <button
              onClick={handleStartDefault}
              disabled={isStarting}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed w-full"
            >
              <Play className="mr-2 h-5 w-5" />
              {isStarting ? 'Starting default session...' : 'Start / Restart default session'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cara melihat QR</h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
              <li>Klik tombol "Start / Restart default session" di sebelah kiri.</li>
              <li>Buka log container WAHA di server kamu, contoh perintah:</li>
            </ol>
            <pre className="mt-2 bg-gray-900 text-gray-100 text-xs rounded p-3 overflow-x-auto">
{`docker logs -f <nama_container_waha>`}
            </pre>
            <ol start={3} className="list-decimal list-inside text-sm text-gray-700 space-y-2 mt-2">
              <li>Tunggu sampai QR code muncul besar di log.</li>
              <li>Buka WhatsApp di HP &gt; Perangkat tertaut &gt; Scan QR.</li>
              <li>Setelah terhubung, gunakan menu Kampanye untuk kirim broadcast.</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
}
