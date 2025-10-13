# Admin Dashboard Design System

## Color Palette

### Primary Colors (Consistent Across All Components)
- **Background**: `bg-slate-50` (light gray)
- **Cards**: `bg-white` with `border-slate-200`
- **Headers**: `bg-gradient-to-r from-slate-100 to-slate-50`

### Band/Status Colors (Harmonized)
- **Green (Safe)**: `bg-emerald-50 border-emerald-200 text-emerald-700`
- **Blue (Low Risk)**: `bg-sky-50 border-sky-200 text-sky-700`
- **Yellow (Caution)**: `bg-amber-50 border-amber-200 text-amber-700`
- **Red (High Risk)**: `bg-rose-50 border-rose-200 text-rose-700`

### Action Colors
- **Primary Button**: `bg-indigo-600 hover:bg-indigo-700 text-white`
- **Secondary Button**: `bg-slate-200 hover:bg-slate-300 text-slate-900`
- **Success**: `bg-emerald-50 border-emerald-200 text-emerald-800`
- **Error**: `bg-rose-50 border-rose-200 text-rose-800`

### Typography
- **Heading**: `text-slate-900 font-semibold`
- **Subheading**: `text-slate-700 font-medium`
- **Body**: `text-slate-600`
- **Muted**: `text-slate-500`

## Component Standards

### Cards
```tsx
<Card className="border-slate-200 bg-white shadow-sm">
  <CardHeader className="border-b border-slate-100 bg-slate-50">
    <CardTitle className="text-slate-900">Title</CardTitle>
    <CardDescription className="text-slate-600">Description</CardDescription>
  </CardHeader>
  <CardContent className="p-6">
    Content
  </CardContent>
</Card>
```

### Badges
```tsx
// Status badges
<Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
  Safe
</Badge>

// Info badges  
<Badge variant="secondary" className="bg-slate-100 text-slate-700">
  Info
</Badge>
```

### Buttons
```tsx
// Primary action
<Button className="bg-indigo-600 hover:bg-indigo-700">
  Save
</Button>

// Secondary action
<Button variant="outline" className="border-slate-300 hover:bg-slate-50">
  Cancel
</Button>
```

### Tables
- Header: `bg-slate-50 text-slate-700 font-medium`
- Rows: `hover:bg-slate-50 border-slate-200`
- Text: `text-slate-900` (primary), `text-slate-600` (secondary)

### Forms
- Labels: `text-slate-700 font-medium text-sm`
- Inputs: `border-slate-300 focus:border-indigo-500 focus:ring-indigo-500`
- Placeholders: `text-slate-400`

## Spacing
- Section spacing: `space-y-6`
- Card padding: `p-6`
- Form spacing: `space-y-4`
- Element gaps: `gap-4`
