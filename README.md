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
- `/` : Main Monitoring Dashboard
- `/compressed-air` : Interactive System Flow Canvas Editor (Drag & Drop)
- Real-time P&ID HMI Graphic Screen
- Simulation Modes (Leak, Dryer Fault, Peak Demand)
- Dynamic Alarm Queue
- Historical Trend Sparklines
- Dark/Light Theme Support
