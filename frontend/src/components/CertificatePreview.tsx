import React, { useState, useEffect } from 'react';
import { Download, Eye, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { generateCertificatePreview, CertificateData } from '../utils/certificateGenerator';
import QRCode from 'qrcode';

interface CertificatePreviewProps {
  data: CertificateData;
  onDownload?: () => void;
  onPreview?: () => void;
  className?: string;
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  data,
  onDownload,
  onPreview,
  className = ''
}) => {
  const [previewImage, setPreviewImage] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generatePreview = async () => {
      setLoading(true);
      try {
        const preview = await generateCertificatePreview(data);
        setPreviewImage(preview);
      } catch (error) {
        console.error('Error generating preview:', error);
      } finally {
        setLoading(false);
      }
    };

    generatePreview();
  }, [data]);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrData = `${data.verificationUrl}?certificateId=${data.certificateId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
          width: 120,
          margin: 2,
          color: {
            dark: '#1e40af',
            light: '#ffffff'
          }
        });
        setQrCodeDataUrl(qrCodeDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [data.verificationUrl, data.certificateId]);

  const getTemplateStyle = (templateType: string = 'completion') => {
    switch (templateType) {
      case 'honor':
        return {
          background: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-500',
          accent: 'text-yellow-600 dark:text-yellow-400',
          title: 'HONOR ROLL CERTIFICATE'
        };
      case 'achievement':
        return {
          background: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-500',
          accent: 'text-purple-600 dark:text-purple-400',
          title: 'ACHIEVEMENT AWARD'
        };
      default:
        return {
          background: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-500',
          accent: 'text-blue-600 dark:text-blue-400',
          title: 'CERTIFICATE OF COMPLETION'
        };
    }
  };

  const templateStyle = getTemplateStyle(data.templateType);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Generating preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-6`}>
      {/* Certificate Preview */}
      <div className={`${templateStyle.background} ${templateStyle.border} border-2 rounded-xl p-6 shadow-lg`}>
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold ${templateStyle.accent} mb-2`}>
            {templateStyle.title}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded"></div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">This is to certify that</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {data.studentName}
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              has successfully completed the course
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white my-2">
              "{data.courseName}"
            </p>
            {data.grade && (
              <p className="text-lg text-gray-700 dark:text-gray-300">
                with a grade of <span className="font-semibold text-green-600 dark:text-green-400">{data.grade}</span>
              </p>
            )}
            {data.department && (
              <p className="text-lg text-gray-700 dark:text-gray-300">
                in the Department of <span className="font-semibold">{data.department}</span>
              </p>
            )}
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">
              on {data.issueDate}
            </p>
          </div>

          {/* QR Code */}
          {qrCodeDataUrl && (
            <div className="flex justify-center mt-6">
              <div className="text-center">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-24 h-24 mx-auto" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Scan to verify
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Certificate ID */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>Certificate ID: {data.certificateId}</span>
            <span>Blockchain Verified</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        {onDownload && (
          <button
            onClick={onDownload}
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        )}
        {onPreview && (
          <button
            onClick={onPreview}
            className="flex-1 btn-outline flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Full Preview</span>
          </button>
        )}
      </div>

      {/* Verification Info */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-green-800 dark:text-green-200 font-medium">
            Blockchain Verified Certificate
          </span>
        </div>
        <p className="text-green-700 dark:text-green-300 text-sm mt-1">
          This certificate is secured on the Ethereum blockchain and can be verified instantly.
        </p>
      </div>
    </div>
  );
};

export default CertificatePreview;



