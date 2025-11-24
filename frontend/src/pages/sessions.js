import { useState, useEffect } from 'react';
import { useMutation } from 'react-query';
import Layout from '@/components/Layout';
import { wahaAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Play } from 'lucide-react';
import { useRouter } from 'next/router';

// Modal QR besar & jelas
function QRModal({ qr, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-lg text-center">

        <h2 className="text-2xl font-bold mb-6 text-gray-900">Scan QR Code WhatsApp</h2>

        {qr ? (
          <img
            src={qr}
            alt="QR Code"
            className="mx-auto mb-6"
            style={{
              width: '480px',
              height: '480px',
              maxWidth: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div className="text-gray-500 mb-6">QR tidak tersedia</div>
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
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [qrImg, setQrImg] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(null);

  // --- CEK STATUS SESSION ---
  const fetchStatus = async () => {
    try {
      const res = await wahaAPI.getStatus('default');
      setSessionStatus(res.data);
    } catch {
      setSessionStatus(null);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // cek tiap 3 detik
    return () => clearInterval(interval);
  }, []);

  const isConnected =
    sessionStatus?.state?.toLowerCase().includes('open') ||
    sessionStatus?.state?.toLowerCase().includes('connected') ||
    sessionStatus?.state?.toLowerCase().includes('ready');

  // --- START SESSION ---
  const createMutation = useMutation(wahaAPI.createSession, {
    onSuccess: () => {
      toast.success('Default session started!');
      setIsStarting(false);
      fetchStatus();
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to create session';
      toast.error(message);
      setIsStarting(false);
    },
  });

  const handleStartDefault = () => {
    if (isStarting) return;
    setIsStarting(true);
    createMutation.mutate('default');
  };

  // --- SHOW QR ---
  const handleShowQR = async () => {
    setQrImg(null);
    setQrModal(true);
    try {
      const response = await wahaAPI.getQR();
      setQrImg(response.data?.qr || null);
    } catch {
      setQrImg(null);
      toast.error('Gagal mengambil QR dari backend');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">

        <h1 className="text-3xl font-bold text-gray-900">
          WhatsApp Session (Default)
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Status Session WhatsApp
          </h3>

          <div className="mb-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isConnected
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Gunakan tombol di bawah untuk memulai atau melihat QR.
          </p>

          <div className="flex flex-col gap-3">

            {/* Tombol utama — berubah otomatis */}
            <button
              onClick={
                isConnected
                  ? () => router.push('/kirim') // arahkan ke halaman kirim pesan
                  : handleStartDefault
              }
              disabled={isStarting}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full"
            >
              <Play className="mr-2 h-5 w-5" />
              {isConnected
                ? 'Kirim Pesan'
                : isStarting
                ? 'Starting default session...'
                : 'Start / Restart default session'}
            </button>

            {/* Tombol QR — otomatis hilang jika sudah connect */}
            {!isConnected && (
              <button
                onClick={handleShowQR}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full"
              >
                Lihat QR Code
              </button>
            )}
          </div>
        </div>

        {/* Modal QR */}
        {qrModal && <QRModal qr={qrImg} onClose={() => setQrModal(false)} />}

      </div>
    </Layout>
  );
}
