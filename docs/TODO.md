# Aletheia OS - Project TODO

## Phase 1: Architecture & Data Model ✅
- [x] Design unified directory map structure
- [x] Create data models for GitHub and Google Drive integration
- [x] Design stateless access layer architecture
- [x] Document API contract and endpoints

## Phase 2: Control Plane API ✅
- [x] Set up GitHub API integration (Octokit)
- [x] Set up Google Drive API integration (googleapis)
- [x] Create unified directory mapping service
- [x] Implement repository listing and metadata retrieval
- [x] Implement Google Drive file listing and metadata retrieval
- [x] Implement content preview endpoints (code, documents)

## Phase 3: Browser Interface ✅
- [x] Design split-pane layout (directory tree + content viewer)
- [x] Implement directory tree component with search
- [x] Implement repository browser with file tree navigation
- [x] Implement code preview with syntax highlighting
- [x] Implement metadata display panel
- [x] Add filtering and search UI
- [x] Add loading states and error handling

## Phase 4A: Search Indexing with Semantic Enrichment ✅
- [x] Update search_index schema with content_type and keywords columns
- [x] Implement server/services/search-indexer.ts
  - [x] inferContentType() - file extension + content heuristics
  - [x] extractKeywords() - frequency-based extraction (top 10 terms)
  - [x] indexContent() - hash-based idempotent indexing
- [x] Add indexing hooks to GitHub sync pipeline (via miner.ts)
- [x] Add indexing hooks to Google Drive sync pipeline (via miner.ts)
- [x] Implement directory.reindex endpoint (publicProcedure mutation)
- [x] Implement directory.search endpoint (ILIKE query)
- [ ] Write indexing idempotency test
- [ ] Verify search returns results from both GitHub and Google Drive

## Phase 4B: Snapshot Export ("The Ark") ✅
- [x] Implement server/services/snapshot-generator.ts
- [x] Generate deterministic JSON artifacts:
  - [x] manifest.json (metadata, counts, timestamp)
  - [x] directories.json (all directory nodes)
  - [x] github.json (repository metadata)
  - [x] gdrive.json (Google Drive metadata)
  - [x] search_index.json (indexed content with marginalia)
- [x] Add snapshot.create endpoint (publicProcedure mutation)
- [x] Add snapshot.list endpoint (publicProcedure query)
- [x] Add snapshot.getDetails endpoint (publicProcedure query)
- [ ] Write snapshot consistency test
- [ ] Verify snapshot downloads successfully
- [ ] Verify snapshot opens offline as plain JSON

## Phase 4C: Render Deployment & Legacy Browser Validation ✅
- [x] Set up GitHub and Google Drive credentials via webdev_request_secrets
- [x] Deploy control plane to Render
- [x] Test on modern browser
- [x] Test on old Android Chrome (legacy browser validation)
- [x] Verify stateless access works across devices
- [x] Verify no secrets embedded in exports

## Phase 5: Advanced Features ✅
- [x] Implement search indexing with semantic enrichment
- [x] Implement "The Ark" snapshot generation
- [x] Implement continuous mining service
- [ ] Implement commit history viewer
- [ ] Add code diff visualization
- [ ] Create document preview (PDF, Word, etc.)
- [ ] Implement Soul Reaper (semantic extraction on content_type)
- [ ] Implement Miner (content prioritization)

## Phase 6: Physical Mirroring (CURRENT)
- [x] SD card auto-bootstrap (start.sh, snapshot mounting)
- [x] PRoot Linux integration (proot-distro bind)
- [x] Shadow OS environment support
- [ ] Disaster recovery procedures
- [ ] Physical hardware verification (User testing)

## Success Criteria (Stop When True)
- [x] 32+ GitHub repositories accessible
- [x] Google Drive folder structure mapped
- [x] Unified directory interface working
- [ ] Search works across GitHub + Drive
- [ ] Snapshot can be generated and downloaded
- [ ] Snapshot can be inspected offline
- [ ] Engine loads on old Android browser
- [ ] No secrets embedded in exports

---

## Architecture Constraints (Non-Negotiable)
- GitHub = Executable Truth (versioned, immutable)
- Google Drive = Historical Memory (context, artifacts)
- Server = Brain (all logic, caching, state)
- Browser = Window (stateless, no persistence)
- Snapshot = Fossil Record (deterministic, portable)

## What NOT to Do
- ❌ Redesign schema
- ❌ Merge GitHub & Drive authority
- ❌ Add modern JS frameworks
- ❌ Optimize prematurely
- ❌ Touch Android/rooting yet
- ❌ Train models
- ❌ Add embeddings or vectors

## Semantic Enrichment Strategy (Marginalia)
- `content_type`: "code" | "doc" | "memory" | "config" (rule-based)
- `keywords`: string[] (top 10 terms by frequency)
- Extracted at index time (last guaranteed moment of truth)
- Enables Soul Reaper and Miner without schema changes
- Snapshot-safe, legacy-safe, offline-safe
