# InnoBridge.AI Design System Documentation

## Complete Guide for Building Professional Applications

This document provides everything needed to understand, implement, and extend the InnoBridge.AI theme. Whether you're building a new page, component, or entire feature, this guide ensures consistency and professional quality across all implementations.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography System](#typography-system)
4. [Layout & Spacing](#layout--spacing)
5. [Component Library](#component-library)
6. [Animation & Motion](#animation--motion)
7. [Responsive Design](#responsive-design)
8. [Accessibility Standards](#accessibility-standards)
9. [Implementation Guide](#implementation-guide)
10. [Common Patterns](#common-patterns)

---

## Design Philosophy

### Core Principles

The InnoBridge.AI design system is built on **Refined Tech Minimalism**—a philosophy that combines professional restraint with technical sophistication.

**Five Core Principles:**

**1. Intentional Simplicity**
Every design element serves a purpose. We avoid decorative flourishes, excessive colors, or busy patterns. Each button, card, and animation is deliberate and functional.

**2. Professional Restraint**
The color palette is limited to professional blues and neutral grays. This creates trust and credibility. Users should feel they're using a serious, well-crafted tool—not a toy or experimental project.

**3. Consistency Over Novelty**
All pages, components, and interactions follow the same design language. This consistency builds familiarity and reduces cognitive load. Users know what to expect.

**4. Accessibility First**
Every design decision considers accessibility. Colors meet WCAG AA contrast standards, typography is readable, and interactive elements are keyboard-navigable.

**5. Subtle Excellence**
Quality is in the details. Soft shadows, smooth transitions, and refined spacing create a premium feel without being obvious. The design should feel "crafted," not "assembled."

### Design Values

| Value | Meaning | Example |
|-------|---------|---------|
| **Clarity** | Information hierarchy is immediately obvious | Headings are clearly distinguished from body text |
| **Efficiency** | Users find what they need quickly | Search is prominent, filters are clear |
| **Trust** | The interface feels reliable and professional | Consistent styling, no surprises |
| **Elegance** | Beauty through simplicity, not complexity | Clean layouts, generous whitespace |
| **Inclusivity** | Works for everyone, regardless of ability | Keyboard navigation, screen reader support |

---

## Color System

### Philosophy

The color palette is intentionally limited. We use **one primary color** (professional blue) and **neutral grays** for backgrounds and text. This creates visual hierarchy without overwhelming the user.

**Why This Approach?**
- Professional appearance
- Better accessibility (fewer colors to manage contrast)
- Easier to maintain consistency
- Reduces decision fatigue for designers

### Light Mode Colors

```
Primary Background:     #FAFBFC (Soft White)
Primary Foreground:     #1A1A1A (Near Black)
Primary Action:         #0969DA (Professional Blue)
Secondary Background:   #F6F8FA (Very Light Gray)
Borders:                #D0D7DE (Light Gray)
Muted Text:             #57606A (Gray)
Success:                #1A7F64 (Subtle Green)
Warning:                #B08500 (Muted Orange)
Error:                  #DA3633 (Refined Red)
```

### Dark Mode Colors

```
Primary Background:     #0D1117 (Deep Charcoal)
Primary Foreground:     #E8E9EB (Off White)
Primary Action:         #58A6FF (Lighter Blue)
Secondary Background:   #21262D (Dark Gray)
Borders:                #30363D (Darker Gray)
Muted Text:             #8B949E (Light Gray)
Success:                #3FB950 (Light Green)
Warning:                #D29922 (Light Orange)
Error:                  #F85149 (Light Red)
```

### Color Usage Guidelines

**Primary Color (#0969DA / #58A6FF)**
- Use for: Call-to-action buttons, active states, links, primary navigation
- Don't use for: Body text, backgrounds, large areas
- Example: "Explore Pulse Feed" button

**Secondary Colors (Grays)**
- Use for: Borders, dividers, secondary text, backgrounds
- Don't use for: Primary actions, important information
- Example: Card borders, muted labels

**Status Colors (Green, Orange, Red)**
- Use ONLY for status indicators, badges, and alerts
- Green: Success, positive actions
- Orange: Warnings, caution
- Red: Errors, destructive actions
- Example: "Advanced" difficulty badge in purple, "Beginner" in green

### Implementing Colors in Code

**CSS Variables (in `client/src/index.css`):**

```css
:root {
  --primary: #0969DA;
  --foreground: #1A1A1A;
  --background: #FAFBFC;
  --border: #D0D7DE;
  --muted-foreground: #57606A;
}

.dark {
  --primary: #58A6FF;
  --foreground: #E8E9EB;
  --background: #0D1117;
  --border: #30363D;
  --muted-foreground: #8B949E;
}
```

**Using in Components:**

```tsx
// ✅ Good: Use semantic color variables
<div className="bg-background text-foreground border border-border">
  Content
</div>

// ❌ Wrong: Hard-coded colors
<div style={{ backgroundColor: "#0969DA", color: "white" }}>
  Content
</div>
```

### Color Contrast Requirements

All text must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Valid Combinations:**

| Text Color | Background | Contrast | Status |
|-----------|-----------|----------|--------|
| #1A1A1A | #FAFBFC | 16.5:1 | ✅ Excellent |
| #57606A | #FAFBFC | 7.2:1 | ✅ Good |
| #0969DA | #FAFBFC | 8.1:1 | ✅ Good |
| #E8E9EB | #0D1117 | 15.3:1 | ✅ Excellent |

---

## Typography System

### Philosophy

Typography creates hierarchy and guides the user's eye. We use **system fonts** for universal compatibility and performance.

**Why System Fonts?**
- Optimized for each operating system
- No font files to download (faster loading)
- Familiar to users
- Excellent readability

### Font Stack

```css
/* Display & Headings */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;

/* Body Text (same as above) */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;

/* Code & Technical */
font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
```

### Type Scale

**Hierarchy Levels:**

| Level | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| **H1** | 32px | 600 | 1.2 | Page titles, main headings |
| **H2** | 24px | 600 | 1.3 | Section headings |
| **H3** | 18px | 600 | 1.4 | Subsection headings |
| **H4** | 16px | 600 | 1.4 | Card titles |
| **Body** | 14px | 400 | 1.5 | Main content, descriptions |
| **Small** | 12px | 400 | 1.4 | Captions, metadata |
| **Code** | 13px | 400 | 1.5 | Code blocks, technical text |

### Typography in HTML/CSS

**HTML Structure:**

```html
<!-- ✅ Good: Semantic HTML with proper hierarchy -->
<h1>Page Title</h1>
<p>Introduction paragraph with body text.</p>
<h2>Section Heading</h2>
<p>Section content...</p>

<!-- ❌ Wrong: Using divs instead of semantic tags -->
<div class="text-4xl font-bold">Page Title</div>
<div>Introduction paragraph...</div>
```

**CSS Implementation:**

```css
h1 {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 1rem;
}

body {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--foreground);
}
```

### Typography Best Practices

**1. Maintain Hierarchy**
- Only one H1 per page
- Use H2 for main sections
- Use H3 for subsections
- Never skip heading levels (H1 → H3 is wrong)

**2. Line Length**
- Optimal line length: 50-75 characters
- Maximum width: 800px for body text
- Use `max-w-4xl` Tailwind class for content containers

**3. Readability**
- Minimum font size: 14px for body text
- Line height: 1.5 for body text
- Letter spacing: Normal (don't increase unless specifically needed)

**4. Emphasis**
- Use **bold** (600 weight) for emphasis, not ALL CAPS
- Use *italics* sparingly
- Avoid underline (reserved for links)

---

## Layout & Spacing

### Spacing Scale

We use a consistent spacing scale based on 8px increments:

```
4px   = xs
8px   = sm
12px  = md
16px  = lg
24px  = xl
32px  = 2xl
48px  = 3xl
64px  = 4xl
```

**In Tailwind Classes:**
```
p-1  = 4px padding
p-2  = 8px padding
p-3  = 12px padding
p-4  = 16px padding
p-6  = 24px padding
p-8  = 32px padding
```

### Layout Patterns

**1. Container Layout**

```tsx
<div className="container mx-auto px-4 py-12">
  {/* Content automatically centered with responsive padding */}
  {/* Max-width: 1200px on desktop */}
</div>
```

**2. Card Layout**

```tsx
<div className="professional-card p-6">
  {/* 
    - White background (light) / Dark gray (dark)
    - 1px border
    - Soft shadow
    - Rounded corners (8px)
    - Hover: Increased shadow, slight lift
  */}
</div>
```

**3. Grid Layout**

```tsx
{/* Two columns on mobile, three on desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* gap-6 = 24px spacing between items */}
</div>
```

**4. Sidebar + Content**

```tsx
<div className="flex">
  <aside className="w-64 bg-sidebar border-r border-border">
    {/* Fixed width sidebar */}
  </aside>
  <main className="flex-1">
    {/* Flexible content area */}
  </main>
</div>
```

### Whitespace Strategy

**Generous Whitespace = Premium Feel**

- Page sections: 48px vertical spacing
- Card sections: 24px vertical spacing
- Between elements: 16px minimum
- Never crowd elements together

**Example:**

```tsx
<section className="py-16 px-4 border-b border-border">
  {/* 16px vertical padding = 64px total (48px + 16px margins) */}
  <div className="container mx-auto">
    <h2 className="mb-12">Section Title</h2>
    {/* 12px = 48px spacing below heading */}
    
    <div className="space-y-6">
      {/* 6px = 24px spacing between items */}
    </div>
  </div>
</section>
```

---

## Component Library

### Button Component

**Variants:**

```tsx
// Primary: Use for main actions
<Button className="bg-primary hover:bg-primary/90 text-white">
  Explore Pulse Feed
</Button>

// Secondary: Use for alternative actions
<Button variant="outline" className="border-border hover:bg-muted">
  Learn More
</Button>

// Ghost: Use for tertiary actions
<Button variant="ghost" className="text-primary hover:bg-primary/10">
  View Details →
</Button>
```

**Sizing:**

```tsx
<Button size="sm">Small</Button>      {/* 8px padding */}
<Button size="md">Medium</Button>    {/* 10px padding (default) */}
<Button size="lg">Large</Button>     {/* 12px padding */}
```

**States:**

```tsx
// Hover: Background shifts, shadow increases
// Focus: Blue ring around button
// Disabled: Reduced opacity, no cursor
// Active: Slightly darker background
```

### Card Component

**Structure:**

```tsx
<div className="professional-card p-6">
  {/* Header */}
  <div className="flex items-start justify-between mb-4">
    <h3 className="text-lg font-semibold text-foreground">
      Card Title
    </h3>
    <Badge>Status</Badge>
  </div>

  {/* Content */}
  <p className="text-muted-foreground mb-4">
    Card description and content
  </p>

  {/* Footer */}
  <div className="flex items-center justify-between pt-4 border-t border-border">
    <span className="text-xs text-muted-foreground">Metadata</span>
    <Button variant="ghost" size="sm">
      Action →
    </Button>
  </div>
</div>
```

**Styling:**

```css
.professional-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 200ms ease-out;
}

.professional-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: var(--primary);
}
```

### Badge Component

**Usage:**

```tsx
// Difficulty levels
<Badge className="bg-green-50 text-green-700">Beginner</Badge>
<Badge className="bg-blue-50 text-blue-700">Intermediate</Badge>
<Badge className="bg-purple-50 text-purple-700">Advanced</Badge>

// Status types
<Badge className="bg-blue-50 text-blue-700">Paper</Badge>
<Badge className="bg-yellow-50 text-yellow-700">News</Badge>
<Badge className="bg-purple-50 text-purple-700">Repository</Badge>
```

### Input Component

**Structure:**

```tsx
<input
  type="text"
  placeholder="Search innovations..."
  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
/>
```

**States:**

- **Default**: Light border, muted placeholder
- **Focus**: Blue ring, border becomes transparent
- **Error**: Red border (add error state if needed)
- **Disabled**: Reduced opacity, no cursor

### Modal/Dialog Component

**Structure:**

```tsx
{/* Overlay */}
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  {/* Modal */}
  <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    {/* Header */}
    <div className="flex items-start justify-between p-6 border-b border-border sticky top-0 bg-card">
      <h2 className="text-2xl font-semibold text-foreground">
        Modal Title
      </h2>
      <button onClick={closeModal} className="p-2 hover:bg-muted rounded-md">
        <X size={20} />
      </button>
    </div>

    {/* Content */}
    <div className="p-6 space-y-6">
      {/* Content sections */}
    </div>

    {/* Footer */}
    <div className="flex gap-3 p-6 border-t border-border">
      <Button className="flex-1 bg-primary text-white">
        Confirm
      </Button>
      <Button variant="outline" className="flex-1">
        Cancel
      </Button>
    </div>
  </div>
</div>
```

---

## Animation & Motion

### Philosophy

Animations should be **purposeful, subtle, and respectful**. They enhance the experience without distracting. All animations respect `prefers-reduced-motion` for accessibility.

### Animation Types

**1. Entrance Animations**

Used when content first appears on the page.

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 300ms ease-out;
}

.animate-slide-up {
  animation: slideUp 300ms ease-out;
}
```

**Usage:**

```tsx
{/* Fade in on load */}
<div className="animate-fade-in">Content</div>

{/* Staggered entrance for lists */}
{items.map((item, idx) => (
  <div
    key={item.id}
    className="animate-slide-up"
    style={{ animationDelay: `${idx * 80}ms` }}
  >
    {item.content}
  </div>
))}
```

**2. Hover Animations**

Used for interactive elements.

```css
.professional-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: var(--primary);
  transition: all 200ms ease-out;
}

button:hover {
  background-color: var(--primary-hover);
  transform: scale(0.98);
  transition: all 150ms ease-out;
}
```

**3. Loading Animations**

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse-subtle {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

**Usage:**

```tsx
{isLoading && (
  <div className="flex items-center gap-2">
    <Loader2 size={20} className="animate-spin" />
    <span>Loading...</span>
  </div>
)}
```

### Animation Timing

| Duration | Use Case |
|----------|----------|
| 150ms | Quick interactions (hover, click) |
| 200ms | Standard transitions |
| 300ms | Entrance animations |
| 2s | Subtle background animations |

### Respecting Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This ensures users who prefer reduced motion won't see animations.

---

## Responsive Design

### Breakpoints

We use Tailwind's standard breakpoints:

```
sm: 640px   (tablets)
md: 768px   (small laptops)
lg: 1024px  (desktops)
xl: 1280px  (large desktops)
```

### Mobile-First Approach

**Always design for mobile first, then enhance for larger screens:**

```tsx
{/* Mobile: 1 column */}
{/* Tablet: 2 columns */}
{/* Desktop: 3 columns */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} item={item} />)}
</div>
```

### Responsive Typography

```tsx
{/* Mobile: 24px, Desktop: 32px */}
<h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
  Page Title
</h1>
```

### Responsive Spacing

```tsx
{/* Mobile: 16px, Desktop: 48px */}
<section className="py-8 md:py-12 lg:py-16">
  Content
</section>
```

### Sidebar Navigation (Mobile)

**Desktop:** Always visible sidebar
**Mobile:** Hamburger menu that slides in

```tsx
<aside
  className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transition-transform duration-300 ${
    sidebarOpen ? "translate-x-0" : "-translate-x-full"
  } lg:static lg:translate-x-0`}
>
  {/* Navigation content */}
</aside>
```

---

## Accessibility Standards

### WCAG AA Compliance

All implementations must meet WCAG AA standards:

**Color Contrast:**
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum

**Keyboard Navigation:**
- All interactive elements must be keyboard accessible
- Tab order should be logical
- Focus indicators must be visible

**Screen Readers:**
- Use semantic HTML (buttons, links, headings)
- Add ARIA labels where needed
- Describe images with alt text

### Implementation Checklist

```tsx
{/* ✅ Good: Semantic HTML */}
<button onClick={handleClick}>Click me</button>
<a href="/page">Link</a>
<h1>Page Title</h1>

{/* ❌ Wrong: Non-semantic */}
<div onClick={handleClick} role="button">Click me</div>
<div onClick={() => navigate('/page')}>Link</div>
<div className="text-4xl font-bold">Page Title</div>
```

**Focus Management:**

```tsx
{/* Visible focus ring */}
<button className="focus:ring-2 focus:ring-offset-2 focus:ring-primary">
  Click me
</button>
```

**ARIA Labels:**

```tsx
{/* For icon-only buttons */}
<button aria-label="Close modal" onClick={closeModal}>
  <X size={20} />
</button>

{/* For search inputs */}
<input
  type="search"
  aria-label="Search innovations"
  placeholder="Search..."
/>
```

---

## Implementation Guide

### Step-by-Step: Building a New Page

**1. Create Page Component**

```tsx
// client/src/pages/YourPage.tsx
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";

export default function YourPage() {
  return (
    <DashboardLayout currentPage="your-page">
      <div className="min-h-screen bg-background">
        {/* Page content */}
      </div>
    </DashboardLayout>
  );
}
```

**2. Add Page Header**

```tsx
{/* Always include a header with title and description */}
<div className="border-b border-border bg-card">
  <div className="container mx-auto px-4 py-12">
    <h1 className="text-4xl font-semibold text-foreground mb-2">
      Page Title
    </h1>
    <p className="text-muted-foreground">
      Page description or subtitle
    </p>
  </div>
</div>
```

**3. Add Main Content**

```tsx
<div className="container mx-auto px-4 py-12">
  <div className="max-w-4xl mx-auto">
    {/* Your content */}
  </div>
</div>
```

**4. Add to Router**

```tsx
// client/src/App.tsx
import YourPage from "./pages/YourPage";

function Router() {
  return (
    <Switch>
      <Route path={"/your-page"} component={YourPage} />
      {/* ... other routes ... */}
    </Switch>
  );
}
```

**5. Add to Navigation**

```tsx
// client/src/components/DashboardLayout.tsx
const navItems = [
  // ... existing items ...
  { label: "Your Page", href: "/your-page", id: "your-page" },
];
```

### Step-by-Step: Building a New Component

**1. Create Component File**

```tsx
// client/src/components/YourComponent.tsx
interface YourComponentProps {
  title: string;
  description: string;
  // ... other props
}

export default function YourComponent({
  title,
  description,
}: YourComponentProps) {
  return (
    <div className="professional-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
```

**2. Use Component**

```tsx
import YourComponent from "@/components/YourComponent";

export default function Page() {
  return (
    <div className="space-y-4">
      <YourComponent
        title="Component Title"
        description="Component description"
      />
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: List with Filters

**Structure:**

```tsx
export default function ListPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const items = [/* ... */];
  const filteredItems = selectedFilter === "all"
    ? items
    : items.filter(item => item.category === selectedFilter);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-semibold text-foreground mb-2">
              Page Title
            </h1>
            <p className="text-muted-foreground">Description</p>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilter(cat.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedFilter === cat.id
                      ? "bg-primary text-white"
                      : "bg-card border border-border hover:border-primary"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="professional-card p-6 animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Item content */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

### Pattern 2: Modal Dialog

**Structure:**

```tsx
export default function PageWithModal() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      {/* Main content */}
      <div className="grid gap-6">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="professional-card p-6 cursor-pointer"
          >
            {item.title}
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full">
            <div className="flex items-start justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-semibold text-foreground">
                {selectedItem.title}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-muted rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Modal content */}
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <Button className="flex-1 bg-primary text-white">
                Confirm
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedItem(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

### Pattern 3: Hero Section

**Structure:**

```tsx
<section className="relative py-20 px-4 overflow-hidden">
  {/* Background image with overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/40" />

  <div className="relative container mx-auto max-w-4xl text-center">
    {/* Badge */}
    <div className="inline-block mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
      <span className="text-sm font-medium text-primary">
        Badge Text
      </span>
    </div>

    {/* Title */}
    <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-6">
      Main Heading
      <br />
      <span className="text-primary">with Accent</span>
    </h1>

    {/* Description */}
    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
      Descriptive paragraph explaining the value proposition.
    </p>

    {/* CTA Buttons */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
        Primary Action
      </Button>
      <Button size="lg" variant="outline" className="border-border hover:bg-muted">
        Secondary Action
      </Button>
    </div>
  </div>
</section>
```

### Pattern 4: Grid of Cards

**Structure:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item, idx) => (
    <div
      key={item.id}
      className="professional-card p-6 animate-fade-in"
      style={{ animationDelay: `${idx * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {item.title}
        </h3>
        <Badge>{item.status}</Badge>
      </div>

      <p className="text-muted-foreground text-sm mb-4">
        {item.description}
      </p>

      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
        Learn More →
      </Button>
    </div>
  ))}
</div>
```

---

## Quick Reference Checklist

Use this checklist when building any new page or component:

### Design Checklist

- [ ] Colors use CSS variables (not hard-coded)
- [ ] Text contrast meets WCAG AA (4.5:1 minimum)
- [ ] Typography follows the scale (H1, H2, H3, Body, Small)
- [ ] Spacing uses the 8px scale (4, 8, 12, 16, 24, 32, 48, 64px)
- [ ] Cards use `.professional-card` class
- [ ] Buttons use primary/secondary/ghost variants
- [ ] Hover states are implemented
- [ ] Focus indicators are visible

### Component Checklist

- [ ] Component is in `client/src/components/`
- [ ] Component accepts TypeScript props with interface
- [ ] Component uses semantic HTML
- [ ] Component is responsive (mobile-first)
- [ ] Component respects theme (light/dark mode)
- [ ] Component has proper spacing and padding

### Page Checklist

- [ ] Page is in `client/src/pages/`
- [ ] Page uses `DashboardLayout` wrapper
- [ ] Page has header with title and description
- [ ] Page has proper spacing (py-12, py-16, etc.)
- [ ] Page is responsive on mobile/tablet/desktop
- [ ] Page has animations (fade-in, slide-up)
- [ ] Page is added to router in `App.tsx`
- [ ] Page is added to navigation in `DashboardLayout.tsx`

### Accessibility Checklist

- [ ] All buttons are keyboard accessible
- [ ] Focus rings are visible
- [ ] Images have alt text
- [ ] Form inputs have labels
- [ ] Color is not the only indicator
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Semantic HTML is used (h1-h6, button, a, etc.)

---

## Troubleshooting

### Issue: Colors Look Different in Dark Mode

**Solution:** Ensure you're using CSS variables, not hard-coded colors. The theme automatically switches variables based on `.dark` class.

```tsx
// ✅ Correct
<div className="bg-background text-foreground">

// ❌ Wrong
<div style={{ backgroundColor: "#FAFBFC", color: "#1A1A1A" }}>
```

### Issue: Animations Not Showing

**Solution:** Check that animations are applied and not being overridden by `prefers-reduced-motion`.

```tsx
// ✅ Correct
<div className="animate-slide-up" style={{ animationDelay: "0ms" }}>

// ❌ Wrong (no animation class)
<div className="slide-up">
```

### Issue: Text Not Readable

**Solution:** Verify color contrast. Use dark text on light backgrounds and light text on dark backgrounds.

```tsx
// ✅ Correct
<div className="bg-background text-foreground">
<div className="dark:bg-background dark:text-foreground">

// ❌ Wrong (low contrast)
<div className="bg-background text-muted-foreground">
```

### Issue: Layout Breaking on Mobile

**Solution:** Use responsive classes and test on mobile devices.

```tsx
// ✅ Correct (mobile-first)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ❌ Wrong (desktop-first)
<div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
```

---

## Resources

### Files to Reference

- **Theme Variables:** `client/src/index.css`
- **Components:** `client/src/components/`
- **Pages:** `client/src/pages/`
- **Layout:** `client/src/components/DashboardLayout.tsx`
- **Router:** `client/src/App.tsx`

### External Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Accessibility by Google](https://www.udacity.com/course/web-accessibility--ud891)
- [System Font Stack](https://systemfontstack.com/)

---

## Summary

The InnoBridge.AI design system is built on **professional restraint, consistency, and accessibility**. By following these guidelines, you can build pages and components that feel cohesive, premium, and intentional.

**Key Principles to Remember:**

1. **Use CSS variables** for colors (not hard-coded values)
2. **Follow the typography scale** for consistent hierarchy
3. **Respect the spacing scale** for balanced layouts
4. **Implement animations purposefully** for enhanced UX
5. **Test for accessibility** at every step
6. **Keep it simple** - less is more

When in doubt, ask: **"Does this choice reinforce or dilute our design philosophy?"**

Happy building! 🚀
