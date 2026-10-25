import { Transaksi } from "./types";

const PRINTER_NAME = "RPP02N";
const CHUNK_SIZE = 20;
const PAPER_WIDTH = 32; // 58mm

/** Common BLE UART / printer service UUIDs used by Chinese ESC/POS printers */
const KNOWN_SERVICE_UUIDS = [
  "0000ff00-0000-1000-8000-00805f9b34fb",
  "0000ae30-0000-1000-8000-00805f9b34fb",
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "0000fff0-0000-1000-8000-00805f9b34fb",
  "49535343-fe7d-4ae5-8fa9-9fafd205e455", // ISSC Transparent UART
  "6e400001-b5a3-f393-e0a9-e50e24dcca9e", // Nordic UART
  "e7810a71-73ae-43f5-2a88-a9fef198e0d0",
];

let cachedDevice: BluetoothDevice | null = null;
let cachedCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

function encoder(): TextEncoder {
  return new TextEncoder();
}

function row(left: string, right: string, width = PAPER_WIDTH): string {
  const gap = Math.max(1, width - left.length - right.length);
  const line = left + " ".repeat(gap) + right;
  return line.slice(0, width);
}

function divider(char = "-"): string {
  return char.repeat(PAPER_WIDTH);
}

function formatNum(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

/** Build ESC/POS bytes for a Dewanda receipt (58mm). */
export function buildReceiptEscPos(transaksi: Transaksi): Uint8Array {
  const parts: Uint8Array[] = [];
  const enc = encoder();
  const push = (s: string) => parts.push(enc.encode(s));
  const cmd = (...bytes: number[]) => parts.push(new Uint8Array(bytes));

  // Init + code page + align center
  cmd(0x1b, 0x40); // ESC @ init
  cmd(0x1b, 0x74, 0x00); // ESC t 0 — PC437
  cmd(0x1b, 0x61, 0x01); // center
  cmd(0x1b, 0x21, 0x10); // double height
  push("DEWANDA\n");
  cmd(0x1b, 0x21, 0x00); // normal
  push("Terima Kasih\n");
  cmd(0x1b, 0x61, 0x00); // left
  push(divider("=") + "\n");

  push(`ID     : ${transaksi.id}\n`);
  push(`Waktu  : ${transaksi.tanggal} ${transaksi.waktu}\n`);
  push(`Nama   : ${transaksi.namaCustomer || "-"}\n`);
  push(`Kasir  : ${transaksi.kasir}\n`);
  push(divider() + "\n");

  for (const item of transaksi.items) {
    push(item.namaBarang.slice(0, PAPER_WIDTH) + "\n");
    push(
      row(
        `${item.jumlah}x ${formatNum(item.hargaJual)}`,
        formatNum(item.subtotal)
      ) + "\n"
    );
  }

  push(divider() + "\n");
  push(row("Sub Total", `Rp ${formatNum(transaksi.subtotal)}`) + "\n");
  push(divider() + "\n");
  cmd(0x1b, 0x21, 0x08); // emphasized
  push(row("TOTAL", `Rp ${formatNum(transaksi.total)}`) + "\n");
  cmd(0x1b, 0x21, 0x00);
  push(row("Cash", `Rp ${formatNum(transaksi.cashDibayar)}`) + "\n");
  if (transaksi.kembalian > 0) {
    push(row("Kembali", `Rp ${formatNum(transaksi.kembalian)}`) + "\n");
  }
  push(divider() + "\n");

  cmd(0x1b, 0x61, 0x01); // center
  push("Powered by NUSAJAYA\n");
  push("\n\n");
  cmd(0x1d, 0x56, 0x00); // GS V 0 — full cut (ignored if no cutter)
  cmd(0x1b, 0x64, 0x03); // feed 3 lines

  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

function isBluetoothSupported(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

async function findWritableCharacteristic(
  server: BluetoothRemoteGATTServer
): Promise<BluetoothRemoteGATTCharacteristic> {
  const services = await server.getPrimaryServices();

  for (const service of services) {
    let chars: BluetoothRemoteGATTCharacteristic[];
    try {
      chars = await service.getCharacteristics();
    } catch {
      continue;
    }
    for (const char of chars) {
      const props = char.properties;
      if (props.writeWithoutResponse || props.write) {
        return char;
      }
    }
  }

  throw new Error(
    "Karakteristik tulis printer tidak ditemukan. Pastikan RPP02N mendukung BLE."
  );
}

async function connectPrinter(): Promise<BluetoothRemoteGATTCharacteristic> {
  if (
    cachedCharacteristic &&
    cachedDevice?.gatt?.connected &&
    cachedCharacteristic.service.device.gatt?.connected
  ) {
    return cachedCharacteristic;
  }

  if (!isBluetoothSupported()) {
    throw new Error(
      "Browser tidak mendukung Web Bluetooth. Gunakan Chrome/Edge di Android atau desktop."
    );
  }

  const optionalServices = [
    ...KNOWN_SERVICE_UUIDS,
    "battery_service",
    "device_information",
  ];

  let device = cachedDevice?.gatt ? cachedDevice : null;

  if (!device) {
    try {
      device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: PRINTER_NAME },
          { namePrefix: "RPP" },
          { namePrefix: "Printer" },
        ],
        optionalServices,
      });
    } catch (firstErr) {
      // Fallback: show all BLE devices (some RPP02N advertise a different name)
      const msg =
        firstErr instanceof Error ? firstErr.message : String(firstErr);
      if (
        msg.includes("User cancelled") ||
        msg.includes("canceled") ||
        msg.includes("cancelled")
      ) {
        throw firstErr;
      }
      device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices,
      });
    }
  }

  cachedDevice = device;
  device.addEventListener("gattserverdisconnected", () => {
    cachedCharacteristic = null;
  });

  const server = device.gatt;
  if (!server) {
    throw new Error("GATT server tidak tersedia pada printer.");
  }

  if (!server.connected) {
    await server.connect();
  }

  // Try known services first, then scan all
  let characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  for (const uuid of KNOWN_SERVICE_UUIDS) {
    try {
      const service = await server.getPrimaryService(uuid);
      const chars = await service.getCharacteristics();
      const writable = chars.find(
        (c) => c.properties.writeWithoutResponse || c.properties.write
      );
      if (writable) {
        characteristic = writable;
        break;
      }
    } catch {
      // try next
    }
  }

  if (!characteristic) {
    characteristic = await findWritableCharacteristic(server);
  }

  cachedCharacteristic = characteristic;
  return characteristic;
}

