const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Assets from root
app.use(express.static(path.join(__dirname)));

// Nodemailer Newsletter API
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  console.log(`[Newsletter] New subscription request received for: ${email}`);

  try {
    let transporter;

    // Use environment variables if configured, otherwise fall back to Ethereal test account
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
      console.log(`[Nodemailer] Using configured SMTP: ${process.env.SMTP_HOST}`);
    } else {
      let testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
      console.log(`[Nodemailer] Using Ethereal sandbox: ${testAccount.user}`);
    }

    // Send newsletter verification email
    let info = await transporter.sendMail({
      from: '"MDP.STUDIO" <newsletter@mdp.studio>',
      to: email,
      subject: "Welcome to the MDP.STUDIO Archive",
      text: "Thank you for subscribing to MDP.STUDIO. You will now receive early lookbook drops, product launches, and exclusive collections.",
      html: `
        <div style="background-color:#F5F5F0; padding:40px; font-family:sans-serif; color:#0A0A0A; text-align:center;">
          <h2 style="font-size:24px; letter-spacing:2px; font-weight:900; margin-bottom:20px;">MDP.STUDIO</h2>
          <p style="font-size:14px; line-height:1.6; color:#333; max-width:400px; margin:0 auto 30px auto;">
            Your subscription to the MDP.STUDIO Archive has been confirmed. You will now receive notifications for exclusive lookbook drops and product archive launches.
          </p>
          <div style="border-top:1px solid #D1D1CB; padding-top:20px; font-size:11px; color:#888;">
            © 2024 MDP FASHION STORE. ALL RIGHTS RESERVED.<br>
            Chula Vista, San Diego, CA
          </div>
        </div>
      `,
    });

    console.log(`[Nodemailer] Email sent successfully! Message ID: ${info.messageId}`);
    // Ethereal email preview URL (printed to terminal)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Nodemailer] Preview URL: ${previewUrl}`);

    return res.status(200).json({ 
      success: true, 
      message: 'Subscription successful.', 
      preview: previewUrl 
    });

  } catch (error) {
    console.error('[Nodemailer Error] Failed to send email via test SMTP:', error.message);
    
    // Fallback response for offline or restricted environments
    return res.status(200).json({ 
      success: true, 
      message: 'Subscription received (local console mode).',
      debug: 'Transporter offline. Logged subscription.'
    });
  }
});

// Fallback to index.html for SPA routing feel if hit
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server only if run directly (local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`  MDP FASHION STORE running at http://localhost:${PORT}`);
    console.log(`  Serving static files & nodemailer API endpoints.`);
    console.log(`==================================================`);
  });
}

// Export for Vercel Serverless
module.exports = app;
