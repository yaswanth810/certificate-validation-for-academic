// Mock certificate data for impressive demo presentation

export interface MockCertificate {
  tokenId: string;
  studentName: string;
  courseName: string;
  grade: string;
  department: string;
  issueDate: number;
  isRevoked: boolean;
  issuer: string;
  ipfsHash: string;
  verificationUrl: string;
}

export const mockCertificates: MockCertificate[] = [
  {
    tokenId: "1",
    studentName: "Arjun Reddy",
    courseName: "Advanced Blockchain Development",
    grade: "A+",
    department: "Computer Science & Engineering",
    issueDate: 1704067200, // Jan 1, 2024
    isRevoked: false,
    issuer: "0x742d35Cc6634C0532925a3b8D404fddF4b34c451",
    ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    verificationUrl: "https://edutrust.vignan.edu/verify?tokenId=1"
  },
  {
    tokenId: "2", 
    studentName: "Priya Sharma",
    courseName: "Artificial Intelligence & Machine Learning",
    grade: "A",
    department: "Computer Science & Engineering",
    issueDate: 1701388800, // Dec 1, 2023
    isRevoked: false,
    issuer: "0x742d35Cc6634C0532925a3b8D404fddF4b34c451",
    ipfsHash: "QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB",
    verificationUrl: "https://edutrust.vignan.edu/verify?tokenId=2"
  },
  {
    tokenId: "3",
    studentName: "Rahul Kumar",
    courseName: "Full Stack Web Development",
    grade: "A+",
    department: "Information Technology",
    issueDate: 1698710400, // Nov 1, 2023
    isRevoked: false,
    issuer: "0x742d35Cc6634C0532925a3b8D404fddF4b34c451",
    ipfsHash: "QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51",
    verificationUrl: "https://edutrust.vignan.edu/verify?tokenId=3"
  },
  {
    tokenId: "4",
    studentName: "Sneha Patel",
    courseName: "Cybersecurity Fundamentals",
    grade: "A",
    department: "Computer Science & Engineering",
    issueDate: 1696032000, // Oct 1, 2023
    isRevoked: false,
    issuer: "0x742d35Cc6634C0532925a3b8D404fddF4b34c451",
    ipfsHash: "QmRAQB6YaCyidP37UdDnjFY5vQuiBrcqdyoW1CuDgwxkD4",
    verificationUrl: "https://edutrust.vignan.edu/verify?tokenId=4"
  },
  {
    tokenId: "5",
    studentName: "Vikram Singh",
    courseName: "Data Science & Analytics",
    grade: "A+",
    department: "Information Technology",
    issueDate: 1693440000, // Sep 1, 2023
    isRevoked: false,
    issuer: "0x742d35Cc6634C0532925a3b8D404fddF4b34c451",
    ipfsHash: "QmYHGxLZaqkGT4u9MUUaXaFNvuL1N7zrhkPSrqRVHpgJMX",
    verificationUrl: "https://edutrust.vignan.edu/verify?tokenId=5"
  },
  {
    tokenId: "6",
    studentName: "Ananya Krishnan",
    courseName: "Cloud Computing & DevOps",
    grade: "A",
    department: "Computer Science & Engineering",
    issueDate: 1690761600, // Aug 1, 2023
    isRevoked: false,
    issuer: "0x742d35Cc6634C0532925a3b8D404fddF4b34c451",
    ipfsHash: "QmUNLLsPACCz1vLxQVkXqqLX5R1X345hhAoL4JBDQ6u3Ax",
    verificationUrl: "https://edutrust.vignan.edu/verify?tokenId=6"
  },
  {
    tokenId: "7",
    studentName: "Karthik Reddy",
    courseName: "Mobile App Development",
    grade: "A+",
    department: "Information Technology",
    issueDate: 1688083200, // Jul 1, 2023
    isRevoked: false,
    issuer: "0x742d35Cc6634C0532925a3b8D404fddF4b34c451",
    ipfsHash: "QmVHtWdaBiKUnYqGGq1rw5o3pcBhGgxNJkdmzDuQRRHTGU",
    verificationUrl: "https://edutrust.vignan.edu/verify?tokenId=7"
  },
  {
    tokenId: "8",
    studentName: "Divya Nair",
    courseName: "Internet of Things (IoT)",
    grade: "A",
    department: "Electronics & Communication",
    issueDate: 1685491200, // Jun 1, 2023
    isRevoked: false,
    issuer: "0x742d35Cc6634C0532925a3b8D404fddF4b34c451",
    ipfsHash: "QmTRxXnEeqR4hgdHgJgzNGbxgHiuyjgHvK8ENENzkiY5oX",
    verificationUrl: "https://edutrust.vignan.edu/verify?tokenId=8"
  }
];

export const mockStats = {
  totalCertificates: mockCertificates.length,
  recentCertificates: mockCertificates.slice(0, 3),
  certificatesByDepartment: {
    "Computer Science & Engineering": 4,
    "Information Technology": 3,
    "Electronics & Communication": 1
  },
  averageGrade: "A+",
  verificationRate: "100%",
  blockchainTransactions: mockCertificates.length,
  totalStudentsServed: 847,
  institutionRanking: "#1 in Blockchain Certificates"
};
