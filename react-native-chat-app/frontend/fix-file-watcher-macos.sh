#!/bin/bash

echo "🔧 Fixing 'too many open files' error on macOS"
echo "================================================"

# Check current limits
echo "Current file descriptor limits:"
echo "Soft limit: $(ulimit -n)"
echo "Hard limit: $(ulimit -Hn)"

# Increase the limits temporarily (for current session)
echo -e "\n📈 Increasing limits for current session..."
ulimit -n 65536

echo "New soft limit: $(ulimit -n)"

# Create a permanent solution
echo -e "\n💾 Creating permanent solution..."

# Create launchd plist for permanent fix
sudo tee /Library/LaunchDaemons/limit.maxfiles.plist > /dev/null <<EOF
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
EOF

# Load the launchd job
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist

echo "✅ File watcher limits increased!"
echo "📱 You can now run: npm start"
echo ""
echo "If you still have issues, try these alternatives:"
echo "1. Restart your terminal and try again"
echo "2. Use: npx expo start --clear"
echo "3. Use: npx expo start --no-dev --minify"