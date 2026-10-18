const express = require("express");
const multer = require("multer");
const path = require("path");

const { processVideo } = require("../services/processingService");

const router = express.Router();
const uploadDirectory = path.join(__dirname, "../uploads");

// Multer cannot write to a directory that does not exist.
require("fs").mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,

    fileFilter: (req, file, cb) => {
        const allowedExtensions = [".mp4", ".mov", ".mkv", ".avi"];
        const extension = path.extname(file.originalname).toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            return cb(new Error("Only video files are allowed"));
        }

        cb(null, true);
    }
});

router.post("/", upload.single("video"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: "No video file uploaded"
        });
    }

    try {
        console.log(`Video uploaded: ${req.file.filename}`);

        const result = await processVideo(req.file.path);

        res.json({
            message: "Video uploaded and processed successfully",
            filename: req.file.filename,
            processing: result
        });

    } catch (error) {
        console.error("Processing error:", error);

        res.status(500).json({
            message: "Video uploaded but processing failed",
            filename: req.file.filename,
            error: error.message
        });
    }
});

module.exports = router;