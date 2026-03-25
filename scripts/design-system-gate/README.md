# Design System Gate

Automated enforcement of design system consistency. Prevents NEW violations while allowing existing technical debt to be addressed incrementally.

## What It Checks

| Rule | Description | Fix |
|------|-------------|-----|
| `inline-style` | `style={{...}}` in JSX/TSX | Use Tailwind classes |
| `hex-color` | Hardcoded `#RRGGBB` colors | Use CSS variables (`var(--color)`) |
| `raw-tailwind-color` | `bg-gray-*`, `text-blue-*` | Use semantic tokens (`bg-ak-*`, `text-ak-*`) |

## Semantic Token Mapping

Use this table to convert inline styles to Tailwind classes.

### Text Colors

| Inline Style | Tailwind Class |
|-------------|----------------|
| `color: 'var(--text-primary)'` | `text-text-primary` |
| `color: 'var(--text-secondary)'` | `text-text-secondary` |
| `color: 'var(--text-tertiary)'` | `text-text-tertiary` |
| `color: 'var(--accent)'` | `text-accent` |
| `color: 'var(--success)'` | `text-success` |
| `color: 'var(--warning)'` | `text-warning` |
| `color: 'var(--error)'` | `text-danger` |
| `color: 'var(--info)'` | `text-info` |

### Background Colors

| Inline Style | Tailwind Class |
|-------------|----------------|
| `backgroundColor: 'var(--bg-primary)'` | `bg-bg-primary` |
| `backgroundColor: 'var(--bg-secondary)'` | `bg-bg-secondary` |
| `backgroundColor: 'var(--bg-tertiary)'` | `bg-bg-tertiary` |
| `backgroundColor: 'var(--accent)'` | `bg-accent` |
| `backgroundColor: 'var(--success)'` | `bg-success` |
| `backgroundColor: 'var(--warning)'` | `bg-warning` |
| `backgroundColor: 'var(--error)'` | `bg-danger` |
| `backgroundColor: 'var(--info)'` | `bg-info` |

### Muted Backgrounds (replaces `rgba(..., 0.1)` patterns)

| Inline Style | Tailwind Class |
|-------------|----------------|
| `backgroundColor: 'rgba(5, 150, 105, 0.1)'` | `bg-success-muted` |
| `backgroundColor: 'rgba(217, 119, 6, 0.1)'` | `bg-warning-muted` |
| `backgroundColor: 'rgba(220, 38, 38, 0.08)'` | `bg-danger-muted` |
| `backgroundColor: 'rgba(2, 132, 199, 0.1)'` | `bg-info-muted` |
| `backgroundColor: 'rgba(27, 77, 62, 0.08)'` | `bg-accent-muted` |
| `backgroundColor: 'var(--success-muted)'` | `bg-success-muted` |
| `backgroundColor: 'var(--warning-muted)'` | `bg-warning-muted` |
| `backgroundColor: 'var(--error-muted)'` | `bg-danger-muted` |
| `backgroundColor: 'var(--info-muted)'` | `bg-info-muted` |
| `backgroundColor: 'var(--accent-muted)'` | `bg-accent-muted` |

### Border Colors

| Inline Style | Tailwind Class |
|-------------|----------------|
| `border: '1px solid var(--border-default)'` | `border border-default` |
| `border: '1px solid var(--border-subtle)'` | `border border-subtle` |
| `borderColor: 'var(--accent)'` | `border-accent` |
| `border: '1px solid rgba(34, 197, 94, 0.2)'` | `border border-success-muted` |
| `border: '1px solid rgba(239, 68, 68, 0.2)'` | `border border-danger-muted` |
| `border: '1px solid rgba(234, 179, 8, 0.2)'` | `border border-warning-muted` |
| `border: '1px solid rgba(14, 165, 233, 0.2)'` | `border border-info-muted` |

## Conversion Examples

### Before/After: Simple Text Color

```jsx
// Before
<p style={{ color: 'var(--text-secondary)' }}>Description</p>

// After
<p className="text-text-secondary">Description</p>
```

### Before/After: Status Background with Muted Opacity

```jsx
// Before
<div style={{
  backgroundColor: 'rgba(220, 38, 38, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: 'var(--error)',
}}>
  Error message
</div>

// After
<div className="bg-danger-muted border border-danger-muted text-danger">
  Error message
</div>
```

### Before/After: Accent with Hover State

```jsx
// Before
<button style={{ backgroundColor: 'var(--accent)' }}>Submit</button>

// After
<button className="bg-accent hover:bg-accent-hover">Submit</button>
```

### Before/After: Card with Multiple Tokens

```jsx
// Before
<div style={{
  backgroundColor: 'var(--bg-primary)',
  border: '1px solid var(--border-default)',
  padding: '16px',
}}>
  Content
</div>

// After
<div className="bg-bg-primary border border-default p-4">
  Content
</div>
```

## When NOT to Convert

Keep inline styles for:
- **Dynamic values**: `style={{ width: `${percent}%` }}`
- **Computed colors**: `style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}`
- **Complex animations**: Runtime-dependent transforms
- **One-off values**: Truly unique measurements not in the design system

## CSS Variable Reference

All tokens are defined in `apps/web/src/index.css`. Key semantic tokens:

```css
/* Text */
--text-primary: #111827;
--text-secondary: #374151;
--text-tertiary: #6B7280;

/* Backgrounds */
--bg-primary: var(--background-white);
--bg-secondary: var(--background-default);
--bg-tertiary: var(--gray-100);

/* Accent */
--accent: var(--ak-primary);
--accent-muted: rgba(27, 77, 62, 0.08);

/* Status */
--success: var(--ak-success);
--success-muted: rgba(5, 150, 105, 0.1);
--warning: var(--ak-warning);
--warning-muted: rgba(217, 119, 6, 0.1);
--error: var(--ak-error);
--error-muted: rgba(220, 38, 38, 0.08);
--info: var(--ak-info);
--info-muted: rgba(2, 132, 199, 0.1);

/* Borders */
--border-default: #E5E7EB;
--border-subtle: #EEF1F4;
--success-border-muted: rgba(34, 197, 94, 0.2);
--warning-border-muted: rgba(234, 179, 8, 0.2);
--error-border-muted: rgba(239, 68, 68, 0.2);
--info-border-muted: rgba(14, 165, 233, 0.2);
```
