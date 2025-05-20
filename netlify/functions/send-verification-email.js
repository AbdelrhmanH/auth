const sendgridMail = require('@sendgrid/mail');
  const admin = require('firebase-admin');

  // Initialize Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
console.log("API KEY:", process.env.SENDGRID_API_KEY);
  const db = admin.firestore();

  exports.handler = async (event, context) => {
    try {
      const { userId, email, displayName, verificationCode } = JSON.parse(event.body);
      if (!userId || !email || !verificationCode) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing required fields' }),
        };
      }

      const isArabic = (event.headers['accept-language'] || '').includes('ar');
      sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: email,
        from: 'Smart Notifier <abdelrhmanhn@gmail.com>', // Replace with your verified email
        subject: isArabic ? 'تحقق من بريدك الإلكتروني' : 'Verify Your Email',
        html: isArabic
          ? `
            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; text-align: center; direction: rtl;">
              <h1 style="font-size: 24px; color: #1a73e8;">تحقق من بريدك الإلكتروني</h1>
              <p>مرحبًا ${displayName || 'مستخدم'}،</p>
              <p>لتفعيل حسابك، انقر على الزر أدناه أو أدخل الرمز في التطبيق.</p>
              <a href="https://gatewaye.netlify.app/verify-email?code=${userId}" style="display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: #ffffff; text-decoration: none; border-radius: 6px;">تحقق الآن</a>
              <p>الرمز: <strong style="font-size: 20px;">${verificationCode}</strong></p>
              <p>إذا لم يعمل الزر، انسخ: <a href="https://gatewaye.netlify.app/verify-email?code=${userId}">الرابط</a></p>
              <p>الرابط والرمز ينتهيان خلال 24 ساعة.</p>
              <p>مشكلة؟ تواصل مع <a href="mailto:abdelrhmanhn@gmail.com">abdelrhmanhn@gmail.com</a></p>
            </div>
          `
          : `
            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; text-align: center;">
              <h1 style="font-size: 24px; color: #1a73e8;">Verify Your Email</h1>
              <p>Hello ${displayName || 'User'},</p>
              <p>To activate your account, click the button below or enter the code in the app.</p>
              <a href="https://gatewaye.netlify.app/verify-email?code=${userId}" style="display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: #ffffff; text-decoration: none; border-radius: 6px;">Verify Now</a>
              <p>Code: <strong style="font-size: 20px;">${verificationCode}</strong></p>
              <p>If the button doesn't work, copy: <a href="https://gatewaye.netlify.app/verify-email?code=${userId}">the link</a></p>
              <p>The link and code expire in 24 hours.</p>
              <p>Trouble? Contact <a href="mailto:abdelrhmanhn@gmail.com">abdelrhmanhn@gmail.com</a></p>
            </div>
          `,
      };

      await sendgridMail.send(msg);

      await db.collection('emailVerifications').doc(userId).set({
        code: verificationCode,
        email: email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Verification email sent' }),
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error:  process.env.SENDGRID_API_KEY }),
      };
    }
  };
