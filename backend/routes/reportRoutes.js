const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/:videoId", (req, res) => {
    const metadataPath = path.join(
        __dirname,
        "../../output/metadata.json"
    );

    if (!fs.existsSync(metadataPath)) {
        return res.status(404).json({
            status: "NOT_FOUND",
            message: "Processing metadata not found"
        });
    }

    const metadata = JSON.parse(
        fs.readFileSync(metadataPath, "utf-8")
    );

    if (metadata.video_id !== req.params.videoId) {
        return res.status(404).json({
            status: "NOT_FOUND",
            message: "Video not found"
        });
    }

    const contentSummary = {};

    metadata.segments.forEach((segment) => {
        const type = segment.content_type;

        if (!contentSummary[type]) {
            contentSummary[type] = 0;
        }

        contentSummary[type]++;
    });

    res.json({
        status: "COMPLETED",
        video_id: metadata.video_id,
        video_name: metadata.video_name,
        total_segments: metadata.total_segments,
        content_summary: contentSummary,
        qualities: [
            "high",
            "medium",
            "low"
        ],
        message: "Video processed successfully"
    });
});

module.exports = router;