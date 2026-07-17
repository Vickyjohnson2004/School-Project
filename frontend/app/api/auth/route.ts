import axios from 'axios';
import { NextResponse } from 'next/server';

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function POST(request: Request) {
  const body = await request.json();
  const response = await axios.post(`${apiBase}/api/auth/login`, body, {
    withCredentials: true,
    validateStatus: () => true
  });

  const nextResponse = NextResponse.json(response.data, { status: response.status });
  const setCookies = response.headers['set-cookie'] ?? [];
  setCookies.forEach((cookie) => {
    nextResponse.headers.append('set-cookie', cookie);
  });

  return nextResponse;
}
