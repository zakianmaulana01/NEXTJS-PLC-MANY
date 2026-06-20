'use client';

import React, { useState } from 'react';
import {
  Fan, Droplets, Container, Activity, Gauge, Zap, Flame, Factory, Box, Thermometer,
  ChevronDown, ChevronRight, GripVertical, Search,
} from 'lucide-react';
import { EQUIPMENT_CATALOGUE, type EquipmentCatalogueItem } from '@/types/editor';

/* -- Icon Map --------------------------------------- */

const ICON_MAP: Record<string, React.ElementType> = {
  Fan, Droplets, Container, Activity, Gauge, Zap, Flame, Factory, Box, Thermometer,
};

/* -- Category Labels -------------------------------- */

const CATEGORY_LABELS: Record<string, string> = {
  generation: 'Generation',
  treatment: 'Treatment',
  storage: 'Storage',
  distribution: 'Distribution',
  sensing: 'Sensing',
  custom: 'Other',
};

const CATEGORY_ORDER = ['generation', 'treatment', 'storage', 'distribution', 'sensing', 'custom'];

/* -- Props ------------------------------------------ */

interface EquipmentPaletteProps {
  className?: string;
}

/* -- Component -------------------------------------- */

export default function EquipmentPalette({ className }: EquipmentPaletteProps) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = search
    ? EQUIPMENT_CATALOGUE.filter(
        (item) =>
          item.label.toLowerCase().includes(search.toLowerCase()) ||
          item.type.includes(search.toLowerCase()),
      )
    : EQUIPMENT_CATALOGUE;

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: filtered.filter((item) => item.category === cat),
  })).filter((g) => g.items.length > 0);

  const onDragStart = (event: React.DragEvent, item: EquipmentCatalogueItem) => {
    event.dataTransfer.setData('application/reactflow-type', item.type);
    event.dataTransfer.setData('application/reactflow-data', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <aside className={`flex flex-col w-[220px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 select-none ${className || ''}`}>
      {/* Header */}
      <div className="px-3 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <h2 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
          Equipment Palette
        </h2>
        <p className="text-[9px] text-slate-400 mt-0.5">Drag onto canvas</p>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment..."
            className="w-full pl-7 pr-2 py-1.5 text-[10px] font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Equipment List */}
      <div className="flex-1 overflow-y-auto">
        {grouped.map((group) => (
          <div key={group.category} className="border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => toggleCategory(group.category)}
              className="flex w-full items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                {collapsed[group.category] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {group.label}
                <span className="text-slate-300 dark:text-slate-600 font-normal">({group.items.length})</span>
              </span>
            </button>

            {!collapsed[group.category] && (
              <div className="px-2 pb-2 space-y-1">
                {group.items.map((item) => {
                  const Icon = ICON_MAP[item.icon] || Box;
                  return (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                      className="flex items-center gap-2 px-2 py-2 rounded border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all group/item"
                    >
                      <GripVertical className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0 group-hover/item:text-blue-400" />
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                        style={{ backgroundColor: item.defaultColor, border: `1.5px solid ${item.defaultBorderColor}` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: item.defaultBorderColor }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {item.label}
                        </div>
                        <div className="text-[8px] text-slate-400 font-mono uppercase tracking-wider truncate">
                          {item.type}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
