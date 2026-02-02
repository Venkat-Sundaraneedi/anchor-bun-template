# AI Agent Instructions

## Package Management

**Always use Bun CLI, never edit package.json manually:**

```bash
bun add <package-name>@latest
```

## Error Resolution Protocol

When encountering errors, follow this sequence:

1. **Verify Installation**
   ```bash
   bun list <package-name>
   # If missing: bun add <package-name>@latest
   ```

2. **Get Documentation via Context7 MCP**
   ```
   Package: <installed-package-name>
   Query: <specific error or functionality>
   ```

3. **Apply Fix and Test**
   ```bash
   mise test
   ```

## Never Do

- ❌ Manually edit `package.json`
- ❌ Use npm/yarn/pnpm
- ❌ Add packages without `@latest`
- ❌ Skip Context7 docs when stuck
- ❌ Guess APIs without checking docs

## Remember

**Detect Error → Verify Install → Context7 Docs → Apply Fix → Test**
