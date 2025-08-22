import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key (only if provided)
const apiKey = process.env.SENDGRID_API_KEY || '';
console.log('SendGrid API Key configured:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No');
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export async function sendLoginCode(email: string, code: string, challengeId: string) {
  const fromAddress = process.env.MAIL_FROM_ADDRESS || 'no-reply@fitq.local';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
  const loginUrl = `${baseUrl}/login?challenge=${challengeId}&code=${code}`;
  
  console.log('Sending email from:', fromAddress, 'to:', email);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Login code for ${email}: ${code}`);
    console.log(`[DEV] Login URL: ${loginUrl}`);
  }
  // Dev fallback: if no SENDGRID_API_KEY, log the code and return
  if (!apiKey) {
    console.warn('[DEV] SENDGRID_API_KEY not configured. Using console fallback for login code.');
    console.log(`[DEV] Login code for ${email}: ${code}`);
    console.log(`[DEV] Login URL: ${loginUrl}`);
    return { mocked: true } as any;
  }
  
  const msg = {
    to: email,
    from: {
      email: fromAddress,
      name: 'FitQ Studio'
    },
    subject: 'FitQ sisselogimise kood',
    text: `Teie FitQ sisselogimise kood: ${code}\n\nVõi klikkige siia: ${loginUrl}\n\nKood aegub 10 minuti pärast.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #40b236; font-size: 28px; margin: 0;">FitQ Studio</h1>
        </div>
        
        <div style="background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2c313a; font-size: 20px; margin-top: 0;">Tere!</h2>
          
          <p style="font-size: 16px; color: #4d5665; line-height: 1.5; margin-bottom: 30px;">
            Logi FitQ-sse sisse ühe klikiga:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #40b236, #60cc56); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(64, 178, 54, 0.3);">
              Logi sisse nüüd
            </a>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 14px; color: #828ea0; margin-bottom: 10px;">
              Või sisesta kood käsitsi:
            </p>
            <div style="background-color: #f5f7fa; padding: 20px; text-align: center; margin: 15px 0; border-radius: 8px; border: 2px dashed #e1e8f0; user-select: all;">
              <span style="font-size: 42px; font-weight: bold; letter-spacing: 10px; color: #2c313a; font-family: 'Courier New', monospace; user-select: all;">${code}</span>
            </div>
            <p style="font-size: 12px; color: #828ea0; margin-top: 10px;">
              Kliki koodile, et see kopeerida
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e1e8f0; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #828ea0; line-height: 1.5; margin-bottom: 0;">
            • Kood aegub 10 minuti pärast<br>
            • Ärge jagage seda linki ega koodi kellegagi<br>
            • Kui te ei tellinud seda koodi, võite selle kirja ignoreerida
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="font-size: 12px; color: #828ea0;">
            © ${new Date().getFullYear()} FitQ Studio. Kõik õigused kaitstud.<br>
            <a href="https://fitq.me" style="color: #40b236; text-decoration: none;">fitq.me</a>
          </p>
        </div>
      </div>
    `,
  };

  try {
    const response = await sgMail.send(msg);
    console.log('SendGrid response:', response[0].statusCode, response[0].headers);
    console.log('Email sent successfully to:', email);
    return response;
  } catch (error: any) {
    console.error('SendGrid error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.body,
      statusCode: error.response?.statusCode
    });
    throw error;
  }
}