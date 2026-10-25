"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronDown, TrendingUp, DollarSign, Wallet, CreditCard, Calendar } from "lucide-react";
import { formatRupiah, formatNumber, formatDateRange } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

interface DailyData {
  date: string;
  transaksi: number;
  penjualan: number;
  keuntungan: number;
}

interface RingkasanProps {
  totalTransaksi: number;
  totalPenjualanKotor: number;
  totalPenjualanBersih: number;
  totalKeuntungan: number;
  cashTotal: number;
  nonCashTotal: number;
  dailyData: DailyData[];
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
}

// Simple line chart component
function MiniChart({
  data,
  dataKey,
  color,
  height = 160,
}: {
  data: DailyData[];
  dataKey: "transaksi" | "penjualan" | "keuntungan";
  color: string;
  height?: number;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const values = data.map((d) => d[dataKey]);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = 340;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = values.map((v, i) => {
    const x = padding.left + (i / Math.max(values.length - 1, 1)) * chartWidth;
    const y = padding.top + chartHeight - ((v - minVal) / (maxVal - minVal || 1)) * chartHeight;
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Y-axis labels
  const yLabels = [0, Math.round(maxVal / 2), maxVal];

  // Format Y label
  const formatYLabel = (val: number) => {
    if (dataKey === "transaksi") return val.toString();
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}Jt`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}Rb`;
    return val.toString();
  };

  // X-axis labels (dates)
  const xLabels = data.map((d, i) => {
    const date = new Date(d.date);
    const day = date.getDate();
    const month = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date);
    return { label: `${day} ${month}`, x: points[i]?.x || 0 };
  });

  // Show only a few x labels
  const step = Math.max(1, Math.ceil(xLabels.length / 4));
  const visibleXLabels = xLabels.filter((_, i) => i % step === 0 || i === xLabels.length - 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Y axis */}
      {yLabels.map((val, i) => {
        const y = padding.top + chartHeight - ((val - minVal) / (maxVal - minVal || 1)) * chartHeight;
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke={isDark ? "#334155" : "#e2e8f0"}
              strokeWidth="0.5"
            />
            <text
              x={padding.left - 6}
              y={y + 3}
              textAnchor="end"
              fill={isDark ? "#64748b" : "#94a3b8"}
              fontSize="8"
            >
              {formatYLabel(val)}
            </text>
          </g>
        );
      })}

      {/* X axis labels */}
      {visibleXLabels.map((xl, i) => (
        <text
          key={i}
          x={xl.x}
          y={height - 8}
          textAnchor="middle"
          fill={isDark ? "#64748b" : "#94a3b8"}
          fontSize="8"
        >
          {xl.label}
        </text>
      ))}

      {/* Axes */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke={isDark ? "#475569" : "#cbd5e1"} strokeWidth="1" />
      <line x1={padding.left} y1={padding.top + chartHeight} x2={width - padding.right} y2={padding.top + chartHeight} stroke={isDark ? "#475569" : "#cbd5e1"} strokeWidth="1" />

      {/* Line */}
      {points.length > 1 && (
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
    </svg>
  );
}

export default function Ringkasan({
  totalTransaksi,
  totalPenjualanKotor,
  totalPenjualanBersih,
  totalKeuntungan,
  cashTotal,
  nonCashTotal,
  dailyData,
  startDate,
  endDate,
  onDateRangeChange,
}: RingkasanProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [transaksiOpen, setTransaksiOpen] = useState(false);
  const [penjualanKotorOpen, setPenjualanKotorOpen] = useState(false);
  const [penjualanBersihOpen, setPenjualanBersihOpen] = useState(false);
  const [keuntunganOpen, setKeuntunganOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Preset date ranges
  const presets = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 29);
    return {
      week: { start: weekAgo, end: today, label: "7 Hari" },
      month: { start: monthAgo, end: today, label: "30 Hari" },
    };
  }, []);

  const cardClass = `rounded-xl border p-4 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`;
  const headerColor = isDark ? "text-white" : "text-slate-900";
  const mutedColor = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="space-y-4">
      {/* Date Range Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-bold ${headerColor}`}>Ringkasan</h2>
          <p className={`text-xs ${mutedColor}`}>{formatDateRange(startDate, endDate)}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`p-2.5 rounded-lg border ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
          >
            <Calendar className="w-5 h-5" />
          </button>
          {showDatePicker && (
            <div className={`absolute right-0 top-12 z-20 rounded-xl border p-3 space-y-2 min-w-[160px] ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-lg"}`}>
              <button
                onClick={() => { onDateRangeChange(presets.week.start, presets.week.end); setShowDatePicker(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-50 text-slate-600"}`}
              >
                📅 7 Hari Terakhir
              </button>
              <button
                onClick={() => { onDateRangeChange(presets.month.start, presets.month.end); setShowDatePicker(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-50 text-slate-600"}`}
              >
                📅 30 Hari Terakhir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaksi Card */}
      <div className={cardClass}>
        <h3 className={`font-semibold text-sm mb-3 ${headerColor}`}>Transaksi</h3>
        <button
          onClick={() => setTransaksiOpen(!transaksiOpen)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className={`text-sm ${mutedColor}`}>Total Transaksi</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronDown className={`w-5 h-5 transition-transform ${transaksiOpen ? "rotate-180" : ""} ${mutedColor}`} />
          </div>
        </button>
        <p className={`text-xl font-bold mt-1 ml-4 ${headerColor}`}>{totalTransaksi}</p>

        {transaksiOpen && (
          <div className="mt-3">
            <MiniChart data={dailyData} dataKey="transaksi" color="#3b82f6" />
          </div>
        )}
      </div>

      {/* Keuntungan Card */}
      <div className={cardClass}>
        <h3 className={`font-semibold text-sm mb-3 ${headerColor}`}>Keuntungan</h3>
        <button
          onClick={() => setKeuntunganOpen(!keuntunganOpen)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className={`text-sm ${mutedColor}`}>Total Keuntungan</span>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${keuntunganOpen ? "rotate-180" : ""} ${mutedColor}`} />
        </button>
        <p className={`text-xl font-bold mt-1 ml-4 ${headerColor}`}>{formatRupiah(totalKeuntungan)}</p>

        {keuntunganOpen && (
          <div className="mt-3">
            <MiniChart data={dailyData} dataKey="keuntungan" color="#22c55e" />
          </div>
        )}
      </div>

      {/* Penjualan Card */}
      <div className={cardClass}>
        <h3 className={`font-semibold text-sm mb-3 ${headerColor}`}>Penjualan</h3>
        
        {/* Penjualan Kotor */}
        <button
          onClick={() => setPenjualanKotorOpen(!penjualanKotorOpen)}
          className="w-full flex items-center justify-between mb-1"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className={`text-sm ${mutedColor}`}>Total Penjualan Kotor</span>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${penjualanKotorOpen ? "rotate-180" : ""} ${mutedColor}`} />
        </button>
        <p className={`text-lg font-bold ml-4 mb-3 ${headerColor}`}>{formatRupiah(totalPenjualanKotor)}</p>

        {penjualanKotorOpen && (
          <div className="mb-4">
            <MiniChart data={dailyData} dataKey="penjualan" color="#f97316" height={140} />
          </div>
        )}

        {/* Penjualan Bersih */}
        <button
          onClick={() => setPenjualanBersihOpen(!penjualanBersihOpen)}
          className="w-full flex items-center justify-between mb-1"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className={`text-sm ${mutedColor}`}>Total Penjualan Bersih</span>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${penjualanBersihOpen ? "rotate-180" : ""} ${mutedColor}`} />
        </button>
        <p className={`text-lg font-bold ml-4 ${headerColor}`}>{formatRupiah(totalPenjualanBersih)}</p>
      </div>

      {/* Pembayaran Card */}
      <div className={cardClass}>
        <h3 className={`font-semibold text-sm mb-3 ${headerColor}`}>Pembayaran</h3>

        <div className="space-y-3">
          <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? "bg-slate-600" : "bg-blue-50"}`}>
              <Wallet className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${headerColor}`}>Cash</p>
              <p className={`text-sm ${isDark ? "text-blue-400" : "text-blue-600"}`}>{formatRupiah(cashTotal)}</p>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? "bg-slate-600" : "bg-purple-50"}`}>
              <CreditCard className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-500"}`} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${headerColor}`}>Non Tunai</p>
              <p className={`text-sm ${isDark ? "text-purple-400" : "text-purple-600"}`}>{formatRupiah(nonCashTotal)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
