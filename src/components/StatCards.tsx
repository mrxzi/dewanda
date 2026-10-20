"use client";

import { DollarSign, Package, Layers } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-xl p-4 sm:p-5 border transition-colors ${isDark
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200 shadow-sm"
        }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? "bg-slate-700" : "bg-slate-100"
            }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p
            className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"
              }`}
          >
            {title}
          </p>
          <p
            className={`text-lg sm:text-xl font-bold truncate ${isDark ? "text-white" : "text-slate-900"
              }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

interface StatCardsProps {
  totalNilai: number;
  totalJenis: number;
  totalQty: number;
}

export default function StatCards({
  totalNilai,
  totalJenis,
  totalQty,
}: StatCardsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const iconColor = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <div className="col-span-2 lg:col-span-1">
        <StatCard
          title="Total Uang"
          value={formatRupiah(totalNilai)}
          icon={<DollarSign className={`w-4 h-4 ${iconColor}`} />}
        />
      </div>
      <StatCard
        title="Jenis Barang"
        value={totalJenis.toLocaleString("id-ID")}
        icon={<Package className={`w-4 h-4 ${iconColor}`} />}
      />
      <StatCard
        title="Total Unit"
        value={totalQty.toLocaleString("id-ID")}
        icon={<Layers className={`w-4 h-4 ${iconColor}`} />}
      />
    </div>
  );
}
