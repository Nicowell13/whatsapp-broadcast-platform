import { useState } from 'react';
import { useMutation } from 'react-query';
import Layout from '@/components/Layout';
import { wahaAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Play } from 'lucide-react';

function QRModal({ onClose }) {
  const [qr, setQr] = useState(null);

  useEffect(() => {
    const evt = new EventSource('/session/qr-stream');

    evt.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      setQr(data?.qr || null);
    };

    evt.onerror = () => console.log("QR stream error");

    return () => evt.close();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Scan QR Code WhatsApp</h2>

        {qr ? (
          <img src={qr} alt="QR Code" className="mx-auto mb-6" style={{ width: 480, height: 480 }} />
        ) : (
          <div className="text-gray-500 mb-6">Menunggu QR...</div>
        )}

        <button
          onClick={onClose}
          className="bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 transition"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

export default function Sessions() {
  const [qrModal, setQrModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const startMutation = useMutation(
    async () => {
      return await wahaAPI.startSession();
    },
    {
      onSuccess: async () => {
        toast.success('Default session dimulai!');
        setIsStarting(false);
        setQrModal(true);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || err.message);
        setIsStarting(false);
      },
    }
  );

  const handleStart = () => {
    if (isStarting) return;
    setIsStarting(true);
    startMutation.mutate();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          WhatsApp Session (Default)
        </h1>

        <div className="bg-white rounded-lg shadow p-6">

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Start WhatsApp Session
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Klik tombol untuk memulai session dan menampilkan QR WhatsApp untuk login.
          </p>

          <button
            onClick={handleStart}
            disabled={isStarting}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full"
          >
            <Play className="mr-2 h-5 w-5" />
            {isStarting ? 'Memulai session...' : 'Start / Restart Default Session'}
          </button>

          <button
            onClick={() => setQrModal(true)}
            className="mt-3 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full"
          >
            Lihat QR Code
          </button>

        </div>

        {qrModal && <QRModal onClose={() => setQrModal(false)} />}
      </div>
    </Layout>
  );
}
