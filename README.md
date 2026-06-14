# Industrial SCADA Dashboard (Next.js)

Industrial-grade dashboard for monitoring and simulating production systems (Compressed Air, Steam/Boiler). 

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4, Shadcn/UI
- **Icons:** Lucide React
- **Animations:** Framer Motion, NumberFlow
- **Visualization:** `@xyflow/react` (Canvas Editor), Recharts & SVG Piping

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

## Application Routes

Tim dan operator dapat mengakses route/halaman berikut secara manual via browser:

### 1. Main Monitoring (`/`)
Dashboard utama untuk memonitor SCADA.
- Halaman ini akan me-load **Custom Layout** yang dibuat di Editor secara otomatis jika sudah pernah di-save ke browser (via localStorage).
- Jika belum ada layout yang tersimpan, akan memunculkan *Fallback SVG Map* (P&ID interaktif versi awal).
- Anda bisa men-toggle (klik) komponen (Compressor/Dryer/Valve) untuk ON/OFF langsung dari dashboard. Aliran pipa akan mati/menyala menyesuaikan status.

### 2. Compressed Air System Editor (`/compressed-air`)
Interactive Canvas berbasis *Drag & Drop* untuk menggambar ulang dan menyusun denah perpipaan pabrik.
- **Load Template**: Jika canvas kosong, klik tombol `Load Default Template` (icon grid di top toolbar) untuk memuat set lengkap template bawaan pabrik.
- **Drag & Drop**: Tarik logo perangkat dari Palette di sebelah kiri ke area canvas tengah.
- **Tarik Pipa (Routing)**: Arahkan kursor ke sisi perangkat (Atas/Bawah/Kiri/Kanan) hingga muncul handle abu-abu, lalu tarik (drag) garis ke handle di perangkat lain untuk menghubungkan pipa.
- **Custom Titik Belok Pipa**: 
  - Double-click pada badan pipa yang sudah jadi untuk membuat titik belok (waypoint).
  - Drag titik putih tersebut untuk mengatur kemana pipa harus berbelok (routing).
  - Double-click pada titik putih tersebut jika ingin menghapusnya agar pipa kembali lurus.
- **Pindah / Reconnect Ujung Pipa**: Klik pada pipa untuk memilihnya, lalu drag handle di ujung pipa ke perangkat yang berbeda untuk memindahkan sambungan.
- **Edit Node (Panel Kanan)**: Klik sebuah komponen di canvas, lalu perhatikan panel di sebelah kanan. Anda dapat mengedit *Tag Name, Display Name*, mengubah *Data Binding*, menambah *Custom Metrics*, dan menyesuaikan *Styling* (warna & glow).
- **Simulasi Node (Toggle ON/OFF)**: Double-click pada node (Compressor/Boiler/Valve) untuk toggle antara status `RUN` dan `STOP`. Pipa yang terhubung ke node berstatus `STOP` akan otomatis berubah warna menjadi abu-abu dan aliran animasinya berhenti.
- **Save & Exit**: Tekan tombol `Save & Exit` di sudut kanan atas untuk menyimpan layout Anda (ke localStorage), kemudian Anda akan diarahkan kembali ke Dashboard utama (`/`) untuk melihat hasilnya secara *Live*.

### 3. Steam Plant Dashboard (`/steam-plant`)
Halaman placeholder/layout untuk sistem perpipaan dan boiler uap (Steam Generation). *Note: masih dalam tahap layouting UI, dapat difungsikan ke depannya sama seperti Compressed Air.*

---

## Data Integration (REST API)

### 4. Telemetry Endpoint (`/api/telemetry`)
Semua Node dan Dashboard mendapatkan live-data simulasi / PLC bridge dari route API internal ini. Data diakses via `GET /api/telemetry` dan mengembalikan JSON Payload standar.

Setiap node yang di-drag di Editor memiliki kapabilitas *Data Binding* di panel Properties. Node membutuhkan:
- **`apiEndpoint`** : Defaultnya `/api/telemetry`
- **`dataSourceKey`** : Key identifier perangkat di payload API (contoh: `COMP-01`, `FT-HB`, `TK-101`)
- **`metrics[]`** : Daftar baris/rows yang ditampilkan pada node (dengan field *Label*, *Value Key* yang dibaca dari payload API, *Unit*, dan *Fallback* jika error).

**Kontrak Payload `/api/telemetry`:**
```json
{
  "ts": "2026-06-14T10:00:00.000Z",
  "devices": {
    "COMP-01": { "status": "RUN", "loadPercent": 70, "powerkW": 75, "dischargeTemp": 76.5, "flow": 595 },
    "FT-101":  { "flow": 850 },
    "XV-101":  { "open": true },
    "BOILER-01": { "status": "RUN", "pressure": 12.3, "temp": 182 }
  }
}
```

#### Cara Tim/Backend Melakukan Integrasi ke Real PLC (OPC-UA/Modbus)
Buka file `src/app/api/telemetry/route.ts`. Di dalam sana ada objek *mock data* `devices`. Ganti logic pengisian objek tersebut dengan library / service *driver bridge* PLC yang digunakan perusahaan. Selama struktur kembalian (JSON contract) nya dipertahankan berupa key tag identifier (`COMP-01`) dengan propertiesnya, Dashboard HMI Canvas tidak perlu dimodifikasi ulang sama sekali.

Contoh cara client mengkonsumsi endpoint ini secara manual bila ingin membuat komponen terpisah di luar canvas:
```ts
const res = await fetch('/api/telemetry');
const { devices } = await res.json();
const speed = devices['COMP-01'].loadPercent;
```

## Features List Summary
- Node-Based Visual System Modeler (`@xyflow/react`)
- Drag & Drop Hardware Templating
- Draggable Pipe Bending & Auto-Animation Flow Status
- Persistent LocalStorage Dashboard Layout
- Dynamic Alarm Queue
- Historical Trend Sparklines
- Dark/Light Theme Support
- Dynamic Data Metrics Binding
