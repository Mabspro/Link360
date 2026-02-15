# Link360: Quick Implementation Guide

## Get Award-Winning Results in 2 Hours

This guide focuses on the **highest-impact, lowest-effort** changes you can make today.

---

## Hour 1: Core Animations

### Step 1: Install Framer Motion (5 minutes)

```bash
npm install framer-motion
```

### Step 2: Add Animation Utilities (10 minutes)

Create `lib/animations.ts`:

```typescript
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const cardHover = {
  whileHover: { y: -6, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)' },
  transition: { type: 'spring', stiffness: 300, damping: 25 }
};
```

### Step 3: Animate Your Hero Section (15 minutes)

Update your homepage hero:

```tsx
import { motion } from 'framer-motion';

// Wrap your hero content
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  {/* Your existing hero content */}
</motion.div>

// Animate the badge pulse
<motion.span 
  className="w-2 h-2 bg-green-500 rounded-full"
  animate={{ scale: [1, 1.3, 1] }}
  transition={{ duration: 1.5, repeat: Infinity }}
/>

// Animate CTA button
<motion.a
  href="#pools"
  className="btn-primary"
  whileHover={{ scale: 1.03, y: -2 }}
  whileTap={{ scale: 0.98 }}
>
  Pledge Your Space
</motion.a>
```

### Step 4: Add Card Hover Effects (15 minutes)

Wrap your pool cards:

```tsx
<motion.div
  whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)' }}
  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
>
  {/* Your pool card content */}
</motion.div>
```

### Step 5: Animate the Thermometer (15 minutes)

Update your progress bar:

```tsx
<motion.div
  className="h-full bg-blue-500 rounded-full"
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
/>

// Add ship icon that moves
<motion.div
  className="absolute top-1/2 -translate-y-1/2 text-xl"
  initial={{ left: '0%' }}
  animate={{ left: `${percentage}%` }}
  transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
>
  🚢
</motion.div>
```

---

## Hour 2: Polish & Micro-interactions

### Step 6: Add Button Press Effects (10 minutes)

All buttons should have:

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
>
  Button Text
</motion.button>
```

### Step 7: Add Scroll-Triggered Animations (15 minutes)

For sections that appear on scroll:

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-100px' }}
  transition={{ duration: 0.5 }}
>
  {/* Section content */}
</motion.div>
```

### Step 8: Add Loading States (15 minutes)

Create `components/Skeleton.tsx`:

```tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
  );
}

// Usage while loading
<div className="space-y-4">
  <Skeleton className="h-6 w-2/3" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-32 w-full" />
</div>
```

### Step 9: Add Toast Notifications (15 minutes)

Create `components/Toast.tsx`:

```tsx
import { motion, AnimatePresence } from 'framer-motion';

export function Toast({ message, isVisible, onClose }: { message: string; isVisible: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Step 10: Add Reduced Motion Support (5 minutes)

```tsx
// hooks/useReducedMotion.ts
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Usage
const prefersReducedMotion = useReducedMotion();

<motion.div
  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
>
```

---

## Copy-Paste Components

### Animated Pool Card

```tsx
'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function AnimatedPoolCard({ pool, stats, index }: { pool: any; stats: any; index: number }) {
  const percentage = stats.pct_full || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/pool/${pool.slug}`}>
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 p-6 cursor-pointer"
          whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">{pool.title}</h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Open for Pledges
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Container Fill</span>
              <span className="font-bold">{percentage.toFixed(0)}% Full</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Pledged:</span>{' '}
              <span className="font-semibold">{stats.total_ft3?.toLocaleString()} ft³</span>
            </div>
            <div>
              <span className="text-gray-500">Pledges:</span>{' '}
              <span className="font-semibold">{stats.pledge_count}</span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
```

### Animated Button

```tsx
'use client';
import { motion } from 'framer-motion';

export function AnimatedButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      {...props}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`px-6 py-3 bg-orange-600 text-white rounded-lg font-medium ${props.className}`}
    >
      {children}
    </motion.button>
  );
}
```

---

## Before & After Checklist

### Homepage
- [ ] Hero fades in on load
- [ ] Badge has pulsing dot
- [ ] CTA button lifts on hover
- [ ] Pool cards lift on hover
- [ ] Progress bars animate on scroll
- [ ] "How it works" section animates on scroll

### Pool Detail Page
- [ ] Stats cards animate with counting numbers
- [ ] Thermometer fills smoothly
- [ ] Ship icon moves with progress
- [ ] Form accordions expand smoothly
- [ ] Submit button has loading state

### Global
- [ ] All buttons have hover/tap effects
- [ ] Page transitions are smooth
- [ ] Loading states show skeletons
- [ ] Toast notifications appear
- [ ] Reduced motion is respected

---

## Testing Your Changes

### Visual Testing
1. Load homepage → Hero should fade in
2. Scroll down → Cards should animate in
3. Hover over card → Should lift up
4. Click on pool → Progress bar should animate
5. Hover over button → Should lift slightly

### Accessibility Testing
1. Enable reduced motion in OS settings
2. Refresh page → Animations should be instant
3. Tab through page → All interactive elements should be focusable

### Performance Testing
1. Open DevTools → Performance tab
2. Record while scrolling → Should be 60fps
3. Check for layout thrashing

---

## Expected Results

| Metric | Before | After (2 hours) |
|--------|--------|-----------------|
| **Perceived Quality** | Good | Premium |
| **User Engagement** | Static | Interactive |
| **Time on Page** | Baseline | +20% |
| **Delight Factor** | Functional | Memorable |

---

## Next Steps

After these quick wins, consider:
1. Adding the full components from `AWARD_WINNING_GUIDE.md`
2. Implementing features from `WOULD_BE_NICE_FEATURES.md`
3. Adding analytics tracking
4. Performance optimization

---

*2 hours of work = Award-winning feel. Let's do this!* 🚀
