import { useState } from 'react';
import { useMutation } from 'react-query';
import Layout from '@/components/Layout';
import { wahaAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Play } from 'lucide-react';

// Tambahan: modal QR
function QRModal({ qr, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
        {qr ? (
          <img src={qr} alt="QR Code" className="mx-auto mb-4" style={{ maxWidth: 320, maxHeight: 320 }} />
        ) : (
          <div className="text-gray-500 mb-4">QR tidak tersedia</div>
        )}
        <button
          onClick={onClose}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function Sessions() {
  const [isStarting, setIsStarting] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [qrImg, setQrImg] = useState(null);

  const createMutation = useMutation(wahaAPI.createSession, {
    onSuccess: () => {
      toast.success('Default session started!');
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

  const handleShowQR = async () => {
    setQrImg(null);
    setQrModal(true);
    try {
      const response = await wahaAPI.getQR();
      setQrImg(response.data?.qr || null);
    } catch (e) {
      setQrImg(null);
      toast.error('Gagal mengambil QR dari backend');
    }
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
              Gunakan tombol di bawah untuk memulai / restart session <code>default</code>.<br />
              Untuk WAHA Free, QR code bisa diambil dari backend jika endpoint <code>/api/screenshot</code> aktif, atau tetap lihat log WAHA jika tidak muncul.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleStartDefault}
                disabled={isStarting}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed w-full"
              >
                <Play className="mr-2 h-5 w-5" />
                {isStarting ? 'Starting default session...' : 'Start / Restart default session'}
              </button>
              <button
                onClick={handleShowQR}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full"
              >
                Lihat QR dari Backend
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cara melihat QR (alternatif)</h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
              <li>Klik tombol "Start / Restart default session" di sebelah kiri.</li>
              <li>Bisa klik "Lihat QR dari Backend" (jika WAHA support).</li>
              <li>Atau buka log container WAHA di server kamu, contoh perintah:</li>
            </ol>
            <pre className="mt-2 bg-gray-900 text-gray-100 text-xs rounded p-3 overflow-x-auto">
{`docker logs -f <nama_container_waha>`}
            </pre>
            <ol start={4} className="list-decimal list-inside text-sm text-gray-700 space-y-2 mt-2">
              <li>Tunggu sampai QR code muncul besar di log.</li>
              <li>Buka WhatsApp di HP &gt; Perangkat tertaut &gt; Scan QR.</li>
              <li>Setelah terhubung, gunakan menu Kampanye untuk kirim broadcast.</li>
            </ol>
          </div>
        </div>

        {qrModal && (
          <QRModal qr={qrImg} onClose={() => setQrModal(false)} />
        )}
      </div>
    </Layout>
  );
}
