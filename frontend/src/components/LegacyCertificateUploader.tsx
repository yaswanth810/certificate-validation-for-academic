import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLegacyCertificate } from '../hooks/useLegacyCertificate';

const LegacyCertificateUploader: React.FC = () => {
  const { importLegacyCertificate, loading, error } = useLegacyCertificate();
  const [file, setFile] = useState<File | null>(null);
  const [studentAddress, setStudentAddress] = useState('');
  const [progress, setProgress] = useState<'idle' | 'analyzing' | 'extracting' | 'uploading' | 'minting' | 'done'>('idle');
  const [result, setResult] = useState<{ tokenId?: string | null; fileCid?: string; metadataCid?: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !studentAddress) return;
    setResult(null);
    try {
      setProgress('analyzing');
      await new Promise(r => setTimeout(r, 800));
      setProgress('extracting');
      await new Promise(r => setTimeout(r, 800));

      // Mock extracted fields (replace later with real OCR)
      const extracted = {
        studentName: 'Legacy Student',
        regdNo: 'LEG123456',
        branch: 'Information Technology',
        examination: 'III B-Tech I Semester',
        monthYearExams: 'NOVEMBER 2022',
        aadharNo: '000000000000',
        serialNo: 'LEG-SN-' + Math.floor(Math.random() * 1e6),
        memoNo: 'LEG-MN-' + Math.floor(Math.random() * 1e6)
      };

      setProgress('uploading');
      await new Promise(r => setTimeout(r, 400));
      setProgress('minting');

      const minted = await importLegacyCertificate(file, extracted, studentAddress);
      setResult(minted);
      setProgress('done');
    } catch (e) {
      setProgress('idle');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Import Legacy Semester Certificate
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Upload a scanned PDF/JPEG and we will analyze, store to IPFS, and mint an NFT.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Wallet Address</label>
          <input
            type="text"
            value={studentAddress}
            onChange={(e) => setStudentAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="0x..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certificate File (PDF/JPEG)</label>
          <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} className="block w-full" />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Progress */}
        {progress !== 'idle' && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-300 flex items-center space-x-2">
            {loading || progress !== 'done' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            <span>
              {progress === 'analyzing' && 'Analyzing document...'}
              {progress === 'extracting' && 'Extracting data via OCR...'}
              {progress === 'uploading' && 'Uploading to IPFS...'}
              {progress === 'minting' && 'Minting NFT on blockchain...'}
              {progress === 'done' && 'Completed'}
            </span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!file || !studentAddress || loading}
            className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>Upload & Mint</span>
          </button>
        </div>

        {result && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="text-green-800 dark:text-green-300 font-medium">Legacy certificate minted!</div>
            <div className="text-sm mt-1 text-gray-700 dark:text-gray-300">Token ID: {result.tokenId || 'N/A'}</div>
            <div className="text-sm mt-1"><a className="text-blue-600" href={`https://ipfs.io/ipfs/${result.fileCid}`} target="_blank" rel="noreferrer">View Original File</a></div>
            <div className="text-sm"><a className="text-blue-600" href={`https://ipfs.io/ipfs/${result.metadataCid}`} target="_blank" rel="noreferrer">View Metadata</a></div>
          </div>
        )}
      </form>
    </div>
  );
};

export default LegacyCertificateUploader;


