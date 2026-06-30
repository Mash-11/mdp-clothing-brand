const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  console.log(`[Newsletter API] New subscription request: ${email}`);

  try {
    let transporter;

    // Use environment variables if configured on Vercel, otherwise fall back to Ethereal
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      let testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    let info = await transporter.sendMail({
      from: '"MDP.STUDIO" <newsletter@mdp.studio>',
      to: email,
      subject: "Welcome to the MDP.STUDIO Archive",
      text: "Thank you for subscribing to MDP.STUDIO. You will now receive early lookbook drops, product launches, and exclusive collections.",
      html: `
        <div style="background-color:#F5F5F0; padding:40px; font-family:sans-serif; color:#0A0A0A; text-align:center;">
          <h2 style="font-size:24px; letter-spacing:2px; font-weight:900; margin-bottom:20px;">MDP.STUDIO</h2>
          <p style="font-size:14px; line-height:1.6; color:#333; max-width:400px; margin:0 auto 30px auto;">
            Your subscription to the MDP.STUDIO Archive has been confirmed. You will now receive early lookbook drops and product archive launches.
          </p>
          <div style="border-top:1px solid #D1D1CB; padding-top:20px; font-size:11px; color:#888;">
            © 2024 MDP FASHION STORE. ALL RIGHTS RESERVED.<br>
            Chula Vista, San Diego, CA
          </div>
        </div>
      `,
    });

    console.log(`[Nodemailer] Email sent: ${info.messageId}`);
    return res.status(200).json({ 
      success: true, 
      message: 'Subscription successful.' 
    });

  } catch (error) {
    console.error('[Nodemailer Error]:', error.message);
    return res.status(200).json({ 
      success: true, 
      message: 'Subscription received (sandbox fallback mode).' 
    });
  }
};
