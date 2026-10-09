import { useState } from "react";
import NetworkSimulator from "./components/NetworkSimulator";
import ModeToggle from "./components/ModeToggle";
import {
  getNormalQuality,
  getSmartQuality,
} from "./logic/qualitySelector";

function App() {
  const [bandwidth, setBandwidth] = useState(3);
  const [mode, setMode] = useState("normal");

  const contentType = "slide";

  const selectedQuality =
    mode === "normal"
      ? getNormalQuality(bandwidth)
      : getSmartQuality(bandwidth, contentType);

  return (
    <div className="app">
      <h1>SplitLearn</h1>

      <p>Adaptive Video Streaming</p>

      <ModeToggle
        mode={mode}
        setMode={setMode}
      />

      <NetworkSimulator
        bandwidth={bandwidth}
        setBandwidth={setBandwidth}
      />

      <div className="quality-display">
        <h2>Current Segment</h2>

        <p>
          Content Type: <strong>{contentType}</strong>
        </p>

        <p>
          Bandwidth: <strong>{bandwidth} Mbps</strong>
        </p>

        <p>
          Mode: <strong>{mode.toUpperCase()}</strong>
        </p>

        <p>
          Selected Quality:{" "}
          <strong>{selectedQuality.toUpperCase()}</strong>
        </p>
      </div>
    </div>
  );
}

export default App;