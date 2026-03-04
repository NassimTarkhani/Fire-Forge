# FireForge API Playground - Implementation Prompt

## Project Overview
Build a modern, interactive playground/dashboard for the FireForge API - a web scraping and crawling gateway built on Firecrawl. The playground should allow users to test all API endpoints, manage their API keys, purchase credits, and view usage statistics.

## Backend API Information
**Deployed API Base URL:** `https://fireforge.kapturo.online`

**Payment Checkout Link:** `https://polar.sh/checkout/polar_c_G1eHjiRDzWGLMTlJVgbcjfkorKdpd7Eo0gjcO0bpbvW`

## Available API Endpoints

### Health Check
- `GET /health` - Check API status (no auth required)

### Firecrawl Operations (Prefix: `/v1`)
All firecrawl endpoints require `Authorization: Bearer {api_key}` header.

#### Core Operations
- `POST /v1/scrape` - Scrape a single URL
  - Body: `{ "url": "string", "formats": ["markdown", "html"], "onlyMainContent": true, "includeTags": [], "excludeTags": [], "headers": {}, "waitFor": 0, "timeout": 30000 }`
  
- `POST /v1/crawl` - Start a crawl job
  - Body: `{ "url": "string", "excludePaths": [], "includePaths": [], "maxDepth": 2, "limit": 10, "allowBackwardLinks": false, "allowExternalLinks": false, "ignoreSitemap": false, "scrapeOptions": {} }`

- `GET /v1/crawl/{job_id}` - Get crawl job status

- `DELETE /v1/crawl/{job_id}` - Cancel a crawl job

- `POST /v1/map` - Map website structure
  - Body: `{ "url": "string", "search": "optional search term", "ignoreSitemap": false, "includeSubdomains": false, "limit": 5000 }`

- `POST /v1/search` - Search across crawled content
  - Body: `{ "query": "string", "limit": 10, "lang": "en", "country": "us", "location": "optional", "tbs": "optional", "filter": "optional", "timeout": 30000 }`

- `POST /v1/batch/scrape` - Batch scrape multiple URLs
  - Body: `{ "urls": ["string"], "formats": ["markdown"], "onlyMainContent": true, "excludeTags": [], "includeTags": [], "headers": {}, "waitFor": 0 }`

### Admin Operations (Prefix: `/admin`)
All admin endpoints require `Authorization: Bearer {admin_master_key}` header.

#### User Management
- `POST /admin/users` - Create a new user
  - Body: `{ "email": "string", "name": "string", "initial_credits": 0 }`

- `GET /admin/users` - List all users

- `GET /admin/users/{user_id}` - Get user details

- `PUT /admin/users/{user_id}` - Update user
  - Body: `{ "name": "string", "email": "string", "credits": 100, "is_active": true }`

#### API Key Management
- `POST /admin/api-keys` - Create API key for a user
  - Body: `{ "user_id": "uuid", "name": "string" }`
  - Returns: `{ "key": "fireforge_xxx", "key_id": "uuid", "user_id": "uuid", "name": "string", "created_at": "timestamp" }`

- `GET /admin/api-keys` - List all API keys

- `POST /admin/api-keys/revoke` - Revoke an API key
  - Body: `{ "key_id": "uuid" }`

### Polar Payment Operations (Prefix: `/polar`)
- `POST /polar/webhook` - Webhook endpoint for Polar (internal use, signature verified)

- `POST /polar/admin/payments` - Get payments with filters (admin only)
  - Body: `{ "user_id": "optional uuid", "status": "optional", "order_id": "optional" }`

- `GET /polar/admin/payments/{payment_id}` - Get payment details (admin only)

- `POST /polar/admin/payments/{payment_id}/reprocess` - Reprocess failed payment (admin only)

- `GET /polar/admin/payments/user/{user_id}` - Get user's payments (admin only)

## Technical Stack Requirements

### Frontend Framework
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **React 18+**

### UI Component Library
- **shadcn/ui** - Use for all UI components (buttons, inputs, cards, dialogs, tabs, etc.)
- Link: https://ui.shadcn.com/

### Styling
- **Tailwind CSS** - Already configured with shadcn
- **Dark mode support** - Implement theme toggle
- Modern, clean design with good use of whitespace

### State Management
- **React Hooks** (useState, useEffect, useContext)
- **Local Storage** for API key persistence
- Optional: **Zustand** for global state if needed

### API Integration
- **Fetch API** or **Axios** for HTTP requests
- Create reusable API client service
- Implement proper error handling with toast notifications

### Additional Libraries
- **react-syntax-highlighter** - For displaying JSON/code responses
- **react-markdown** - For rendering markdown from scrape results
- **lucide-react** - Icons (comes with shadcn)
- **sonner** - Toast notifications (shadcn recommendation)

## UI/UX Requirements

### Design Principles
1. **Clean & Modern** - Inspired by Vercel, Linear, and modern SaaS dashboards
2. **Responsive** - Mobile-first design, works on all screen sizes
3. **Intuitive** - Clear navigation, helpful tooltips, good UX patterns
4. **Fast** - Optimistic UI updates, loading states, proper error handling
5. **Accessible** - Follow WCAG guidelines, keyboard navigation, screen reader support

