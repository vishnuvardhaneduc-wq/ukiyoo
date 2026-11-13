---
trigger: always_on
---

# MindMate AI: frontend rules

STACK
- Vite + React 18 + JavaScript (.jsx/.js only, no TypeScript) + Tailwind + react-router-dom + lucide-react.
- Before editing, read package.json and the Tailwind config and follow the installed versions (Tailwind v3 and v4 are set up differently).
- Do not add or upgrade dependencies. If you think one is needed, stop and ask me.
- No Next.js APIs. No dangerouslySetInnerHTML. No secrets or API keys in frontend code.

DESIGN AND STITCH
- Source of truth, in this priority order: docs/DESIGN.md (colors, fonts, radius, spacing), then the screenshots in design/stitch/ (layout and look), then the saved HTML in design/stitch/ (structure only).
- Use the saved files in design/stitch/ for all work. Call the Stitch MCP only when I say "design updated", or when a screen I name is not saved yet; then save its screenshot and HTML to design/stitch/ with a numbered name.
- The Stitch MCP is READ-ONLY. Never call tools that generate, edit, delete or create screens or projects. If a design looks wrong, tell me; do not fix it in Stitch.
- If I name a screen, find it by name in design/stitch/. If you cannot find it, say so. Do not guess or invent a layout.
- Translate Stitch HTML to JSX one component at a time. Replace hex colors with design tokens (CSS variables mapped in Tailwind), icon fonts and CDN scripts with lucide-react and local code, and inline styles with Tailwind classes. Move all text into the mock data layer.
- If the design contains jargon, text from a reference website, or a feature that is not in docs/PRD.md, do not copy it. Use plain wording and tell me what you changed.
- After building a screen, compare it with its screenshot at 1440px, list the differences, and fix them once.

COLOR MEANING (never decorative)
- primary = the AI and primary actions; teal = memory only; amber = needs confirmation only (always with an icon and a text label); green = success; red = errors and destructive actions. Only High priority is colored.

DATA
- All data comes from src/lib/api/, split by feature (chat, memory, search, workspace), with mock data in src/lib/mock/.
- Follow the shapes in docs/API_SHAPES.md exactly. Every function is async with 300 to 600 ms simulated latency and has a JSDoc line naming the future real endpoint.
- Never hard-code sample text in components. Seed realistic content from the screenshots.

OWNERSHIP
- When I tell you which folders you own, edit only those. Do not edit shared components, the router, AppLayout or other features. If you need a change there, create what you need inside your own folder and tell me.

GIT
- Do not run git commands. I commit, push and merge myself, except when I explicitly ask you to resolve a merge.

QUALITY AND SPEED
- Simple working code over abstractions.
- Every page has loading, empty and error states.
- Basics: semantic HTML, labels on inputs, aria-label on icon-only buttons, visible focus ring, Escape closes overlays, 4.5:1 text contrast.
- At the end run npm run lint and npm run build and fix everything.
- Report in 5 lines or fewer: what you built, files changed, deviations from the design. Then stop.

