const express = require("express");
const cors = require("cors");
const path = require("path");
const reportRoutes = require("./routes/reportRoutes");

const videoRoutes = require("./routes/videoRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use(
    "/qualities",
    express.static(path.join(__dirname, "../output/qualities"))
);

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "SplitLearn backend is running"
    });
});

app.use("/api/videos", videoRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reports", reportRoutes);

app.listen(PORT, () => {
    console.log(`SplitLearn backend running on http://localhost:${PORT}`);
});