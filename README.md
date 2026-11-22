# Umrah Taxi Online - Admin & Dispatch Portal

Next.js 16 + TypeScript + Tailwind CSS Admin Operations Web App for [Umrah Taxi Online](https://umrahtaxionline.com).

## Overview
This portal provides full management over all Supabase database tables:
1. **Bookings & Dispatch (`/bookings`)**: Manage incoming pilgrim booking leads, customer phone numbers, flight monitoring, passenger/luggage details, and one-click direct WhatsApp dispatch.
2. **Site Settings (`/settings`)**: Dynamically edit customer support phone numbers, WhatsApp dispatch numbers, support email, Makkah & Madinah office addresses, and cancellation policies.
3. **Fleet & Vehicles (`/vehicles`)**: Add, edit, or toggle vehicle models (Camry, Staria, HiAce, Yukon XL), capacities, and feature lists.
4. **Routes Catalog (`/routes`)**: Configure corridors between Jeddah Airport (KAIA), Makkah, and Madinah, as well as Holy Ziyarat tours.
5. **Pricing Matrix (`/pricing`)**: Interactive grid allowing instant click-and-edit SAR rate adjustments per vehicle and route.
6. **Chauffeurs & Drivers (`/drivers`)**: Manage Saudi TGA-verified chauffeurs, phone numbers, license IDs, and trip assignment statuses.
7. **Pilgrim Reviews (`/testimonials`)**: Approve, edit, or create verified pilgrim testimonials and star ratings.
8. **FAQs & Guides (`/faqs`)**: Manage dynamic questions and answers.

---

## Getting Started

### 1. Development Mode
Run the admin portal on port 3001 (to run concurrently with the main client web app on port 3000):
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### 2. Production Build
```bash
npm run build
npm run start
```

### 3. Supabase Live Connection
Configure your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://lbfmxgnxihujjcrzhjzn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
*(If no Supabase key is provided, the admin portal operates in offline Demo Storage mode with full interactive localStorage persistence so no functionality breaks).*
