import { useState } from 'react';
import { uploadFileToIPFS, uploadJsonToIPFS } from '../utils/ipfs';
import { useContract } from './useContract';

interface LegacyExtractedData {
  studentName?: string;
  regdNo?: string;
  branch?: string;
  examination?: string;
  monthYearExams?: string;
  aadharNo?: string;
  serialNo?: string;
  memoNo?: string;
}

export const useLegacyCertificate = () => {
  const { getSignedContracts } = useContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importLegacyCertificate = async (file: File, extracted: LegacyExtractedData, studentAddress: string) => {
    const signed = getSignedContracts();
    if (!signed?.certificateNFT) throw new Error('Wallet not connected');

    setLoading(true);
    setError(null);
    try {
      // 1) Upload original file to IPFS
      const fileCid = await uploadFileToIPFS(file);

      // 2) Build metadata JSON and upload to IPFS
      const metadata = {
        type: 'legacy-semester-certificate',
        sourceFileCid: fileCid,
        extracted,
        createdAt: new Date().toISOString()
      };
      const metadataCid = await uploadJsonToIPFS(metadata);

      // 3) Prepare minimal semester cert data to pass to contract (courses empty; SGPA computed as 0)
      const certData = {
        studentName: extracted.studentName || '',
        serialNo: extracted.serialNo || '',
        memoNo: extracted.memoNo || '',
        regdNo: extracted.regdNo || '',
        branch: extracted.branch || '',
        examination: extracted.examination || '',
        monthYearExams: extracted.monthYearExams || '',
        aadharNo: extracted.aadharNo || '',
        studentPhoto: '',
        courses: [],
        totalCredits: 0,
        sgpa: 0,
        mediumOfInstruction: 'English',
        issueDate: 0,
        issuer: '0x0000000000000000000000000000000000000000',
        isRevoked: false
      };

      // 4) Mint via semester function using extracted serial/memo
      const tx = await signed.certificateNFT.mintSemesterCertificate(
        studentAddress,
        certData.serialNo,
        certData.memoNo,
        certData
      );
      const receipt = await tx.wait();

      // 5) Try to read tokenId from events (fallback none)
      let tokenId: string | null = null;
      try {
        for (const log of receipt.logs) {
          try {
            const parsed = signed.certificateNFT.interface.parseLog(log);
            if (parsed?.name === 'Transfer') {
              tokenId = (parsed.args?.tokenId || parsed.args?.[2])?.toString?.() || null;
            }
          } catch {}
        }
      } catch {}

      return { tokenId, fileCid, metadataCid };
    } catch (e: any) {
      setError(e.message || 'Failed to import legacy certificate');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { importLegacyCertificate, loading, error };
};


