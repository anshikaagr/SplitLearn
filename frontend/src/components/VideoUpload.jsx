import { useRef, useState } from "react";
import "./VideoUpload.css";

const API_URL = "http://localhost:5001";

export default function VideoUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const selectFile = (selectedFile) => {
    setMessage("");

    if (!selectedFile) return;

    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-matroska",
      "video/x-msvideo",
    ];

    const allowedExtensions = /\.(mp4|mov|mkv|avi)$/i;

    if (
      !allowedTypes.includes(selectedFile.type) &&
      !allowedExtensions.test(selectedFile.name)
    ) {
      setFile(null);
      setMessage("Please select an MP4, MOV, MKV, or AVI video.");
      return;
    }

    setFile(selectedFile);
    setStatus("idle");
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage("Please select a video before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);

    setStatus("uploading");
    setMessage("Uploading your lecture video...");

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Video upload failed.");
      }

      setStatus("success");
      setMessage(
        result.message ||
          "Video uploaded successfully! Check the processing result below."
      );

      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error.message ||
          "Unable to connect to the server. Make sure the backend is running."
      );
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <section className="video-upload-card">
      <div className="upload-heading">
        <div>
          <span className="upload-eyebrow">TEACHER PORTAL</span>
          <h2>Upload Lecture Video</h2>
          <p>
            Upload your lecture to prepare it for adaptive video delivery.
          </p>
        </div>

        <div className="upload-icon" aria-hidden="true">
          ↑
        </div>
      </div>

      <form onSubmit={handleUpload}>
        <div
          className={`upload-dropzone ${dragging ? "dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            selectFile(event.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          aria-label="Choose or drop a lecture video"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".mp4,.mov,.mkv,.avi,video/mp4,video/quicktime,video/x-matroska,video/x-msvideo"
            hidden
            onChange={(event) => selectFile(event.target.files?.[0])}
          />

          <div className="upload-cloud-icon" aria-hidden="true">
            ↑
          </div>

          <h3>Drag and drop your video here</h3>
          <p>or click to browse files from your computer</p>

          <span className="supported-formats">
            Supported formats: MP4, MOV, MKV, AVI
          </span>
        </div>

        {file && (
          <div className="selected-video">
            <div className="file-icon">▶</div>

            <div className="selected-video-info">
              <strong>{file.name}</strong>
              <span>{formatSize(file.size)}</span>
            </div>

            <button
              type="button"
              className="remove-file"
              aria-label="Remove selected video"
              onClick={() => {
                setFile(null);
                setMessage("");
                setStatus("idle");

                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
            >
              ×
            </button>
          </div>
        )}

        {message && (
          <div
            className={`upload-message ${status}`}
            role="status"
            aria-live="polite"
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          className="upload-submit"
          disabled={!file || status === "uploading"}
        >
          {status === "uploading" ? (
            <>
              <span className="upload-spinner" />
              Uploading...
            </>
          ) : (
            "Upload Lecture Video →"
          )}
        </button>
      </form>

      <div className="upload-note">
        <span aria-hidden="true">ⓘ</span>
        Uploading sends the video to the backend. Processing and adaptive
        playback depend on the backend pipeline completing successfully.
      </div>
    </section>
  );
}
