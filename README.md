# Password Vault

A secure password generator and vault built with **Next.js**, **TypeScript**, and **MongoDB**.  
Users can register, log in, generate strong passwords, and store them securely. Email verification with a 6-digit PIN is included for both registration and login.

---

## **Features**

- User registration with email + password  
- Email verification via 6-digit PIN  
- Login with email verification PIN  
- Password generator and vault  
- Responsive UI with dark/light theme toggle  
- Built with Next.js, TypeScript, Tailwind CSS, and MongoDB  

---

## **Setup & Installation**

1. **Clone the repository**

```bash
git clone https://github.com/your-username/Password-vault.git
cd Password-vault
Install dependencies

bash
Copy code
npm install
Create environment variables

Copy the example .env:

bash
Copy code
cp .env.example .env.local
Fill in your credentials in .env.local:

env
Copy code
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-super-secure-jwt-secret-key
NEXTAUTH_SECRET=another-secret-for-encryption-key-derivation

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com
Note: Never upload .env.local to GitHub. Use .env.example for sharing config structure.

Run the development server

bash
Copy code
npm run dev
The app will run at http://localhost:3000

Usage
Open http://localhost:3000 in your browser

Register a new user → check your email for the 6-digit PIN

Login with email + password → enter PIN from email

Start adding passwords to your vault

Scripts
Command	Description
npm run dev	Run development server
npm run build	Build project for production
npm run start	Start production server
npm run lint	Run ESLint

Tech Stack
Frontend: Next.js, TypeScript, Tailwind CSS

Backend: Next.js API Routes (Node.js)

Database: MongoDB (Atlas)

Email Service: SMTP (Gmail, Outlook, etc.)

Notes
Ensure SMTP credentials are valid for email PIN verification.

For Gmail, use an App Password if 2FA is enabled.

.env.local contains sensitive data and should not be shared.


