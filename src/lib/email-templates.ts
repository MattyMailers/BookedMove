interface CompanyBrand {
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
}

function layout(brand: CompanyBrand, content: string): string {
  const pc = brand.primaryColor || '#2563eb';
  const logo = brand.logoUrl
    ? `<img src="${brand.logoUrl}" alt="${brand.name}" style="height:40px;max-width:160px;object-fit:contain;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,${pc},${brand.accentColor || pc});padding:24px 32px;">
<table><tr>${logo ? `<td style="padding-right:12px;">${logo}</td>` : ''}<td><span style="color:#fff;font-size:18px;font-weight:700;">${brand.name}</span></td></tr></table>
</td></tr>
<tr><td style="padding:32px;">${content}</td></tr>
<tr><td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
<span style="color:#9ca3af;font-size:12px;">Powered by <a href="https://bookedmove.com" style="color:${pc};text-decoration:none;font-weight:600;">BookedMove</a></span>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">${label}</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#111827;font-size:14px;">${value}</td></tr>`;
}

export function bookingConfirmationEmail(brand: CompanyBrand, booking: any): { subject: string; html: string } {
  return {
    subject: `Booking Confirmed — ${booking.booking_ref}`,
    html: layout(brand, `
<h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Your Move is Booked! ✅</h2>
<p style="color:#6b7280;margin:0 0 24px;font-size:14px;">Here are your booking details:</p>
<table width="100%" style="background:#f9fafb;border-radius:12px;padding:16px;" cellpadding="0" cellspacing="0">
${row('Reference', booking.booking_ref)}
${row('Move Date', booking.move_date)}
${booking.time_slot ? row('Time', booking.time_slot) : ''}
${row('From', booking.origin_address)}
${row('To', booking.destination_address)}
${booking.estimated_price ? row('Estimated Price', '$' + Number(booking.estimated_price).toLocaleString()) : ''}
${booking.deposit_amount ? row('Deposit', '$' + Number(booking.deposit_amount).toLocaleString()) : ''}
</table>
<p style="color:#9ca3af;font-size:12px;margin:24px 0 0;">Questions? Contact ${brand.name} directly.</p>
`),
  };
}

export function bookingAlertEmail(brand: CompanyBrand, booking: any): { subject: string; html: string } {
  return {
    subject: `New Booking: ${booking.customer_name} — ${booking.booking_ref}`,
    html: layout(brand, `
<h2 style="margin:0 0 8px;color:#111827;font-size:22px;">New Booking Received 🎉</h2>
<p style="color:#6b7280;margin:0 0 24px;font-size:14px;">A customer just booked through your widget.</p>
<table width="100%" style="background:#f9fafb;border-radius:12px;padding:16px;" cellpadding="0" cellspacing="0">
${row('Customer', booking.customer_name)}
${row('Email', booking.customer_email)}
${booking.customer_phone ? row('Phone', booking.customer_phone) : ''}
${row('Ref', booking.booking_ref)}
${row('Move Date', booking.move_date)}
${row('From', booking.origin_address)}
${row('To', booking.destination_address)}
${booking.estimated_price ? row('Estimate', '$' + Number(booking.estimated_price).toLocaleString()) : ''}
${booking.notes ? row('Notes', booking.notes) : ''}
</table>
<p style="margin:24px 0 0;"><a href="https://bookedmove.com/dashboard" style="background:${brand.primaryColor || '#2563eb'};color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">View in Dashboard</a></p>
`),
  };
}

export function bookingStatusEmail(brand: CompanyBrand, booking: any, newStatus: string): { subject: string; html: string } {
  const messages: Record<string, string> = {
    confirmed: 'Your move has been confirmed! We\'ll see you on the scheduled date.',
    cancelled: 'Your booking has been cancelled. If this was unexpected, please contact us.',
    completed: 'Your move is complete! Thank you for choosing us.',
  };
  return {
    subject: `Booking ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} — ${booking.booking_ref}`,
    html: layout(brand, `
<h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Booking ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</h2>
<p style="color:#6b7280;margin:0 0 24px;font-size:14px;">${messages[newStatus] || `Your booking status has been updated to: ${newStatus}`}</p>
<table width="100%" style="background:#f9fafb;border-radius:12px;padding:16px;" cellpadding="0" cellspacing="0">
${row('Reference', booking.booking_ref)}
${row('Move Date', booking.move_date)}
${row('Status', newStatus.charAt(0).toUpperCase() + newStatus.slice(1))}
</table>
`),
  };
}

export function paymentReceiptEmail(brand: CompanyBrand, booking: any, amount: number, transactionId: string): { subject: string; html: string } {
  return {
    subject: `Payment Receipt — ${booking.booking_ref}`,
    html: layout(brand, `
<h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Payment Received 💳</h2>
<p style="color:#6b7280;margin:0 0 24px;font-size:14px;">Thank you for your payment.</p>
<table width="100%" style="background:#f9fafb;border-radius:12px;padding:16px;" cellpadding="0" cellspacing="0">
${row('Amount Paid', '$' + amount.toFixed(2))}
${row('Transaction ID', transactionId)}
${row('Booking Ref', booking.booking_ref)}
${row('Move Date', booking.move_date)}
</table>
<p style="color:#9ca3af;font-size:12px;margin:24px 0 0;">Keep this email as your receipt.</p>
`),
  };
}

export function teamInviteEmail(brand: CompanyBrand, inviteUrl: string, role: string): { subject: string; html: string } {
  return {
    subject: `You're invited to join ${brand.name} on BookedMove`,
    html: layout(brand, `
<h2 style="margin:0 0 8px;color:#111827;font-size:22px;">You're Invited! 🤝</h2>
<p style="color:#6b7280;margin:0 0 24px;font-size:14px;">${brand.name} has invited you to join their team as a <strong>${role}</strong>.</p>
<p style="margin:0 0 24px;"><a href="${inviteUrl}" style="background:${brand.primaryColor || '#2563eb'};color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">Accept Invitation</a></p>
<p style="color:#9ca3af;font-size:12px;">Or copy this link: ${inviteUrl}</p>
`),
  };
}

export function welcomeEmail(brand: CompanyBrand): { subject: string; html: string } {
  return {
    subject: `Welcome to BookedMove! 🚀`,
    html: layout(brand, `
<h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Welcome to BookedMove! 🎉</h2>
<p style="color:#6b7280;margin:0 0 16px;font-size:14px;">Your account for <strong>${brand.name}</strong> is ready.</p>
<p style="color:#6b7280;margin:0 0 24px;font-size:14px;">Here's how to get started:</p>
<ol style="color:#374151;font-size:14px;padding-left:20px;line-height:2;">
<li>Set up your pricing rules</li>
<li>Customize your widget colors &amp; branding</li>
<li>Embed the booking widget on your website</li>
<li>Start accepting bookings!</li>
</ol>
<p style="margin:24px 0 0;"><a href="https://bookedmove.com/dashboard" style="background:${brand.primaryColor || '#2563eb'};color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">Go to Dashboard</a></p>
`),
  };
}
