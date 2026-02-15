# Link360 UI/UX Implementation Guide

This guide walks you through implementing the award-winning UI/UX redesign for Link360 Shipping.

## Quick Start

### 1. Install Dependencies

```bash
# Animation library
npm install framer-motion

# Number animations
npm install @number-flow/react

# Icons (if not already installed)
npm install lucide-react

# Tailwind forms plugin
npm install -D @tailwindcss/forms
```

### 2. Update Tailwind Config

Replace your `tailwind.config.ts` with the provided `design-system/tailwind.config.ts`.

### 3. Update Global Styles

Replace your `app/globals.css` with the provided `design-system/globals.css`.

### 4. Add Components

Copy the components from the `components/` folder to your project:
- `AnimatedThermometer.tsx`
- `PoolCard.tsx`
- `PledgeForm.tsx`

## Component Usage

### AnimatedThermometer

```tsx
import { AnimatedThermometer, HorizontalThermometer } from '@/components/AnimatedThermometer';

// Vertical thermometer (default)
<AnimatedThermometer
  current={1624}
  max={2390}
  threshold={1792} // 75% of max
  unit="ft³"
  label="Container Fill"
  size="md"
/>

// Horizontal thermometer (better for desktop)
<HorizontalThermometer
  current={1624}
  max={2390}
  threshold={1792}
  unit="ft³"
  label="Container Fill Progress"
/>
```

### PoolCard

```tsx
import { PoolCard, PoolCardCompact } from '@/components/PoolCard';

<PoolCard
  pool={{
    id: 'uuid',
    slug: 'norcal-lusaka-march',
    title: 'NorCal → Lusaka (March Window)',
    destination_city: 'Lusaka',
    container_type: '40ft',
    usable_ft3: 2390,
    announce_threshold_pct: 75,
    status: 'collecting',
    is_public: true,
    created_at: '2024-01-15T00:00:00Z',
  }}
  stats={{
    pool_id: 'uuid',
    total_ft3: 1624,
    total_internal_ft3: 0,
    total_paid_ft3: 1624,
    est_revenue: 12450,
    pledge_count: 23,
    pct_full: 68,
  }}
  variant="detailed"
  index={0} // For stagger animation
/>
```

### PledgeForm

```tsx
import { PledgeForm } from '@/components/PledgeForm';

<PledgeForm
  poolId="uuid"
  pricing={{
    ratePerIn3: 0.0145,
    inCityStopFee: 25,
    outOfCityBaseFee: 25,
    outOfCityPerBoxFee: 15,
  }}
  onSubmit={async (data) => {
    // Submit to your API
    await fetch('/api/pledges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }}
/>
```

## Page Implementations

### Home Page (`app/page.tsx`)

```tsx
import { PoolCard } from '@/components/PoolCard';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Package, Shield, Users, TrendingUp } from 'lucide-react';

export default async function HomePage() {
  // Fetch pools from Supabase
  const pools = await fetchActivePools();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-20 md:py-32">
        <div className="container-wide text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Now accepting pledges for March
            </span>
            
            <h1 className="heading-display mb-6">
              Ship with Confidence from
              <br />
              <span className="text-gradient">NorCal to Zambia</span>
            </h1>
            
            <p className="text-body-lg max-w-2xl mx-auto mb-8">
              Join our community-driven shipping pools. Pledge your space, watch the container fill, 
              and ship when we hit our goal. No payment until confirmed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#pools" className="btn-primary btn-lg">
                Pledge Your Space
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/pricing" className="btn-secondary btn-lg">
                See How It Works
              </Link>
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                No payment until confirmed
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Community-driven
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                Transparent pricing
              </span>
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                Reliable delivery
              </span>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
      </section>

      {/* Active Pools Section */}
      <section id="pools" className="section">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="heading-2">Active Shipping Pools</h2>
              <p className="text-body mt-2">Choose a destination and pledge your space</p>
            </div>
            <Link href="/pools" className="btn-ghost hidden sm:flex">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {pools.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pools.map((pool, index) => (
                <PoolCard
                  key={pool.id}
                  pool={pool}
                  stats={pool.stats}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <EmptyPoolsState />
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-gray-50">
        <div className="container-narrow text-center">
          <h2 className="heading-2 mb-4">How Link360 Works</h2>
          <p className="text-body mb-12">Four simple steps to ship your goods</p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Pledge Your Space', desc: 'Estimate your cargo volume and costs' },
              { step: '2', title: 'Watch Progress', desc: 'See the container fill in real-time' },
              { step: '3', title: 'Container Announced', desc: 'Once threshold is met, we confirm' },
              { step: '4', title: 'Ship with Confidence', desc: 'Your goods arrive safely in Zambia' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyPoolsState() {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Pools</h3>
      <p className="text-gray-600 mb-6">We're preparing our next shipping window.</p>
      {/* Email signup form */}
    </div>
  );
}
```

