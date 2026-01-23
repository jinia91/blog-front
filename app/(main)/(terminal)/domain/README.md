# Terminal Domain Layer

Enhanced command parsing and management system for the terminal emulator.

## Files

### command.ts
Core command interface and parsing logic.

**Enhanced Interfaces:**

```typescript
interface CommandFlag {
  name: string
  short?: string  // -h
  long?: string   // --help
  description: string
  hasValue?: boolean
}

interface Command {
  name: string
  description: string
  category: 'system' | 'navigation' | 'util' | 'fun' | 'dev'
  aliases?: string[]
  flags?: CommandFlag[]
  usage?: string  // e.g., "curl [options] <url>"
  execute: (setContext: SetContextFn, args: string[], flags?: ParsedFlags) => Promise<void>
}

interface ParsedFlags {
  [key: string]: string | boolean
}
```

**Command Categories:**

- `system` - 시스템 명령어 (clear, welcome, help)
- `navigation` - 탐색 명령어 (github)
- `util` - 유틸리티 (curl, history, whoami)
- `fun` - 재미있는 명령어 (snake)
- `dev` - 개발자 도구 (eval)

**Enhanced parseCommand:**

Parses command line input into structured data:

```typescript
parseCommand("curl -v --timeout 5000 https://example.com")
// Returns:
{
  command: "curl",
  args: ["https://example.com"],
  flags: { v: true, timeout: "5000" }
}
```

**Supported flag formats:**

- Short flags: `-v`, `-h`
- Multiple short flags: `-al` → `{ a: true, l: true }`
- Long flags: `--help`, `--verbose`
- Flags with values: `--timeout 5000`, `--timeout=5000`
- Boolean flags: `--help` → `{ help: true }`

### command-utils.ts
Utility functions for command management.

**Functions:**

1. **resolveAlias(commandName, aliases)**
   - Resolves command aliases to actual command names
   - Example: `ls` → `list`, `ll` → `list`

2. **buildAliasMap(commands)**
   - Builds a map of all aliases from command list
   - Returns `Map<string, string>`

3. **suggestCommand(input, commands, maxSuggestions)**
   - Suggests similar commands for typos
   - Uses Levenshtein distance algorithm
   - Example: `curl` → suggests `["curl", "clear"]`

4. **groupCommandsByCategory(commands)**
   - Groups commands by their category
   - Returns `Map<string, Command[]>`

5. **findCommand(commandName, commands)**
   - Finds a command by name or alias
   - Returns `Command | undefined`

6. **formatFlagName(flag)**
   - Formats flag for display: `-v, --verbose`

## Usage Examples

### Basic command parsing

```typescript
import { commandParser } from './command'

const result = commandParser.parseCommand('curl --help')
// { command: 'curl', args: [], flags: { help: true } }
```

### Command suggestions

```typescript
import { suggestCommand } from './command-utils'
import { COMMAND_LIST } from './command'

const suggestions = suggestCommand('cler', COMMAND_LIST)
// Returns: ['clear']
```

### Group by category

```typescript
import { groupCommandsByCategory } from './command-utils'
import { COMMAND_LIST } from './command'

const grouped = groupCommandsByCategory(COMMAND_LIST)
// Returns Map with categories as keys
```

### Find command with alias

```typescript
import { findCommand } from './command-utils'
import { COMMAND_LIST } from './command'

const cmd = findCommand('h', COMMAND_LIST)
// Finds 'help' if 'h' is an alias
```

## Migration Guide

### Before (v1)

```typescript
export interface Command {
  name: string
  description: string
  execute: (setContext, strings: string[]) => Promise<void>
}

const [command, args] = commandParser.parseCommand(input)
```

### After (v2)

```typescript
export interface Command {
  name: string
  description: string
  category: CommandCategory
  aliases?: string[]
  flags?: CommandFlag[]
  usage?: string
  execute: (setContext, args: string[], flags?: ParsedFlags) => Promise<void>
}

const { command, args, flags } = commandParser.parseCommand(input)
```

### Updating existing commands

All commands must now include a `category` field:

```typescript
export const clearCommand: Command = {
  name: 'clear',
  description: '터미널 화면을 지웁니다',
  category: 'system',  // NEW: Required
  execute: async (setContext, args, flags) => {  // NEW: flags parameter
    // implementation
  }
}
```

## Testing

Run the test suite:

```bash
npm run test -- command.test
```

Test command parser manually:

```bash
node test-command-parser.mjs
```

## Future Enhancements

- [ ] Add autocomplete based on command aliases
- [ ] Implement command history search
- [ ] Add command validation before execution
- [ ] Support for subcommands (e.g., `git commit -m "message"`)
- [ ] Command help text generation from flags
- [ ] Tab completion for flags
