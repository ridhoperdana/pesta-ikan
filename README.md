# Pesta Ikan

A web-based arcade game inspired by Feeding Frenzy, built with a modern full-stack JavaScript architecture.

## 1. Development

### Folder Structure
- `client/`: React frontend (Vite)
  - `src/components/`: Reusable UI components and game canvas logic.
  - `src/pages/`: Main application routes (Home, Game).
  - `src/hooks/`: Custom React hooks for state and data fetching.
- `server/`: Express backend
  - `routes.ts`: API endpoint definitions and business logic.
  - `storage.ts`: Data persistence layer (PostgreSQL).
  - `db.ts`: Database connection configuration.
- `shared/`: Shared TypeScript types and Zod schemas used by both frontend and backend.

### Code Standards
- **TypeScript**: Strictly typed codebase for both frontend and backend.
- **Drizzle ORM**: Used for database schema definition and type-safe queries.
- **Shadcn UI**: Component library for a consistent and professional look.
- **Tailwind CSS**: Utility-first styling.
- **API First**: Endpoints are defined in `shared/routes.ts` before implementation.

## 2. How to Run

### Native (Local Development)
1. **Prerequisites**: Node.js v20+, PostgreSQL.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Setup Database**:
   Set the `DATABASE_URL` environment variable in a `.env` file.
   ```bash
   npm run db:push
   ```
4. **Start Application**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5000`.

### Using Docker
1. **Build Image**:
   ```bash
   docker build -t pesta-ikan .
   ```
2. **Run Container**:
   ```bash
   docker run -p 5000:5000 --env DATABASE_URL=your_postgres_url pesta-ikan
   ```

## 3. Deployment

### Replit (Recommended)
This app is optimized for Replit.
1. Click the **Publish** button in the Replit interface.
2. Replit will automatically handle the build, database provisioning, and hosting.

### Other Platforms (Heroku, Vercel, DigitalOcean)
1. **Build the frontend**: `npm run build`.
2. **Setup Environment**: Ensure `DATABASE_URL` and `SESSION_SECRET` are set.
3. **Start the production server**: `npm start`.
4. Ensure the platform supports Node.js and can connect to a PostgreSQL instance.
