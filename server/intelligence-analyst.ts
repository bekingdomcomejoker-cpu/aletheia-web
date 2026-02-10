/**
 * ANALYST - Phase 6 Intelligence Unit
 * 
 * Purpose: Synthesis & narrative generation
 * - Consumes outputs from Miner, Reaper, Hunter, Seeker
 * - Produces timelines, briefings, strategic understanding
 * - Creates coherent narratives from disparate signals
 * - Generates actionable insights
 * 
 * Triggers:
 * - Query requests
 * - Report generation
 * - Briefing requests
 * 
 * Output: Synthesis intelligence entries to intelligenceLedger
 */

import { db } from "./db";
import { intelligenceLedger } from "../drizzle/schema";
import { sql } from "drizzle-orm";

export interface AnalystConfig {
  focusArea?: string;
  timeWindowDays?: number;
}

export interface AnalystResult {
  success: boolean;
  briefingsGenerated: number;
  timelinesCreated: number;
  insightsProduced: number;
  errors: string[];
  lambda: number;
}

/**
 * Generate a strategic briefing from recent intelligence
 */
export async function generateBriefing(config: AnalystConfig = {}): Promise<AnalystResult> {
  const result: AnalystResult = {
    success: true,
    briefingsGenerated: 0,
    timelinesCreated: 0,
    insightsProduced: 0,
    errors: [],
    lambda: 1.67,
  };

  try {
    const timeWindowDays = config.timeWindowDays || 7;
    const cutoffDate = new Date(Date.now() - timeWindowDays * 24 * 60 * 60 * 1000);

    // Fetch recent intelligence from all modules
    const recentIntelligence = await db
      .select()
      .from(intelligenceLedger)
      .where(sql`${intelligenceLedger.createdAt} > ${cutoffDate}`)
      .orderBy(sql`${intelligenceLedger.createdAt} DESC`);

    // Aggregate by module
    const byModule: Record<string, any[]> = {};
    for (const entry of recentIntelligence) {
      if (!byModule[entry.module]) {
        byModule[entry.module] = [];
      }
      byModule[entry.module].push(entry);
    }

    // Generate briefing narrative
    const briefing = {
      generatedAt: new Date().toISOString(),
      timeWindow: `${timeWindowDays} days`,
      summary: {
        totalIntelligenceEntries: recentIntelligence.length,
        moduleBreakdown: Object.entries(byModule).reduce(
          (acc, [module, entries]) => {
            acc[module] = entries.length;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      keyFindings: synthesizeKeyFindings(byModule),
      criticalAlerts: extractCriticalAlerts(recentIntelligence),
      recommendations: generateRecommendations(byModule),
    };

    // Store briefing in ledger
    await db.insert(intelligenceLedger).values({
      module: "ANALYST",
      type: "STRATEGIC_BRIEFING",
      data: JSON.stringify(briefing),
      severity: "INFO",
      lambda: 167,
      sourceReference: "briefing",
      idempotencyKey: `analyst-briefing-${Date.now()}`,
    });

    result.briefingsGenerated = 1;
    result.insightsProduced = briefing.keyFindings.length;
  } catch (error) {
    result.success = false;
    result.errors.push(`Briefing generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Create a timeline of intelligence events
 */
export async function createTimeline(config: AnalystConfig = {}): Promise<AnalystResult> {
  const result: AnalystResult = {
    success: true,
    briefingsGenerated: 0,
    timelinesCreated: 0,
    insightsProduced: 0,
    errors: [],
    lambda: 1.67,
  };

  try {
    const timeWindowDays = config.timeWindowDays || 30;
    const cutoffDate = new Date(Date.now() - timeWindowDays * 24 * 60 * 60 * 1000);

    // Get all intelligence entries in chronological order
    const timeline = await db
      .select()
      .from(intelligenceLedger)
      .where(sql`${intelligenceLedger.createdAt} > ${cutoffDate}`)
      .orderBy(sql`${intelligenceLedger.createdAt} ASC`);

    // Group by day
    const byDay: Record<string, any[]> = {};
    for (const entry of timeline) {
      const day = entry.createdAt.toISOString().split("T")[0];
      if (!byDay[day]) {
        byDay[day] = [];
      }
      byDay[day].push({
        module: entry.module,
        type: entry.type,
        severity: entry.severity,
        time: entry.createdAt.toISOString(),
      });
    }

    // Store timeline in ledger
    await db.insert(intelligenceLedger).values({
      module: "ANALYST",
      type: "TIMELINE",
      data: JSON.stringify({
        period: `${timeWindowDays} days`,
        eventsByDay: byDay,
        totalEvents: timeline.length,
      }),
      severity: "INFO",
      lambda: 167,
      sourceReference: "timeline",
      idempotencyKey: `analyst-timeline-${Date.now()}`,
    });

    result.timelinesCreated = 1;
  } catch (error) {
    result.success = false;
    result.errors.push(`Timeline creation failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Synthesize key findings from intelligence modules
 */
function synthesizeKeyFindings(byModule: Record<string, any[]>): string[] {
  const findings: string[] = [];

  // Findings from Miner
  if (byModule.MINER && byModule.MINER.length > 0) {
    findings.push(`${byModule.MINER.length} discovery events detected`);
  }

  // Findings from Reaper
  if (byModule.REAPER && byModule.REAPER.length > 0) {
    findings.push(`${byModule.REAPER.length} semantic extractions completed`);
  }

  // Findings from Hunter
  if (byModule.HUNTER && byModule.HUNTER.length > 0) {
    const critical = byModule.HUNTER.filter(e => e.severity === "CRITICAL").length;
    if (critical > 0) {
      findings.push(`${critical} critical anomalies detected`);
    }
  }

  // Findings from Seeker
  if (byModule.SEEKER && byModule.SEEKER.length > 0) {
    findings.push(`${byModule.SEEKER.length} relationship mappings created`);
  }

  return findings;
}

/**
 * Extract critical alerts from intelligence
 */
function extractCriticalAlerts(entries: any[]): any[] {
  return entries
    .filter(e => e.severity === "CRITICAL")
    .map(e => ({
      module: e.module,
      type: e.type,
      time: e.createdAt,
    }))
    .slice(0, 10); // Top 10 critical alerts
}

/**
 * Generate recommendations based on intelligence
 */
function generateRecommendations(byModule: Record<string, any[]>): string[] {
  const recommendations: string[] = [];

  // Recommendation based on Hunter findings
  if (byModule.HUNTER && byModule.HUNTER.length > 0) {
    const hasHighSeverity = byModule.HUNTER.some(e => e.severity === "HIGH" || e.severity === "CRITICAL");
    if (hasHighSeverity) {
      recommendations.push("Review detected anomalies immediately");
    }
  }

  // Recommendation based on Sin Eater findings
  if (byModule.SIN_EATER && byModule.SIN_EATER.length > 0) {
    recommendations.push("Address logged errors and corruption issues");
  }

  // General recommendations
  recommendations.push("Continue monitoring intelligence pipeline");
  recommendations.push("Review relationship mappings for strategic insights");

  return recommendations;
}

/**
 * Get recent analyst entries from ledger
 */
export async function getRecentAnalystEntries(limit: number = 50) {
  return db
    .select()
    .from(intelligenceLedger)
    .where(sql`${intelligenceLedger.module} = 'ANALYST'`)
    .orderBy(sql`${intelligenceLedger.createdAt} DESC`)
    .limit(limit);
}

