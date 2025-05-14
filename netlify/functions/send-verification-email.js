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

   const db = admin.firestore();

   exports.handler = async (event, context) => {
     try {
       // Parse request body
       const { userId, email, displayName, verificationCode } = JSON.parse(event.body);

       // Validate input
       if (!userId || !email || !verificationCode) {
         return {
           statusCode: 400,
           body: JSON.stringify({ error: 'Missing required fields: userId, email, verificationCode' }),
         };
       }

       // Determine language from Accept-Language header
       const acceptLanguage = event.headers['accept-language'] || '';
       const isArabic = acceptLanguage.includes('ar');

       // Set SendGrid API key
       sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

       // Email template
       const msg = {
         to: email,
         from: 'Smart Notifier <support@smartnotifier.com>',
         subject: isArabic ? 'تحقق من عنوان بريدك الإلكتروني' : 'Verify Your Email for Smart Notifier',
         html: isArabic
           ? `
             <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; padding: 30px; text-align: center; direction: rtl;">
               <h1 style="font-size: 24px; color: #1a73e8;">تحقق من عنوان بريدك الإلكتروني</h1>
               <p>مرحبًا ${displayName || 'مستخدم'}،</p>
               <p>مرحبًا بك في Smart Notifier! لتفعيل حسابك، يرجى التحقق من بريدك الإلكتروني بالنقر على الزر أدناه أو استخدام الرمز المقدم.</p>
               <a href="https://yourdomain.com/verify-email?oobCode=${userId}" style="display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; margin: 16px 0;">تحقق من البريد</a>
               <p>أو، انسخ هذا الرمز والصقه في تطبيق Smart Notifier:</p>
               <div style="background-color: #f0f0f0; padding: 10px 20px; font-size: 20px; font-weight: bold; letter-spacing: 2px; border-radius: 6px; margin: 16px 0;">${verificationCode}</div>
               <p>إذا لم يعمل الزر، انسخ هذا الرابط والصقه في متصفحك:</p>
               <p style="font-size: 14px; color: #666; word-break: break-all;">https://yourdomain.com/verify-email?oobCode=${userId}</p>
               <p>ينتهي صلاحية الرابط والرمز خلال 24 ساعة لأغراض الأمان.</p>
               <p style="font-size: 12px; color: #666;">هل تواجه مشكلة؟ تواصل مع <a href="mailto:support@smartnotifier.com">support@smartnotifier.com</a></p>
             </div>
           `
           : `
             <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; padding: 30px; text-align: center;">
               <h1 style="font-size: 24px; color: #1a73e8;">Verify Your Email Address</h1>
               <p>Hello ${displayName || 'User'},</p>
               <p>Welcome to Smart Notifier! To activate your account, please verify your email address by clicking the button below or using the code provided.</p>
               <a href="https://yourdomain.com/verify-email?oobCode=${userId}" style="display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; margin: 16px 0;">Verify Your Email</a>
               <p>Or, copy and paste this code into the Smart Notifier app:</p>
               <div style="background-color: #f0f0f0; padding: 10px 20px; font-size: 20px; font-weight: bold; letter-spacing: 2px; border-radius: 6px; margin: 16px 0;">${verificationCode}</div>
               <p>If the button doesn't work, copy and paste this link into your browser:</p>
               <p style="font-size: 14px; color: #666; word-break: break-all;">https://yourdomain.com/verify-email?oobCode=${userId}</p>
               <p>This link and code expire in 24 hours for your security.</p>
               <p style="font-size: 12px; color: #666;">Having trouble? Contact <a href="mailto:support@smartnotifier.com">support@smartnotifier.com</a></p>
             </div>
           `,
       };

       // Send email
       await sendgridMail.send(msg);

       // Store verification code in Firestore
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
       console.error('Error sending verification email:', error);
       return {
         statusCode: error.code || 500,
         body: JSON.stringify({ error: `Failed to send verification email: ${error.message}` }),
       };
     }
   };