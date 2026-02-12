import { Resend } from 'resend';
import { run } from './db';

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  companyId?: number;
  bookingId?: number;
  emailType?: string;
}

export async function sendEmail({ to, subject, html, from, companyId, bookingId, emailType }: SendEmailParams): Promise<boolean> {
  const sender = from || process.env.EMAIL_FROM || 'BookedMove <noreply@bookedmove.com>';
  const resend = getResend();

  if (resend) {
    try {
      await resend.emails.send({ from: sender, to, subject, html });
      if (emailType && companyId) {
        await logEmail(companyId, bookingId || null, emailType, to, 'sent');
      }
      return true;
    } catch (e: any) {
      console.error('[Email] Send failed:', e.message);
      if (emailType && companyId) {
        await logEmail(companyId, bookingId || null, emailType, to, 'failed');
      }
      return false;
    }
  }

  // Dev fallback: log to console
  console.log(`[Email] TO: ${to} | SUBJECT: ${subject}`);
  console.log(`[Email] HTML length: ${html.length} chars`);
  if (emailType && companyId) {
    await logEmail(companyId, bookingId || null, emailType, to, 'logged');
  }
  return true;
}

async function logEmail(companyId: number, bookingId: number | null, emailType: string, recipient: string, status: string) {
  try {
    await run('INSERT INTO email_log (company_id, booking_id, email_type, recipient, status) VALUES (?,?,?,?,?)',
      [companyId, bookingId, emailType, recipient, status]);
  } catch {}
}
