"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { SystemTelemetry, Alarm } from '@/types/scada';
import Header from '@/components/Header';
import MonitoringCanvas from '@/components/MonitoringCanvas';
import RightPanel from '@/components/RightPanel';
import { useTheme } from '@/context/ThemeContext';

export default function ScadaDashboard() {
  const { theme } = useTheme();
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    compressors: [
      {
        id: 'C1',
        tag: 'COMP-01',
        name: 'Rotary Screw Compressor A',
        status: 'RUN',
        loadPercent: 70,
        powerkW: 75,
        dischargeTemp: 76.5,
        dischargePressure: 7.4,
        runtimeHours: 4231,
      },
      {
        id: 'C2',
        tag: 'COMP-02',
        name: 'Rotary Screw Compressor B',
        status: 'STOP',
        loadPercent: 0,
        powerkW: 90,
        dischargeTemp: 22.1,
        dischargePressure: 0.0,
        runtimeHours: 3840,
      },
      {
        id: 'C3',
        tag: 'COMP-03',
        name: 'Rotary Screw Compressor C',
        status: 'STOP',
        loadPercent: 0,
        powerkW: 85,
        dischargeTemp: 21.8,
        dischargePressure: 0.0,
        runtimeHours: 1459,
      },
    ],
    dryers: [
      {
        id: 'D1',
        tag: 'DRY-01',
        name: 'Refrigerated Dryer A',
        status: 'RUN',
        dewPoint: -40.0,
        outletTemp: 21.2,
      },
      {
        id: 'D2',
        tag: 'DRY-02',
        name: 'Refrigerated Dryer B',
        status: 'STOP',
        dewPoint: 15.0,
        outletTemp: 22.0,
      },
    ],
    tank: {
      id: 'T1',
      tag: 'TK-101',
      pressure: 7.25,
      condensateLevel: 25.0,
      autoDrainActive: false,
    },
    valves: {
      'XV-101': {
        id: 'V1',
        tag: 'XV-101',
        name: 'Primary Isolation Valve',
        open: true,
        mode: 'REMOTE',
        interlocked: false,
      },
      'XV-201': {
        id: 'V2',
        tag: 'XV-201',
        name: 'Weaving Branch Valve',
        open: true,
        mode: 'REMOTE',
        interlocked: false,
      },
      'XV-202': {
        id: 'V3',
        tag: 'XV-202',
        name: 'Spinning Branch Valve',
        open: true,
        mode: 'REMOTE',
        interlocked: false,
      },
    },
    header: {
      pressure: 7.15,
      flow: 850.0,
    },
    branches: {
      weaving: {
        tag: 'WEAVE',
        name: 'Weaving Air Demand',
        flow: 450.0,
        pressure: 7.12,
        temp: 22.4,
        demandFactor: 1.0,
      },
      spinning: {
        tag: 'SPINNING',
        name: 'Spinning Air Demand',
        flow: 400.0,
        pressure: 7.08,
        temp: 22.1,
        demandFactor: 1.0,
      },
    },
    alarms: [],
    overallStatus: 'NORMAL',
    simMode: 'NORMAL',
  });

  const [historyPressure, setHistoryPressure] = useState<number[]>(() =>
    Array.from({ length: 25 }, (_, index) => Number((6.2 + (index % 5) * 0.08).toFixed(2)))
  );
  const [historyFlow, setHistoryFlow] = useState<number[]>(() =>
    Array.from({ length: 25 }, (_, index) => 730 + (index % 6) * 10)
  );
  const [historyDewPoint, setHistoryDewPoint] = useState<number[]>(() =>
    Array.from({ length: 25 }, (_, index) => Number((-42 + (index % 5) * 0.8).toFixed(1)))
  );



  const [alarmsMuted, setAlarmsMuted] = useState<boolean>(false);
  const tickCounter = useRef<number>(0);


  const emitAlarm = (tag: string, device: string, message: string, severity: 'WARNING' | 'CRITICAL') => {
    const timestamp = new Date().toLocaleTimeString(undefined, { hour12: false });
    const id = tag + '-' + Date.now();

    setTelemetry((prev) => {
      const isDuplicate = prev.alarms.some((a) => a.tag === tag && a.message === message && !a.acknowledged);
      if (isDuplicate) return prev;

      const newAlarm: Alarm = {
        id,
        time: timestamp,
        device,
        tag,
        message,
        severity,
        acknowledged: false,
      };

      return {
        ...prev,
        alarms: [newAlarm, ...prev.alarms],
      };
    });
  };

  const toggleCompressor = (id: string) => {
    setTelemetry((prev) => {
      const updated = prev.compressors.map((comp) => {
        if (comp.id === id) {
          const nextStatus = comp.status === 'RUN' ? 'STOP' : 'RUN';
          setTimeout(() => {
            emitAlarm(
              comp.tag,
              'Compressors',
              `Manual Operator action: SET status command to ${nextStatus}`,
              'WARNING'
            );
          }, 10);
          return {
            ...comp,
            status: nextStatus as 'RUN' | 'STOP',
            loadPercent: nextStatus === 'RUN' ? 50 : 0,
          };
        }
        return comp;
      });
      return { ...prev, compressors: updated };
    });
  };

  const forceCompressorFault = (id: string) => {
    setTelemetry((prev) => {
      const updated = prev.compressors.map((comp) => {
        if (comp.id === id) {
          if (comp.status === 'FAULT') {
            setTimeout(() => {
              emitAlarm(comp.tag, 'Compressor Reset', 'Operator executed fault safety acknowledgement & restart core', 'WARNING');
            }, 10);
            return { ...comp, status: 'STOP' as const, loadPercent: 0 };
          } else {
            setTimeout(() => {
              emitAlarm(
                comp.tag,
                'Compressor Trip',
                `ALARM: Thermal safety trip triggered. Mechanical pressure overload on rotor screws.`,
                'CRITICAL'
              );
            }, 10);
            return { ...comp, status: 'FAULT' as const, loadPercent: 0 };
          }
        }
        return comp;
      });
      return { ...prev, compressors: updated };
    });
  };

  const toggleValve = (tag: string) => {
    setTelemetry((prev) => {
      const valve = prev.valves[tag];
      if (!valve) return prev;
      const nextOpen = !valve.open;
      setTimeout(() => {
        emitAlarm(
          tag,
          'Valves',
          `Valving sequence call: Actuator set to ${nextOpen ? 'OPEN (GREEN)' : 'CLOSED (RED)'}`,
          'WARNING'
        );
      }, 10);
      return {
        ...prev,
        valves: {
          ...prev.valves,
          [tag]: { ...valve, open: nextOpen },
        },
      };
    });
  };

  const toggleDryerStatus = (id: string) => {
    setTelemetry((prev) => {
      const updated = prev.dryers.map((dryer) => {
        if (dryer.id === id) {
          const nextStatus = dryer.status === 'RUN' ? 'STOP' : 'RUN';
          setTimeout(() => {
            emitAlarm(
              dryer.tag,
              'Dryers',
              `Manual Operator override toggle: Set Dryer to ${nextStatus === 'RUN' ? 'ONLINE' : 'BYPASS'}`,
              'WARNING'
            );
          }, 10);
          return { ...dryer, status: nextStatus as 'RUN' | 'STOP' };
        }
        return dryer;
      });
      return { ...prev, dryers: updated };
    });
  };

  const handleAcknowledgeAlarm = (id: string) => {
    setTelemetry((prev) => ({
      ...prev,
      alarms: prev.alarms.map((al) => (al.id === id ? { ...al, acknowledged: true } : al)),
    }));
  };

  const handleClearAlarms = () => {
    setTelemetry((prev) => ({
      ...prev,
      alarms: prev.alarms.filter((al) => !al.acknowledged),
    }));
  };

  const setSimMode = (mode: SystemTelemetry['simMode']) => {
    setTelemetry((prev) => {
      let message = '';
      if (mode === 'NORMAL') message = 'System restored to nominal operational bounds.';
      else if (mode === 'LEAK') message = 'WARNING: Simulated main delivery pipeline fracture test initialized. Pressure loss surge injected.';
      else if (mode === 'DRYER_FAULT') message = 'CRITICAL: Dryer_fault test running. Thermal coils in DRY-01 bypassed.';
      else if (mode === 'PEAK_DEMAND') message = 'Process demand wave initiated. Weaving & Spinning workshops operating at full production.';

      setTimeout(() => {
        emitAlarm('SYS-CTRL', 'Simulation Controller', message, mode === 'NORMAL' ? 'WARNING' : 'CRITICAL');
      }, 10);

      let compUpdate = [...prev.compressors];
      let dryerUpdate = [...prev.dryers];

      if (mode === 'NORMAL') {
        compUpdate = compUpdate.map((c) =>
          c.tag === 'COMP-01' ? { ...c, status: 'RUN' as const } : { ...c, status: 'STOP' as const }
        );
        dryerUpdate = dryerUpdate.map((d) =>
          d.tag === 'DRY-01' ? { ...d, status: 'RUN' as const } : { ...d, status: 'STOP' as const }
        );
      } else if (mode === 'DRYER_FAULT') {
        dryerUpdate = dryerUpdate.map((d) =>
          d.tag === 'DRY-01' ? { ...d, status: 'FAULT' as const } : d
        );
      }

      return {
        ...prev,
        simMode: mode,
        compressors: compUpdate,
        dryers: dryerUpdate,
      };
    });
  };

  const resetSimulation = () => {
    setTelemetry((prev) => ({
      ...prev,
      tank: { ...prev.tank, pressure: 7.25, condensateLevel: 25.0, autoDrainActive: false },
      valves: {
        'XV-101': { ...prev.valves['XV-101'], open: true },
        'XV-201': { ...prev.valves['XV-201'], open: true },
        'XV-202': { ...prev.valves['XV-202'], open: true },
      },
      compressors: prev.compressors.map((c, idx) =>
        idx === 0
          ? { ...c, status: 'RUN', loadPercent: 70 }
          : { ...c, status: 'STOP', loadPercent: 0 }
      ),
      dryers: prev.dryers.map((d, idx) =>
        idx === 0
          ? { ...d, status: 'RUN', dewPoint: -40.0 }
          : { ...d, status: 'STOP', dewPoint: 15.0 }
      ),
      simMode: 'NORMAL',
      alarms: [],
    }));
    setHistoryPressure(Array.from({ length: 25 }, () => 7.2 + Math.random() * 0.1));
    setHistoryFlow(Array.from({ length: 25 }, () => 850 + Math.random() * 20));
    setHistoryDewPoint(Array.from({ length: 25 }, () => -40 + Math.random() * 1));
    emitAlarm('SYS-RESET', 'HMI Master', 'System telemetry core databases reindexed & refreshed. Hard reset successful.', 'WARNING');
  };

  useEffect(() => {
    const runSimulationTick = () => {
      setTelemetry((prev) => {
        tickCounter.current++;

        let totalFlowGenerated = 0;


        const updatedCompressors = prev.compressors.map((comp) => {
          if (comp.status === 'RUN') {
            let targetLoad = comp.loadPercent;
            const tankP = prev.tank.pressure;

            if (tankP > 8.5) targetLoad = 0;
            else if (tankP > 8.0) targetLoad = Math.max(30, targetLoad - 15);
            else if (tankP > 7.6) targetLoad = Math.max(50, targetLoad - 5);
            else if (tankP < 6.4) targetLoad = Math.min(100, targetLoad + 15);
            else if (tankP < 7.0) targetLoad = Math.min(90, targetLoad + 8);

            targetLoad = Math.max(0, Math.min(100, targetLoad + (Math.random() * 4 - 2)));

            const currentFlow = 8.5 * targetLoad;
            const currentPower = 50 + 0.45 * targetLoad;
            const currentTemp = 65 + 0.25 * targetLoad + Math.sin(Date.now() / 10000) * 2;

            totalFlowGenerated += currentFlow;

            return {
              ...comp,
              loadPercent: Math.round(targetLoad),
              powerkW: Math.round(currentPower),
              dischargeTemp: Number(currentTemp.toFixed(1)),
              dischargePressure: Number((tankP + 0.15).toFixed(2)),
            };
          } else {
            const ambient = 22.0 + Math.sin(Date.now() / 5000) * 0.4;
            const nextTemp = Math.max(ambient, comp.dischargeTemp - 3.5);
            return {
              ...comp,
              loadPercent: 0,
              dischargeTemp: Number(nextTemp.toFixed(1)),
              dischargePressure: 0,
            };
          }
        });

        const isC1Running = updatedCompressors[0].status === 'RUN';
        const isC2Running = updatedCompressors[1].status === 'RUN';
        const isC3Running = updatedCompressors[2].status === 'RUN';
        const tankPressure = prev.tank.pressure;

        if (tankPressure < 6.2 && isC1Running && !isC2Running && updatedCompressors[1].status !== 'FAULT') {
          updatedCompressors[1].status = 'RUN';
          updatedCompressors[1].loadPercent = 60;
          setTimeout(() => {
            emitAlarm('SCADA-PLC', 'Sequencer Core', 'PLC CASCADE TRIGGER: Primary pressure below 6.2 bar. Auto-firing standby COMP-02.', 'WARNING');
          }, 10);
        }

        if (tankPressure < 5.7 && isC2Running && !isC3Running && updatedCompressors[2].status !== 'FAULT') {
          updatedCompressors[2].status = 'RUN';
          updatedCompressors[2].loadPercent = 70;
          setTimeout(() => {
            emitAlarm('SCADA-PLC', 'Sequencer Core', 'PLC CRITICAL CASCADE: Emergency low pressure below 5.7 bar. Launching terminal backup COMP-03.', 'CRITICAL');
          }, 10);
        }

        if (tankPressure > 7.9 && isC3Running) {
          updatedCompressors[2].status = 'STOP';
          setTimeout(() => {
            emitAlarm('SCADA-PLC', 'Sequencer Core', 'PLC DECASCADING: Buffer pressure recovered to >7.9 bar. High-efficiency shutdown of COMP-03.', 'WARNING');
          }, 10);
        }
        if (tankPressure > 8.1 && isC2Running) {
          updatedCompressors[1].status = 'STOP';
          setTimeout(() => {
            emitAlarm('SCADA-PLC', 'Sequencer Core', 'PLC DECASCADING: Pressure stabilized at 8.1 bar. Terminating secondary aid COMP-02.', 'WARNING');
          }, 10);
        }

        const isAnyDryerOnline = prev.dryers.some((d) => d.status === 'RUN');

        const updatedDryers = prev.dryers.map((dryer) => {
          if (dryer.status === 'RUN') {
            const targetDew = -40.0 + (prev.simMode === 'PEAK_DEMAND' ? 5.0 : 0);
            const currentDew = dryer.dewPoint + (targetDew - dryer.dewPoint) * 0.3;
            const currentTemp = 19.5 + Math.random() * 0.5;
            return {
              ...dryer,
              dewPoint: Number(currentDew.toFixed(1)),
              outletTemp: Number(currentTemp.toFixed(1)),
            };
          } else if (dryer.status === 'FAULT') {
            const currentDew = Math.min(18.5, dryer.dewPoint + 4.2);
            const currentTemp = Math.min(32.0, dryer.outletTemp + 1.2);
            return {
              ...dryer,
              dewPoint: Number(currentDew.toFixed(1)),
              outletTemp: Number(currentTemp.toFixed(1)),
            };
          } else {
            return {
              ...dryer,
              dewPoint: 15.0,
              outletTemp: 22.0,
            };
          }
        });

        const mainOpen = prev.valves['XV-101'].open;
        const weaveOpen = prev.valves['XV-201'].open;
        const spinOpen = prev.valves['XV-202'].open;

        let baseWeaking = 450.0;
        let baseSpinning = 400.0;

        if (prev.simMode === 'PEAK_DEMAND') {
          baseWeaking = 620.0;
          baseSpinning = 540.0;
        }

        const weaveFlow = mainOpen && weaveOpen ? baseWeaking * (tankPressure / 7.2) : 0;
        const spinFlow = mainOpen && spinOpen ? baseSpinning * (tankPressure / 7.2) : 0;
        const leakFlow = prev.simMode === 'LEAK' && mainOpen ? 210.0 : 0;

        const totalDemandOutflow = weaveFlow + spinFlow + leakFlow;
        const flowDiff = totalFlowGenerated - (mainOpen ? totalDemandOutflow : 0);
        const dp = flowDiff * 0.00065;
        let nextTankPressure = Math.max(0.0, prev.tank.pressure + dp);

        if (nextTankPressure >= 8.8) {
          nextTankPressure = 8.8;
          setTimeout(() => {
            emitAlarm('TK-101', 'Overpressure Safety Valve', 'SAFETY OVERPRESSURE RELIEF POPPED: Air vented at maximum rate. System pressure exceeds structural thresholds.', 'CRITICAL');
          }, 10);
        }

        let condensateDelta = 0.03;
        const currentActiveDewPoint = updatedDryers.find((d) => d.status === 'RUN')?.dewPoint ?? 15.0;
        if (currentActiveDewPoint > 5.0 || !isAnyDryerOnline) {
          condensateDelta = 0.28;
        }

        let nextCondensate = prev.tank.condensateLevel + condensateDelta;
        nextCondensate = Math.max(0, Math.min(100, nextCondensate));

        const decayBranchPressure = (currentP: number) => Math.max(0.0, currentP * 0.82);

        const nextHeaderP = mainOpen ? Math.max(0.0, nextTankPressure - totalDemandOutflow * 0.0001) : 0.0;
        const nextWeaveP = mainOpen && weaveOpen
          ? Math.max(0.0, nextHeaderP - weaveFlow * 0.00008)
          : decayBranchPressure(prev.branches.weaving.pressure);
        const nextSpinP = mainOpen && spinOpen
          ? Math.max(0.0, nextHeaderP - spinFlow * 0.00008)
          : decayBranchPressure(prev.branches.spinning.pressure);

        const baseFeedTemp = isAnyDryerOnline ? currentActiveDewPoint + 22 : 25.0;
        const nextWeaveTemp = weaveOpen ? baseFeedTemp + weaveFlow * 0.001 : 22.0 + Math.random() * 0.2;
        const nextSpinTemp = spinOpen ? baseFeedTemp + spinFlow * 0.001 : 21.8 + Math.random() * 0.2;

        if (tickCounter.current % 3 === 0) {
          if (nextTankPressure > 8.3) {
            setTimeout(() => {
              emitAlarm('PT-101', 'Tank Sensor', 'PT-101 Alert: Tank pressure approaching critical envelope limits (>8.3 bar)', 'CRITICAL');
            }, 5);
          }
          if (nextTankPressure < 5.8 && totalDemandOutflow > 100) {
            setTimeout(() => {
              emitAlarm('PT-101', 'Header Pressure', 'PT-102 Warning: Distribution system line head pressure dropping severely below 5.8 bar.', 'WARNING');
            }, 5);
          }
          if (currentActiveDewPoint > 5.0) {
            setTimeout(() => {
              emitAlarm('DPT-101', 'Dew Point Sensor', 'DPT-101 CRITICAL ALERT: High Moisture bypass detected! Condensation hazard in electronics & weaving lines.', 'CRITICAL');
            }, 5);
          }
          if (nextCondensate > 70.0) {
            setTimeout(() => {
              emitAlarm('TK-101-LV', 'Liquid Level Switch', 'TK-101 Warning: Water build-up exceeding 70% bounds. Immediate drain scavenging required.', 'WARNING');
            }, 5);
          }
          if (nextCondensate > 90.0) {
            setTimeout(() => {
              emitAlarm('TK-101-LV', 'Liquid Level Switch', 'TK-101 HEAVY CARRY-OVER CRISIS: Water levels over 90%. Automatic line protection may cycle.', 'CRITICAL');
            }, 5);
          }
        }

        const activeAlarmsCount = prev.alarms.filter((a) => !a.acknowledged).length;
        const criticalAlarmsCount = prev.alarms.filter((a) => !a.acknowledged && a.severity === 'CRITICAL').length;

        let overallStatus: 'NORMAL' | 'WARNING' | 'ALARM' = 'NORMAL';
        if (criticalAlarmsCount > 0) overallStatus = 'ALARM';
        else if (activeAlarmsCount > 0) overallStatus = 'WARNING';

        const pressureNoise = (Math.random() - 0.5) * 0.15;
        const flowNoise = (Math.random() - 0.5) * 15;
        const dewNoise = (Math.random() - 0.5) * 1.5;

        const visualP = Math.max(6.2, Math.min(6.6, 6.4 + pressureNoise));
        const visualF = Math.max(730, Math.min(790, 760 + flowNoise));
        const visualD = Math.max(-42, Math.min(-38, -40 + dewNoise));

        setHistoryPressure((h) => [...h.slice(1), Number(visualP.toFixed(2))]);
        setHistoryFlow((h) => [...h.slice(1), Math.round(visualF)]);
        setHistoryDewPoint((h) => [...h.slice(1), Number(visualD.toFixed(1))]);

        return {
          ...prev,
          compressors: updatedCompressors,
          dryers: updatedDryers,
          overallStatus,
          header: {
            pressure: Number(nextHeaderP.toFixed(2)),
            flow: Math.round(mainOpen ? totalDemandOutflow : 0),
          },
          tank: {
            ...prev.tank,
            pressure: Number(nextTankPressure.toFixed(2)),
            condensateLevel: Number(nextCondensate.toFixed(1)),
          },
          branches: {
            weaving: {
              ...prev.branches.weaving,
              pressure: Number(nextWeaveP.toFixed(2)),
              flow: Math.round(weaveFlow),
              temp: Number(nextWeaveTemp.toFixed(1)),
            },
            spinning: {
              ...prev.branches.spinning,
              pressure: Number(nextSpinP.toFixed(2)),
              flow: Math.round(spinFlow),
              temp: Number(nextSpinTemp.toFixed(1)),
            },
          },
        };
      });
    };

    runSimulationTick();
    const intervalId = setInterval(runSimulationTick, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden selection:bg-sky-500 selection:text-white transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Header
        telemetry={telemetry}
        setSimMode={setSimMode}
        resetSimulation={resetSimulation}
        muteAlarms={() => setAlarmsMuted(!alarmsMuted)}
        alarmsMuted={alarmsMuted}
      />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <h2 className="sr-only">HMI Graphics Panel</h2>
        <MonitoringCanvas
          telemetry={telemetry}
          onToggleCompressor={toggleCompressor}
          onSetCompressorFault={forceCompressorFault}
          onToggleValve={toggleValve}
          onToggleDryerStatus={toggleDryerStatus}
        />

        <RightPanel
          telemetry={telemetry}
          historyPressure={historyPressure}
          historyFlow={historyFlow}
          historyDewPoint={historyDewPoint}
          onAcknowledgeAlarm={handleAcknowledgeAlarm}
          onClearAlarms={handleClearAlarms}
          alarmsMuted={alarmsMuted}
          onToggleMute={() => setAlarmsMuted(!alarmsMuted)}
        />
      </main>

      <footer className={`h-8 border-t px-6 flex items-center justify-between text-[10px] tracking-tight shrink-0 z-10 transition-colors duration-500 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 uppercase font-mono">Session: <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>ENGINEER_SR</span></span>
          <span className="text-slate-500 uppercase font-mono">Comm: <span className="text-emerald-500">CONNECTED</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/compressed-air"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 text-[9px] font-mono font-bold uppercase tracking-wider transition-all"
          >
            <Pencil className="w-3 h-3" />
            Edit Layout
          </Link>
          <span className="text-slate-600 italic font-mono text-[9px]">Modbus TCP @ 192.168.1.104</span>
          <span className="text-slate-600 italic font-mono text-[9px]">SCADA v4.2.1-stable</span>
        </div>
      </footer>
    </div>
  );
}
