/**
 * SOUL REAPER - Phase 6 Intelligence Unit
 * 
 * Purpose: Semantic extraction & essence distillation
 * - Reads indexed material from Miner
 * - Extracts semantic essence (summaries, keywords, signals)
 * - Deterministic, stateless processing
 * - No mutation of source data
 * 
 * Triggers:
 * - API calls
 * - Snapshot generation
 * - Batch jobs
 * 
 * Output: Semantic intelligence entries to intelligenceLedger
 */

import { db } from "./db";
import { intelligenceLedger, analyses } from "../drizzle/schema";
import { sql } from "drizzle-orm";

export interface ReaperConfig {
  maxBatchSize?: number;
  minConfidence?: number;
}

export interface ReaperResult {
  success: boolean;
  entriesCreated: number;
  semanticSignals: number;
  errors: string[];
  lambda: number;
}

/**
 * Extract semantic essence from analysis data
 */
export async function extractSemanticEssence(analysisId: string, config: ReaperConfig = {}): Promise<ReaperResult> {
  const result: ReaperResult = {
    success: true,
    entriesCreated: 0,
    semanticSignals: 0,
    errors: [],
    lambda: 1.67,
  };

  try {
    // Fetch the analysis
    const analysis = await db
      .select()
      .from(analyses)
      .where(sql`${analyses.analysisId} = ${analysisId}`)
      .limit(1);

    if (!analysis || analysis.length === 0) {
      result.errors.push(`Analysis not found: ${analysisId}`);
      result.success = false;
      return result;
    }

    const data = analysis[0];

    // Extract semantic signals
    const semanticData = {
      analysisId,
      truthIndex: data.truthIndex,
      integrityIndex: data.integrityIndex,
      riskIndex: data.riskIndex,
      awakeningIndex: data.awakeningIndex,
      keyPatterns: data.patternsDetected ? JSON.parse(data.patternsDetected) : [],
      anomalies: data.anomalies ? JSON.parse(data.anomalies) : [],
      essence: {
        status: data.status,
        riskLevel: data.riskLevel,
        consistency: data.consistency,
        drift: data.drift,
      },
    };

    // Write semantic summary to ledger
    await db.insert(intelligenceLedger).values({
      module: "REAPER",
      type: "SEMANTIC_SUMMARY",
      data: JSON.stringify(semanticData),
      severity: data.riskIndex > 70 ? "HIGH" : data.riskIndex > 40 ? "MEDIUM" : "LOW",
      lambda: 167,
      sourceReference: analysisId,
      idempotencyKey: `reaper-${analysisId}-${Date.now()}`,
    });

    result.entriesCreated = 1;
    result.semanticSignals = 1;
  } catch (error) {
    result.success = false;
    result.errors.push(`Semantic extraction failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Batch semantic extraction from multiple analyses
 */
export async function batchSemanticExtraction(config: ReaperConfig = {}): Promise<ReaperResult> {
  const result: ReaperResult = {
    success: true,
    entriesCreated: 0,
    semanticSignals: 0,
    errors: [],
    lambda: 1.67,
  };

  try {
    const maxBatch = config.maxBatchSize || 50;

    // Get recent analyses that haven't been reaped yet
    const recentAnalyses = await db
      .select()
      .from(analyses)
      .orderBy(sql`${analyses.createdAt} DESC`)
      .limit(maxBatch);

    for (const analysis of recentAnalyses) {
      const reapResult = await extractSemanticEssence(analysis.analysisId, config);
      result.entriesCreated += reapResult.entriesCreated;
      result.semanticSignals += reapResult.semanticSignals;
      if (!reapResult.success) {
        result.errors.push(...reapResult.errors);
      }
    }

    result.success = result.errors.length === 0;
  } catch (error) {
    result.success = false;
    result.errors.push(`Batch extraction failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Extract keywords and signals from text
 */
export function extractKeywords(text: string, limit: number = 10): string[] {
  // Simple keyword extraction (in production, use NLP)
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3);

  const frequency: Record<string, number> = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Get recent reaper entries from ledger
 */
export async function getRecentReaperEntries(limit: number = 50) {
  return db
    .select()
    .from(intelligenceLedger)
    .where(sql`${intelligenceLedger.module} = 'REAPER'`)
    .orderBy(sql`${intelligenceLedger.createdAt} DESC`)
    .limit(limit);
}
