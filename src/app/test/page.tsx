"use client";

import { useEffect } from "react";

export default function TestPage() {
    useEffect(() => {
        alert("REACT LOADED");
    }, []);

    return (
        <div style={{ padding: 40 }}>
            <h1>Test Page</h1>

            <button
                onClick={() =>
                    alert("BUTTON WORKS")
                }
            >
                Test Button
            </button>
        </div>
    );
}