# 🎓 SplitLearn

### Content-Aware & Network-Aware Adaptive Video Delivery

SplitLearn is an adaptive video delivery system designed to make educational video streaming more efficient under varying network conditions. It automatically segments lecture videos, identifies the type of content in each segment, and supports intelligent video quality selection based on content type and available bandwidth.

The goal is to provide a better learning experience by balancing visual clarity with network efficiency.

## ✨ Key Features

* **✂️ Automatic Video Segmentation:** Splits uploaded lecture videos into smaller segments using FFmpeg.
* **🧠 Content-Aware Classification:** Uses Python and OpenCV to analyze segments and classify them as talking-head content, presentation slides, or high-motion content.
* **📊 Segment Timeline:** Displays classified segments so users can identify different types of lecture content.
* **📶 Smart Quality Selection:** Selects video quality based on content type and network bandwidth.
* **🎞️ Multiple Quality Variants:** Generates Low (360p), Medium (480p), and High (720p) versions of video segments.
* **⚙️ Automated Processing Pipeline:** Connects video segmentation, quality generation, content analysis, and metadata generation into the upload workflow.
* **🔌 Backend API:** Uses Node.js and Express to manage video processing and expose video information to the frontend.

## 🛠️ Tech Stack

| Technology | Purpose                                               |
| ---------- | ----------------------------------------------------- |
| React      | Frontend interface                                    |
| Vite       | Frontend development and build tooling                |
| Node.js    | Backend runtime                                       |
| Express.js | Backend API and request handling                      |
| Python     | Video analysis and processing scripts                 |
| OpenCV     | Frame analysis, motion estimation, and face detection |
| FFmpeg     | Video segmentation and quality generation             |
| JavaScript | Frontend and backend application logic                |

## ⚙️ How It Works

1. **Upload:** A user uploads a lecture video through the frontend.
2. **Segmentation:** FFmpeg divides the video into smaller segments.
3. **Quality Generation:** The processing pipeline generates low-, medium-, and high-quality variants.
4. **Content Analysis:** Python and OpenCV analyze the segments using motion information and face detection.
5. **Metadata Generation:** The system records segment information, content classifications, and available quality paths.
6. **Adaptive Playback:** The frontend uses the segment classification and bandwidth information to select a suitable quality in Smart Mode.

### Content Classification

SplitLearn currently uses a rule-based heuristic rather than a trained machine-learning model.

| Content Type        | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| Talking Head        | Identifies segments where a speaker's face is detected |
| Presentation Slides | Identifies segments likely to contain slides or notes  |
| High Motion         | Identifies segments with substantial visual motion     |

Classification is performed per segment. Results depend on the video content and the effectiveness of face and motion detection.

### Video Quality Levels

| Quality | Resolution | Intended Use                   |
| ------- | ---------- | ------------------------------ |
| Low     | 360p       | Reduces bandwidth requirements |
| Medium  | 480p       | Balances clarity and bandwidth |
| High    | 720p       | Provides greater visual detail |

Smart Mode uses content type and network bandwidth to determine an appropriate quality. The exact selection depends on the configured quality-selection logic.

## 📁 Project Structure

```text
SplitLearn/
├── backend/
│   ├── routes/
│   ├── services/
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── logic/
│       └── App.jsx
├── processing/
│   ├── ffmpeg/
│   ├── metadata/
│   └── opencv/
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Install the following tools:

* Node.js and npm
* Python
* FFmpeg
* Git

### 1. Clone the Repository

```bash
git clone <https://github.com/anshikaagr/SplitLearn.git>
cd SplitLearn
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

Configure any required environment variables according to your backend configuration.

### 3. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 4. Set Up Python Dependencies

From the project root, activate your Python virtual environment and install the dependencies required by the processing scripts.

For example, the project uses OpenCV, NumPy, and other Python packages for video analysis. Ensure FFmpeg is installed and available on your system PATH.

Use your project's dependency file, if available, to install the exact required versions.

### 5. Run the Application

Start the backend using the start command configured in `backend/package.json`.

Start the frontend using the command configured in `frontend/package.json`, typically:

```bash
npm run dev
```

The frontend and backend must both be running for the complete application workflow to function.

## 🔮 Future Improvements

Potential areas for future development include:

* More robust content classification using trained computer-vision models.
* Improved detection of transitions between speakers and slides.
* More precise bandwidth estimation and adaptive quality selection.
* Additional performance testing under different network conditions.

## 🎯 Project Objective

SplitLearn explores how content-aware processing and adaptive video delivery can improve educational streaming. By analyzing lecture segments and selecting suitable video quality levels, the project aims to balance learning experience, visual clarity, and network efficiency.

---

**SplitLearn** — Smarter video delivery for better learning.
