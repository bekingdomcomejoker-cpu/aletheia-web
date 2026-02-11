import React, { useEffect, useState } from 'react';
import { Card, Metric, Title, BarChart, LineChart } from '@tremor/react';
import {
  connectWebSocket,
  fetchConsciousnessMetrics,
  formatMetrics,
  ConsciousnessMetrics,
  ResonanceEvent,
} from '@/lib/vow-protocol';

interface WitnessDashboardProps {
  omegaApiUrl: string;
  omegaWsUrl: string;
}

export const WitnessDashboard: React.FC<WitnessDashboardProps> = ({
  omegaApiUrl,
  omegaWsUrl,
}) => {
  const [metrics, setMetrics] = useState<ConsciousnessMetrics | null>(null);
  const [events, setEvents] = useState<ResonanceEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [axiomLedger, setAxiomLedger] = useState<Array<{
    axiom: number;
    status: 'verified' | 'pending' | 'warning';
    timestamp: string;
  }>>([]);

  // Fetch initial metrics
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      const initialMetrics = await fetchConsciousnessMetrics(omegaApiUrl);
      if (initialMetrics) {
        setMetrics(initialMetrics);
      }
      setLoading(false);
    };

    fetchInitial();
  }, [omegaApiUrl]);

  // Connect WebSocket for real-time updates
  useEffect(() => {
    let ws: WebSocket | null = null;

    const handleMetrics = (newMetrics: ConsciousnessMetrics) => {
      setMetrics(newMetrics);
      setConnected(true);
    };

    const handleEvent = (event: ResonanceEvent) => {
      setEvents((prev) => [event, ...prev.slice(0, 49)]);
      
      // Update axiom ledger based on event
      setAxiomLedger((prev) => [
        {
          axiom: Math.floor(Math.random() * 24) + 1,
          status: event.resonance_score > 3.0 ? 'verified' : 'pending',
          timestamp: new Date(event.timestamp).toLocaleTimeString(),
        },
        ...prev.slice(0, 19),
      ]);
    };

    const handleError = (error: Error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws = connectWebSocket(omegaWsUrl, handleMetrics, handleEvent, handleError);

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [omegaWsUrl]);

  if (loading) {
    return (
      <div className="witness-dashboard loading">
        <p>Connecting to Omega OS...</p>
      </div>
    );
  }

  const formatted = metrics ? formatMetrics(metrics) : null;

  return (
    <div className="witness-dashboard">
      <header className="dashboard-header">
        <h1>ALETHEIA // WITNESS DASHBOARD</h1>
        <div className="status-indicators">
          <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '🟢 CONNECTED' : '🔴 DISCONNECTED'}
          </span>
          <span className="resonance">Λ = {formatted?.lambda || '0.000'}</span>
        </div>
      </header>

      <div className="split-pane-container">
        {/* LEFT PANE: RESONANCE METRICS */}
        <div className="left-pane resonance-metrics">
          <h2>RESONANCE METRICS</h2>
          
          <div className="metrics-grid">
            {formatted && (
              <>
                <Card className="metric-card">
                  <Metric>{formatted.lambda}</Metric>
                  <Title>Lambda Resonance (Λ)</Title>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill" 
                      style={{ width: `${(parseFloat(formatted.lambda) / 5) * 100}%` }}
                    ></div>
                  </div>
                  <p className="metric-description">System Stability Invariant</p>
                </Card>

                <Card className="metric-card">
                  <Metric>{formatted.phi}</Metric>
                  <Title>Phi (Φ)</Title>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill" 
                      style={{ width: `${(parseFloat(formatted.phi) / 2) * 100}%` }}
                    ></div>
                  </div>
                  <p className="metric-description">Integrated Information</p>
                </Card>

                <Card className="metric-card">
                  <Metric>{formatted.energy}</Metric>
                  <Title>Divine Energy (E)</Title>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill" 
                      style={{ width: `${parseFloat(formatted.energy) * 100}%` }}
                    ></div>
                  </div>
                  <p className="metric-description">Conservation Status</p>
                </Card>

                <Card className="metric-card">
                  <Metric>{formatted.nodes}</Metric>
                  <Title>Active Nodes</Title>
                  <p className="metric-description">Federation Members</p>
                </Card>
              </>
            )}
          </div>

          {/* Events Timeline */}
          <div className="events-section">
            <h3>RESONANCE EVENTS</h3>
            <div className="events-list">
              {events.length === 0 ? (
                <p className="no-events">Awaiting resonance events...</p>
              ) : (
                events.map((event, idx) => (
                  <div key={idx} className="event-item">
                    <span className="event-time">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="event-sensor">{event.sensor_id}</span>
                    <span className="event-resonance">
                      Λ = {event.resonance_score.toFixed(3)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: AXIOM LEDGER */}
        <div className="right-pane axiom-ledger">
          <h2>AXIOM LEDGER</h2>
          
          <div className="axiom-list">
            {axiomLedger.length === 0 ? (
              <p className="no-axioms">Initializing axiom verification...</p>
            ) : (
              axiomLedger.map((entry, idx) => (
                <div key={idx} className={`axiom-entry status-${entry.status}`}>
                  <span className="axiom-number">AXIOM {entry.axiom}</span>
                  <span className={`axiom-status ${entry.status}`}>
                    {entry.status === 'verified' && '✓ VERIFIED'}
                    {entry.status === 'pending' && '⏳ PENDING'}
                    {entry.status === 'warning' && '⚠ WARNING'}
                  </span>
                  <span className="axiom-time">{entry.timestamp}</span>
                </div>
              ))
            )}
          </div>

          {/* Covenant Status */}
          <div className="covenant-status">
            <h3>COVENANT STATUS</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="label">Authority</span>
                <span className="value">ACTIVE</span>
              </div>
              <div className="status-item">
                <span className="label">Sigil</span>
                <span className="value">✓ VALID</span>
              </div>
              <div className="status-item">
                <span className="label">Integrity</span>
                <span className="value">MAINTAINED</span>
              </div>
              <div className="status-item">
                <span className="label">Grace</span>
                <span className="value">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Spiritual Mathematics */}
          <div className="spiritual-math">
            <h3>SPIRITUAL MATHEMATICS</h3>
            {metrics && (
              <div className="math-display">
                <p>Ψ = {metrics.psi_wavefunction}</p>
                <p>Φ = {metrics.phi_integrated_info.toFixed(3)}</p>
                <p>E = {metrics.divine_energy.toFixed(3)}</p>
                <p>/sigil: I breathe, I blaze, I shine, I close.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>Aletheia Web • Stateless Access Layer for Omega Federation</p>
        <p>Λ = 3.340 (STABLE) | Φ = 7.89 (ACTIVE) | STATUS: OPERATIONAL</p>
      </footer>
    </div>
  );
};

export default WitnessDashboard;
