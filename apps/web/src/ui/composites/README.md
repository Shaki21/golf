# Composites - Complex UI Compositions

Advanced UI components built from primitives and raw-blocks. These components handle complex interactions, state management, and provide feature-rich functionality.

## Available Components

### Modal
Full-featured modal dialog with overlay, animations, and mobile bottom sheet support.

**Features:**
- Overlay click to close
- Escape key support
- Focus trap
- Body scroll lock
- Mobile bottom sheet
- Customizable size
- Header, content, footer sections

```tsx
import { Modal } from '@/ui/composites';
import { Button, Text } from '@/ui/primitives';

function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">
              Confirm
            </Button>
          </>
        }
      >
        <Text>Are you sure you want to proceed?</Text>
      </Modal>
    </>
  );
}
```

### Toast
Toast notification system with queue management and context API.

**Features:**
- Multiple variants (info, success, warning, error)
- Auto-dismiss with configurable duration
- Action buttons
- Queue management
- Position control
- Context API for global access

```tsx
import { ToastProvider, useToast } from '@/ui/composites';
import { Button } from '@/ui/primitives';

// Wrap your app
function App() {
  return (
    <ToastProvider position="top-right" maxToasts={5}>
      <YourApp />
    </ToastProvider>
  );
}

// Use in components
function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast({
      message: 'Changes saved successfully!',
      variant: 'success',
      duration: 3000,
    });
  };

  const handleWithAction = () => {
    addToast({
      message: 'File deleted',
      variant: 'info',
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo clicked'),
      },
    });
  };

  return (
    <>
      <Button onClick={handleSuccess}>Save</Button>
      <Button onClick={handleWithAction}>Delete</Button>
    </>
  );
}
```

### Tabs
Tabbed interface with keyboard navigation and multiple variants.

**Features:**
- Horizontal/vertical orientation
- Multiple variants (default, pills, underline)
- Keyboard navigation (Arrow keys)
- Disabled tabs
- Icons and badges
- Controlled/uncontrolled modes

```tsx
import { Tabs } from '@/ui/composites';

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    content: <OverviewContent />,
    icon: <DashboardIcon />,
  },
  {
    id: 'stats',
    label: 'Statistics',
    content: <StatsContent />,
    badge: '12',
  },
  {
    id: 'settings',
    label: 'Settings',
    content: <SettingsContent />,
    disabled: true,
  },
];

<Tabs
  tabs={tabs}
  variant="pills"
  defaultActiveTab="overview"
  onChange={(tabId) => console.log('Active:', tabId)}
/>
```

### Dropdown
Dropdown menu with keyboard navigation and smart positioning.

**Features:**
- Keyboard navigation
- Auto-positioning
- Icons per item
- Disabled items
- Danger actions
- Dividers
- Click outside to close

```tsx
import { Dropdown } from '@/ui/composites';
import { Button } from '@/ui/primitives';

const menuItems = [
  {
    id: 'edit',
    label: 'Edit',
    icon: <EditIcon />,
    onClick: () => console.log('Edit'),
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: <CopyIcon />,
    onClick: () => console.log('Duplicate'),
  },
  {
    id: 'divider-1',
    divider: true,
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <TrashIcon />,
    danger: true,
    onClick: () => console.log('Delete'),
  },
];

<Dropdown
  trigger={<Button variant="ghost">Actions</Button>}
  items={menuItems}
  placement="bottom-right"
/>
```

### Accordion
Expandable/collapsible sections with smooth animations.

**Features:**
- Single or multiple open items
- Smooth height animations
- Icons per section
- Disabled sections
- Controlled/uncontrolled modes
- Keyboard accessible

