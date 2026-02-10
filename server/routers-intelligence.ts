/**
 * Phase 6 Intelligence Layer - tRPC Router
 * 
 * Exposes all five intelligence units as API endpoints:
 * - POST /api/intelligence/mine
 * - POST /api/intelligence/reap
 * - POST /api/intelligence/hunt
 * - POST /api/intelligence/seek
 * - POST /api/intelligence/cycle (orchestrator)
 * 
 * All endpoints:
 * - Process bounded batches
 * - Write to intelligence_ledger
 * - Exit cleanly (no long-running processes)
 */

import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import * as Miner from "./intelligence-miner";
import * as Reaper from "./intelligence-reaper";
import * as Hunter from "./intelligence-hunter";
import * as Seeker from "./intelligence-seeker";
import * as SinEater from "./intelligence-sin-eater";
import * as Analyst from "./intelligence-analyst";
import { db } from "./db";
import { intelligenceLedger } from "../drizzle/schema";
import { sql } from "drizzle-orm";

export const intelligenceRouter = router({
  /**
   * POST /api/intelligence/mine
   * Trigger mining cycle (GitHub + Google Drive discovery)
   */
  mine: publicProcedure
    .input(z.object({
      githubToken: z.string().optional(),
      googleDriveToken: z.string().optional(),
    }).optional())
    .mutation(async ({ input }) => {
      const result = await Miner.runMiningCycle(input || {});
      return {
        success: result.success,
        entriesCreated: result.entriesCreated,
        entriesUpdated: result.entriesUpdated,
        errors: result.errors,
        lambda: result.lambda,
      };
    }),

  /**
   * POST /api/intelligence/reap
   * Trigger semantic extraction from recent analyses
   */
  reap: publicProcedure
    .input(z.object({
      maxBatchSize: z.number().optional(),
      minConfidence: z.number().optional(),
    }).optional())
    .mutation(async ({ input }) => {
      const result = await Reaper.batchSemanticExtraction(input || {});
      return {
        success: result.success,
        entriesCreated: result.entriesCreated,
        semanticSignals: result.semanticSignals,
        errors: result.errors,
        lambda: result.lambda,
      };
    }),

  /**
   * POST /api/intelligence/hunt
   * Trigger anomaly and pattern detection
   */
  hunt: publicProcedure
    .input(z.object({
      driftThreshold: z.number().optional(),
      contradictionThreshold: z.number().optional(),
      minSignalStrength: z.number().optional(),
    }).optional())
    .mutation(async ({ input }) => {
      const result = await Hunter.detectAnomalies(input || {});
      return {
        success: result.success,
        anomaliesDetected: result.anomaliesDetected,
        contradictionsFound: result.contradictionsFound,
        highValueSignals: result.highValueSignals,
        errors: result.errors,
        lambda: result.lambda,
      };
    }),

  /**
   * POST /api/intelligence/seek
   * Trigger relationship and dependency mapping
   */
  seek: publicProcedure
    .input(z.object({
      maxRelationships: z.number().optional(),
      minSimilarity: z.number().optional(),
    }).optional())
    .mutation(async ({ input }) => {
      const mapResult = await Seeker.mapRelationships(input || {});
      const clusterResult = await Seeker.identifyClusters(input || {});

      return {
        success: mapResult.success && clusterResult.success,
        relationshipsFound: mapResult.relationshipsFound,
        clustersIdentified: clusterResult.clustersIdentified,
        errors: [...mapResult.errors, ...clusterResult.errors],
        lambda: 1.67,
      };
    }),

  /**
   * POST /api/intelligence/cycle
   * Orchestrator - runs all intelligence units in sequence
   * This is the main entry point for batch intelligence processing
   */
  cycle: publicProcedure
    .input(z.object({
      includeMiner: z.boolean().optional().default(true),
      includeReaper: z.boolean().optional().default(true),
      includeHunter: z.boolean().optional().default(true),
      includeSeeker: z.boolean().optional().default(true),
      includeSinEater: z.boolean().optional().default(true),
      includeAnalyst: z.boolean().optional().default(true),
    }).optional())
    .mutation(async ({ input = {} }) => {
      const results: Record<string, any> = {};
      const startTime = Date.now();

      // Run Miner
      if (input.includeMiner !== false) {
        results.miner = await Miner.runMiningCycle();
      }

      // Run Reaper
      if (input.includeReaper !== false) {
        results.reaper = await Reaper.batchSemanticExtraction();
      }

      // Run Hunter
      if (input.includeHunter !== false) {
        results.hunter = await Hunter.detectAnomalies();
      }

      // Run Seeker
      if (input.includeSeeker !== false) {
        const mapResult = await Seeker.mapRelationships();
        const clusterResult = await Seeker.identifyClusters();
        results.seeker = { mapResult, clusterResult };
      }

      // Run Sin Eater
      if (input.includeSinEater !== false) {
        const corruptionResult = await SinEater.detectCorruption();
        const dissonanceResult = await SinEater.detectDissonance();
        results.sinEater = { corruptionResult, dissonanceResult };
      }

      // Run Analyst
      if (input.includeAnalyst !== false) {
        const briefingResult = await Analyst.generateBriefing();
        const timelineResult = await Analyst.createTimeline();
        results.analyst = { briefingResult, timelineResult };
      }

      const endTime = Date.now();

      return {
        success: true,
        cycleTime: endTime - startTime,
        results,
        lambda: 1.67,
      };
    }),

  /**
   * GET /api/intelligence/ledger
   * Retrieve recent intelligence entries
   */
  ledger: publicProcedure
    .input(z.object({
      module: z.enum(["MINER", "REAPER", "HUNTER", "SEEKER", "SIN_EATER", "ANALYST"]).optional(),
      severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]).optional(),
      limit: z.number().optional().default(50),
    }))
    .query(async ({ input }) => {
      let query = db.select().from(intelligenceLedger);

      if (input.module) {
        query = query.where(sql`${intelligenceLedger.module} = ${input.module}`);
      }

      if (input.severity) {
        query = query.where(sql`${intelligenceLedger.severity} = ${input.severity}`);
      }

      const entries = await query
        .orderBy(sql`${intelligenceLedger.createdAt} DESC`)
        .limit(input.limit);

      return {
        count: entries.length,
        entries: entries.map(e => ({
          id: e.id,
          module: e.module,
          type: e.type,
          severity: e.severity,
          lambda: e.lambda / 100, // Convert back to decimal
          processedAt: e.processedAt,
          data: JSON.parse(e.data),
        })),
      };
    }),

  /**
   * GET /api/intelligence/status
   * Get current intelligence system status
   */
  status: publicProcedure.query(async () => {
    const totalEntries = await db
      .select({ count: sql<number>`COUNT(*) as count` })
      .from(intelligenceLedger);

    const byModule = await db
      .select({
        module: intelligenceLedger.module,
        count: sql<number>`COUNT(*) as count`,
      })
      .from(intelligenceLedger)
      .groupBy(intelligenceLedger.module);

    const bySeverity = await db
      .select({
        severity: intelligenceLedger.severity,
        count: sql<number>`COUNT(*) as count`,
      })
      .from(intelligenceLedger)
      .groupBy(intelligenceLedger.severity);

    return {
      totalEntries: totalEntries[0]?.count || 0,
      byModule: byModule.reduce(
        (acc, { module, count }) => {
          acc[module] = count;
          return acc;
        },
        {} as Record<string, number>
      ),
      bySeverity: bySeverity.reduce(
        (acc, { severity, count }) => {
          acc[severity] = count;
          return acc;
        },
        {} as Record<string, number>
      ),
      lambda: 1.67,
    };
  }),
});

