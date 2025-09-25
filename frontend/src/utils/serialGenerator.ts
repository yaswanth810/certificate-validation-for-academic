/**
 * Generate a unique serial number based on timestamp and random number
 */
export const generateSerialNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${timestamp}${random}`;
};

/**
 * Generate a unique memo number based on current date and random suffix
 */
export const generateMemoNumber = (): string => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `VB ${year}${month}${random}`;
};

/**
 * Check if a serial number is available and generate a new one if needed
 */
export const getAvailableSerialNumber = async (
  checkFunction: (serialNo: string) => Promise<boolean>,
  maxAttempts: number = 10
): Promise<string> => {
  for (let i = 0; i < maxAttempts; i++) {
    const serialNo = generateSerialNumber();
    const isUsed = await checkFunction(serialNo);
    if (!isUsed) {
      return serialNo;
    }
  }
  throw new Error('Could not generate unique serial number after maximum attempts');
};

/**
 * Check if a memo number is available and generate a new one if needed
 */
export const getAvailableMemoNumber = async (
  checkFunction: (memoNo: string) => Promise<boolean>,
  maxAttempts: number = 10
): Promise<string> => {
  for (let i = 0; i < maxAttempts; i++) {
    const memoNo = generateMemoNumber();
    const isUsed = await checkFunction(memoNo);
    if (!isUsed) {
      return memoNo;
    }
  }
  throw new Error('Could not generate unique memo number after maximum attempts');
};
