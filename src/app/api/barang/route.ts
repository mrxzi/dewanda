import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { Barang } from "@/lib/types";
import { INITIAL_DATA } from "@/lib/data";

const DATA_KEY = "dewanda-barang";

function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

// GET — ambil semua data barang
export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) {
      // Fallback: return initial data if no Redis configured
      return NextResponse.json(INITIAL_DATA);
    }

    const data = await redis.get<Barang[]>(DATA_KEY);
    if (!data) {
      // First time: seed with initial data
      await redis.set(DATA_KEY, INITIAL_DATA);
      return NextResponse.json(INITIAL_DATA);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/barang error:", error);
    return NextResponse.json(INITIAL_DATA);
  }
}

// POST — simpan seluruh data barang
export async function POST(request: Request) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const data: Barang[] = await request.json();
    await redis.set(DATA_KEY, data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/barang error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
