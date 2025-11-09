# 🌍 Personal Parcel Tracker — Thailand Post Edition

A modern, minimal web application for tracking international parcels sent via Thailand Post. Built with React, TypeScript, and TailwindCSS for an elegant and intuitive user experience.

## ✨ Features

- **Dashboard** - View all your parcels at a glance with tracking status and last updated date
- **Add Parcels** - Easily add new parcels with tracking number, sender name, destination country, and notes
- **Tracking Timeline** - See the complete journey of your parcel with timestamps and locations
- **Local Storage** - All data is saved locally in your browser (no server required)
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **REST API Ready** - Placeholder for future integration with Thailand Post API

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

## 📖 Usage

### Adding a Parcel

1. Click the **"+ Add Parcel"** button (floating button in bottom-right or in the header)
2. Fill in the required fields:
   - **Tracking Number** - Your parcel's tracking number (e.g., EP123456789TH)
   - **Destination Country** - Select from the dropdown list
3. Optionally add:
   - **Sender Name** - Who sent the parcel
   - **Description/Notes** - Any additional information
4. Click **"Save Parcel"** to add it to your tracker

### Viewing Parcel Details

1. From the dashboard, click the **"Details"** button on any parcel card
2. View the complete parcel information and tracking timeline
3. Click **"Refresh"** to manually update the tracking status
4. Click **"Delete Parcel"** to remove the parcel from your tracker

### Tracking Timeline

The timeline shows all tracking events for your parcel in chronological order, including:
- Event timestamp and location
- Status message (e.g., "Departed Thailand", "Arrived at destination")
- Visual timeline with markers for easy scanning

## 🎨 Design Philosophy

This app follows the **Ultrathink** design principle:

- **Simplicity with Soul** - Every element serves a purpose and feels obvious
- **Visual Clarity** - Clean whitespace, graceful motion, and no cognitive noise
- **Narrative Focus** - Users should "feel" their parcel's journey, not just read data
- **Minimal Aesthetic** - Modern light theme with subtle shadows and smooth transitions

## 🛠️ Technology Stack

- **Frontend Framework** - React 19 with TypeScript
- **Build Tool** - Vite
- **Styling** - TailwindCSS 4
- **State Management** - React Hooks + localStorage
- **UI Components** - shadcn/ui
- **Date Formatting** - date-fns
- **Routing** - Wouter
- **Icons** - Lucide React

## 📁 Project Structure

```
client/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── AddParcelModal.tsx
│   │   ├── ParcelCard.tsx
│   │   └── Timeline.tsx
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   └── ParcelDetail.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useLocalStorage.ts
│   ├── utils/           # Utility functions
│   │   ├── api.ts       # API placeholder
│   │   └── parcelStorage.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
└── index.html           # HTML template
```

## 🔌 API Integration

### Thailand Post API - Production Ready ✅

The app is now fully integrated with **Thailand Post Track & Trace API**. Real-time tracking data is fetched directly from Thailand Post's official API.

#### Setup

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Add your Thailand Post API token:
   ```env
   VITE_THAILAND_POST_API_URL=https://trackapi.thailandpost.co.th/post/api/v1/track
   VITE_THAILAND_POST_API_TOKEN=Token eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9...
   VITE_USE_MOCK_DATA=false
   ```

3. Get your API token from [Thailand Post Track API](https://trackapi.thailandpost.co.th/)

#### Features

- ✅ **Real-time tracking** from Thailand Post API
- ✅ **Response caching** (5 minutes) to reduce API calls
- ✅ **Automatic status mapping** from Thailand Post codes to app statuses
- ✅ **Date conversion** from Buddhist Era (พ.ศ.) to Gregorian (ค.ศ.)
- ✅ **Error handling** with fallback to mock data
- ✅ **Rate limiting** awareness (1500 requests/day)

#### Documentation

- [Thailand Post API Integration Guide](docs/THAILAND_POST_API_INTEGRATION.md)
- [Testing Guide](docs/TESTING_GUIDE.md)
- [Integration Plan](INTEGRATION_PLAN.md)

#### Mock Data Mode

For development without API access:
```env
VITE_USE_MOCK_DATA=true
```

## 💾 Data Storage

All parcel data is stored in the browser's localStorage under the key `parcels_tracker_data`. The data structure:

```json
{
  "id": "parcel_1762690995994_r2ngkqiab",
  "trackingNumber": "EP123456789TH",
  "senderName": "John Smith",
  "country": "Japan",
  "description": "Electronics package - fragile items",
  "status": "pending_dispatch",
  "history": [
    {
      "timestamp": "2025-11-01T10:00:00Z",
      "location": "Bangkok",
      "message": "Accepted by post office"
    }
  ],
  "createdAt": "2025-11-09T12:23:00Z",
  "updatedAt": "2025-11-09T12:23:00Z"
}
```

## 🎯 Color Scheme

- **Primary Blue** - `#0078D4` (main actions and accents)
- **Success Green** - `#00B894` (delivered status)
- **Warning Orange** - `#E67E22` (in transit status)
- **Danger Red** - `#E74C3C` (returned status)

## 📱 Responsive Breakpoints

- **Mobile** - Up to 640px
- **Tablet** - 640px to 1024px
- **Desktop** - 1024px and above

## 🚢 Building for Production

```bash
# Build the app
pnpm build

# Preview production build
pnpm preview
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📧 Support

For questions or issues, please open an issue on the repository.

---

**Made with ❤️ using the Ultrathink design philosophy**
