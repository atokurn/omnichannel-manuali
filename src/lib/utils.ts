import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fungsi untuk format angka dengan pemisah ribuan
export const formatNumberWithSeparator = (number: number | null | undefined): string => {
  if (number === null || number === undefined) {
    return '-'; // Atau string kosong '', tergantung preferensi
  }
  // Tampilkan tanda negatif jika angka negatif
  const formattedNumber = Math.abs(number).toLocaleString('id-ID');
  return number < 0 ? `-${formattedNumber}` : formattedNumber;
};
