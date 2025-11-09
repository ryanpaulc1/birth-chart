# Birth Chart Web Application

A beautiful web application for generating astrological birth charts using Western astrology.

## Features

- 🌟 Interactive birth chart visualization
- 📅 Birth date, time, and location input
- 🗺️ Automatic city geocoding with timezone detection
- 🔮 Western astrology calculations via ProKerala API
- 💳 Stripe integration for print purchases (coming soon)
- 📱 Fully responsive design

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your machine
- ProKerala API account (for astrology calculations)
- Google Cloud account (for geocoding)

### 1. Clone and Install

```bash
cd birth-chart
bun install
```

### 2. Set Up API Keys

Create a `.env.local` file (already created for you) and add your API keys:

#### ProKerala API Setup

1. Sign up at [https://api.prokerala.com](https://api.prokerala.com)
2. Create an application in your dashboard
3. Copy your Client ID and Client Secret
4. Add to `.env.local`:
   ```
   PROKERALA_CLIENT_ID=your_client_id_here
   PROKERALA_CLIENT_SECRET=your_client_secret_here
   ```

#### Google Places/Geocoding API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable these APIs:
   - Geocoding API
   - Time Zone API
4. Create credentials (API Key)
5. Add to `.env.local`:
   ```
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

### 3. Run Development Server

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## API Routes

- `GET /api/auth` - Test ProKerala OAuth authentication
- `POST /api/birth-chart` - Generate birth chart data
- `GET /api/geocode?city=CityName` - Geocode city to coordinates

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Runtime**: Bun
- **APIs**:
  - ProKerala (Astrology)
  - Google Maps (Geocoding)
  - Stripe (Payments)

## Project Structure

```
birth-chart/
├── app/
│   ├── api/           # API routes
│   ├── chart/[id]/    # Chart display page
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── components/        # React components
├── lib/              # Utilities and API clients
└── public/           # Static assets
```

## Cost Estimates

### Free Tier (Development)
- ProKerala: 5,000 credits/month = ~6-10 full charts
- Google Geocoding: $200 free credit/month
- Vercel Hosting: Free for hobby projects

### Production Estimates
- ProKerala: $19/mo (100k credits) = ~150-200 charts
- Google Maps: ~$2.83/1k requests (geocoding)
- Stripe: 2.9% + $0.30 per transaction

## Deployment

Deploy to Vercel with one command:

```bash
vercel
```

Don't forget to add your environment variables in the Vercel dashboard!

## License

MIT
