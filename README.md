# 🧠 AI-Powered Interactive DFA Simulator

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![React Flow](https://img.shields.io/badge/React_Flow-v11-FF0072?style=for-the-badge&logo=react)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-764ABC?style=for-the-badge)
![MiniMax](https://img.shields.io/badge/AI-MiniMax_M2.7-00A67E?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

Simulator **Deterministic Finite Automata (DFA)** dan **Non-Deterministic Finite Automata (NFA)** berbasis web yang diperkuat dengan kecerdasan buatan (AI) dan penganalisis kerentanan keamanan (ReDoS). 

Proyek ini mendobrak batasan simulator tradisional (seperti JFLAP) dengan mengintegrasikan **Cognitive AI Layer** yang menerjemahkan bahasa alami langsung menjadi representasi matematis 5-Tuple, serta fitur **Cybersecurity ReDoS Metric** untuk mendeteksi *state explosion* dan *catastrophic backtracking*.

---

## 📑 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Instalasi](#-instalasi)
3. [Panduan Penggunaan](#-panduan-penggunaan)
4. [Tech Stack](#-tech-stack)

---

## ✨ Fitur Utama

- 🤖 **AI-Driven 5-Tuple Generation:** Ketikkan deskripsi bahasa (misal: *"DFA yang menerima string biner berakhiran 01"*) dan AI MiniMax-M2.7 akan menyusun struktur JSON matematis ($Q, \Sigma, \delta, q_0, F$) secara presisi.
- 🎨 **Interactive Graph Visualization:** Visualisasi graf interaktif menggunakan *React Flow* dan algoritma tata letak *Dagre*. State dapat diedit, dipindahkan, ditambah, dan dihubungkan secara langsung melalui *canvas*.
- 🔍 **Simulation & Tracing:** Fitur *Trace Player* untuk menganimasikan perpindahan *state* secara *step-by-step* ketika memproses input *string*, lengkap dengan validasi *Dead State*.
- 🛡️ **ReDoS / State Explosion Analytics:** Dasbor yang secara *real-time* menganalisis kekompleksan komputasi. Memperingatkan pengguna apabila model NFA yang dibuat berpotensi mengalami *Catastrophic Backtracking* ($O(2^n)$) yang rentan terhadap serangan ReDoS (*Regular Expression Denial of Service*).
- 📊 **Bulk Tester & Export:** Fasilitas pengujian massal (memasukkan banyak *string* sekaligus) dan ekspor tampilan kanvas serta hasil analisis menjadi laporan berformat PDF untuk kebutuhan akademis.

---

## 🚀 Instalasi

Pastikan **Node.js** (v18+) telah terpasang di sistem Anda.

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/username/dfa-simulator.git
   cd dfa-simulator
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Buat file `.env.local` di root direktori dan tambahkan API Key MiniMax Anda:
   ```env
   MINIMAX_API_KEY=your_minimax_api_key_here
   ```

4. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di peramban Anda.

---

## 📖 Panduan Penggunaan

1. **Membuat Automata via AI:**
   - Fokus ke panel sebelah kiri, temukan "Generator AI".
   - Masukkan *prompt* dalam Bahasa Indonesia atau Inggris, misalnya: *"Buat NFA yang menerima string yang mengandung '11' atau '00'"*.
   - Klik **Buat Automata**. Graf akan langsung tergambar di kanvas utama.

2. **Mengedit Graf Secara Manual:**
   - Gunakan *Floating Toolbar* di pojok kiri atas kanvas untuk menambah state baru (`+`).
   - Tarik garis (*drag*) dari bulatan (handle) satu state ke state lain untuk membuat fungsi transisi ($\delta$). Sistem akan meminta Anda memasukkan simbol transisi.
   - Klik sebuah state, lalu gunakan *toolbar* untuk menandainya sebagai *Initial State* atau *Accept State*.

3. **Menganalisis Kerentanan ReDoS:**
   - Buka bagian **Analitik ReDoS** di sisi kanan bawah.
   - Masukkan *string* uji. Sistem akan melacak jumlah langkah (*steps*) yang dibutuhkan model untuk mengevaluasi input tersebut. 
   - Jika rasio langkah dibandingkan panjang *string* sangat tinggi, peringatan merah **Risiko Kritis** akan menyala.

4. **Ekspor Laporan:**
   - Klik tombol **Unduh Laporan** di sudut kanan atas halaman untuk mengekspor tampilan arsitektur menjadi dokumen PDF yang elegan.
