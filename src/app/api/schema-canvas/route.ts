import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function OPTIONS(req: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
        },
    });
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        for (const [key, val] of formData.entries()) {
            console.log(`FormData Entry: ${key} = ${val}`);
        }
        if (!file || !(file instanceof File)) {
            return Response.json(
                { error: "File not provided" },
                { status: 400 },
            );
        }

        console.log("File uploaded");

        const fileContent = await file.text();
        let jsonData;
        try {
            jsonData = JSON.parse(fileContent);
        } catch (error) {
            console.error("Error parsing JSON file:", error);
            return Response.json(
                { error: "Invalid JSON file" },
                { status: 400 },
            );
        }

        await prisma.schemaCanvasData.upsert({
            where: { id: "schema-canvas-data" },
            update: {
                data: jsonData,
            },
            create: {
                id: "schema-canvas-data",
                data: jsonData,
            },
        });

        return Response.json(
            { message: "File uploaded successfully" },
            {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers":
                        "Content-Type, Authorization",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                },
            },
        );
    } catch (error) {
        console.error("Error uploading file:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function GET() {
    try {
        const data = await prisma.schemaCanvasData.findUnique({
            where: { id: "schema-canvas-data" },
        });

        if (!data) {
            return Response.json({ error: "No data found" }, { status: 404 });
        }
        const json = data.data;
        if (!json) {
            return Response.json({ error: "No data found" }, { status: 404 });
        }

        const blob = new Blob([JSON.stringify(json)], {
            type: "application/json",
        });

        return new Response(blob, {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="schema-canvas-data.json"`,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Cache-Control": "no-cache, no-store, must-revalidate",
            },
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