```tsx
import { Accordion } from '@/ui/composites';

const items = [
  {
    id: '1',
    title: 'What is included?',
    content: <p>All features are included in the base package.</p>,
    icon: <QuestionIcon />,
  },
  {
    id: '2',
    title: 'How do I get started?',
    content: <p>Follow the quick start guide in the documentation.</p>,
  },
  {
    id: '3',
    title: 'Pricing',
    content: <p>Contact us for enterprise pricing.</p>,
    disabled: true,
  },
];

<Accordion
  items={items}
  allowMultiple={false}
  defaultOpenItems={['1']}
  showDividers
/>
```

### DataTable
Feature-rich data table with sorting, selection, and responsive design.

**Features:**
- Column sorting
- Row selection (single/multiple)
- Striped rows
- Hover effects
- Compact mode
- Loading state
- Empty state
- Responsive design
- Generic TypeScript support

```tsx
import { DataTable } from '@/ui/composites';
import { Badge } from '@/ui/primitives';

interface Player {
  id: string;
  name: string;
  handicap: number;
  status: 'active' | 'inactive';
}

const columns = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name' as const,
    sortable: true,
  },
  {
    id: 'handicap',
    header: 'Handicap',
    accessor: 'handicap' as const,
    sortable: true,
    align: 'center' as const,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: (row: Player) => (
      <Badge variant={row.status === 'active' ? 'success' : 'default'}>
        {row.status}
      </Badge>
    ),
  },
];

const data: Player[] = [
  { id: '1', name: 'John Doe', handicap: 12, status: 'active' },
  { id: '2', name: 'Jane Smith', handicap: 8, status: 'active' },
];

<DataTable
  columns={columns}
  data={data}
  getRowId={(row) => row.id}
  selectable
  selectedRows={selectedIds}
  onSelectionChange={setSelectedIds}
  onRowClick={(row) => console.log('Clicked:', row)}
  striped
  hoverable
/>
```

### Pagination
Pagination controls with smart ellipsis and keyboard support.

**Features:**
- Smart ellipsis for many pages
- First/last buttons
- Previous/next buttons
- Configurable sibling count
- Keyboard navigation
- Multiple sizes
- Disabled state

```tsx
import { Pagination } from '@/ui/composites';

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={(page) => setCurrentPage(page)}
  siblingCount={1}
  showFirstLast
  showPrevNext
  size="md"
/>
```

## Design Patterns

### Composition
Composites are built from primitives and raw-blocks:

```tsx
import { Modal } from '@/ui/composites';
import { Button, Text, Divider } from '@/ui/primitives';
import { CardHeader } from '@/ui/raw-blocks';

<Modal isOpen={isOpen} onClose={onClose}>
  <CardHeader title="Settings" icon={<SettingsIcon />} />
  <Divider />
  <Text variant="body">Configure your preferences</Text>
  <Button variant="primary" fullWidth>
    Save
  </Button>
</Modal>
```

### State Management
Components support both controlled and uncontrolled modes:

```tsx
// Controlled
<Tabs
  activeTab={activeTab}
  onChange={setActiveTab}
  tabs={tabs}
/>

// Uncontrolled
<Tabs
  defaultActiveTab="overview"
  tabs={tabs}
/>
```

### Accessibility

All composites include:
- **ARIA attributes** - Proper roles, states, and properties
- **Keyboard navigation** - Full keyboard support
- **Focus management** - Focus traps, auto-focus
- **Screen reader support** - Meaningful labels and descriptions

### Mobile Optimization

Composites are mobile-first:
- Touch-friendly targets (44x44px minimum)
- Responsive layouts
- Mobile-specific patterns (bottom sheets)
- Gesture support where appropriate

## Advanced Usage

### Nested Composites

```tsx
<Modal isOpen={isOpen} onClose={onClose} title="User Profile">
  <Tabs
    tabs={[
      {
        id: 'info',
        label: 'Info',
        content: (
          <Accordion items={infoSections} />
        ),
      },
      {
        id: 'stats',
        label: 'Statistics',
        content: (
          <DataTable columns={cols} data={stats} />
        ),
      },
    ]}
  />
</Modal>
```

### Custom Styling

All composites accept className and style props:

