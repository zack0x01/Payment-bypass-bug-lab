# Payment Bypass Techniques Lab

Learn how to find and exploit payment bypass vulnerabilities. This lab teaches you three common techniques used in bug bounty hunting.

## What You'll Learn

- **Lab 01: Price Modification** - Change the price from $99 to $0
- **Lab 02: Direct Path Access** - Access premium files without paying
- **Lab 03: Permission Bypass** - Change your account from "free" to "paid"

## Getting Started

### What You Need

- Node.js installed on your computer ([Download here](https://nodejs.org/))
- Burp Suite (optional, for some labs)

### Setup

1. Open a terminal in this folder
2. Run the start script:
   ```bash
   bash start-lab.sh
   ```

That's it! The lab will open in your browser automatically.

**To stop the lab:**
```bash
bash stop-lab.sh
```

## How to Complete Each Lab

### Lab 01: Price Modification

1. Go to Lab 01
2. Click "Check Price" on any course
3. Use Burp Suite to intercept the response
4. Change `price` from `99` to `0`
5. Forward the response
6. Click "Purchase" - you got it for free! 🎉

### Lab 02: Direct Path Access

1. Go to Lab 02
2. Click "View Course Details"
3. Open browser DevTools (press F12)
4. Go to the Network tab
5. Look at the API response - you'll see file download links
6. Copy and use those links to download files directly

### Lab 03: Permission Bypass

1. Go to Lab 03
2. Click "Check Access Status"
3. Use Burp Suite to intercept the response
4. Change `userType` from `"free"` to `"paid"`
5. Forward the response
6. You're now a premium user! 👑

## Important Note

This lab is for **learning only**. Never try these techniques on real websites without permission. Always get authorization before testing.
