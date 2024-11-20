import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://backend:8000';  

export async function GET() {
    const response = await fetch(`${BACKEND_URL}/hands`);
    const data = await response.json();
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/hands`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
}