### Pool Detail Page (`app/pool/[slug]/page.tsx`)

```tsx
import { HorizontalThermometer } from '@/components/AnimatedThermometer';
import { PledgeForm } from '@/components/PledgeForm';
import { notFound } from 'next/navigation';

export default async function PoolPage({ params }: { params: { slug: string } }) {
  const pool = await fetchPoolBySlug(params.slug);
  if (!pool) notFound();
  
  const pricing = await fetchPricingConfig();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-wide py-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>🚢</span>
            <span>Active Pool</span>
          </div>
          <h1 className="heading-1 mb-6">{pool.title}</h1>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              value={`${pool.stats.pct_full.toFixed(0)}%`} 
              label="Full"
              color="blue"
            />
            <StatCard 
              value={pool.stats.total_ft3.toLocaleString()} 
              label="ft³ pledged"
              color="green"
            />
            <StatCard 
              value={`$${pool.stats.est_revenue.toLocaleString()}`} 
              label="Est. revenue"
              color="purple"
            />
            <StatCard 
              value={pool.stats.pledge_count.toString()} 
              label="Pledges"
              color="orange"
            />
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Thermometer + Info */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="heading-3 mb-6">Container Progress</h2>
              <HorizontalThermometer
                current={pool.stats.total_ft3}
                max={pool.usable_ft3}
                threshold={(pool.usable_ft3 * pool.announce_threshold_pct) / 100}
                unit="ft³"
              />
            </div>
            
            {/* Prohibited Items */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Prohibited Items</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <span>❌ Hazardous materials</span>
                <span>❌ Perishable goods</span>
                <span>❌ Illegal items</span>
                <span>❌ Weapons</span>
                <span>❌ Cash/currency</span>
                <span>❌ Live animals</span>
              </div>
            </div>
          </div>

          {/* Right: Pledge Form */}
          <div className="card p-6">
            <h2 className="heading-3 mb-6">Make Your Pledge</h2>
            <PledgeForm
              poolId={pool.id}
              pricing={pricing}
              onSubmit={async (data) => {
                'use server';
                await createPledge(data);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className={`p-4 rounded-xl ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}
```

## Animation Patterns

### Page Load Animation
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
>
  Content here
</motion.div>
```

### Stagger Children
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }}
>
  {items.map((item, i) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Hover Effects
```tsx
<motion.div
  whileHover={{ y: -4, scale: 1.02 }}
  transition={{ duration: 0.2 }}
>
  Card content
</motion.div>
```

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

## Accessibility Checklist

- [ ] All interactive elements have focus states
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Form inputs have associated labels
- [ ] Images have alt text
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announcements for dynamic content

## Performance Tips

1. **Lazy load components** below the fold
2. **Use `will-change` sparingly** for animations
3. **Optimize images** with WebP format
4. **Code split** admin routes
5. **Use skeleton screens** for data loading states

## Testing

```bash
# Run accessibility audit
npm run lint:a11y

# Test responsive design
npm run dev
# Open http://localhost:3000 and test at different viewport sizes
```

## Support

For questions or issues with the implementation, refer to:
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
