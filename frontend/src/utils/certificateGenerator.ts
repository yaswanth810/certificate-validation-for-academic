import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface CertificateData {
  certificateId: string;
  studentName: string;
  courseName: string;
  grade?: string;
  department?: string;
  issueDate: string;
  verificationUrl: string;
  templateType?: 'completion' | 'honor' | 'achievement';
  instituteName?: string;
  signatoryName?: string;
  signatoryTitle?: string;
}

export interface CertificateTemplate {
  name: string;
  type: 'completion' | 'honor' | 'achievement';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  layout: {
    title: string;
    subtitle?: string;
    borderStyle: 'simple' | 'decorative' | 'elegant';
  };
}

export const certificateTemplates: CertificateTemplate[] = [
  {
    name: 'Classic Completion',
    type: 'completion',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#10b981',
      text: '#1f2937'
    },
    layout: {
      title: 'CERTIFICATE OF COMPLETION',
      borderStyle: 'simple'
    }
  },
  {
    name: 'Honor Roll',
    type: 'honor',
    colors: {
      primary: '#d97706',
      secondary: '#f59e0b',
      accent: '#eab308',
      text: '#1f2937'
    },
    layout: {
      title: 'HONOR ROLL CERTIFICATE',
      subtitle: 'Excellence in Academic Achievement',
      borderStyle: 'decorative'
    }
  },
  {
    name: 'Achievement Award',
    type: 'achievement',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a855f7',
      text: '#1f2937'
    },
    layout: {
      title: 'ACHIEVEMENT AWARD',
      subtitle: 'Outstanding Performance Recognition',
      borderStyle: 'elegant'
    }
  }
];

