# Network Buddy - iOS App Setup Guide

Your Network Buddy web app has been configured with Capacitor to create a native iOS app!

## What Was Done

1. **Installed Capacitor** - Added @capacitor/core, @capacitor/cli, and @capacitor/ios
2. **Created iOS Project** - Generated native Xcode project in the `ios/` directory
3. **Configured WebView Mode** - App points to your live Vercel deployment: `https://network-buddy-d7lquuzqd-metspagmailcoms-projects.vercel.app`

## How It Works

Your iOS app is a **native WebView wrapper** around your live website. This means:
- All your API routes, authentication, and server features work perfectly
- Updates to your website instantly reflect in the app (no App Store update needed)
- You get native iOS features: app icon, splash screen, App Store presence
- Camera and other device features work seamlessly

## Next Steps - You Need a Mac

Since you're on Windows, here's what you need to do to build and test the iOS app:

### Option 1: Use Your Own Mac

1. **Transfer the project** to your Mac (via GitHub, cloud storage, or flash drive)

2. **Install Xcode** on Mac:
   - Open App Store
   - Search for "Xcode"
   - Install (it's free, but ~15GB download)

3. **Install CocoaPods** (required for iOS dependencies):
   ```bash
   sudo gem install cocoapods
   ```

4. **Open the project in Xcode**:
   ```bash
   cd /path/to/network-buddy
   npx cap open ios
   ```
   This will open the Xcode project.

5. **Run in iOS Simulator**:
   - In Xcode, select a simulator device (e.g., "iPhone 15 Pro")
   - Click the Play button (▶️) to build and run
   - The app will launch in the iOS Simulator

6. **Test on Physical iPhone**:
   - Connect your iPhone to the Mac via USB
   - In Xcode, select your iPhone from the device dropdown
   - You may need to:
     - Trust the computer on your iPhone
     - Enable "Developer Mode" in iPhone Settings
   - Click Play (▶️) to install and run on your iPhone

### Option 2: Use a Cloud Mac Service

If you don't have a Mac, you can rent one temporarily:

**MacStadium** (https://www.macstadium.com)
- Pay-per-hour Mac in the cloud
- Access via remote desktop
- Good for testing and building

**AWS EC2 Mac Instances** (https://aws.amazon.com/ec2/instance-types/mac/)
- Hourly Mac rental from Amazon
- More technical setup required

**MacinCloud** (https://www.macincloud.com)
- Managed Mac access
- Easier to use than AWS

### Option 3: Hire a Developer

If you just want to get it submitted to the App Store:
- Hire a freelancer on Upwork or Fiverr
- Provide them this project
- They can build, test, and submit for you
- Cost: $50-200 typically

## Publishing to App Store

Once you've tested the app, here's how to publish:

### 1. Join Apple Developer Program
- Go to https://developer.apple.com
- Cost: $99/year
- Required to publish to App Store

### 2. Configure App Signing
In Xcode:
- Select your project in the left sidebar
- Go to "Signing & Capabilities"
- Select your Apple Developer team
- Xcode will automatically manage signing certificates

### 3. Prepare App Store Assets
You'll need:
- **App Icon**: 1024x1024px PNG (no transparency)
- **Screenshots**: For various iPhone sizes
- **App Description**: What your app does
- **Privacy Policy**: Required by Apple
- **Keywords**: For App Store search

### 4. Create App in App Store Connect
- Go to https://appstoreconnect.apple.com
- Click "My Apps" → "+" → "New App"
- Fill in app information:
  - Name: Network Buddy
  - Bundle ID: com.networkbuddy.app
  - SKU: networkbuddy001
  - Language: English

### 5. Build and Upload
In Xcode:
- Select "Any iOS Device" from device dropdown
- Go to Product → Archive
- Once archived, click "Distribute App"
- Select "App Store Connect"
- Follow prompts to upload

### 6. Submit for Review
In App Store Connect:
- Upload screenshots
- Add description, keywords, support URL
- Set pricing (free or paid)
- Submit for review
- Review takes 1-7 days
- Apple will test and approve/reject

## App Updates

**For code/feature changes:**
- Just update your Vercel deployment
- Changes are instant (no App Store submission needed!)

**For native changes (app name, icon, permissions):**
- Make changes in Xcode
- Re-build and submit to App Store
- Users update through App Store

## Testing Without a Mac

While you can't build for iOS on Windows, you can test the web app experience:
1. Visit: https://network-buddy-d7lquuzqd-metspagmailcoms-projects.vercel.app on your iPhone
2. Tap Share button → "Add to Home Screen"
3. This gives you an app-like experience (PWA)

The actual iOS app will look and behave the same, but with:
- Better performance
- App Store presence
- Better camera integration
- Native feel

## Project Structure

```
network-buddy/
├── ios/                          # Xcode project (open this on Mac)
│   └── App/
│       └── App.xcodeproj         # Double-click to open in Xcode
├── capacitor.config.ts           # Capacitor configuration
├── out/                          # Web assets (placeholder)
└── (rest of your Next.js app)
```

## Troubleshooting

**"Unable to find xcodebuild"**
- This is normal on Windows - you need Xcode on Mac

**"Skipping pod install"**
- Run `pod install` in the `ios/App` directory on Mac

**App shows white screen**
- Check that your Vercel URL is accessible
- Check the `server.url` in capacitor.config.ts

**Camera not working**
- Ensure you've added camera permissions in iOS Info.plist
- Apple requires a description of why you need camera access

## Current Configuration

Your app is currently configured to load from:
```
https://network-buddy-d7lquuzqd-metspagmailcoms-projects.vercel.app
```

This is set in [capacitor.config.ts](capacitor.config.ts) under `server.url`.

## Questions?

- Capacitor Docs: https://capacitorjs.com/docs
- iOS Development Guide: https://capacitorjs.com/docs/ios
- App Store Submission: https://developer.apple.com/app-store/submissions/

---

**Ready to submit?** You'll need a Mac or cloud Mac service to open Xcode and build the iOS app.
