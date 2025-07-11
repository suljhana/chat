# AI Chat App - React Native Conversion

This project is a conversion of the Next.js AI chat application to React Native with a separate backend and frontend architecture.

## Project Structure

```
react-native-chat-app/
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── db/        # Database schema and connection
│   │   ├── middleware/# Authentication middleware
│   │   └── config/    # Environment configuration
│   └── package.json
└── frontend/          # React Native Expo app
    ├── src/
    │   ├── screens/   # UI screens
    │   ├── contexts/  # React contexts
    │   ├── navigation/# Navigation setup
    │   └── services/  # API client
    └── package.json
```

## Features

### Backend (Express.js)
- **Authentication**: JWT-based user registration and login
- **AI Integration**: Multiple LLM providers (OpenAI, Anthropic, Google)
- **Real-time Chat**: WebSocket support with Socket.IO
- **Database**: PostgreSQL with Drizzle ORM
- **API Routes**: RESTful endpoints for chats, messages, and user management

### Frontend (React Native + Expo)
- **Cross-platform**: iOS and Android support
- **Modern UI**: React Native Paper components
- **Real-time Updates**: Socket.IO client integration
- **Navigation**: React Navigation with tab and stack navigators
- **State Management**: React Context for auth and chat state
- **Offline Support**: AsyncStorage for token persistence

## Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL database
- At least one AI API key (OpenAI, Anthropic, or Google)
- Expo CLI: `npm install -g @expo/cli`

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd react-native-chat-app/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and AI API keys
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd react-native-chat-app/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   ```

4. Use Expo Go app on your phone or run in simulator:
   - **iOS**: Press `i` to open iOS simulator
   - **Android**: Press `a` to open Android emulator
   - **Mobile**: Scan QR code with Expo Go app

## Environment Variables

### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/chat_db

# AI API Keys (at least one required)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key

# CORS
CORS_ORIGIN=http://localhost:8081
```

## Key Changes from Next.js Version

1. **Separated Architecture**: Split into independent backend (Express.js) and frontend (React Native)
2. **Mobile UI**: Redesigned for mobile-first experience with React Native Paper
3. **Real-time Communication**: Socket.IO for live chat updates
4. **Navigation**: React Navigation instead of Next.js routing
5. **State Management**: React Context instead of SWR/server state
6. **Authentication**: JWT tokens stored in AsyncStorage
7. **Cross-platform**: Single codebase for iOS and Android

## Development Commands

### Backend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run db:migrate # Run database migrations
npm run db:studio  # Open Drizzle Studio
```

### Frontend
```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web (limited support)
```

## Production Deployment

### Backend
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npm run db:migrate`
4. Build and start: `npm run build && npm start`

### Frontend
1. Build for production: `expo build`
2. Deploy to app stores or use Expo's hosted service
3. Update API_BASE_URL in `src/services/api.ts`

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `DELETE /api/chats/:id` - Delete chat
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/models` - Get available AI models

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## License

Same as the original Next.js project.