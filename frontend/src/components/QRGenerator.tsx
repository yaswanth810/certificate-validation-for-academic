import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { generateQRData } from '../utils/web3';

interface QRGeneratorProps {
  certificate: any;
  onClose: () => void;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ certificate, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateQRCode();
  }, [certificate]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate QR data URL
      const qrData = generateQRData(
        certificate.tokenId,
        process.env.REACT_APP_CERTIFICATE_NFT_ADDRESS || '',
        parseInt(process.env.REACT_APP_NETWORK_ID || '11155111')
      );

      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      setQrDataUrl(qrCodeDataUrl);

      // Draw on canvas
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            canvas.width = 300;
            canvas.height = 300;
            ctx.drawImage(img, 0, 0);
          };
          img.src = qrCodeDataUrl;
        }
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `certificate-${certificate.tokenId}-qr.png`;
      link.href = qrDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyQRData = async () => {
    const qrData = generateQRData(
      certificate.tokenId,
      process.env.REACT_APP_CERTIFICATE_NFT_ADDRESS || '',
      parseInt(process.env.REACT_APP_NETWORK_ID || '11155111')
    );
    
    try {
      await navigator.clipboard.writeText(qrData);
      alert('QR data copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy QR data:', err);
      alert('Failed to copy QR data');
    }
  };

  const printCertificate = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate - ${certificate.studentName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .certificate { border: 3px solid #3b82f6; padding: 30px; text-align: center; }
              .header { color: #1e40af; margin-bottom: 20px; }
              .student-name { font-size: 24px; font-weight: bold; margin: 20px 0; }
              .course-name { font-size: 18px; margin: 10px 0; }
              .grade { font-size: 16px; margin: 10px 0; }
              .qr-code { margin: 20px 0; }
              .verification { font-size: 12px; color: #666; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="certificate">
              <div class="header">
                <h1>VIGNAN INSTITUTE</h1>
                <h2>CERTIFICATE OF COMPLETION</h2>
              </div>
              <div class="student-name">${certificate.studentName}</div>
              <div class="course-name">${certificate.courseName}</div>
              <div class="grade">Grade: ${certificate.grade}</div>
              <div class="qr-code">
                <img src="${qrDataUrl}" alt="QR Code" style="width: 150px; height: 150px;">
              </div>
              <div class="verification">
                <p>Token ID: ${certificate.tokenId}</p>
                <p>Verification: ${window.location.origin}/verify?tokenId=${certificate.tokenId}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Certificate QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Generating QR code...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={generateQRCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Certificate Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificate Details</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Student:</span>
                    <p className="font-medium">{certificate.studentName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Course:</span>
                    <p className="font-medium">{certificate.courseName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Grade:</span>
                    <p className="font-medium">{certificate.grade}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Token ID:</span>
                    <p className="font-medium">{certificate.tokenId}</p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code for Verification</h3>
                <div className="qr-code inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <canvas ref={canvasRef} className="mx-auto"></canvas>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Scan this QR code to verify the certificate
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download QR Code
                </button>
                <button
                  onClick={copyQRData}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Copy QR Data
                </button>
                <button
                  onClick={printCertificate}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Print Certificate
                </button>
              </div>

              {/* Verification Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">How to Use This QR Code</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Scan the QR code with any QR code reader</li>
                  <li>• It will open the verification page automatically</li>
                  <li>• The certificate details will be displayed instantly</li>
                  <li>• Anyone can verify the certificate's authenticity</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
