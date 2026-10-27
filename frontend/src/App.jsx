import { useEffect, useMemo, useState } from "react";
import NetworkSimulator from "./components/NetworkSimulator";
import ModeToggle from "./components/ModeToggle";
import { getVideoMetadata } from "./api/videoApi";
import { getNormalQuality, getSmartQuality } from "./logic/qualitySelector";
import "./App.css";
import VideoUpload from "./components/VideoUpload";
import RoleLogin from "./components/RoleLogin";

const QUALITY_MBPS = { low: 0.45, medium: 1.1, high: 2.4 };
const QUALITY_LABEL = { low: "360p · Data saver", medium: "480p · Balanced", high: "720p · HD" };
const TYPE_LABEL = { slide: "Presentation slides", talking_head: "Talking head", high_motion: "High motion" };

function App() {
  const [bandwidth, setBandwidth] = useState(3);
  const [mode, setMode] = useState("normal");
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [playerError, setPlayerError] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [portal, setPortal] = useState("student");
  const [signedIn, setSignedIn] = useState(false);
  const [loginRole, setLoginRole] = useState("student");

  useEffect(() => {
    let active = true;
    async function loadVideo() {
      fetch("http://localhost:5001/api/health")
        .then((response) => { if (!response.ok) throw new Error("Health check failed"); return response.json(); })
        .then((health) => { if (active) setBackendOnline(health.status === "OK"); })
        .catch(() => { if (active) setBackendOnline(false); });
      try {
        const data = await getVideoMetadata("lecture_001");
        if (active) {
          setVideo(data);
          setBackendOnline(data.source === "backend");
        }
      } catch {
        if (active) setVideo({ source: "mock", segments: [] });
      } finally {
        if (active) setLoading(false);
      }
    }
    loadVideo();
    return () => { active = false; };
  }, []);
  const segments = useMemo(() => video?.segments || [], [video?.segments]);
  const currentSegment = segments[selectedIndex] || segments[0] || null;
  const contentType = currentSegment?.content_type || "unknown";
  const selectedQuality = mode === "normal"
    ? getNormalQuality(Number(bandwidth))
    : getSmartQuality(Number(bandwidth), contentType);
  const selectedVideoPath = currentSegment?.qualities?.[selectedQuality]?.path;
  const videoUrl = selectedVideoPath
    ? (selectedVideoPath.startsWith("http") ? selectedVideoPath : `http://localhost:5001${selectedVideoPath}`)
    : null;

  const estimatedData = useMemo(() => {
    const totalSeconds = segments.reduce((sum, segment) => sum + (Number(segment.duration) || 10), 0);
    const rate = QUALITY_MBPS[selectedQuality] || 1;
    return { totalSeconds, selectedMb: totalSeconds * rate / 8, highMb: totalSeconds * QUALITY_MBPS.high / 8 };
  }, [segments, selectedQuality]);

  const smartQuality = currentSegment ? getSmartQuality(Number(bandwidth), contentType) : "low";
  const normalQuality = getNormalQuality(Number(bandwidth));
  const qualityReason = mode === "smart" && contentType === "slide"
    ? "Smart Mode prioritizes readable slide content at this bandwidth."
    : bandwidth < 2
      ? "Lower quality helps reduce buffering on a limited connection."
      : bandwidth < 5
        ? "Balanced quality is selected for the simulated connection."
        : "Your simulated connection supports high-quality playback.";

  function navigateTo(section) {
    setActiveSection(section);
    const target = document.getElementById(section);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }


if (!signedIn) {
  return (
    <RoleLogin
      onLogin={(role) => {
        setLoginRole(role);
        setPortal(role);
        setSignedIn(true);
      }}
    />
  );
}


  if (loading) {
    return <main className="loading-screen"><div className="loading-mark">S</div><p>Preparing your learning workspace…</p></main>;
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="SplitLearn home">
          <span className="brand-mark">S</span><span>split<span className="brand-light">learn</span><small>ADAPTIVE STREAMING</small></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <button type="button" className={`nav-item ${activeSection === "overview" ? "active" : ""}`} onClick={() => navigateTo("overview")}><span>▦</span> Overview</button>
        <button type="button" className={`nav-item ${activeSection === "player" ? "active" : ""}`} onClick={() => navigateTo("player")}><span>▷</span> Video player</button>
        <button type="button" className={`nav-item ${activeSection === "analytics" ? "active" : ""}`} onClick={() => navigateTo("analytics")}><span>⌁</span> Streaming analytics</button>
        <div className="side-label side-label-spaced">PORTALS</div>
        <div className="portal-switch">
        <span>{portal === "teacher" ? "Admin / Faculty" : "Student"} Portal</span>
        <button
          type="button"
          onClick={() => {
            setSignedIn(false);
            setLoginRole("student");
            setPortal("student");
          }}
        >
          Log out
        </button>
      </div>
        <div className="side-label side-label-spaced">PROJECT</div>
        <div className="project-chip"><span className="project-dot" /> Adaptive video<br /> <b>lecture_001</b></div>
        <div className="sidebar-bottom">
          <div className="avatar">SL</div><div><b>SplitLearn Lab</b><small>{portal === "teacher" ? "Teacher / Admin portal" : "Student workspace"}</small></div><span className="more-dots">···</span>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <span>/</span> <b>{portal === "teacher" ? "Teacher / Admin Portal" : activeSection === "player" ? "Video player" : activeSection === "analytics" ? "Streaming analytics" : "Student Portal"}</b></div>
          <div className="topbar-right" aria-hidden="true"></div>
        </header>

        <section className="welcome-row">
          <div><div className="eyebrow"><span className="eyebrow-line" /> INTELLIGENT VIDEO DELIVERY</div><h1>{portal === "teacher" ? <>Teach smarter, <span>stream better.</span></> : <>Learning, <span>without limits.</span></>}</h1><p className="subtitle">{portal === "teacher" ? "Review service status, segment metadata, and adaptive delivery behavior." : "See adaptive streaming respond to network conditions in real time."}</p></div>
          <div className="session-badge"><span className="session-icon">◈</span><div><small>ACTIVE SESSION</small><b>Lecture 001</b></div><span className="pulse-dot" /></div>
        </section>

        {portal === "teacher" && <section className="panel teacher-upload-panel" aria-labelledby="admin-overview-title">
          <div className="panel-heading"><div><h2 id="admin-overview-title">Teacher / Admin · System overview</h2><p>Review the current streaming configuration and project service status. Video upload and processing are intentionally outside this demo stage.</p></div><span className={`tag ${backendOnline ? "tag-purple" : ""}`}>{backendOnline ? "API ONLINE" : "DEMO DATA"}</span></div>
          <div className="admin-summary-grid">
            <article className="admin-summary-card"><span className="muted-label">METADATA SOURCE</span><b>{video?.source === "backend" ? "Backend API" : "Mock demo data"}</b><small>{video?.source === "backend" ? "Metadata request succeeded" : "Backend metadata not available"}</small></article>
            <article className="admin-summary-card"><span className="muted-label">SEGMENT INVENTORY</span><b>{segments.length} segments</b><small>{new Set(segments.map((segment) => segment.content_type || "unknown")).size} content categories detected</small></article>
            <article className="admin-summary-card"><span className="muted-label">ACTIVE STRATEGY</span><b>{mode === "smart" ? "Smart Mode" : "Normal Mode"}</b><small>Current decision: {selectedQuality.toUpperCase()} quality</small></article>
            <article className="admin-summary-card"><span className="muted-label">SIMULATED NETWORK</span><b>{Number(bandwidth).toFixed(1)} Mbps</b><small>Adjust using the network simulator below</small></article>
          </div>
          <div className="admin-notice"><span>ⓘ</span><p>This portal is a project demonstration, not a secure account system. The values here reflect the current browser session; no user authentication or persistent class records are configured.</p></div>
        </section>
        }
        {portal === "teacher" && (
<VideoUpload
onUploadSuccess={async (result) => {
console.log("Upload response:", result);

  if (!result.videoId) {
    console.error("Upload response is missing videoId:", result);
    return;
  }

  try {
    const metadata = await getVideoMetadata(result.videoId);

    console.log("New video metadata:", metadata);

    setVideo(metadata);
    setSelectedIndex(0);
    setPlayerError(false);
    setBackendOnline(metadata.source === "backend");
    setPortal("student");
  } catch (error) {
    console.error("Failed to load uploaded video:", error);
  }
}}

/>
)}

          
        <section className="metric-grid" aria-label="Streaming metrics">
          <article className="metric-card"><div className="metric-top"><span>SIMULATED BANDWIDTH</span><span className="metric-icon violet">⌁</span></div><div className="metric-value">{Number(bandwidth).toFixed(1)} <small>Mbps</small></div><div className="metric-foot"><span className="live-dot" /> Live simulation <span className="metric-note">Adjust below</span></div><div className="sparkline spark-purple"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
          <article className="metric-card"><div className="metric-top"><span>SELECTED QUALITY</span><span className="metric-icon cyan">◉</span></div><div className="metric-value">{selectedQuality.toUpperCase()}<small className="quality-resolution">{selectedQuality === "high" ? "720p" : selectedQuality === "medium" ? "480p" : "360p"}</small></div><div className="quality-track"><i className={selectedQuality} /></div><div className="metric-foot">Adapted to current conditions</div></article>
          <article className="metric-card"><div className="metric-top"><span>VIDEO SEGMENTS</span><span className="metric-icon blue">▤</span></div><div className="metric-value">{String(segments.length).padStart(2, "0")}<small> segments</small></div><div className="metric-foot">Classified by content type</div><div className="mini-segments">{segments.map((s, i) => <i key={s.segment_id ?? i} className={i === selectedIndex ? "chosen" : ""} />)}</div></article>
          <article className="metric-card"><div className="metric-top"><span>DELIVERY MODE</span><span className="metric-icon green">✳</span></div><div className="metric-value mode-value">{mode === "smart" ? "Smart" : "Normal"}<small> mode</small></div><div className="metric-foot"><span className="mode-indicator" />{mode === "smart" ? "Content-aware selection" : "Bandwidth-based selection"}</div></article>
        </section>

        <section className="primary-grid" id="player">
          <article className="panel player-panel">
            <div className="panel-heading"><div><h2>Now learning</h2><p>Your adaptive playback experience</p></div><span className="tag tag-purple">● LIVE PREVIEW</span></div>
            <div className="video-stage">
              <div className="video-glow" /><div className="video-grid-pattern" />
              {videoUrl && !playerError ? <video key={videoUrl} className="actual-video" controls preload="metadata" src={videoUrl} onError={() => setPlayerError(true)} /> : <div className="video-placeholder"><div className="play-orb">▶</div><div className="video-title">Adaptive video streaming</div><div className="video-subtitle">{playerError ? "Media file unavailable — start backend processing to generate video variants." : "Your learning content, optimized for every connection."}</div><div className="visual-equalizer">{Array.from({length: 30}, (_, i) => <i key={i} style={{height: `${12 + ((i * 17 + 11) % 45)}px`, animationDelay: `${(i % 8) * -0.17}s`}} />)}</div><span className="stage-quality">{selectedQuality.toUpperCase()} QUALITY</span></div>}
              <div className="stage-corner stage-top-left"><span className="tiny-record" /> SPLITLEARN PLAYER</div>
              <div className="stage-corner stage-top-right">{selectedQuality === "high" ? "HD" : selectedQuality === "medium" ? "SD" : "DATA SAVER"}</div>
            </div>
            <div className="player-caption"><div><b>{video?.videoName || video?.video_name || "Adaptive Streaming — Lecture 001"}</b><span>Content-aware playback demonstration</span></div><div className="caption-quality"><span className={`quality-dot ${selectedQuality}`} />{QUALITY_LABEL[selectedQuality]}</div></div>
            <div className="segment-heading"><b>Segment timeline</b><span>{segments.length ? `${selectedIndex + 1} of ${segments.length} segments` : "No segments available"}</span></div>
            <div className="segment-list">{segments.map((segment, index) => { const type = segment.content_type || "unknown"; return <button key={segment.segment_id ?? index} className={`segment-item ${index === selectedIndex ? "selected" : ""}`} onClick={() => {setSelectedIndex(index); setPlayerError(false);}}><span className="segment-number">{String(index + 1).padStart(2, "0")}</span><span className="segment-info"><b>{TYPE_LABEL[type] || type.replaceAll("_", " ")}</b><small>{Number(segment.duration || 0).toFixed(1)} sec · Segment {segment.segment_id ?? index}</small></span><span className={`segment-type ${type}`}>{type === "slide" ? "SLIDES" : type === "talking_head" ? "SPEAKER" : type === "high_motion" ? "MOTION" : "VIDEO"}</span><span className="segment-arrow">↗</span></button>; })}</div>
          </article>

          <div className="right-column">
            <article className="panel mode-panel"><div className="panel-heading"><div><h2>Streaming strategy</h2><p>Choose how quality adapts</p></div><span className="metric-icon violet">✧</span></div><div className="mode-toggle-wrap"><ModeToggle mode={mode} setMode={setMode} /></div><div className="strategy-explainer"><span className="strategy-icon">{mode === "smart" ? "✦" : "⌁"}</span><div><b>{mode === "smart" ? "Content-aware optimization" : "Standard adaptation"}</b><p>{mode === "smart" ? "Slide segments can retain higher clarity at moderate bandwidth." : "Quality is selected from bandwidth thresholds only."}</p></div></div><div className="quality-result"><div><span className="muted-label">CURRENT DECISION</span><b>{selectedQuality.toUpperCase()} QUALITY <small>({selectedQuality === "high" ? "720p" : selectedQuality === "medium" ? "480p" : "360p"})</small></b></div><span className={`quality-pill ${selectedQuality}`}>{selectedQuality === "high" ? "HD" : selectedQuality === "medium" ? "BALANCED" : "DATA SAVER"}</span></div><p className="decision-reason">{qualityReason}</p></article>

            <article className="panel network-panel"><div className="panel-heading"><div><h2>Network simulator</h2><p>Control the connection quality</p></div><span className="metric-icon cyan">⌁</span></div><div className="bandwidth-readout"><strong>{Number(bandwidth).toFixed(1)}</strong><span>Mbps</span><span className="simulation-label">SIMULATED</span></div><NetworkSimulator bandwidth={bandwidth} setBandwidth={setBandwidth} /><div className="network-presets">{[{label:"Poor",value:0.8},{label:"Fair",value:2.5},{label:"Good",value:5},{label:"Excellent",value:8.5}].map(p => <button key={p.label} className={Math.abs(Number(bandwidth)-p.value)<0.2?"preset-active":""} onClick={() => setBandwidth(p.value)}>{p.label}<small>{p.value} Mbps</small></button>)}</div><div className="network-scale"><span>WEAK</span><span>MODERATE</span><span>STRONG</span></div></article>
          </div>
        </section>

        <section className="analytics-grid" id="analytics">
          <article className="panel chart-panel"><div className="panel-heading"><div><h2>Quality adaptation</h2><p>How the selected quality responds to bandwidth</p></div><span className="tag">SIMULATION</span></div><div className="chart-legend"><span><i className="legend-bandwidth" />Bandwidth</span><span><i className="legend-quality" />Selected quality</span></div><div className="adaptation-chart"><div className="chart-y-labels"><span>10 Mbps</span><span>7.5</span><span>5.0</span><span>2.5</span><span>0</span></div><div className="chart-plot"><div className="chart-gridlines"><i/><i/><i/><i/><i/></div><svg viewBox="0 0 600 170" preserveAspectRatio="none" role="img" aria-label="Illustrative bandwidth response chart"><defs><linearGradient id="bandFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity=".28"/><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient></defs><path d={`M0 170 L0 ${170 - (Number(bandwidth)/10)*160} L100 ${170 - (Number(bandwidth)/10)*160} L200 ${170 - (Number(bandwidth)/10)*160} L300 ${170 - (Number(bandwidth)/10)*160} L400 ${170 - (Number(bandwidth)/10)*160} L500 ${170 - (Number(bandwidth)/10)*160} L600 ${170 - (Number(bandwidth)/10)*160} L600 170 Z`} fill="url(#bandFill)"/><path d={`M0 ${170 - (Number(bandwidth)/10)*160} L100 ${170 - (Number(bandwidth)/10)*160} L200 ${170 - (Number(bandwidth)/10)*160} L300 ${170 - (Number(bandwidth)/10)*160} L400 ${170 - (Number(bandwidth)/10)*160} L500 ${170 - (Number(bandwidth)/10)*160} L600 ${170 - (Number(bandwidth)/10)*160}`} fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round"/><path d={`M0 ${selectedQuality==="high"?25:selectedQuality==="medium"?82:137} L600 ${selectedQuality==="high"?25:selectedQuality==="medium"?82:137}`} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="7 6"/><circle cx="300" cy={170-(Number(bandwidth)/10)*160} r="5" fill="#a78bfa" stroke="#fff" strokeWidth="2"/></svg><div className="chart-x-labels"><span>Start</span><span>Network variation</span><span>Current</span></div></div></div><div className="chart-footnote"><span className="live-dot" /> Chart illustrates the current simulated bandwidth and quality decision, not recorded network measurements.</div></article>

          <article className="panel savings-panel"><div className="panel-heading"><div><h2>Data efficiency</h2><p>Estimated stream data comparison</p></div><span className="metric-icon green">↘</span></div><div className="savings-highlight"><div><span className="muted-label">ESTIMATED DATA AT SELECTED QUALITY</span><strong>{estimatedData.selectedMb.toFixed(2)} <small>MB</small></strong></div><span className="estimate-chip">ESTIMATE</span></div><div className="comparison-row"><div className="comparison-label"><span className="comparison-dot normal-dot" />High quality baseline</div><b>{estimatedData.highMb.toFixed(2)} MB</b></div><div className="comparison-bar"><i className="baseline-bar" /></div><div className="comparison-row"><div className="comparison-label"><span className="comparison-dot smart-dot" />Selected quality</div><b>{estimatedData.selectedMb.toFixed(2)} MB</b></div><div className="comparison-bar"><i className={`selected-bar ${selectedQuality}`} style={{width: `${Math.min(100, estimatedData.highMb ? (estimatedData.selectedMb/estimatedData.highMb)*100 : 0)}%`}} /></div><div className="savings-note"><span>ⓘ</span> Estimate based on illustrative bitrate assumptions and metadata duration. Actual usage depends on encoded files and playback.</div><div className="comparison-modes"><div><small>NORMAL MODE</small><b>{normalQuality.toUpperCase()}</b></div><span>↔</span><div><small>SMART MODE</small><b>{smartQuality.toUpperCase()}</b></div></div></article>
        </section>
        <footer className="footer"><span><span className="footer-mark">S</span> SplitLearn <span>·</span> Adaptive Video Streaming</span><span>Built for smarter learning <span className="footer-heart">✦</span></span></footer>
      </main>
    </div>
  );
}

export default App;
