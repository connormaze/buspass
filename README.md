# StarDetect Bus Pass

A comprehensive school bus tracking and management system built with React and Firebase.

## Features

- Real-time bus tracking
- Parent notifications for bus arrivals
- QR code-based pickup verification
- Emergency contact management
- Role-based access control
- Email verification
- Password reset functionality

## Tech Stack

- React 18
- Firebase (Authentication, Firestore, Storage)
- Material-UI (MUI)
- React Router v6

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/buspass-stardetect.git
cd buspass-stardetect
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project:
- Go to the [Firebase Console](https://console.firebase.google.com)
- Create a new project
- Enable Authentication (Email/Password)
- Create a Firestore database
- Get your Firebase configuration

4. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your Firebase configuration.

5. Start the development server:
```bash
npm start
```

## Firebase Setup

1. Authentication:
- Enable Email/Password authentication
- Configure email templates for verification and password reset

2. Firestore Rules:
- Copy the provided security rules to your Firebase Console
- Adjust rules based on your specific requirements

3. Storage Rules:
- Set up appropriate rules for file storage if needed

## Development

- `npm start` - Start development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 