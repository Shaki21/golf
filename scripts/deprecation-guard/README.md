# Deprecation Guard

Prevents **NEW** usage of deprecated functions while allowing existing references to remain until they are refactored.

## How It Works

1. Maintains a `baseline.txt` of existing deprecated function references
2. Scans codebase for all references to deprecated functions
3. Fails if current count exceeds baseline count

## Usage

```bash
# Check for new deprecated function usage
./scripts/deprecation-guard/check-deprecated.sh

# Update baseline after intentionally removing deprecated usages
./scripts/deprecation-guard/check-deprecated.sh --update-baseline
```

## Deprecated Functions

| Function | Reason | Alternative |
|----------|--------|-------------|
| `approximateSkillLevelFromPlayerCategory` | Semantic mismatch - PlayerCategory (A1-D2) and UISkillLevel (K-A) are incompatible systems | Fetch `UISkillLevel` from player profile API endpoint |

## CI Integration

Add to your CI workflow:

```yaml
- name: Check deprecated function usage
  run: ./scripts/deprecation-guard/check-deprecated.sh
```

## Adding New Deprecated Functions

1. Add function name to `DEPRECATED_FUNCTIONS` array in `check-deprecated.sh`
2. Update `baseline.txt` to include existing references
3. Document in this README
