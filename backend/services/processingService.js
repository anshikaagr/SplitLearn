const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const projectRoot = path.join(__dirname, "../..");

function resolvePython() {
    if (process.env.PYTHON) return process.env.PYTHON;

    const candidates = [
        path.join(projectRoot, ".venv", "bin", "python"),
        path.join(projectRoot, ".venv", "Scripts", "python.exe"),
    ];

    return candidates.find((candidate) => fs.existsSync(candidate))
        || (process.platform === "win32" ? "python" : "python3");
}

function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: projectRoot,
            shell: false,
        });

        let output = "";
        let errorOutput = "";

        child.stdout.on("data", (data) => {
            output += data.toString();
            process.stdout.write(data);
        });

        child.stderr.on("data", (data) => {
            errorOutput += data.toString();
            process.stderr.write(data);
        });

        child.on("error", (error) => {
            reject(new Error(
                `Could not start ${command}: ${error.message}`
            ));
        });

        child.on("close", (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(
                    `${command} failed with code ${code}\n${errorOutput || output}`
                ));
            }
        });
    });
}

async function processVideo(videoPath, originalFilename) {
    const videoId = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    const videoRoot = path.join(projectRoot, "output", "videos", videoId);
    const segmentsDir = path.join(videoRoot, "segments");
    const qualitiesDir = path.join(videoRoot, "qualities");
    const metadataFile = path.join(videoRoot, "metadata.json");

    fs.mkdirSync(segmentsDir, { recursive: true });
    fs.mkdirSync(qualitiesDir, { recursive: true });

    console.log("Starting processing for:", videoId);

    try {
        await runCommand("ffmpeg", [
            "-y",
            "-i", videoPath,
            "-map", "0:v:0",
            "-map", "0:a?",
            "-c", "copy",
            "-f", "segment",
            "-segment_time", "10",
            "-reset_timestamps", "1",
            path.join(segmentsDir, "segment_%03d.mp4"),
        ]);

        const pythonPath = resolvePython();

        await runCommand(pythonPath, [
            "processing/ffmpeg/generate_qualities.py",
            "--segments-dir", segmentsDir,
            "--qualities-dir", qualitiesDir,
        ]);

        await runCommand(pythonPath, [
            "processing/metadata/generate_metadata.py",
            "--video-id", videoId,
            "--video-name", originalFilename || path.basename(videoPath),
            "--segments-dir", segmentsDir,
            "--qualities-dir", qualitiesDir,
            "--output-file", metadataFile,
        ]);

        return {
            videoId,
            totalSegments: JSON.parse(
                fs.readFileSync(metadataFile, "utf8")
            ).total_segments,
            metadata: `/api/videos/${videoId}`,
        };
    } catch (error) {
        console.error(`Processing failed for ${videoId}:`, error);
        throw error;
    }
}

module.exports = { processVideo };
