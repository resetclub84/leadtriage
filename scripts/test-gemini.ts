
import * as fs from "fs";
import * as path from "path";

async function listAllModels() {
    console.log("Reading .env file...");
    let apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        try {
            const envContent = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
            const match = envContent.match(/GEMINI_API_KEY=(.*)/);
            if (match && match[1]) {
                apiKey = match[1].trim().replace(/^["']|["']$/g, '');
            }
        } catch (e) {
            console.error("Could not read .env file");
        }
    }

    if (!apiKey) {
        console.error("No API KEY found");
        return;
    }

    console.log("Fetching definitive model list from Google API...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        // Node 18+ has global fetch. If this fails, we'll know.
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Details:", text);
            return;
        }
        const data = await response.json();
        console.log("✅ AVAILABLE MODELS:");
        // Only show generateContent supported models
        const generateModels = (data.models || []).filter((m: any) =>
            m.supportedGenerationMethods.includes("generateContent")
        );

        generateModels.forEach((m: any) => {
            console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
        });

    } catch (e) {
        console.error("Fetch execution error:", e);
    }
}

listAllModels();