### Color Scheme
- Use shadcn's default theme as base
- Primary: Blue/Purple gradient for CTAs
- Success: Green for successful operations
- Warning: Amber for warnings
- Error: Red for errors
- Neutral: Slate/Gray for backgrounds

### Layout Structure
```
├── Navigation Bar (top)
│   ├── Logo + Title
│   ├── Navigation Links (Playground, Docs, Pricing)
│   ├── Theme Toggle (dark/light)
│   └── User Menu (API Key, Credits, Logout)
│
├── Sidebar (left, collapsible on mobile)
│   ├── API Endpoints (grouped)
│   │   ├── Scraping
│   │   ├── Crawling  
│   │   ├── Mapping
│   │   ├── Search
│   │   └── Batch Operations
│   └── Admin Section (if admin key set)
│       ├── Users
│       ├── API Keys
│       └── Payments
│
└── Main Content Area
    ├── Endpoint Header (method, path, description)
    ├── Request Configuration Panel
    │   ├── Authentication (API key input/status)
    │   ├── Parameters (dynamic form based on endpoint)
    │   └── Request Body (JSON editor with syntax highlighting)
    ├── Action Button ("Send Request", loading state)
    ├── Response Panel
    │   ├── Tabs: Response, Headers, Timing
    │   ├── Status Code Badge
    │   ├── JSON Response (syntax highlighted, collapsible)
    │   └── Copy/Download buttons
    └── Credits Info (remaining credits, cost per operation)
```

## Core Features to Implement

### 1. API Key Management
- Input field to enter and save API key (stored in localStorage)
- Visual indicator when key is set (green checkmark)
- Option to test key validity (call /health first, then a test endpoint)
- Clear/Remove key button
- Admin key separate input (different color/styling)

### 2. Interactive API Playground
- **Endpoint Selection**: Sidebar with all endpoints grouped by category
- **Dynamic Forms**: Generate form fields based on endpoint parameters
- **Request Builder**: 
  - URL parameters
  - JSON body editor with syntax highlighting
  - Headers editor (auto-include Authorization)
- **Send Request Button**: Loading state with spinner
- **Response Display**:
  - Status code with color coding (green 2xx, yellow 3xx, red 4xx/5xx)
  - Formatted JSON with collapsible sections
  - Raw response toggle
  - Copy to clipboard button
  - Download response as JSON
- **Request History**: Save last 10 requests per endpoint (localStorage)

### 3. Credits & Usage Dashboard
- Display current credits (fetch from user endpoint)
- Credit cost per operation type:
  - Scrape: 1 credit
  - Crawl: 1 credit per page
  - Map: 1 credit
  - Search: 1 credit per result
- Usage graph (optional, nice to have)
- "Buy Credits" CTA button linking to Polar checkout

### 4. Buy Credits Flow
- Prominent "Buy Credits" button in header
- Modal/Page explaining credit packages
- Direct link to: `https://polar.sh/checkout/polar_c_G1eHjiRDzWGLMTlJVgbcjfkorKdpd7Eo0gjcO0bpbvW`
- After payment, show success message (user should refresh to see updated credits)

### 5. Code Generation
- For each request, show equivalent code in multiple languages:
  - cURL
  - JavaScript (fetch/axios)
  - Python (requests)
  - Node.js
- One-click copy button for each

### 6. Admin Panel (when admin key is set)
- **User Management**:
  - List users in table (sortable, searchable)
  - Create new user form
  - Edit user modal (update credits, name, email)
  - View user details (credits, API keys, usage)
- **API Key Management**:
  - List all keys in table
  - Create new key for user (show key once, copy button)
  - Revoke key with confirmation
- **Payment Management**:
  - List payments in table (filterable by user, status)
  - View payment details
  - Reprocess failed payments

### 7. Documentation Sidebar
- For each endpoint, show:
  - Description of what it does
  - Required parameters with types
  - Optional parameters with defaults
  - Example requests
  - Example responses
  - Credit cost
  - Rate limits (if any)

### 8. Getting Started Guide
- Welcome screen on first visit
- Step-by-step:
  1. Get your API key (link to admin contact or buy credits)
  2. Try a simple scrape
  3. View your credits
  4. Explore other endpoints
- Dismissible, can be reopened from menu

## Example Component Structure

```
app/
├── layout.tsx (root layout, theme provider)
├── page.tsx (landing/home)
├── playground/
│   ├── layout.tsx (playground layout with sidebar)
│   ├── page.tsx (default playground view)
│   └── [endpoint]/page.tsx (dynamic endpoint pages)
├── docs/
│   └── page.tsx (API documentation)
└── pricing/
    └── page.tsx (credits pricing)

components/
├── ui/ (shadcn components)
├── playground/
│   ├── Sidebar.tsx
│   ├── EndpointSelector.tsx
│   ├── RequestBuilder.tsx
│   ├── ResponseViewer.tsx
│   ├── CodeGenerator.tsx
│   └── CreditsDisplay.tsx
├── admin/
│   ├── UserTable.tsx
│   ├── APIKeyTable.tsx
│   └── PaymentTable.tsx
├── layout/
│   ├── Header.tsx
│   ├── ThemeToggle.tsx
│   └── UserMenu.tsx
└── shared/
    ├── JsonEditor.tsx
    └── StatusBadge.tsx

lib/
├── api/
│   ├── client.ts (API client with auth)
│   ├── endpoints/
│   │   ├── firecrawl.ts
│   │   ├── admin.ts
│   │   └── polar.ts
│   └── types.ts (TypeScript types for all API models)
└── utils/
    ├── storage.ts (localStorage helpers)
    └── code-generator.ts (code snippet generation)
```

