# Password Vault

A secure password generator and vault built with **Next.js**, **TypeScript**, and **MongoDB**.
Users can register, log in, generate strong passwords, and store them securely. Email verification with a 6‑digit PIN is included for registration and login.

---

## Setup & Installation

1) Clone the repository

```bash
git clone https://github.com/your-username/Password-vault.git
cd Password-vault
```

2) Install dependencies

```bash
npm install
```

3) Create environment variables

Copy the example `.env`:

```bash
cp .env.example .env.local
```

Fill in your credentials in `.env.local`:

```env
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-super-secure-jwt-secret-key
NEXTAUTH_SECRET=another-secret-for-encryption-key-derivation

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com
```

Note: Never upload `.env.local` to GitHub. `.env.example` can be safely shared.

4) Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Usage

- Register a new user → check your email for the 6‑digit PIN and verify
- Login with email + password → enter the PIN sent to your email
- Start adding passwords to your vault

## Available Scripts

| Command       | Description                    |
| ------------- | ------------------------------ |
| `npm run dev` | Run development server         |
| `npm run build` | Build project for production |
| `npm run start` | Start production server      |
| `npm run lint` | Run ESLint                    |

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Next.js API Routes (Node.js)
- Database: MongoDB
- Email Service: SMTP (Gmail, Outlook, Mailtrap, etc.)
