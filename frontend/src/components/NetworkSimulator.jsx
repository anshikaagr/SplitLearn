function NetworkSimulator({ bandwidth, setBandwidth }) {
  return (
    <div className="network-simulator">
      <h2>Network Simulator</h2>

      <input
        type="range"
        min="0.5"
        max="10"
        step="0.1"
        value={bandwidth}
        onChange={(e) => setBandwidth(Number(e.target.value))}
      />

      <p>
        Simulated Bandwidth: <strong>{bandwidth} Mbps</strong>
      </p>
    </div>
  );
}

export default NetworkSimulator;