# Mantine to shadcn/ui Component Conversion Guide

## Overview
This guide shows how to convert Mantine components to shadcn/ui components for the admin dashboard.

## Import Changes

### Before (Mantine):
```tsx
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Select,
  Space,
  Stack,
  Table,
  Text,
  Textarea,
} from '@mantine/core';
```

### After (shadcn):
```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
```

## Component Mappings

### Stack → div with className="space-y-*"
```tsx
// Before:
<Stack spacing="xl">
  <div>Content 1</div>
  <div>Content 2</div>
</Stack>

// After:
<div className="space-y-6">
  <div>Content 1</div>
  <div>Content 2</div>
</div>
```

### Group → div with className="flex gap-*"
```tsx
// Before:
<Group spacing="md" position="apart">
  <Button>Left</Button>
  <Button>Right</Button>
</Group>

// After:
<div className="flex items-center justify-between gap-4">
  <Button>Left</Button>
  <Button>Right</Button>
</div>
```

### Text → span/div/p with className
```tsx
// Before:
<Text size="lg" weight={600} color="dimmed">
  Heading
</Text>

// After:
<h3 className="text-lg font-semibold text-muted-foreground">
  Heading
</h3>
```

### Select (Complete Restructure Required)
```tsx
// Before:
<Select
  label="Concern"
  placeholder="Select concern"
  data={[{ value: 'acne', label: 'Acne' }]}
  value={selectedValue}
  onChange={setValue}
/>

// After:
<div className="space-y-2">
  <Label htmlFor="concern-select">Concern</Label>
  <Select value={selectedValue} onValueChange={setValue}>
    <SelectTrigger id="concern-select">
      <SelectValue placeholder="Select concern" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="acne">Acne</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Table (Restructure Required)
```tsx
// Before:
<Table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Product</td>
      <td>Price</td>
    </tr>
  </tbody>
</Table>

// After:
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Value</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Product</TableCell>
      <TableCell>Price</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Card
```tsx
// Before:
<Card withBorder radius="lg" padding="lg">
  <Text weight={600}>Title</Text>
  <Text size="sm">Description</Text>
  <div>Content</div>
</Card>

// After:
<Card className="border-slate-200">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <div>Content</div>
  </CardContent>
</Card>
```

### Alert
```tsx
// Before:
<Alert icon={<AlertTriangle size={16} />} title="Error" color="red" variant="light">
  Error message
</Alert>

// After:
<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Error message</AlertDescription>
</Alert>
```

### Button
```tsx
// Before:
<Button
  variant="gradient"
  gradient={{ from: 'teal', to: 'lime', deg: 120 }}
  leftSection={<RefreshCcw size={16} />}
  loading={saving}
  onClick={handleClick}
>
  Save
</Button>

// After:
<Button
  onClick={handleClick}
  disabled={saving}
  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
>
  {saving && <Spinner className="h-4 w-4 mr-2" />}
  <RefreshCcw className="h-4 w-4 mr-2" />
  Save
</Button>
```

### Badge
```tsx
// Before:
<Badge color="teal" variant="light" size="sm">
  Status
</Badge>

// After:
<Badge variant="secondary" className="text-xs">
  Status
</Badge>
```

### Textarea
```tsx
// Before:
<Textarea
  label="Notes"
  minRows={3}
  maxRows={5}
  autosize
  value={notes}
  onChange={(e) => setNotes(e.currentTarget.value)}
/>

// After:
<div className="space-y-2">
  <Label htmlFor="notes">Notes</Label>
  <Textarea
    id="notes"
    rows={3}
    value={notes}
    onChange={(e) => setNotes(e.currentTarget.value)}
    className="resize-none"
  />
</div>
```

### Loader → Spinner
```tsx
// Before:
<Loader />

// After:
<Spinner className="h-6 w-6" />
```

### Divider → Separator
```tsx
// Before:
<Divider />

// After:
<Separator />
```

### Space → className spacing
```tsx
// Before:
<Space h="md" />

// After:
<div className="h-4" />  {/* or use mt-4, my-4, etc. */}
```

## Color/Style Mappings

### Tailwind Equivalents
- `color="dimmed"` → `className="text-muted-foreground"`
- `weight={600}` → `className="font-semibold"`
- `weight={500}` → `className="font-medium"`
- `size="sm"` → `className="text-sm"`
- `size="lg"` → `className="text-lg"`
- `size="xl"` → `className="text-xl"`

### Band Colors
```tsx
const getBandColor = (band: BandColor) => {
  switch (band) {
    case 'green':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'blue':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'yellow':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'red':
      return 'bg-red-100 text-red-800 border-red-200';
  }
};
```

## Full Example: Matrix Editor Row

### Before (Mantine):
```tsx
<Card withBorder radius="lg" padding="lg">
  <Group position="apart" align="center">
    <Group spacing="sm">
      <Badge color="green" variant="filled">
        GREEN band
      </Badge>
      <Text size="sm" color="dimmed">
        3 variants
      </Text>
    </Group>
  </Group>
  <Space h="md" />
  <Divider />
  <Stack spacing="sm">
    <Text weight={600}>Comedonal Acne</Text>
  </Stack>
</Card>
```

### After (shadcn):
```tsx
<Card className="border-slate-200 overflow-hidden">
  <CardHeader className="bg-emerald-100 text-emerald-800 border-emerald-200 border-b">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="text-sm font-bold uppercase px-3 py-1">
          GREEN band
        </Badge>
        <CardDescription className="text-sm font-medium text-slate-700">
          3 variants
        </CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent className="p-6 space-y-4">
    <h4 className="text-base font-semibold text-slate-900">Comedonal Acne</h4>
  </CardContent>
</Card>
```

## Notes

1. **No direct `data` prop**: shadcn Select requires manual mapping with SelectItem components
2. **No `leftSection`/`rightSection`**: Use Flexbox and manually position icons
3. **No `weight`/`size` props on Text**: Use Tailwind classes like `font-semibold`, `text-sm`
4. **Spacing**: Use Tailwind's space-y-*, space-x-*, gap-* instead of `spacing` prop
5. **Layout**: Use Flexbox/Grid with Tailwind classes instead of Group/Stack

## Key Tailwind Classes

- **Spacing**: `space-y-{n}`, `space-x-{n}`, `gap-{n}`, `p-{n}`, `m-{n}`
- **Colors**: `text-slate-900`, `bg-slate-50`, `border-slate-200`, `text-muted-foreground`
- **Typography**: `text-{size}`, `font-{weight}`, `tracking-{spacing}`
- **Layout**: `flex`, `items-center`, `justify-between`, `grid`, `grid-cols-{n}`
- **Sizing**: `w-full`, `h-full`, `min-w-[200px]`, `max-w-[1400px]`
