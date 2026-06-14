# Compressed Air SCADA Dashboard (Next.js)

Industrial-grade dashboard for monitoring and simulating compressed air systems. 

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4, Shadcn/UI
- **Icons:** Lucide React
- **Animations:** Framer Motion, NumberFlow
- **Visualization:** Recharts & SVG Piping

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

## Migration Note
This project was migrated from a React + Vite setup to Next.js App Router for better scalability and developer experience.

## Routes
- `/` : Main Monitoring Dashboard (membaca layout dari editor bila sudah disimpan)
- `/compressed-air` : Interactive System Flow Canvas Editor (Drag & Drop)
- `/api/telemetry` : Sample SCADA data source (REST JSON)

## Canvas Editor (`/compressed-air`)
- **Load Template**: kalau canvas kosong, klik tombol *Load Default Template* untuk memuat layout standar (mirip dashboard).
- **Drag & Drop**: tarik equipment dari palette kiri ke canvas.
- **Toggle ON/OFF**: double-click node untuk start/stop aliran. Pipa otomatis jadi abu-abu + nilai 0 saat sumber STOP.
- **Reroute Pipa**: klik pipa untuk select, lalu double-click pada pipa untuk menambah titik belok (waypoint). Drag titik putih untuk memindahkan jalur. Double-click titik untuk menghapus.
- **Edit Node**: klik node → panel kanan (Tag, Display Name, Status, Data Binding, Custom Metrics, Styling).
- **Save & Exit**: simpan ke localStorage lalu kembali ke dashboard `/`.

## Data Integration (API)
Node mengambil data live lewat REST. Setiap node punya binding:
- `apiEndpoint` — contoh `/api/telemetry`
- `dataSourceKey` — key device di payload, contoh `COMP-01`
- `metrics[]` — baris data yang ditampilkan (label, `valueKey`, unit, fallback)

Kontrak payload `/api/telemetry`:
```json
{
  "ts": "2026-06-14T10:00:00.000Z",
  "devices": {
    "COMP-01": { "status": "RUN", "loadPercent": 70, "powerkW": 75, "dischargeTemp": 76.5, "flow": 595 },
    "FT-101":  { "flow": 850 }
  }
}
```
Node membaca `devices[dataSourceKey][metric.valueKey]`. Untuk integrasi PLC asli, ganti isi `GET()` di `src/app/api/telemetry/route.ts` dengan bridge OPC-UA / Modbus / MQTT Anda — bentuk JSON tetap sama.

Contoh consume manual:
```ts
const res = await fetch('/api/telemetry');
const { devices } = await res.json();
const speed = devices['COMP-01'].loadPercent;
```

## Features
- Real-time P&ID HMI Graphic Screen
- Simulation Modes (Leak, Dryer Fault, Peak Demand)
- Dynamic Alarm Queue
- Historical Trend Sparklines
- Dark/Light Theme Support
