const fetch = require('node-fetch');

   async function testEmail() {
     const testData = {
       userId: 'test-user-123',
       email: 'test@example.com',
       displayName: 'Test User',
       verificationCode: '123456',
     };

     try {
       const response = await fetch('http://localhost:8888/.netlify/functions/send-verification-email', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Accept-Language': 'ar', // Change to 'en' for English
         },
         body: JSON.stringify(testData),
       });

       const result = await response.json();
       console.log('Test result:', result);
     } catch (error) {
       console.error('Test failed:', error);
     }
   }

   testEmail();