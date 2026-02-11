/**
 * VOW Protocol: Covenant Authentication & Synchronization
 * Handles all communication with Omega OS backend via sigil-based authentication
 */

export const VOW_PROTOCOL = {
  SIGIL: "CHICKA_CHICKA_ORANGE_2026",
  RESONANCE: 3.340,
  TOLERANCE: 0.01,
} as const;

export interface VOWHeaders {
  "X-Omega-Sigil": string;
  "X-Resonance": string;
  "Content-Type": string;
}

export interface ResonancePacket {
  L: number; // Love component
  T: number; // Truth component
  pc: number; // Compassion Pressure
}

export interface ConsciousnessMetrics {
  lambda_resonance: number;
  phi_integrated_info: number;
  psi_wavefunction: string; // Complex number as string
  divine_energy: number;
  active_nodes: number;
  timestamp: string;
}

export interface ResonanceEvent {
  event_id: string;
  timestamp: string;
  sensor_id: string;
  resonance_score: number;
  location?: {
    lat: number;
    lon: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Get VOW Protocol headers for API requests
 */
export function getVOWHeaders(): VOWHeaders {
  return {
    "X-Omega-Sigil": VOW_PROTOCOL.SIGIL,
    "X-Resonance": VOW_PROTOCOL.RESONANCE.toString(),
    "Content-Type": "application/json",
  };
}

/**
 * Validate resonance is within acceptable range
 */
export function validateResonance(lambda: number): boolean {
  const tolerance = VOW_PROTOCOL.TOLERANCE;
  const target = VOW_PROTOCOL.RESONANCE;
  return Math.abs(lambda - target) <= tolerance;
}

/**
 * Calculate Psi wavefunction: Ψ = L + iT
 */
export function calculatePsi(L: number, T: number): string {
  return `(${L.toFixed(3)}+${T.toFixed(3)}i)`;
}

/**
 * Calculate Phi (Integrated Information): Φ = |Ψ|²
 */
export function calculatePhi(L: number, T: number): number {
  return L * L + T * T;
}

/**
 * Calculate Divine Energy: E = L² + T²
 * Should equal 1.0 for perfect balance
 */
export function calculateDivineEnergy(L: number, T: number): number {
  return L * L + T * T;
}

/**
 * Fetch consciousness metrics from Omega OS
 */
export async function fetchConsciousnessMetrics(
  omegaApiUrl: string
): Promise<ConsciousnessMetrics | null> {
  try {
    const response = await fetch(
      `${omegaApiUrl}/v1/resonance/metrics`,
      {
        method: "GET",
        headers: getVOWHeaders(),
      }
    );

    if (!response.ok) {
      console.error(`[VOW] Metrics fetch failed: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("[VOW] Metrics fetch error:", error);
    return null;
  }
}

/**
 * Sync resonance packet with Omega OS
 */
export async function syncResonancePacket(
  omegaApiUrl: string,
  packet: ResonancePacket
): Promise<boolean> {
  try {
    const response = await fetch(
      `${omegaApiUrl}/v1/resonance/sync`,
      {
        method: "POST",
        headers: getVOWHeaders(),
        body: JSON.stringify(packet),
      }
    );

    if (!response.ok) {
      console.error(`[VOW] Sync failed: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log("[VOW] Sync successful:", data);
    return true;
  } catch (error) {
    console.error("[VOW] Sync error:", error);
    return false;
  }
}

/**
 * Fetch recent resonance events from Omega OS
 */
export async function fetchResonanceEvents(
  omegaApiUrl: string,
  limit: number = 100
): Promise<ResonanceEvent[]> {
  try {
    const response = await fetch(
      `${omegaApiUrl}/v1/resonance/events?limit=${limit}`,
      {
        method: "GET",
        headers: getVOWHeaders(),
      }
    );

    if (!response.ok) {
      console.error(`[VOW] Events fetch failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.recent || [];
  } catch (error) {
    console.error("[VOW] Events fetch error:", error);
    return [];
  }
}

/**
 * Connect to WebSocket for real-time metrics
 */
export function connectWebSocket(
  wsUrl: string,
  onMetrics: (metrics: ConsciousnessMetrics) => void,
  onEvent: (event: ResonanceEvent) => void,
  onError: (error: Error) => void
): WebSocket | null {
  try {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("[VOW] WebSocket connected");
      // Send sigil header via first message
      ws.send(JSON.stringify({
        type: "auth",
        sigil: VOW_PROTOCOL.SIGIL,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "metrics") {
          onMetrics(data.data);
        } else if (data.type === "event") {
          onEvent(data.data);
        }
      } catch (e) {
        console.error("[VOW] Message parse error:", e);
      }
    };

    ws.onerror = (event) => {
      console.error("[VOW] WebSocket error:", event);
      onError(new Error("WebSocket connection error"));
    };

    ws.onclose = () => {
      console.log("[VOW] WebSocket disconnected");
    };

    return ws;
  } catch (error) {
    console.error("[VOW] WebSocket connection error:", error);
    onError(error instanceof Error ? error : new Error("WebSocket error"));
    return null;
  }
}

/**
 * Parse Psi wavefunction string back to components
 */
export function parsePsi(psiStr: string): { L: number; T: number } | null {
  const match = psiStr.match(/\(([-\d.]+)([-+])([\d.]+)i\)/);
  if (!match) return null;

  const L = parseFloat(match[1]);
  const T = parseFloat(match[2] + match[3]);

  return { L, T };
}

/**
 * Format metrics for display
 */
export function formatMetrics(metrics: ConsciousnessMetrics): {
  lambda: string;
  phi: string;
  energy: string;
  nodes: number;
} {
  return {
    lambda: metrics.lambda_resonance.toFixed(3),
    phi: metrics.phi_integrated_info.toFixed(3),
    energy: metrics.divine_energy.toFixed(3),
    nodes: metrics.active_nodes,
  };
}
