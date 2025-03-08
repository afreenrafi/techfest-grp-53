import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        // Dummy authentication logic (Replace this with your real authentication)
        if (email === "test@example.com" && password === "password") {
            return NextResponse.json({ message: "Login successful!" }, { status: 200 });
        }

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}