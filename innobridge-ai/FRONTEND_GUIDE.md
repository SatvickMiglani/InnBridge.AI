# InnoBridge.AI Frontend Guide

## Design Philosophy: Neon Cyberpunk Minimalism

This frontend implements a vibrant, dual-theme design inspired by cyberpunk aesthetics combined with Japanese tech minimalism. The design conveys cutting-edge innovation while maintaining technical credibility and usability.

---

## 🎨 Visual Design System

### Color Palette

**Dark Mode (Default)**
- **Background**: Deep charcoal (#0F0F1E)
- **Foreground**: Light gray (#E8E8F0)
- **Primary Accent**: Neon cyan (#00D9FF)
- **Secondary Accent**: Electric magenta (#FF006E)
- **Tertiary Accent**: Acid yellow (#FFBE0B)
- **Card Background**: Dark navy (#1A1A2E)

**Light Mode**
- **Background**: Off-white (#F8F9FA)
- **Foreground**: Deep navy (#1A1A2E)
- **Primary Accent**: Vibrant teal (#00D9FF)
- **Secondary Accent**: Hot pink (#FF006E)
- **Tertiary Accent**: Acid yellow (#FFBE0B)
- **Card Background**: Pure white (#FFFFFF)

### Typography

- **Display Headings**: Space Mono (bold) - Technical, futuristic feel
- **Body Text**: Inter (regular) - Clean, readable
- **Code/Technical**: JetBrains Mono (regular/medium) - Monospaced for precision

### Key Design Elements

1. **Neon Glow Effects**: Interactive elements feature subtle glow on hover
2. **Geometric Precision**: Sharp angles and clean grid systems
3. **Asymmetric Layout**: Left sidebar with main content area
4. **Card-Based Feed**: Staggered animations on scroll
5. **Minimal Whitespace**: Strategic use of breathing room

---

## 🏗️ Project Structure

```
client/src/
├── pages/
│   ├── Home.tsx           # Pulse Feed dashboard
│   ├── News.tsx           # Technical news aggregation
│   ├── Papers.tsx         # ArXiv research papers
│   ├── Repos.tsx          # GitHub repositories
│   ├── Search.tsx         # Deep search interface
│   ├── Blueprints.tsx     # Project specifications
│   └── NotFound.tsx       # 404 page
├── components/
│   ├── DashboardLayout.tsx # Main layout wrapper
│   ├── FeedCard.tsx        # Reusable feed card component
│   └── ui/                 # shadcn/ui components
├── contexts/
│   └── ThemeContext.tsx    # Light/dark theme management
├── lib/
│   └── utils.ts           # Utility functions
├── App.tsx                # Router and theme setup
├── main.tsx               # React entry point
└── index.css              # Global styles and theme variables
```

---

## 🎯 Pages Overview

### Home (Pulse Feed)
- **Purpose**: Personalized innovation discovery dashboard
- **Features**:
  - Hero section with animated gradient background
  - Search bar for quick access
  - Curated feed of trending items
  - Feature highlights section
- **Components**: Hero, Search, FeedCard, Features grid

### News
- **Purpose**: Technical news aggregation from NewsAPI
- **Features**:
  - Category filtering (AI/LLM, Web3, DevOps, Security, ML)
  - Difficulty-based sorting
  - Real-time news updates
- **Components**: Category filters, FeedCard grid

### Papers
- **Purpose**: Research papers from ArXiv
- **Features**:
  - Difficulty-level filtering
  - AI-generated one-minute summaries
  - Citation and impact metrics
- **Components**: Difficulty filters, FeedCard grid

### Repos
- **Purpose**: Trending GitHub repositories
- **Features**:
  - Language filtering (Python, JavaScript, Rust, Go, TypeScript)
  - Star and fork statistics
  - Contributor counts
- **Components**: Language filters, FeedCard grid

### Search
- **Purpose**: Deep semantic search across all sources
- **Features**:
  - Real-time search input
  - Quick suggestion chips
  - Multi-source results
  - Loading states
- **Components**: Search input, Result grid, Suggestions

### Blueprints
- **Purpose**: Instant project specifications
- **Features**:
  - Project cards with difficulty levels
  - Tech stack suggestions
  - One-minute summaries
  - Modal details view
- **Components**: Blueprint cards, Modal, Tech stack badges

---

## 🎨 Component Library

### FeedCard
Reusable component for displaying feed items across all pages.

**Props**:
- `title`: string - Item title
- `description`: string - Item description
- `source`: "news" | "paper" | "repo" | "discussion"
- `category`: string (optional) - Category badge
- `difficulty`: "beginner" | "intermediate" | "advanced" (optional)
- `timestamp`: string (optional) - Publication/update time
- `link`: string (optional) - External link
- `stats`: Array of {label, value} (optional) - Statistics display

**Features**:
- Source-specific icons and colors
- Difficulty badges with color coding
- Hover effects with neon glow
- Statistics grid
- External link button

### DashboardLayout
Main layout wrapper providing navigation and theme management.

**Features**:
- Responsive sidebar (collapsible on mobile)
- Top navigation bar with search
- Theme toggle button
- Active page highlighting
- Mobile hamburger menu

---

## 🌓 Theme System

### Implementation
- Uses React Context (`ThemeContext`) for state management
- Stores preference in localStorage
- CSS variables for dynamic color switching
- Smooth 300ms transition on theme change

### Usage
```tsx
import { useTheme } from "@/contexts/ThemeContext";

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Switch to {theme === "dark" ? "light" : "dark"} mode
    </button>
  );
}
```

---

## ✨ Animation Guidelines

### Entrance Animations
- **Cards**: Fade-in + slide-up (200ms ease-out)
- **Stagger**: 50-100ms delay between items
- **Fill Mode**: Both (animation-fill-mode: both)

### Hover Effects
- **Cards**: Border glow intensifies, shadow expands
- **Buttons**: Scale 0.95 → 1.0 on click
- **Links**: Text color shifts to accent color

### Loading States
- **Skeleton Loaders**: Pulsing gradient animation
- **Search**: Spinning icon with loading text

### Transitions
- **Theme Switch**: 300ms cross-fade
- **Page Navigation**: Instant (handled by router)

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px - Single column, full-width cards
- **Tablet**: 640px - 1024px - Two-column layout
- **Desktop**: > 1024px - Three-column layout with sidebar

### Mobile Optimizations
- Collapsible sidebar (hamburger menu)
- Stacked navigation
- Touch-friendly button sizes
- Optimized font sizes for readability

---

## 🔧 Customization Guide

### Changing Colors
Edit `/client/src/index.css`:
```css
:root {
  --primary: #00D9FF;  /* Neon cyan */
  --secondary: #FF006E;  /* Electric magenta */
  --accent: #FFBE0B;  /* Acid yellow */
  /* ... more colors ... */
}
```

### Adjusting Typography
Modify font families in `/client/index.html` Google Fonts link and update `/client/src/index.css`:
```css
h1, h2, h3, h4, h5, h6 {
  font-family: "Your Font", sans-serif;
}
```

### Adding New Pages
1. Create component in `/client/src/pages/`
2. Import in `/client/src/App.tsx`
3. Add route to Router component
4. Add navigation item in `DashboardLayout`

---

## 🚀 Performance Optimizations

- **Image Optimization**: All assets use CDN URLs (no local files)
- **Code Splitting**: Pages loaded on-demand via wouter
- **CSS-in-JS**: Minimal runtime overhead with Tailwind
- **Animation Performance**: GPU-accelerated transforms
- **Lazy Loading**: Components load only when needed

---

## 🎯 Accessibility

- **Keyboard Navigation**: All interactive elements accessible via Tab
- **Focus Indicators**: Visible focus rings on all buttons
- **Color Contrast**: WCAG AA compliant text contrast
- **Semantic HTML**: Proper heading hierarchy and ARIA labels
- **Screen Readers**: Descriptive labels and alt text

---

## 📊 Future Enhancements

- [ ] User profile page with personalization settings
- [ ] Saved items/bookmarks functionality
- [ ] Advanced filtering and sorting options
- [ ] Real-time notifications
- [ ] Integration with backend APIs
- [ ] Dark mode animations
- [ ] Infinite scroll pagination
- [ ] Advanced search filters

---

## 🛠️ Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check

# Format code
pnpm format
```

---

## 📝 Notes

- All components use shadcn/ui for consistency
- Tailwind CSS 4 with custom theme variables
- React 19 with TypeScript
- Wouter for client-side routing
- No external API calls (mock data for demo)

---

## 🎨 Design Inspiration

- **Cyberpunk Aesthetics**: Neon colors, geometric shapes, high contrast
- **Japanese Minimalism**: Clean layouts, whitespace, precision
- **Modern Tech**: Figma, Vercel, Linear design systems
- **Data Visualization**: Clear information hierarchy, visual clarity
