CAMS Quiz — iPad PWA Bundle
=================================

What this is
------------
This folder contains a Progressive Web App (PWA) for your CAMS training.
It includes:
- index.html (launcher)
- manifest.json (PWA manifest)
- sw.js (service worker for offline)
- Assessment Tests/* (exam simulator, drills, trainer)
- icons/* (PWA icons)
- screenshots/* (optional manifest screenshots)
- test-setup.html (self-check page)

Quick iPad install (no computer)
--------------------------------
1) Upload this entire folder to an HTTPS host. Easiest options:
   • Netlify Drop: https://app.netlify.com/drop  (drag-drop the folder)
   • GitHub Pages (if you prefer GitHub)

2) On your iPad, open the *public HTTPS URL* in Safari.
3) Tap the Share icon → Add to Home Screen → Add.
4) Launch from the Home Screen icon (full screen, offline-ready).

Troubleshooting
---------------
• If the Home Screen option is missing, ensure you used Safari (not Chrome) and the site is HTTPS.
• If updates don’t appear, close the app card and reopen (service worker will refresh). 
• Run test-setup.html to verify files & caching.
