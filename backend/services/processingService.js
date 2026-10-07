const { spawn } = require("child_process");
const path = require("path");

const projectRoot = path.join(__dirname, "../..");

function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, {
            cwd: projectRoot,
            shell: false
        });

        let output = "";
        let errorOutput = "";

        process.stdout.on("data", (data) => {
            output += data.toString();
        });

        process.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        process.on("close", (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(
                    new Error(
                        `${command} failed with code ${code}\n${errorOutput}`
                    )
                );
            }
        });
    });
}

async function processVideo(videoPath) {
    console.log("Starting video processing...");
    console.log("Input:", videoPath);

    const segmentsDir = path.join(projectRoot, "output", "segments");

    console.log("Step 1: Creating video segments...");

    await runCommand("ffmpeg", [
        "-y",
        "-i",
        videoPath,
        "-map",
        "0",
        "-c",
        "copy",
        "-f",
        "segment",
        "-segment_time",
        "10",
        "-reset_timestamps",
        "1",
        path.join(segmentsDir, "segment_%03d.mp4")
    ]);

    console.log("Step 1 complete.");

    console.log("Step 2: Generating quality versions...");

    const pythonPath = path.join(
        projectRoot,
        ".venv",
        "Scripts",
        "python.exe"
    );

    await runCommand(pythonPath, [
        "processing/ffmpeg/generate_qualities.py"
    ]);

    console.log("Step 2 complete.");

    console.log("Step 3: Running OpenCV and generating metadata...");

    await runCommand(pythonPath, [
        "processing/metadata/generate_metadata.py"
    ]);

    console.log("Step 3 complete.");

    console.log("Video processing completed successfully.");

    return {
        message: "Video processing completed",
        metadata: "/output/metadata.json"
    };
}

module.exports = {
    processVideo
};