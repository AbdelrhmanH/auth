Auth Backend
   Backend for the Auth mobile app, providing email verification using Netlify Functions and Firebase.
Overview
   This repository contains the backend functions for the Auth mobile app, built with Netlify Functions and integrated with Firebase Firestore and SendGrid for email verification.
   Note: The mobile app frontend (including LoginScreen.kt) is in a separate Android project (auth-mobile).
Setup

Clone the repository:
git clone https://github.com/AbdelrhmanH/auth.git
cd auth


Install dependencies:
npm install


Configure environment variables in .env:
SENDGRID_API_KEY=your-sendgrid-api-key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="your-firebase-private-key"


Deploy to Netlify:

Link the repository to Netlify.
Set functions directory to netlify/functions.
Add environment variables in Netlify Dashboard.



Running Locally
npm start

Testing
   Test the email function locally:
npm run test-email

Features

Sends verification emails with a link and 6-digit code using Netlify Functions.
Supports Arabic and English email templates based on Accept-Language header.
Integrates with Firebase Firestore to store and validate verification codes.

Mobile App Integration
   The mobile app (built with Kotlin and Jetpack Compose) calls the Netlify Function at /.netlify/functions/send-verification-email to send verification emails and uses Firebase Firestore to validate codes.
