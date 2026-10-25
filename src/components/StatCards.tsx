"use client";

import { formatRupiah } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
}

function StatCard({ title, value, icon, gradient, iconBg }: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`relative rounded-2xl p-4 sm:p-5 overflow-hidden card-glow slide-up ${gradient}`}
    >
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -right-2 w-16 h-16 rounded-full bg-white/5" />
      
      {/* Shimmer overlay */}
      <div className="absolute inset-0 shimmer pointer-events-none" />

      <div className="relative z-10 flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} shadow-lg`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-white/70">
            {title}
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-white truncate drop-shadow-sm">
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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div className="col-span-2 lg:col-span-1">
        <StatCard
          title="Total Inventaris"
          value={formatRupiah(totalNilai)}
          icon={
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
          gradient="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500"
          iconBg="bg-white/20"
        />
      </div>
      <StatCard
        title="Jenis Barang"
        value={totalJenis.toLocaleString("id-ID")}
        icon={
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
          </svg>
        }
        gradient="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400"
        iconBg="bg-white/20"
      />
      <StatCard
        title="Total Dus"
        value={`${totalQty.toLocaleString("id-ID")} dus`}
        icon={
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 16h6M16 10h6M16 4h6M4 6l4 4 4-4M4 14l4 4 4-4" />
          </svg>
        }
        gradient="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500"
        iconBg="bg-white/20"
      />
    </div>
  );
}
