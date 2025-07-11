# Frontend Troubleshooting Guide

## "EMFILE: too many open files" Error (macOS)

This error occurs when Metro bundler exceeds the system's file descriptor limit on macOS.

### Quick Fix (Temporary)
```bash
# Increase the limit for current terminal session
ulimit -n 65536
npm start
```

### Permanent Fix (Recommended)
Run our automated fix script:
```bash
chmod +x fix-file-watcher-macos.sh
./fix-file-watcher-macos.sh
```

### Manual Permanent Fix
1. **Check current limits:**
   ```bash
   ulimit -n      # Soft limit
   ulimit -Hn     # Hard limit
   ```

2. **Create launchd configuration:**
   ```bash
   sudo nano /Library/LaunchDaemons/limit.maxfiles.plist
   ```
   
   Add this content:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
     <dict>
       <key>Label</key>
       <string>limit.maxfiles</string>
       <key>ProgramArguments</key>
       <array>
         <string>launchctl</string>
         <string>limit</string>
         <string>maxfiles</string>
         <string>65536</string>
         <string>65536</string>
       </array>
       <key>RunAtLoad</key>
       <true/>
       <key>ServiceIPC</key>
       <false/>
     </dict>
   </plist>
   ```

3. **Load the configuration:**
   ```bash
   sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
   ```

4. **Restart your terminal and try again**

### Alternative Solutions

#### Option 1: Use Expo CLI with Different Flags
```bash
# Clear cache and restart
npx expo start --clear

# Use production mode (fewer file watchers)
npx expo start --no-dev --minify

# Disable fast refresh
npx expo start --no-dev
```

#### Option 2: Use Watchman (Facebook's File Watcher)
```bash
# Install Watchman
brew install watchman

# Clear Watchman cache
watchman watch-del-all

# Start Expo
npm start
```

#### Option 3: Use Expo Go App (Simplest)
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Start with tunnel mode (works around file watcher issues)
npx expo start --tunnel
```

### Linux/Windows Users
This error is specific to macOS. Linux and Windows users shouldn't encounter this issue.

## Other Common Issues

### Metro Bundler Issues
```bash
# Clear Metro cache
npx expo start --clear

# Reset Metro cache completely
npx expo r -c
```

### Port Already in Use
```bash
# Find process using port 8081
lsof -ti:8081

# Kill process using port 8081
kill -9 $(lsof -ti:8081)
```

### Node Modules Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Testing the Frontend

### 1. Start the Backend First
```bash
cd ../backend
npm run dev
```

### 2. Start the Frontend
```bash
cd ../frontend
npm start
```

### 3. Test on Device/Simulator
- **iOS Simulator**: Press `i` in Expo CLI
- **Android Emulator**: Press `a` in Expo CLI  
- **Physical Device**: Use Expo Go app and scan QR code

## API Connection Testing

The frontend should connect to the backend at `http://localhost:3001`. Make sure:

1. Backend is running on port 3001
2. Frontend API client points to correct URL
3. CORS is configured properly (already done)

## Development Tips

1. **Use Expo Go App**: Easiest way to test on real devices
2. **Enable Hot Reload**: For faster development
3. **Use Metro Cache Clearing**: When encountering weird issues
4. **Check Network**: Ensure backend and frontend can communicate

## Need Help?

1. Check the main README.md for setup instructions
2. Verify backend is running: `curl http://localhost:3001/health`
3. Check console logs for specific error messages
4. Try the troubleshooting steps in order