async function writeChunks(
  characteristic: BluetoothRemoteGATTCharacteristic,
  data: Uint8Array
): Promise<void> {
  const useWithoutResponse = characteristic.properties.writeWithoutResponse;

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    if (useWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValueWithResponse(chunk);
    }
    // Small delay helps flaky BLE stacks
    await new Promise((r) => setTimeout(r, 15));
  }
}

export type PrintBluetoothResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Print a receipt to Bluetooth printer named RPP02N (ESC/POS over BLE).
 * Must be called from a user gesture (button click).
 */
export async function printReceiptBluetooth(
  transaksi: Transaksi
): Promise<PrintBluetoothResult> {
  try {
    const characteristic = await connectPrinter();
    const payload = buildReceiptEscPos(transaksi);
    await writeChunks(characteristic, payload);
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Gagal mencetak ke printer Bluetooth.";

    // User cancelled the picker
    if (
      message.includes("User cancelled") ||
      message.includes("canceled") ||
      message.includes("cancelled")
    ) {
      return { ok: false, error: "Pemilihan printer dibatalkan." };
    }

    return { ok: false, error: message };
  }
}

/** Disconnect and clear cache (optional). */
export function disconnectPrinter(): void {
  try {
    cachedDevice?.gatt?.disconnect();
  } catch {
    // ignore
  }
  cachedDevice = null;
  cachedCharacteristic = null;
}

export function getPrinterName(): string {
  return PRINTER_NAME;
}
