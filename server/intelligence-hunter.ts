/**
 * HUNTER - Phase 6 Intelligence Unit
 * 
 * Purpose: Pattern & anomaly detection
 * - Finds contradictions across analyses
 * - Detects drift and coherence failures
 * - Identifies high-value signals
 * - Does NOT ingest new data (reads only)
 * 
 * Triggers:
 * - Query/analysis requests
 * - Batch analysis jobs
 * 
 * Output: Anomaly & pattern intelligence entries to intelligenceLedger
 */

import { db } from "./db";
import { intelligenceLedger, analyses } from "../drizzle/schema";
import { sql } from "drizzle-orm";

export interface HunterConfig {
  driftThreshold?: number;
  contradictionThreshold?: number;
  minSignalStrength?: number;
}

export interface HunterResult {
  success: boolean;
  anomaliesDetected: number;
  contradictionsFound: number;
  highValueSignals: number;
  errors: string[];
  lambda: number;
}

/**
 * Detect anomalies in analysis patterns
 */
export async function detectAnomalies(config: HunterConfig = {}): Promise<HunterResult> {
  const result: HunterResult = {
    success: true,
    anomaliesDetected: 0,
    contradictionsFound: 0,
    highValueSignals: 0,
    errors: [],
    lambda: 1.67,
  };

  const driftThreshold = config.driftThreshold || 30;

  try {
    // Get all recent analyses
    const recentAnalyses = await db
      .select()
      .from(analyses)
      .orderBy(sql`${analyses.createdAt} DESC`)
      .limit(100);

    // Detect high drift
    const highDriftAnalyses = recentAnalyses.filter(a => a.drift > driftThreshold);

    if (highDriftAnalyses.length > 0) {
      await db.insert(intelligenceLedger).values({
        module: "HUNTER",
        type: "DRIFT_ANOMALY",
        data: JSON.stringify({
          count: highDriftAnalyses.length,
          threshold: driftThreshold,
          analyses: highDriftAnalyses.map(a => ({
            id: a.analysisId,
            drift: a.drift,
            driftDirection: a.driftDirection,
          })),
        }),
        severity: "HIGH",
        lambda: 167,
        sourceReference: "drift-analysis",
        idempotencyKey: `hunter-drift-${Date.now()}`,
      });

      result.anomaliesDetected += highDriftAnalyses.length;
    }

    // Detect contradictions (truth vs risk mismatch)
    const contradictions = recentAnalyses.filter(
      a => a.truthIndex > 70 && a.riskIndex > 60
    );

    if (contradictions.length > 0) {
      await db.insert(intelligenceLedger).values({
        module: "HUNTER",
        type: "CONTRADICTION",
        data: JSON.stringify({
          count: contradictions.length,
          analyses: contradictions.map(a => ({
            id: a.analysisId,
            truthIndex: a.truthIndex,
            riskIndex: a.riskIndex,
            status: a.status,
          })),
        }),
        severity: "MEDIUM",
        lambda: 167,
        sourceReference: "contradiction-analysis",
        idempotencyKey: `hunter-contradiction-${Date.now()}`,
      });

      result.contradictionsFound += contradictions.length;
    }

    // Identify high-value signals (high awakening + high truth)
    const highValueSignals = recentAnalyses.filter(
      a => a.awakeningIndex > 75 && a.truthIndex > 75
    );

    if (highValueSignals.length > 0) {
      await db.insert(intelligenceLedger).values({
        module: "HUNTER",
        type: "HIGH_VALUE_SIGNAL",
        data: JSON.stringify({
          count: highValueSignals.length,
          analyses: highValueSignals.map(a => ({
            id: a.analysisId,
            awakeningIndex: a.awakeningIndex,
            truthIndex: a.truthIndex,
            status: a.status,
          })),
        }),
        severity: "CRITICAL",
        lambda: 167,
        sourceReference: "signal-analysis",
        idempotencyKey: `hunter-signal-${Date.now()}`,
      });

      result.highValueSignals += highValueSignals.length;
    }

    result.success = true;
  } catch (error) {
    result.success = false;
    result.errors.push(`Anomaly detection failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Hunt for specific patterns across the archive
 */
export async function huntPatterns(pattern: string, config: HunterConfig = {}): Promise<HunterResult> {
  const result: HunterResult = {
    success: true,
    anomaliesDetected: 0,
    contradictionsFound: 0,
    highValueSignals: 0,
    errors: [],
    lambda: 1.67,
  };

  try {
    // Search for pattern in analyses
    const matchingAnalyses = await db
      .select()
      .from(analyses)
      .where(sql`${analyses.patternsDetected} LIKE ${`%${pattern}%`}`)
      .limit(50);

    if (matchingAnalyses.length > 0) {
      await db.insert(intelligenceLedger).values({
        module: "HUNTER",
        type: "PATTERN_HUNT",
        data: JSON.stringify({
          pattern,
          matches: matchingAnalyses.length,
          analyses: matchingAnalyses.map(a => ({
            id: a.analysisId,
            status: a.status,
            riskLevel: a.riskLevel,
          })),
        }),
        severity: "MEDIUM",
        lambda: 167,
        sourceReference: `pattern-${pattern}`,
        idempotencyKey: `hunter-pattern-${pattern}-${Date.now()}`,
      });

      result.anomaliesDetected = matchingAnalyses.length;
    }

    result.success = true;
  } catch (error) {
    result.success = false;
    result.errors.push(`Pattern hunt failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Get recent hunter entries from ledger
 */
export async function getRecentHunterEntries(limit: number = 50) {
  return db
    .select()
    .from(intelligenceLedger)
    .where(sql`${intelligenceLedger.module} = 'HUNTER'`)
    .orderBy(sql`${intelligenceLedger.createdAt} DESC`)
    .limit(limit);
}
