# MahaIND Conversion Sheet API

This is the backend API for the MahaIND Conversion Sheet module.

## Setup Instructions

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Environment Variables (`server/.env`):
   ```
   PORT=3000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   GOOGLE_SA_JSON={"type":"service_account",...}
   PRODUCTION_DOMAIN=http://localhost:5173
   ```

3. Database Setup:
   Execute the `server/supabase_migration_conversion_sheet.sql` script in your Supabase SQL Editor.

4. Run the server:
   ```bash
   npm run start
   ```

## Integration with React Frontend

The React frontend handles authentication via Supabase Auth and passes the JWT in the `Authorization` header to this API server.

- Ensure `VITE_API_URL` in your frontend `.env` points to `http://localhost:3000/api/v1`.
- The frontend will perform CRUD operations by hitting `/api/v1/:stage`.
- Background Google Sheets sync happens automatically on successful data insertions.
