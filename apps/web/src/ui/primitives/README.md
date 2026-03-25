# Primitives - Atomic UI Elements

The most basic building blocks of the UI system. These components form the foundation for all other components and follow the AK Golf design system.

## Available Components

### Button
Basic button component with multiple variants and states.

**Variants:** primary, secondary, outline, ghost, danger
**Sizes:** sm, md, lg

```tsx
import { Button } from '@/ui/primitives';

<Button variant="primary" size="md">
  Click Me
</Button>

<Button
  variant="outline"
  loading
  leftIcon={<Icon />}
>
  Loading...
</Button>
```

### Input
Text input with validation states and addons.

**Variants:** default, filled, flushed
**Sizes:** sm, md, lg

```tsx
import { Input } from '@/ui/primitives';

<Input
  label="Email"
  placeholder="you@example.com"
  error={!!errors.email}
  errorMessage={errors.email}
  leftAddon={<EmailIcon />}
/>
```

### Text
Typography component following Apple HIG type scale.

**Variants:** largeTitle, title1, title2, title3, headline, body, subheadline, footnote, caption1, caption2
**Colors:** primary, secondary, tertiary, brand, inverse, accent, error, success, warning

```tsx
import { Text } from '@/ui/primitives';

<Text variant="title1" color="brand">
  Dashboard
</Text>

<Text variant="body" truncate>
  Long text that will be truncated...
</Text>

<Text variant="caption1" lineClamp={2}>
  Multi-line text that will be clamped to 2 lines
</Text>
```

### Badge
Status indicators and labels.

**Variants:** default, primary, success, warning, error, gold
**Sizes:** sm, md, lg

```tsx
import { Badge } from '@/ui/primitives';

<Badge variant="success" dot>
  Active
</Badge>

<Badge variant="warning" pill>
  Pending
</Badge>
```

### Avatar
User avatars with initials or image fallback.

**Sizes:** xs, sm, md, lg, xl
**Status:** online, offline, away, busy

```tsx
import { Avatar } from '@/ui/primitives';

<Avatar
  src="/path/to/image.jpg"
  alt="John Doe"
  size="md"
  status="online"
/>

<Avatar
  name="John Doe"
  size="lg"
  onClick={() => console.log('clicked')}
/>
```

### Spinner
Loading indicators with multiple variants.

**Variants:** circular, dots, pulse
**Sizes:** sm, md, lg, xl

```tsx
import { Spinner } from '@/ui/primitives';

<Spinner size="md" variant="circular" />

<Spinner
  variant="dots"
  color="var(--ak-primary)"
  label="Loading data..."
/>
```

### Divider
Visual separators with optional labels.

**Orientations:** horizontal, vertical
**Variants:** solid, dashed, dotted

```tsx
import { Divider } from '@/ui/primitives';

<Divider />

<Divider label="OR" />

<Divider
  orientation="vertical"
  spacing={24}
/>
```

### Switch
Toggle switches for binary choices.

**Sizes:** sm, md, lg

```tsx
import { Switch } from '@/ui/primitives';

<Switch
  checked={enabled}
  onChange={(checked) => setEnabled(checked)}
  label="Enable notifications"
/>

<Switch
  size="lg"
  labelPosition="left"
  disabled
/>
```

### Checkbox
Checkbox inputs with custom styling.

**Sizes:** sm, md, lg

```tsx
import { Checkbox } from '@/ui/primitives';

<Checkbox
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
  label="I agree to terms"
/>

<Checkbox
  indeterminate={someChecked}
  error={!!error}
  helperText="Select at least one option"
/>
```

## Design Principles

### Accessibility First
- All inputs have proper labels and ARIA attributes
- Keyboard navigation fully supported
- Focus states clearly visible
- Touch targets meet 44x44px minimum

### Mobile Optimized
- Touch-friendly sizes (minimum 44x44px for interactive elements)
- Responsive font sizes
- Appropriate spacing for mobile interactions
- Optimized animations and transitions

### Design System Compliance
All components use design tokens from `index.css`:
- Colors: `var(--ak-primary)`, `var(--text-primary)`, etc.
- Spacing: `var(--spacing-*)` system
- Typography: `var(--font-size-*)` scale
- Borders: `var(--radius-*)` values

