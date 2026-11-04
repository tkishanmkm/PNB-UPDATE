# PNB-UPDATE Android APK

This Android Studio project is a native Android WebView shell for the separately deployed
PNB-UPDATE web application.

- Hosted start URL: https://pnb-update.onrender.com/
- Render service: PNB-UPDATE
- Source repository: https://github.com/tkishanmkm/PNB-UPDATE
- Application ID (release): com.pnbupdate.mobile
- Application ID (debug): com.pnbupdate.mobile.debug
- Minimum Android version: API 23
- Compile SDK: API 35
- Build Tools: 36.0.0
- Target SDK: API 34
- Java: 17
- Android Gradle Plugin: 8.9.2
- Gradle: 8.11.1

## Build

From Windows PowerShell:

    cd C:\Users\theki\PNB-UPDATE\android
    .\gradlew.bat --offline assembleDebug

The debug APK is written to:

    android/app/build/outputs/apk/debug/app-debug.apk

## Runtime behavior and limitations

This APK is an internet-connected wrapper, not an offline package of the Next.js site.
It requires internet access and the PNB-UPDATE Render service to respond. The WebView
allows JavaScript and DOM storage so the web app can use browser-side IndexedDB/local
storage. The native shell supports HTML file selection and routes normal downloads to
the Android Downloads collection.

Only HTTPS pages on pnb-update.onrender.com stay inside the app. Other websites and
telephone/email links are handed to Android. TLS errors are not bypassed. No new bank,
payment, OTP, or authentication service was added by the native wrapper.

## Emulator verification

- Gradle debug build succeeded.
- The APK installed successfully on the PNB_ONE_Preview_API35 Android emulator.
- The app launcher activity started and was verified as the top-resumed activity.
- The latest clean emulator screenshot, refreshed after the logo fix, is saved at:
  docs/reference-assets/pnb-update-android-emulator.png
- The captured screen is the hosted PNB-UPDATE MPIN login page with the PNB logo and welcome avatar visible.
- The latest verified capture, after Render deployment b7d6b12, shows the bundled PNB logo and extracted welcome avatar loading correctly (both public asset URLs returned HTTP 200).

Render deployment dep-dblcmhijnfac73fkaolg is live on commit b7d6b124142369f89757e7c3c2620d5672b80b52. The public logo and welcome-avatar image endpoints were checked and each returned HTTP 200. The refreshed Android emulator capture confirms the live page renders both images. This still does not certify every web route, upload, PDF download, or banking workflow on a physical device. It does not certify
every web route, file-upload flow, PDF download, or banking workflow on a physical
Android device.