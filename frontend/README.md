# Hafidz Tracker

Website untuk membantu track dan manage hafalan Qur'an

## Fitur

- **Dashboard**: Quick overview tentang progress hafalan dan recent activities kamu
- **Qur'an Browser**: Baca Qur'an dengan teks Arab dan terjemahan Indonesia
- **Hafalan Management**: Track progress hafalan per surah dan ayat
- **Reminder System**: Setup reminder untuk muraja'ah ayat-ayat yang sudah dihafal
- **Progress Visualization**: Lihat kemajuan hafalan dalam bentuk chart interaktif

## Tech Stack

- React 19
- Material UI 7
- Vite
- React Router
- Axios for API calls
- Chart.js for data visualization

## Setup Project

1. Clone repo
   ```bash
   git clone https://github.com/alfajar-122140122/uas-pemrograman-web-122140122.git
   ```

2. Masuk ke folder frontend
   ```bash
   cd uas-pemrograman-web-122140122/frontend
   ```

3. Install dependencies
   ```bash
   npm install
   ```

4. Run development server
   ```bash
   npm run dev
   ```

## Qur'an API

App ini pakai Quran.cloud API untuk teks Arab dan terjemahan. API ini digunakan untuk:
- Get list surah
- Fetch ayat dan terjemahannya
- Get audio recitations

## Hafalan Management

Dengan fitur hafalan management dapat:
- Add new hafalan entries
- Track kualitas hafalan (excellent, good, average, poor)
- View progress by surah
- Manage jadwal hafalan kamu

## Progress Visualization

Feature visualisasi progress ini menyediakan:
- Monthly progress bar chart
- Juz distribution chart
- Quality distribution doughnut chart
- Progress comparison between time periods
- Insights tentang hafalan speed dan completion estimate

## Contributing

Project ini bagian dari tugas kuliah. Contributions are welcome setelah assignment selesai.

## Main Component Structure

- **Dashboard.jsx**: Main page dengan progress summary dan navigation menu
- **ProgressCharts.jsx**: Component untuk data visualization
- **HafalanManagement.jsx**: Component untuk manage hafalan entries
- **QuranBrowser.jsx**: Component untuk read Qur'an
- **MurajaahCalendar.jsx**: Component untuk schedule muraja'ah sessions
- **NotificationSystem.jsx**: Component untuk hafalan reminders

## Key Features Implemented

- Frontend dengan React & Material UI
- Interactive charts dengan Chart.js
- Responsive design untuk mobile dan desktop
- Quran.cloud API integration untuk Al-Quran data
- Smooth user flows dan navigasi
- Date filtering untuk analisis progress

## License

[MIT](LICENSE)
