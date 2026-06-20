/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AlarmSeverity = 'WARNING' | 'CRITICAL';

export interface Alarm {
  id: string;
  time: string;
  device: string;
  tag: string;
  message: string;
  severity: AlarmSeverity;
  acknowledged: boolean;
}

export type MachineStatus = 'RUN' | 'STOP' | 'FAULT';

export interface Compressor {
  id: string;
  tag: string;
  name: string;
  status: MachineStatus;
  loadPercent: number; // 0 - 100
  powerkW: number;
  dischargeTemp: number; // °C
  dischargePressure: number; // bar
  runtimeHours: number;
}

export interface Dryer {
  id: string;
  tag: string;
  name: string;
  status: MachineStatus;
  dewPoint: number; // °C
  outletTemp: number; // °C
}

export interface ReceiverTank {
  id: string;
  tag: string;
  pressure: number; // bar
  condensateLevel: number; // 0 - 100%
  autoDrainActive: boolean;
}

export interface Valve {
  id: string;
  tag: string;
  name: string;
  open: boolean;
  mode: 'REMOTE' | 'MANUAL';
  interlocked: boolean;
}

export interface Branch {
  tag: string;
  name: string;
  flow: number; // Nm3/h
  pressure: number; // bar
  temp: number; // °C
  demandFactor: number; // 0.1 to 1.5
}

export interface SystemTelemetry {
  compressors: Compressor[];
  dryers: Dryer[];
  tank: ReceiverTank;
  valves: { [key: string]: Valve };
  header: {
    pressure: number;
    flow: number;
  };
  branches: {
    weaving: Branch;
    spinning: Branch;
  };
  alarms: Alarm[];
  overallStatus: 'NORMAL' | 'WARNING' | 'ALARM';
  simMode: 'NORMAL' | 'LEAK' | 'DRYER_FAULT' | 'PEAK_DEMAND';
}