## Key Implementation Details

### 1. API Client Setup
```typescript
// lib/api/client.ts
const BASE_URL = 'https://fireforge.kapturo.online';

export class FireForgeAPI {
  private apiKey?: string;
  private adminKey?: string;

  constructor(apiKey?: string, adminKey?: string) {
    this.apiKey = apiKey;
    this.adminKey = adminKey;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    
    if (this.apiKey && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.apiKey}`);
    }
    
    headers.set('Content-Type', 'application/json');

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Implement methods for each endpoint
  async scrape(data: ScrapeRequest) {
    return this.request('/v1/scrape', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // ... more methods
}
```

### 2. Local Storage for Keys
```typescript
// lib/utils/storage.ts
export const STORAGE_KEYS = {
  API_KEY: 'fireforge_api_key',
  ADMIN_KEY: 'fireforge_admin_key',
  REQUEST_HISTORY: 'fireforge_history',
};

export function saveAPIKey(key: string) {
  localStorage.setItem(STORAGE_KEYS.API_KEY, key);
}

export function getAPIKey(): string | null {
  return localStorage.getItem(STORAGE_KEYS.API_KEY);
}

// Similar for admin key and history
```

### 3. Code Generation Example
```typescript
// lib/utils/code-generator.ts
export function generateCurl(endpoint: string, method: string, body?: any, apiKey?: string) {
  let cmd = `curl -X ${method} https://fireforge.kapturo.online${endpoint}`;
  
  if (apiKey) {
    cmd += ` \\\n  -H "Authorization: Bearer ${apiKey}"`;
  }
  
  cmd += ` \\\n  -H "Content-Type: application/json"`;
  
  if (body) {
    cmd += ` \\\n  -d '${JSON.stringify(body, null, 2)}'`;
  }
  
  return cmd;
}

// Similar for other languages
```

## Nice-to-Have Features
1. **WebSocket Support**: Real-time updates for long-running crawl jobs
2. **Request Collections**: Save and organize favorite requests
3. **Team Collaboration**: Share API keys and requests with team
4. **Usage Analytics**: Charts showing API usage over time
5. **Webhook Testing**: Test webhook endpoints locally
6. **Mock Data**: Provide example data for testing without using credits
7. **API Versioning**: Support for future API versions
8. **Export/Import**: Export requests as Postman collection

## Testing Checklist
- [ ] API key authentication works
- [ ] Admin key authentication works
- [ ] All firecrawl endpoints callable
- [ ] All admin endpoints callable (with admin key)
- [ ] Response display handles different response types
- [ ] Error messages are user-friendly
- [ ] Loading states show during requests
- [ ] Dark mode toggle works
- [ ] Mobile responsive design
- [ ] Code generation copies correctly
- [ ] Credits display updates after operations
- [ ] Polar checkout link works
- [ ] Request history persists across sessions

## Development with v0.dev
Since you mentioned using 21st.dev (assuming you meant v0.dev), you can:

1. Start by prompting v0 with specific components:
   - "Create a modern API playground sidebar with shadcn components"
   - "Build a JSON response viewer with syntax highlighting"
   - "Design a credits dashboard card showing remaining credits"

2. Iterate on designs in v0, then export and integrate into Next.js

3. Use v0 for complex components like:
   - The request builder form
   - Admin tables with sorting/filtering
   - User management modals
   - Payment history timeline

## Getting Started Steps
1. Create Next.js app: `npx create-next-app@latest fireforge-playground --typescript --tailwind --app`
2. Install shadcn: `npx shadcn-ui@latest init`
3. Add required components: `npx shadcn-ui@latest add button input card tabs dialog table`
4. Set up API client with TypeScript types
5. Build core layout (header, sidebar, main content)
6. Implement endpoint pages one by one
7. Add admin panel
8. Polish UI/UX and add loading states
9. Test all features
10. Deploy (Vercel recommended for Next.js)

## Final Notes
- Focus on **developer experience** - make it easy to understand and use the API
- Provide **clear feedback** - success/error messages, loading states
- Make it **beautiful** - use shadcn's components effectively, good spacing, modern design
- Ensure **performance** - lazy load components, optimize images, minimize bundle size
- Add **helpful tooltips** - explain parameters, credit costs, response fields

---

**API Base URL**: `https://fireforge.kapturo.online`  
**Buy Credits**: `https://polar.sh/checkout/polar_c_G1eHjiRDzWGLMTlJVgbcjfkorKdpd7Eo0gjcO0bpbvW`

Good luck building an amazing playground! 🚀
