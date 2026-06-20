import { NextResponse } from 'next/server';

/**
 * Telemetry API — sample data source.
 *
 * The dashboard / editor nodes bind to this endpoint via:
 *   - data.apiEndpoint   = "/api/telemetry"
 *   - data.dataSourceKey = "COMP-01"  (the key inside `devices` below)
 *
 * Each node metric reads `devices[dataSourceKey][metric.valueKey]`.
 *
 * Replace the body of GET() with your real OPC-UA / Modbus / MQTT bridge.
 * The shape just needs to stay: { devices: { [tag]: { [field]: value } } }
 *
 * Example consume (client):
 *   const res = await fetch('/api/telemetry');
 *   const { devices } = await res.json();
 *   const speed = devices['COMP-01'].loadPercent;
 */

type DeviceData = Record<string, string | number | boolean>;

function jitter(base: number, spread: number) {
  return Number((base + (Math.random() - 0.5) * spread).toFixed(1));
}

export async function GET() {
  // --- MOCK DATA (swap with real PLC bridge) -------------------------
  const devices: Record<string, DeviceData> = {
    'COMP-01': { status: 'RUN', loadPercent: jitter(70, 6), powerkW: jitter(75, 4), dischargeTemp: jitter(76.5, 2), flow: Math.round(jitter(595, 30)), runtimeHours: 4231 },
    'COMP-02': { status: 'STOP', loadPercent: 0, powerkW: 0, dischargeTemp: 22, flow: 0, runtimeHours: 3840 },
    'COMP-03': { status: 'STOP', loadPercent: 0, powerkW: 0, dischargeTemp: 22, flow: 0, runtimeHours: 1459 },
    'DRY-01': { status: 'RUN', dewPoint: jitter(-40, 2), outletTemp: jitter(19.8, 1) },
    'DRY-02': { status: 'STOP', dewPoint: 15, outletTemp: 22 },
    'TK-101': { pressure: jitter(7.25, 0.3), condensateLevel: jitter(25, 5) },
    'XV-101': { open: true },
    'PT-102': { pressure: jitter(7.15, 0.2) },
    'DPT-101': { dewPoint: jitter(-40, 2) },
    'FT-101': { flow: Math.round(jitter(850, 40)) },
    'FT-201': { flow: Math.round(jitter(450, 30)) },
    'FT-202': { flow: Math.round(jitter(400, 30)) },
    'FT-HB': { flow: Math.round(jitter(3400, 100)) },
    'BOILER-01': { status: 'RUN', pressure: jitter(12.3, 0.4), temp: jitter(182, 5) },
  };
  // -------------------------------------------------------------------------

  return NextResponse.json(
    { ts: new Date().toISOString(), devices },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
