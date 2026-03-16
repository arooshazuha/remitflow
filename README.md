# RemitFlow - FinTech Remittance Demo

A full-stack, cross-platform mobile-first web app demonstrating a modern remittance architecture. 

Features:
- **Debit/Credit Card Payments**: Secure Stripe tokenization (PCI-DSS compliant).
- **Stripe Webhooks**: Cryptographically verified background webhooks for capturing funds securely.
- **Double-Entry Wallet Ledger**: Prisma/SQLite tracking wallet balances and history.
- **Instant Payouts Simulation**: Transferring funds instantly updates the ledger for the recipient.
- **KYC/AML flow**: Enforced verification before funding wallets.
- **Modern UI**: Next.js, Tailwind CSS, Lucide Icons.

## Architecture

* **Frontend**: Next.js 15 (App Router), TailwindCSS, Stripe React Elements.
* **Backend**: Node.js, Express, Prisma ORM, JWT Auth, Stripe SDK.
* **Database**: SQLite (Local Dev) -> Easily deployable as PostgreSQL on Render/Railway.

---

## 🚀 Running Locally

### 1. Backend Setup
1. CD into the backend `cd backend`
2. Install dependencies `npm install`
3. Setup environment variables by copying `.env.example` to `.env`. Ensure your Stripe API keys are configured:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `JWT_SECRET`
4. Setup the database: `npx prisma db push`
5. Start the server: `npm start` (Runs on port 3001)

### 2. Frontend Setup
1. CD into the frontend `cd frontend`
2. Install dependencies `npm install`
3. Set your internal constants in `src/config.ts` (Already points to `http://localhost:3001` backend).
4. Run the development server: `npm run dev`
5. Open your browser to `http://localhost:3000`.

### 3. Testing Stripe Webhooks
To test adding funds locally, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):
```bash
stripe login
stripe listen --forward-to localhost:3001/api/webhook/stripe
```
Copy the webhook secret provided by the CLI and place it in your backend `.env` file under `STRIPE_WEBHOOK_SECRET`. Use a test card like `4242 4242 4242 4242` to add funds.

---

## 🌍 Deployment Instructions

### Backend (Render or Railway)
1. Commit the project to GitHub.
2. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service / App**.
3. Set the root directory to `backend`.
4. Build command: `npm install && npx prisma db push`
5. Start command: `node src/index.js`
6. Add the environment variables (`DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `JWT_SECRET`).
   * For database, configure a free tier PostgreSQL database and point `DATABASE_URL` there.

### Frontend (Vercel)
1. In [Vercel](https://vercel.com), create a new Project.
2. Set the root directory to `frontend`.
3. Vercel will auto-detect Next.js. 
4. Don't forget to define the `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` environment variable.
5. In `src/config.ts`, change `API_URL` to your newly deployed Render/Railway backend URL before pushing.
6. Deploy!