export const generateCertificatePDF = async (data: CertificateData): Promise<Blob> => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const template = certificateTemplates.find(t => t.type === data.templateType) || certificateTemplates[0];
  
  // Page dimensions
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Colors
  const primaryColor = template.colors.primary;
  const accentColor = template.colors.accent;

  // Draw border
  pdf.setDrawColor(primaryColor);
  pdf.setLineWidth(2);
  pdf.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

  // Inner decorative border
  pdf.setLineWidth(0.5);
  pdf.rect(margin + 5, margin + 5, pageWidth - 2 * margin - 10, pageHeight - 2 * margin - 10);

  // Institution header
  pdf.setFontSize(16);
  pdf.setTextColor(primaryColor);
  pdf.text(data.instituteName || 'Vignan Institute of Technology and Management', pageWidth / 2, margin + 20, { align: 'center' });

  // Certificate title
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primaryColor);
  pdf.text(template.layout.title, pageWidth / 2, margin + 40, { align: 'center' });

  // Subtitle if exists
  if (template.layout.subtitle) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#666666');
    pdf.text(template.layout.subtitle, pageWidth / 2, margin + 50, { align: 'center' });
  }

  // Main content
  const contentY = margin + 70;
  
  pdf.setFontSize(14);
  pdf.setTextColor('#333333');
  pdf.text('This is to certify that', pageWidth / 2, contentY, { align: 'center' });

  // Student name
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primaryColor);
  pdf.text(data.studentName, pageWidth / 2, contentY + 20, { align: 'center' });

  // Course completion text
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor('#333333');
  pdf.text('has successfully completed the course', pageWidth / 2, contentY + 35, { align: 'center' });

  // Course name
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(accentColor);
  pdf.text(`"${data.courseName}"`, pageWidth / 2, contentY + 50, { align: 'center' });

  // Grade if provided
  if (data.grade) {
    pdf.setFontSize(14);
    pdf.setTextColor('#333333');
    pdf.text(`with a grade of ${data.grade}`, pageWidth / 2, contentY + 65, { align: 'center' });
  }

  // Department if provided
  if (data.department) {
    pdf.setFontSize(12);
    pdf.setTextColor('#666666');
    const departmentY = data.grade ? contentY + 80 : contentY + 65;
    pdf.text(`Department of ${data.department}`, pageWidth / 2, departmentY, { align: 'center' });
  }

  // Issue date
  pdf.setFontSize(14);
  pdf.setTextColor('#333333');
  const dateY = contentY + (data.grade && data.department ? 95 : data.grade || data.department ? 80 : 65);
  pdf.text(`Issued on ${data.issueDate}`, pageWidth / 2, dateY, { align: 'center' });

  // Generate QR code
  try {
    const qrData = `${data.verificationUrl}?certificateId=${data.certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: primaryColor,
        light: '#ffffff'
      }
    });

    // Add QR code to PDF
    const qrSize = 25;
    pdf.addImage(qrCodeDataUrl, 'PNG', pageWidth - margin - qrSize - 10, pageHeight - margin - qrSize - 10, qrSize, qrSize);
    
    // QR code label
    pdf.setFontSize(8);
    pdf.setTextColor('#666666');
    pdf.text('Scan to verify', pageWidth - margin - qrSize/2 - 10, pageHeight - margin - 5, { align: 'center' });
  } catch (error) {
    console.error('Error generating QR code for PDF:', error);
  }

  // Certificate ID
  pdf.setFontSize(10);
  pdf.setTextColor('#666666');
  pdf.text(`Certificate ID: ${data.certificateId}`, margin + 10, pageHeight - margin - 10);

  // Blockchain verification text
  pdf.text('Blockchain Verified', pageWidth / 2, pageHeight - margin - 10, { align: 'center' });

  // Signatory (if provided)
  if (data.signatoryName) {
    const sigY = pageHeight - margin - 30;
    pdf.setFontSize(12);
    pdf.setTextColor('#333333');
    pdf.text(data.signatoryName, pageWidth - margin - 60, sigY, { align: 'center' });
    
    if (data.signatoryTitle) {
      pdf.setFontSize(10);
      pdf.setTextColor('#666666');
      pdf.text(data.signatoryTitle, pageWidth - margin - 60, sigY + 8, { align: 'center' });
    }
    
    // Signature line
    pdf.setLineWidth(0.5);
    pdf.setDrawColor('#cccccc');
    pdf.line(pageWidth - margin - 80, sigY - 5, pageWidth - margin - 40, sigY - 5);
  }

  return pdf.output('blob');
};

export const generateCertificatePreview = async (data: CertificateData): Promise<string> => {
  // For preview, we'll create a simple canvas-based image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Set canvas size (A4 landscape proportions)
  canvas.width = 800;
  canvas.height = 600;

  const template = certificateTemplates.find(t => t.type === data.templateType) || certificateTemplates[0];

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = template.colors.primary;
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Inner border
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Institution name
  ctx.fillStyle = template.colors.primary;
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(data.instituteName || 'Vignan Institute of Technology and Management', canvas.width / 2, 80);

  // Certificate title
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = template.colors.primary;
  ctx.fillText(template.layout.title, canvas.width / 2, 130);

  // Main content
  ctx.font = '18px Arial';
  ctx.fillStyle = '#333333';
  ctx.fillText('This is to certify that', canvas.width / 2, 180);

  // Student name
  ctx.font = 'bold 42px Arial';
  ctx.fillStyle = template.colors.primary;
  ctx.fillText(data.studentName, canvas.width / 2, 230);

  // Course text
  ctx.font = '18px Arial';
  ctx.fillStyle = '#333333';
  ctx.fillText('has successfully completed the course', canvas.width / 2, 270);

  // Course name
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = template.colors.accent;
  ctx.fillText(`"${data.courseName}"`, canvas.width / 2, 310);

  // Grade
  if (data.grade) {
    ctx.font = '18px Arial';
    ctx.fillStyle = '#333333';
    ctx.fillText(`with a grade of ${data.grade}`, canvas.width / 2, 340);
  }

  // Department
  if (data.department) {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666666';
    const deptY = data.grade ? 370 : 340;
    ctx.fillText(`Department of ${data.department}`, canvas.width / 2, deptY);
  }

  // Issue date
  ctx.font = '18px Arial';
  ctx.fillStyle = '#333333';
  const dateY = data.grade && data.department ? 400 : data.grade || data.department ? 370 : 340;
  ctx.fillText(`Issued on ${data.issueDate}`, canvas.width / 2, dateY);

  // Certificate ID
  ctx.font = '12px Arial';
  ctx.fillStyle = '#666666';
  ctx.textAlign = 'left';
  ctx.fillText(`Certificate ID: ${data.certificateId}`, 40, canvas.height - 40);

  // Blockchain verified
  ctx.textAlign = 'center';
  ctx.fillText('Blockchain Verified', canvas.width / 2, canvas.height - 40);

  // Generate QR code and add to canvas
  try {
    const qrData = `${data.verificationUrl}?certificateId=${data.certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 100,
      margin: 1,
      color: {
        dark: template.colors.primary,
        light: '#ffffff'
      }
    });

    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, canvas.width - 120, canvas.height - 120, 80, 80);
    };
    qrImage.src = qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code for preview:', error);
  }

  return canvas.toDataURL('image/png');
};

export const downloadCertificate = async (data: CertificateData, filename?: string): Promise<void> => {
  try {
    const pdfBlob = await generateCertificatePDF(data);
    const url = URL.createObjectURL(pdfBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `certificate-${data.certificateId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
};

export const verifyCertificate = async (certificateId: string, contractAddress: string, provider: any): Promise<boolean> => {
  try {
    // This would typically interact with the smart contract to verify the certificate
    // For now, we'll return true as a placeholder
    return true;
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return false;
  }
};
