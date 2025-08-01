"use client";

import { Button } from "@/components/ui/button";
import ky from "@/lib/ky";
import { useState } from "react";

export function JsonTester() {
    const json = JSON.stringify(
        {
            name: "John Doe",
            age: 30,
            email: "john@gmail.com",
        },
        null,
        2,
    );

    const [retrievedJson, setRetrievedJson] = useState<string | null>(null);

    async function onSubmit() {
        const fd = new FormData();
        const blob = new Blob([json], { type: "application/json" });
        fd.append("file", blob, "data.json");
        try {
            const response = await ky.post("/api/schema-canvas", {
                method: "POST",
                body: fd,
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const result = await response.json();
            console.log("Success:", result);
        } catch (error) {
            console.error("Error uploading JSON:", error);
        }
    }

    async function onRetrieve() {
        try {
            const response = await ky.get("/api/schema-canvas");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            //response should be a blob file, handle it and update the state
            const blob = await response.blob();
            const text = await blob.text();
            setRetrievedJson(text);
            console.log("Retrieved JSON:", text);
        } catch (error) {
            console.error("Error retrieving JSON:", error);
        }
    }

    return (
        <div>
            <div className="flex flex-col items-center justify-center">
                <h1 className="mb-4 text-2xl font-bold">JSON Tester</h1>
                <Button onClick={onSubmit}>Submit JSON</Button>
            </div>
            <Button onClick={onRetrieve}>Retrieve JSON</Button>
            {retrievedJson && (
                <pre className="mt-4 w-full max-w-2xl rounded-md border bg-gray-100 p-4">
                    <code>{retrievedJson}</code>
                </pre>
            )}
        </div>
    );
}