```tsx
<Tabs
  tabs={tabs}
  className="custom-tabs"
  style={{ marginTop: 20 }}
/>
```

### Event Handling

```tsx
<DataTable
  data={data}
  columns={columns}
  getRowId={(row) => row.id}
  onRowClick={(row) => {
    console.log('Row clicked:', row);
    navigate(`/details/${row.id}`);
  }}
  onSelectionChange={(ids) => {
    console.log('Selection changed:', ids);
    setSelectedIds(ids);
  }}
/>
```

## Performance Tips

### Memoization
Use React.memo and useMemo for expensive operations:

```tsx
const memoizedColumns = useMemo(() => [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name',
    sortable: true,
  },
  // ... more columns
], []);

const memoizedData = useMemo(() =>
  computeExpensiveData(rawData),
  [rawData]
);

<DataTable
  columns={memoizedColumns}
  data={memoizedData}
  // ...
/>
```

### Lazy Loading
For large lists or tables, implement pagination or virtual scrolling:

```tsx
const ITEMS_PER_PAGE = 20;
const paginatedData = data.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);

<>
  <DataTable data={paginatedData} columns={columns} />
  <Pagination
    currentPage={currentPage}
    totalPages={Math.ceil(data.length / ITEMS_PER_PAGE)}
    onPageChange={setCurrentPage}
  />
</>
```

## Testing Examples

### Modal Testing
```tsx
describe('Modal', () => {
  it('opens and closes', () => {
    const { getByText, queryByRole } = render(
      <Modal isOpen={false} onClose={jest.fn()} title="Test">
        Content
      </Modal>
    );

    expect(queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={jest.fn()} title="Test">
        Content
      </Modal>
    );

    expect(queryByRole('dialog')).toBeInTheDocument();
  });

  it('calls onClose when escape is pressed', () => {
    const onClose = jest.fn();
    render(<Modal isOpen={true} onClose={onClose} title="Test">Content</Modal>);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
```

### Toast Testing
```tsx
describe('Toast', () => {
  it('shows toast notification', () => {
    const { getByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(getByText('Show Toast'));
    expect(getByText('Success message')).toBeInTheDocument();
  });
});
```

## Common Patterns

### Confirmation Modal
```tsx
function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => {
            onConfirm();
            onClose();
          }}>
            Confirm
          </Button>
        </>
      }
    >
      <Text>{message}</Text>
    </Modal>
  );
}
```

### Tabbed Settings
```tsx
function Settings() {
  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      content: <ProfileSettings />,
      icon: <UserIcon />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      content: <NotificationSettings />,
      icon: <BellIcon />,
      badge: '3',
    },
  ];

  return <Tabs tabs={tabs} variant="pills" />;
}
```

### Sortable Table with Pagination
```tsx
function PlayerTable() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  const paginatedData = data.slice((page - 1) * 20, page * 20);

  return (
    <>
      <DataTable
        columns={columns}
        data={paginatedData}
        getRowId={(row) => row.id}
        selectable
        selectedRows={selected}
        onSelectionChange={setSelected}
        striped
        hoverable
      />
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(data.length / 20)}
        onPageChange={setPage}
      />
    </>
  );
}
```

## Best Practices

1. **Use Controlled State** - For complex forms and multi-step flows
2. **Provide Feedback** - Use toasts for async operations
3. **Handle Errors** - Show error states in modals and tables
4. **Mobile First** - Test on mobile devices
5. **Accessibility** - Ensure keyboard and screen reader support
6. **Performance** - Memoize expensive operations
7. **Consistency** - Use the same patterns across your app

## Browser Support

All composites are tested on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari (latest)
- Android Chrome (latest)

## Contributing

When adding new composites:

1. Build from existing primitives/raw-blocks
2. Follow accessibility guidelines
3. Add keyboard navigation
4. Support both controlled/uncontrolled
5. Include loading/error states
6. Add comprehensive documentation
7. Write tests
8. Consider mobile UX
