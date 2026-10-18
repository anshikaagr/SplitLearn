const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "../..");

function resolvePython() {
    if (process.env.PYTHON) return process.env.PYTHON;
    const candidates = [
        path.join(projectRoot, ".venv", "bin", "python"),
        path.join(projectRoot, ".venv", "Scripts", "python.exe")
    ];
    return candidates.find((candidate) => fs.existsSync(candidate)) || "python3";
}

function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { cwd: projectRoot, shell: false });
        let output = "";
        let errorOutput = "";
        child.stdout.on("data", (data) => { output += data.toString(); });
        child.stderr.on("data", (data) => { errorOutput += data.toString(); });
        child.on("error", (error) => reject(new Error(`Could not start ${command}: ${error.message}`)));
        child.on("close", (code) => {
            if (code === 0) resolve(output);
            else reject(new Error(`${command} failed with code ${code}\n${errorOutput || output}`));
        });
    });
}

async function processVideo(videoPath) {
    const outputDir = path.join(projectRoot, "output");
    const segmentsDir = path.join(outputDir, "segments");
    fs.mkdirSync(segmentsDir, { recursive: true });
    fs.mkdirSync(path.join(outputDir, "qualities"), { recursive: true });

    console.log("Starting video processing:", videoPath);
    await runCommand("ffmpeg", [
        "-y", "-i", videoPath, "-map", "0:v:0", "-c", "copy",
        "-f", "segment", "-segment_time", "10", "-reset_timestamps", "1",
        path.join(segmentsDir, "segment_%03d.mp4")
    ]);

    const pythonPath = resolvePython();
    console.log("Generating quality variants with", pythonPath);
    await runCommand(pythonPath, ["processing/ffmpeg/generate_qualities.py"]);
    await runCommand(pythonPath, ["processing/metadata/generate_metadata.py"]);

    return {
        message: "Video processing completed",
        metadata: "/api/videos/lecture_001"
    };
}

module.exports = { processVideo };
