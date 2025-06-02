# Hafidz Tracker

Ini adalah aplikasi web untuk menghafal Al-Quran (Hafalan). Aplikasi ini terdiri dari frontend berbasis React dan backend berbasis Python dengan framework Pyramid.

## Fitur

- Autentikasi pengguna (daftar, masuk)
- Menjelajahi surat dan ayat Al-Quran dari API alquran.cloud
- Membuat, membaca, memperbarui, dan menghapus catatan hafalan
- Mengatur pengingat untuk murajaah (revisi)
- Melacak kemajuan hafalan
- Dasbor dengan statistik dan pengingat yang akan datang

## Struktur Proyek

Proyek ini dibagi menjadi dua bagian utama:

1.  **Frontend**: React.js, Vite, Tailwind CSS, Material-UI
2.  **Backend**: Python dengan framework Pyramid, SQLAlchemy, autentikasi JWT

## Instruksi Pengaturan

### Backend

1.  Arahkan ke direktori backend:
    ```
    cd backend
    ```

2.  Instal dependensi:
    ```
    pip install -r requirements.txt
    ```

3.  Inisialisasi database:
    ```
    cd backend
    pip install -e .
    initialize_db development.ini
    ```

4.  Jalankan server backend:
    ```
    pserve development.ini --reload
    ```

Server backend akan tersedia di http://localhost:6543

### Frontend

1.  Arahkan ke direktori frontend:
    ```
    cd frontend
    ```

2.  Instal dependensi:
    ```
    npm install
    ```

3.  Mulai server pengembangan:
    ```
    npm run dev
    ```

Frontend akan tersedia di http://localhost:5173

## API Endpoint

### Autentikasi
- `POST /api/v1/auth/register`: Mendaftarkan pengguna baru
- `POST /api/v1/auth/login`: Masuk dan dapatkan token autentikasi

### Pengguna
- `GET /api/v1/users`: Dapatkan semua pengguna (hanya admin)
- `GET /api/v1/users/{user_id}`: Dapatkan detail pengguna
- `PUT /api/v1/users/{user_id}`: Perbarui pengguna
- `DELETE /api/v1/users/{user_id}`: Hapus pengguna

### Hafalan
- `GET /api/v1/users/{user_id}/hafalan`: Dapatkan semua catatan hafalan untuk pengguna
- `POST /api/v1/users/{user_id}/hafalan`: Buat catatan hafalan baru
- `GET /api/v1/hafalan/{hafalan_id}`: Dapatkan detail hafalan
- `PUT /api/v1/hafalan/{hafalan_id}`: Perbarui hafalan
- `DELETE /api/v1/hafalan/{hafalan_id}`: Hapus hafalan

### Pengingat
- `GET /api/v1/users/{user_id}/reminders`: Dapatkan semua pengingat untuk pengguna
- `POST /api/v1/users/{user_id}/reminders`: Buat pengingat baru
- `GET /api/v1/reminders/{reminder_id}`: Dapatkan detail pengingat
- `PUT /api/v1/reminders/{reminder_id}`: Perbarui pengingat
- `DELETE /api/v1/reminders/{reminder_id}`: Hapus pengingat

## API Eksternal

Aplikasi ini menggunakan [API alquran.cloud](https://alquran.cloud/api) untuk mengambil data Al-Quran.