import { NextResponse } from 'next/server';

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function POST(request: Request) {
  const body = await request.json();
  const response = await fetch(`${apiBase}/api/ml/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