### TypeScript First
- Strict typing with proper interfaces
- Generic components where appropriate
- Exported type definitions
- IntelliSense-friendly props

## Component Anatomy

### State Management
Components support both controlled and uncontrolled modes:

```tsx
// Controlled
<Input value={value} onChange={setValue} />

// Uncontrolled
<Input defaultValue="initial" />
```

### Ref Forwarding
Form components forward refs for imperative access:

```tsx
const inputRef = useRef<HTMLInputElement>(null);

<Input ref={inputRef} />

// Later:
inputRef.current?.focus();
```

### Composition
Primitives are designed to compose well:

```tsx
<Button
  leftIcon={<Spinner size="sm" />}
  disabled
>
  <Text variant="body" weight={600}>
    Processing...
  </Text>
</Button>
```

## Styling

### CSS-in-JS
Components use inline styles with design tokens:
- No runtime CSS generation overhead
- Type-safe style objects
- Scoped styles preventing conflicts
- Direct access to design tokens

### Custom Styling
All components accept `className` and `style` props:

```tsx
<Button
  className="custom-button"
  style={{ marginTop: 20 }}
>
  Custom Styled
</Button>
```

### Hover & Focus States
Interactive elements include proper hover/focus states following WCAG guidelines.

## Testing

Each primitive should be tested for:
- Rendering with different props
- User interactions (click, change, focus, etc.)
- Accessibility (ARIA, keyboard nav)
- Edge cases (disabled, loading, error states)

## Performance

### Optimizations
- Minimal re-renders with React.memo where appropriate
- No unnecessary effect hooks
- Efficient event handlers
- Tree-shakeable exports

### Bundle Size
Primitives are designed to be lightweight:
- No external dependencies (except React)
- Minimal inline styles
- SVG icons inline (no icon library bloat)

## Examples

### Form Example
```tsx
import { Input, Button, Checkbox, Text } from '@/ui/primitives';

function LoginForm() {
  return (
    <form>
      <Input
        label="Email"
        type="email"
        required
        fullWidth
      />

      <Input
        label="Password"
        type="password"
        required
        fullWidth
      />

      <Checkbox label="Remember me" />

      <Button variant="primary" fullWidth>
        Sign In
      </Button>
    </form>
  );
}
```

### Card Example
```tsx
import { Avatar, Text, Badge, Button } from '@/ui/primitives';

function UserCard() {
  return (
    <div>
      <Avatar
        name="John Doe"
        size="lg"
        status="online"
      />

      <Text variant="headline" weight={600}>
        John Doe
      </Text>

      <Badge variant="primary" pill>
        Pro Player
      </Badge>

      <Button variant="outline" size="sm">
        View Profile
      </Button>
    </div>
  );
}
```

### Loading States
```tsx
import { Spinner, Text, Button } from '@/ui/primitives';

function LoadingExample() {
  return (
    <>
      {/* Inline spinner */}
      <Spinner size="sm" />

      {/* Loading button */}
      <Button loading>
        Processing...
      </Button>

      {/* Custom loading state */}
      <div>
        <Spinner variant="dots" />
        <Text color="secondary">Loading data...</Text>
      </div>
    </>
  );
}
```

## Best Practices

1. **Use semantic HTML** - Components render appropriate HTML elements
2. **Provide labels** - Always include labels for form inputs
3. **Handle errors** - Use error states to guide users
4. **Consider mobile** - Test on touch devices
5. **Keyboard navigation** - Ensure all interactive elements are keyboard accessible
6. **Loading states** - Show feedback for async operations
7. **Consistent sizing** - Use size props consistently across your app

## Migration from Existing Components

If you have existing components, migrate gradually:

1. Start with new features
2. Replace components during refactors
3. Use primitives alongside existing code
4. Document differences and benefits

## Contributing

When adding new primitives:

1. Follow existing patterns and naming
2. Use design tokens exclusively
3. Include all size/variant options
4. Add TypeScript interfaces
5. Support both controlled/uncontrolled
6. Forward refs where appropriate
7. Include accessibility features
8. Write clear documentation
9. Add usage examples
