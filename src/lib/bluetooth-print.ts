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

/**
 * Load an image from a URL, draw it to a canvas scaled to the given max width,
 * and return ESC/POS raster bitmap bytes (GS v 0).
 */
async function imageToEscPos(
  src: string,
  maxWidth: number = 384 // 58mm ≈ 384 dots at 203 DPI
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Scale image to fit paper width while keeping aspect ratio
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = Math.round(h * (maxWidth / w));
        w = maxWidth;
      }
      // Width must be a multiple of 8 for ESC/POS raster
      w = Math.ceil(w / 8) * 8;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      // White background
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      // Draw centered
      const offsetX = Math.round((w - (img.width > maxWidth ? w : img.width)) / 2);
      ctx.drawImage(img, offsetX, 0, img.width > maxWidth ? w : img.width, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const pixels = imageData.data;

      const widthBytes = w / 8;
      // GS v 0 command: 1D 76 30 m xL xH yL yH d1...dk
      const header = new Uint8Array([
        0x1d, 0x76, 0x30, 0x00,
        widthBytes & 0xff, (widthBytes >> 8) & 0xff,
        h & 0xff, (h >> 8) & 0xff,
      ]);

      const bitmapData = new Uint8Array(widthBytes * h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          // Convert to grayscale and threshold
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          if (gray < 128) {
            // Dark pixel = 1 (print)
            const byteIndex = y * widthBytes + Math.floor(x / 8);
            const bitIndex = 7 - (x % 8);
            bitmapData[byteIndex] |= 1 << bitIndex;
          }
        }
      }

      const result = new Uint8Array(header.length + bitmapData.length);
      result.set(header, 0);
      result.set(bitmapData, header.length);
      resolve(result);
    };
    img.onerror = () => reject(new Error("Gagal memuat gambar logo untuk cetak."));
    img.src = src;
  });
}

/** Build ESC/POS bytes for a Dewanda receipt (58mm). */
export async function buildReceiptEscPos(transaksi: Transaksi): Promise<Uint8Array> {
  const parts: Uint8Array[] = [];
  const enc = encoder();
  const push = (s: string) => parts.push(enc.encode(s));
  const cmd = (...bytes: number[]) => parts.push(new Uint8Array(bytes));

  // Init + code page
  cmd(0x1b, 0x40); // ESC @ init
  cmd(0x1b, 0x74, 0x00); // ESC t 0 — PC437

  // Header: Logo image
  cmd(0x1b, 0x61, 0x01); // center
  try {
    const logoBitmap = await imageToEscPos("/logo.png", 256);
    parts.push(logoBitmap);
  } catch {
    // Fallback to text if image fails
    cmd(0x1b, 0x45, 0x01); // bold
    cmd(0x1d, 0x21, 0x11); // 2x width + 2x height
    push("NUSAJAYA\n");
    cmd(0x1d, 0x21, 0x00);
    cmd(0x1b, 0x45, 0x00);
  }
  push("\n"); // space below logo
  cmd(0x1b, 0x61, 0x00); // left
  push(divider("=") + "\n");
  push("\n"); // napas sebelum detail

  push(`ID     : ${transaksi.id}\n`);
  push(`Waktu  : ${transaksi.tanggal} ${transaksi.waktu}\n`);
  push(`Nama   : ${transaksi.namaCustomer || "-"}\n`);
  if (transaksi.alamat) {
    push(`Alamat : ${transaksi.alamat}\n`);
  }
  push(`Kasir  : ${transaksi.kasir}\n`);
  push("\n");
  push(divider() + "\n");
  push("\n");

  for (const item of transaksi.items) {
    push(item.namaBarang.slice(0, PAPER_WIDTH) + "\n");
    push(
      row(
        `${item.jumlah} dus x ${formatNum(item.hargaJual)}`,
        formatNum(item.subtotal)
      ) + "\n"
    );
    push("\n"); // jarak antar item
  }

  push(divider() + "\n");
  push("\n");
  push(row("Sub Total", `Rp ${formatNum(transaksi.subtotal)}`) + "\n");
  push("\n");
  push(divider() + "\n");
  push("\n");
  cmd(0x1b, 0x21, 0x08); // emphasized
  push(row("TOTAL", `Rp ${formatNum(transaksi.total)}`) + "\n");
  cmd(0x1b, 0x21, 0x00);
  push(row("Cash", `Rp ${formatNum(transaksi.cashDibayar)}`) + "\n");
  if (transaksi.kembalian > 0) {
    push(row("Kembali", `Rp ${formatNum(transaksi.kembalian)}`) + "\n");
  }
  push("\n");
  push(divider() + "\n");
  push("\n");

  // Footer — Powered by dekat dengan NUSAJAYA
  cmd(0x1b, 0x61, 0x01); // center
  push("Powered by\n");
  cmd(0x1b, 0x45, 0x01); // bold
  cmd(0x1d, 0x21, 0x01); // tinggi 2x
  push("NUSAJAYA\n");
  cmd(0x1d, 0x21, 0x00);
  cmd(0x1b, 0x45, 0x00);
  push("\n\n");
  cmd(0x1d, 0x56, 0x00); // full cut (jika ada)
  cmd(0x1b, 0x64, 0x02); // feed akhir singkat

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
    const payload = await buildReceiptEscPos(transaksi);
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
