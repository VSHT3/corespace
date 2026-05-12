# Graph Report - Corespace  (2026-05-09)

## Corpus Check
- 71 files · ~41,695 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 192 nodes · 170 edges · 12 communities detected
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c03f56bd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 54|Community 54]]

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 15 edges
2. `Corespace (README)` - 12 edges
3. `Corespace Design System (DESIGN.md)` - 9 edges
4. `Corespace` - 6 edges
5. `createClient()` - 5 edges
6. `Brutalist Pastel Design System` - 5 edges
7. `Next.js Framework` - 5 edges
8. `phaseValues()` - 4 edges
9. `app/api/ai/route.ts (Gemini API route)` - 4 edges
10. `updateExhibitionTitle()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Corespace` --semantically_similar_to--> `Corespace (README)`  [INFERRED] [semantically similar]
  PRODUCT.md → README.md
- `Design Principles` --semantically_similar_to--> `Corespace Design System (DESIGN.md)`  [INFERRED] [semantically similar]
  PRODUCT.md → DESIGN.md
- `@tailwindcss/postcss plugin` --conceptually_related_to--> `Tailwind CSS v4`  [INFERRED]
  postcss.config.mjs → README.md
- `Brand Personality: Focused, Candid, Student-native` --semantically_similar_to--> `Creative North Star: The Marked-Up Study Desk`  [INFERRED] [semantically similar]
  PRODUCT.md → DESIGN.md
- `Design Anti-patterns (glassmorphism, gradient text, ambient shadow)` --semantically_similar_to--> `Brand Personality: Focused, Candid, Student-native`  [INFERRED] [semantically similar]
  DESIGN.md → PRODUCT.md

## Hyperedges (group relationships)
- **Brutalist Pastel Design System cohesion across STYLE.md, DESIGN.md, CLAUDE.md, globals.css** — style_brutalist_pastel, design_corespace_system, claude_globals_css, design_marked_up_study_desk [INFERRED 0.90]
- **Server-only AI call pattern: gemini lib + API route + client prohibition** — claude_ai_server_only, readme_api_ai_route, readme_gemini_lib, readme_gemini_api [EXTRACTED 1.00]
- **TOK data flow: actions.ts mutates tok_exhibitions and tok_objects via RLS** — claude_tok_actions, readme_tok_exhibitions_table, readme_tok_objects_table, claude_rls_policy [EXTRACTED 1.00]

## Communities (55 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (20): AGENTS.md → CLAUDE.md reference, Next.js Agent Rules (breaking changes warning), AI Calls Server-Only Pattern, Next.js 16 Breaking Changes, Paddle Payment Integration (CLAUDE.md), Supabase Two-Client Pattern, PostCSS Config, @tailwindcss/postcss plugin (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (18): app/globals.css (CSS vars + utility classes), Design Anti-patterns (glassmorphism, gradient text, ambient shadow), Corespace Design System (DESIGN.md), The Flat-Until-Action Rule, The Highlighter Rule, The Ink Rule, Creative North Star: The Marked-Up Study Desk, The No-Display-UI Rule (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (11): cancel(), computeMessyLayout(), handler(), linear01(), phaseValues(), rng(), runTour(), skipTour() (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.2
Nodes (8): save(), createExhibition(), deleteExhibition(), deleteObject(), duplicateExhibition(), saveObject(), swapObjectPositions(), updateExhibitionTitle()

### Community 7 - "Community 7"
Cohesion: 0.39
Nodes (8): File/Document Icon (SVG), Globe/Web Icon (SVG), Next.js Logo (SVG), Next.js Framework, Public Static Assets Directory, Vercel Deployment Platform, Vercel Logo (SVG), Browser Window Icon (SVG)

### Community 8 - "Community 8"
Cohesion: 0.47
Nodes (3): buildSystemPrompt(), POST(), checkRateLimit()

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (3): TOK Server Actions (actions.ts), tok_exhibitions table, tok_objects table

## Knowledge Gaps
- **16 isolated node(s):** `PostCSS Config`, `IB Diploma Students (Primary Users)`, `proxy.ts (auth gate)`, `lib/tok-prompts.ts`, `Color Tokens (STYLE.md)` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Corespace (README)` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Corespace` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Community 3` to `Community 4`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Corespace Design System (DESIGN.md)` (e.g. with `Design Principles` and `app/globals.css (CSS vars + utility classes)`) actually correct?**
  _`Corespace Design System (DESIGN.md)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PostCSS Config`, `IB Diploma Students (Primary Users)`, `proxy.ts (auth gate)` to the rest of the system?**
  _16 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._