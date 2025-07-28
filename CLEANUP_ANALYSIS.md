# GrooveForge Cleanup & Enhancement Analysis

## Goal 1: Examine codebase for unnecessary components

### Current Issues Found:
1. **Package Naming Inconsistency**:
   - Root package: `@relix42/grooveforge` ✅ (correct)
   - CLI package: `@google/gemini-cli` ❌ (should be `@relix42/grooveforge-cli`)
   - Core package: `@google/gemini-cli-core` ❌ (should be `@relix42/grooveforge-core`)

2. **Directory/File Naming Issues**:
   - `.gemini` directory ❌ (should be `.grooveforge`)
   - `.gcp` directory ❌ (Google Cloud specific, may not be needed)
   - Various references to "gemini" in file names and content

3. **Potentially Unnecessary Components**:
   - `corgiCommand.ts` - Fun but potentially unnecessary
   - `testChatCommand.ts` - Development tool, may not be needed in production
   - `vimCommand.ts` - Niche feature
   - VSCode IDE companion - May be overkill for initial release
   - Sandbox functionality - Complex feature that may not be essential

## Goal 2: Git project naming alignment

### Repository Information:
- Current repo: `https://github.com/relix42/grooveforge.git` ✅
- Directory name: `grooveforge` ✅
- Need to update all internal references from "gemini-cli" to "grooveforge"

## Goal 3: README update needed

### Current README status:
- Needs complete rewrite for GrooveForge branding
- Should focus on local AI and independence
- Remove Google/Gemini specific instructions

## Goal 4: Slash Commands Analysis

### Current Commands (25 total):
1. `/about` - ✅ Essential
2. `/auth` - ✅ Essential  
3. `/bug` - ✅ Useful for feedback
4. `/chat` - ✅ Essential
5. `/clear` - ✅ Essential
6. `/compress` - ❓ Questionable utility
7. `/copy` - ✅ Useful
8. `/corgi` - ❌ Fun but unnecessary
9. `/docs` - ✅ Essential
10. `/editor` - ✅ Useful
11. `/extensions` - ✅ Essential
12. `/fork` - ✅ Essential (GrooveForge specific)
13. `/help` - ✅ Essential
14. `/ide` - ❓ May be overkill
15. `/initial-prompts` - ✅ Essential (new feature)
16. `/logs` - ✅ Essential for debugging
17. `/mcp` - ✅ Essential for extensibility
18. `/memory` - ✅ Essential
19. `/privacy` - ✅ Important
20. `/quit` - ✅ Essential
21. `/restore` - ✅ Useful
22. `/stats` - ✅ Useful
23. `/theme` - ✅ Nice to have
24. `/tools` - ✅ Essential
25. `/vim` - ❌ Niche, unnecessary

### Missing Commands We Need:
- `/providers` - Manage AI providers (Ollama, Claude, etc.)
- `/models` - List/switch available models
- `/queue` - Manage prompt queue (for Goal 5)
- `/status` - Show current work status
- `/cancel` - Cancel current work

## Goal 5: Concurrent Processing & UI

### Current Architecture:
- Single-threaded prompt processing
- No queue system
- No background work indicators

### Needed Changes:
- Implement prompt queue system
- Background processing with status indicators
- User can add prompts while agent is working
- Visual indicators for:
  - Current work in progress
  - Queued prompts
  - Completion status

## Goal 6: Visual Indicators

### Current UI:
- Basic Ink.js terminal UI
- Simple spinner for loading
- No queue visualization

### Needed Enhancements:
- Queue status display
- Progress indicators
- Work completion notifications
- Multi-line status area

## Priority Order:
1. **High Priority**: Package naming, branding consistency
2. **High Priority**: Remove unnecessary components
3. **Medium Priority**: README update
4. **Medium Priority**: Slash command cleanup
5. **Low Priority**: Concurrent processing (complex feature)
6. **Low Priority**: Enhanced UI (depends on #5)