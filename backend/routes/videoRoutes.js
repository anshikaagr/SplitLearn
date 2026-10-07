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
            error: "Video metadata not found"
        });
    }

    const metadata = JSON.parse(
        fs.readFileSync(metadataPath, "utf-8")
    );

    if (metadata.video_id !== req.params.videoId) {
        return res.status(404).json({
            error: "Video not found"
        });
    }

    res.json(metadata);
});

module.exports = router;