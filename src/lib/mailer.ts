import nodemailer, { Transporter } from 'nodemailer';

export async function sendEmailPin(
  to: string,
  code: string,
  purpose: 'register' | 'login'
): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.FROM_EMAIL || user || 'no-reply@example.com';

  if (!host || !user || !pass) {
    console.warn(`[MAILER] SMTP not configured. Fallback PIN for ${to}: ${code}`);
    return;
  }

  let transporter: Transporter;

  try {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // SSL for 465, TLS for 587
      auth: { user, pass },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[MAILER] Failed to create transporter:', message);
    return;
  }

  const subject =
    purpose === 'register' ? 'Your Registration PIN' : 'Your Login PIN';
  const text = `Your ${purpose} verification code is: ${code}. It expires in 10 minutes.`;

  try {
    const info = await transporter.sendMail({ from, to, subject, text });
    console.log(`[MAILER] Email sent to ${to}. Message ID: ${info.messageId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[MAILER] Failed to send email:', message);
  }
}
