const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const videosDirectory = path.join(
    __dirname,
    "../../output/videos"
);

router.get("/:videoId", (req, res) => {
    const videoId = req.params.videoId;

    // Only allow IDs generated in our expected format.
    if (!/^\d+-[a-f0-9]+$/i.test(videoId)) {
        return res.status(400).json({
            message: "Invalid video ID",
        });
    }

    const metadataPath = path.join(
        videosDirectory,
        videoId,
        "metadata.json"
    );

    if (!fs.existsSync(metadataPath)) {
        return res.status(404).json({
            message: "Video metadata not found",
        });
    }

    try {
        const metadata = JSON.parse(
            fs.readFileSync(metadataPath, "utf-8")
        );

        return res.json(metadata);
    } catch (error) {
        console.error("Failed to read video metadata:", error);

        return res.status(500).json({
            message: "Failed to read video metadata",
        });
    }
});

module.exports = router;
