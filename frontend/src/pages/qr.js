import { useEffect, useState } from "react";

export default function QRPage() {
  const [qr, setQr] = useState(null);

  useEffect(() => {
    const evt = new EventSource("http://localhost:3000/session/qr-stream");

    evt.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      setQr(data.qr);
    };

    evt.onerror = () => {
      console.log("SSE error");
    };

    return () => evt.close();
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <h1>Scan QR WhatsApp</h1>
      {qr ? (
        <img
          src={qr}
          alt="QR"
          style={{ width: 300, height: 300, border: "1px solid #ccc" }}
        />
      ) : (
        <p>QR belum tersedia...</p>
      )}
    </div>
  );
}
