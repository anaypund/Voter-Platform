import { spawn } from "child_process";
import path from "path";

// In production, the script is copied to dist/translate.py
// In development, it's in server/translate.py
const pythonScriptPath = path.join(__dirname, "translate.py");

// Use Python from virtual environment
const pythonExecutable = process.platform === "win32" 
  ? ".venv\\Scripts\\python.exe"
  : ".venv/bin/python";

export async function translateToMarathi(text: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      if (!text || !text.trim()) {
        resolve(text);
        return;
      }

      const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, text]);

      let output = "";
      let errorOutput = "";

      if (pythonProcess.stdout) {
        pythonProcess.stdout.on("data", (data: any) => {
          output += data.toString();
        });
      }

      if (pythonProcess.stderr) {
        pythonProcess.stderr.on("data", (data: any) => {
          errorOutput += data.toString();
        });
      }

      pythonProcess.on("close", (code: number) => {
        if (code !== 0) {
          console.error("Translation error:", errorOutput);
          // Return original text if translation fails
          resolve(text);
          return;
        }

        try {
          const result = JSON.parse(output);
          if (result.error) {
            console.error("Translation error:", result.error);
            resolve(text); // Return original on error
          } else {
            resolve(result.translated);
          }
        } catch (parseError) {
          console.error("Failed to parse translation output:", parseError);
          resolve(text); // Return original on parse error
        }
      });

      pythonProcess.on("error", (error: any) => {
        console.error("Failed to spawn Python process:", error);
        resolve(text); // Return original on spawn error
      });
    } catch (error) {
      console.error("Translation error:", error);
      resolve(text); // Return original on any error
    }
  });
}
