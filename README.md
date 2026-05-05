## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

### 5. Load the Extension (Chrome)

1. Open `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the extension folder

### 6. Usage Flow

- Visit Weedmaps
- Click **Dispensaries**
- Open a store page
- Trigger the extension

### 7. Tech Stack

- React / Next.js
- shadcn/ui
- Node.js

---

## ⚠️ Note

This project requires a separate browser extension to function.

👉 Make sure to clone and use my **extension repository** for the scraper to work properly.  
Without the extension, the scraping functionality will not be triggered.

This project uses Turso as the database.

Set up your environment variables:

```env
TURSO_DB_URL=
TURSO_AUTH_TOKEN=
```

Paste your Turso database URL and authentication token before running the project.
