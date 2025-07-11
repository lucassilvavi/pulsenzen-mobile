# PulseZen Mobile App - Network Configuration

## Overview
This guide explains how to configure the mobile app to connect to the PulseZen API during development.

## Problem
Mobile devices (real devices or emulators) cannot access `localhost` directly from the host machine. You need to use your machine's local IP address.

## Quick Setup

### 1. Find Your Local IP Address
```bash
# On macOS/Linux
ifconfig | grep -E "inet " | grep -v "127.0.0.1"

# On Windows
ipconfig | findstr "IPv4"
```

### 2. Configure API Server
Make sure your API is configured to accept external connections:

```bash
# In pulsezen-api/.env
HOST=0.0.0.0
PORT=3333
```

### 3. Update Mobile App Configuration
Edit `/config/api.ts` and update the IP address:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_LOCAL_IP:3333/api/v1',
  // ...rest of config
};
```

Replace `YOUR_LOCAL_IP` with the IP address from step 1.

### 4. Test Connectivity
```bash
# Test API health
curl -X GET http://YOUR_LOCAL_IP:3333/health

# Test registration endpoint
curl -X POST http://YOUR_LOCAL_IP:3333/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "password_confirmation": "test123456",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Environment-Specific Configuration

### Development (Local Network)
- Use your machine's local IP address
- API server configured with `HOST=0.0.0.0`
- Mobile device/emulator on same network

### Production
- Use your production domain/IP
- Update `API_CONFIG.BASE_URL` in `/config/api.ts`
- Ensure HTTPS for production

### Using Expo
If using Expo, you can also use Expo's development server:
- The Expo CLI automatically detects your local IP
- Check the Expo CLI output for the correct IP address

## Troubleshooting

### Common Issues

1. **"Network request failed"**
   - Check if API server is running
   - Verify IP address is correct
   - Ensure mobile device is on same network
   - Test with curl first

2. **API not accessible**
   - Confirm `HOST=0.0.0.0` in API `.env` file
   - Restart API server after changing HOST
   - Check firewall settings

3. **Wrong IP address**
   - IP addresses can change when switching networks
   - Re-run `ifconfig` command to get current IP
   - Update `/config/api.ts` with new IP

### Debug Steps

1. **Test API directly:**
   ```bash
   curl -X GET http://YOUR_IP:3333/health
   ```

2. **Check API logs:**
   - Look for incoming requests in API console
   - Verify CORS settings if needed

3. **Test from mobile device:**
   - Open browser on mobile device
   - Navigate to `http://YOUR_IP:3333/health`
   - Should see JSON response

## Network Security Notes

- Only use `HOST=0.0.0.0` for development
- For production, configure proper firewall rules
- Consider using reverse proxy (nginx) for production
- Always use HTTPS in production

## Current Configuration

The app is currently configured to use:
- **Local IP:** `192.168.3.75`
- **API Port:** `3333`
- **Base URL:** `http://192.168.3.75:3333/api/v1`

Update `/config/api.ts` if your IP address changes.
