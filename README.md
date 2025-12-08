# Network Buddy

A professional networking application with business card scanning, contact management, and intelligent enrichment powered by AI.

## Features

- **Business Card Scanner** - Capture and extract contact information using OpenAI Vision (GPT-4o)
- **Contact Management** - Organize and manage your professional network
- **Auto-Enrichment** - Automatically enhance contacts with LinkedIn, company data, and recent news
- **Authentication** - Secure user authentication via Supabase
- **Stripe Integration** - Pro subscription features
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **TypeScript** - Full type safety

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# OpenAI API Key for business card OCR (GPT-4o Vision)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Places API (for location enrichment)
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PRO_PRICE_ID=your_stripe_price_id_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Optional: Serper API for LinkedIn and company search enrichment
SERPER_API_KEY=your_serper_api_key_here
```

### 3. Database Setup

Run the database migration SQL in your Supabase SQL Editor to create the required tables and Row Level Security policies.

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Deployment

This application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure all environment variables in Vercel project settings
3. Deploy automatically on push to main branch

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI/ML**: OpenAI GPT-4o Vision for OCR
- **Payments**: Stripe
- **Deployment**: Vercel

## Key Features Workflow

1. **Scan Business Card** → Upload/capture image
2. **OCR Processing** → Extract contact info using OpenAI Vision
3. **Review & Edit** → Verify extracted data
4. **Save Contact** → Store in Supabase database
5. **Auto-Enrich** → Enhance with LinkedIn, company data, news
6. **View Contact** → Access full enriched profile
