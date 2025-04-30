import { createClient } from 'redis';

// Mengambil URL Redis dari environment variable, default ke localhost jika tidak ada
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Membuat instance klien Redis
const redisClient = createClient({
  url: redisUrl,
});

// Menangani error koneksi
redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Fungsi untuk menghubungkan klien (dipanggil sekali saat aplikasi start jika diperlukan)
// Atau biarkan klien terhubung secara otomatis saat perintah pertama dijalankan
// async function connectRedis() {
//   if (!redisClient.isOpen) {
//     await redisClient.connect();
//   }
// }

// connectRedis(); // Panggil jika ingin koneksi di awal

// Ekspor klien untuk digunakan di bagian lain aplikasi
export default redisClient;

// Fungsi helper untuk memastikan koneksi sebelum operasi
// (Berguna jika tidak melakukan koneksi di awal)
export async function ensureRedisConnection() {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log('Connected to Redis');
    } catch (err) {
      console.error('Failed to connect to Redis:', err);
      // Melempar ulang error atau menangani sesuai kebutuhan aplikasi
      throw err;
    }
  }
}