import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess, onScanError, onClose }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    // Use Html5Qrcode core API instead of UI scanner
    const html5QrCode = new Html5Qrcode("qr-reader");

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        // Success
        if (html5QrCode.isScanning) {
          html5QrCode.stop().then(() => {
            html5QrCode.clear();
            onScanSuccess(decodedText);
          }).catch(err => {
            console.error("Failed to stop scanner", err);
            onScanSuccess(decodedText);
          });
        }
      },
      (error) => {
        // Parse errors just mean "no QR detected right now", ignore
      }
    ).catch(err => {
      // Camera start failed
      console.error(err);
      if (onScanError) onScanError(err);
    });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="camera-overlay fade-in" style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      color: 'white'
    }}>
      {/* We keep the original scanner-frame class for the graphic overlay */}
      <div 
        id="qr-reader" 
        className="scanner-frame" 
        ref={scannerRef}
        style={{ width: 250, height: 250, border: '2px solid #3b82f6', position: 'relative', overflow: 'hidden', borderRadius: 20, marginBottom: '2rem' }}
      >
        {/* html5-qrcode will mount video here */}
      </div>
      
      <p style={{ zIndex: 10, fontWeight: 500 }}>Scanning QR Code...</p>
      
      <button 
        className="util-btn active" 
        onClick={onClose} 
        style={{ 
          marginTop: '1.5rem', 
          width: 'auto', 
          padding: '0.5rem 1.5rem', 
          borderRadius: 999, 
          zIndex: 10,
          backgroundColor: '#ef4444',
          border: 'none',
          color: 'white',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Cancel
      </button>

      {/* Recreating the scanning line animation for the frame */}
      <style>{`
        #qr-reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
        #qr-reader canvas {
          display: none !important;
        }
        #qr-reader::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background-color: #3b82f6;
          box-shadow: 0 0 15px #3b82f6;
          animation: scan-line 2s infinite linear;
          pointer-events: none;
          z-index: 10;
        }
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
