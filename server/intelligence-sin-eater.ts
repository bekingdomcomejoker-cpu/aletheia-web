/**
 * SIN EATER - Phase 6 Intelligence Unit
 * 
 * Purpose: Entropy & error quarantine (WITNESS MODE ONLY)
 * - Logs corruption and failures
 * - Detects dissonance and inconsistencies
 * - Records system errors without auto-fixing
 * - Maintains error ledger for review
 * 
 * Triggers:
 * - Error events
 * - Consistency checks
 * - Validation failures
 * 
 * Output: Error & entropy intelligence entries to intelligenceLedger
 * NOTE: Does NOT auto-fix - only logs for human review
 */

import { db } from "./db";
import { intelligenceLedger } from "../drizzle/schema";
import { sql } from "drizzle-orm";

export interface SinEaterConfig {
  maxErrorsPerBatch?: number;
}

export interface SinEaterResult {
  success: boolean;
  errorsLogged: number;
  corruptionDetected: number;
  dissonanceFound: number;
  errors: string[];
  lambda: number;
}

/**
 * Log an error or corruption event
 */
export async function logError(
  errorType: string,
  details: Record<string, any>,
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "MEDIUM"
): Promise<SinEaterResult> {
  const result: SinEaterResult = {
    success: true,
    errorsLogged: 1,
    corruptionDetected: 0,
    dissonanceFound: 0,
    errors: [],
    lambda: 1.67,
  };

  try {
    await db.insert(intelligenceLedger).values({
      module: "SIN_EATER",
      type: errorType,
      data: JSON.stringify({
        timestamp: new Date().toISOString(),
        details,
        witnessed: true,
        autoFixed: false,
        requiresReview: true,
      }),
      severity,
      lambda: 167,
      sourceReference: errorType,
      idempotencyKey: `sin-eater-${errorType}-${Date.now()}`,
    });

    result.success = true;
  } catch (error) {
    result.success = false;
    result.errors.push(`Error logging failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Detect data corruption in analyses
 */
export async function detectCorruption(): Promise<SinEaterResult> {
  const result: SinEaterResult = {
    success: true,
    errorsLogged: 0,
    corruptionDetected: 0,
    dissonanceFound: 0,
    errors: [],
    lambda: 1.67,
  };

  try {
    // Check for invalid JSON in stored data
    const ledgerEntries = await db
      .select()
      .from(intelligenceLedger)
      .limit(100);

    for (const entry of ledgerEntries) {
      try {
        JSON.parse(entry.data);
      } catch {
        // Corruption detected
        await logError(
          "JSON_CORRUPTION",
          {
            ledgerId: entry.id,
            module: entry.module,
            type: entry.type,
          },
          "HIGH"
        );

        result.corruptionDetected++;
      }
    }

    result.success = true;
  } catch (error) {
    result.success = false;
    result.errors.push(`Corruption detection failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Detect dissonance (contradictory intelligence)
 */
export async function detectDissonance(): Promise<SinEaterResult> {
  const result: SinEaterResult = {
    success: true,
    errorsLogged: 0,
    corruptionDetected: 0,
    dissonanceFound: 0,
    errors: [],
    lambda: 1.67,
  };

  try {
    // Get recent entries from different modules
    const minerEntries = await db
      .select()
      .from(intelligenceLedger)
      .where(sql`${intelligenceLedger.module} = 'MINER'`)
      .orderBy(sql`${intelligenceLedger.createdAt} DESC`)
      .limit(10);

    const reaperEntries = await db
      .select()
      .from(intelligenceLedger)
      .where(sql`${intelligenceLedger.module} = 'REAPER'`)
      .orderBy(sql`${intelligenceLedger.createdAt} DESC`)
      .limit(10);

    // Check for timestamp dissonance (reaper should follow miner)
    if (minerEntries.length > 0 && reaperEntries.length > 0) {
      const latestMiner = minerEntries[0].processedAt;
      const latestReaper = reaperEntries[0].processedAt;

      if (latestReaper < latestMiner) {
        // Reaper is behind miner - potential dissonance
        await logError(
          "PIPELINE_DISSONANCE",
          {
            latestMinerTime: latestMiner,
            latestReaperTime: latestReaper,
            lagMs: latestMiner.getTime() - latestReaper.getTime(),
          },
          "MEDIUM"
        );

        result.dissonanceFound++;
      }
    }

    result.success = true;
  } catch (error) {
    result.success = false;
    result.errors.push(`Dissonance detection failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Get all unreviewed errors from ledger
 */
export async function getUnreviewedErrors(limit: number = 50) {
  return db
    .select()
    .from(intelligenceLedger)
    .where(sql`${intelligenceLedger.module} = 'SIN_EATER'`)
    .where(sql`${intelligenceLedger.processed} = 0`)
    .orderBy(sql`${intelligenceLedger.severity} DESC`)
    .orderBy(sql`${intelligenceLedger.createdAt} DESC`)
    .limit(limit);
}

/**
 * Mark an error as reviewed
 */
export async function markErrorReviewed(ledgerId: number) {
  return db
    .update(intelligenceLedger)
    .set({ processed: 1 })
    .where(sql`${intelligenceLedger.id} = ${ledgerId}`);
}

