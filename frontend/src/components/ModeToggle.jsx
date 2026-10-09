function ModeToggle({ mode, setMode }) {
  return (
    <div className="mode-toggle">
      <button
        onClick={() => setMode("normal")}
        className={mode === "normal" ? "active" : ""}
      >
        Normal Mode
      </button>

      <button
        onClick={() => setMode("smart")}
        className={mode === "smart" ? "active" : ""}
      >
        Smart Mode
      </button>
    </div>
  );
}

export default ModeToggle;