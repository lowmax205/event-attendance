# Technical Research: QR-Based Attendance and Role-Based Dashboards

**Phase**: 0 (Outline & Research)  
**Date**: 2025-10-06  
**Status**: Complete

## Overview

This document consolidates research findings for implementing QR-based attendance with location verification, photo/signature capture, and role-based dashboards in the Event Attendance System.

## Research Areas

### 1. QR Code Generation and Scanning

**Decision**: Use `qrcode` library for generation (server-side) and `html5-qrcode` or `@zxing/library` for scanning (client-side)

**Rationale**:
- `qrcode` (npm): Lightweight, server-side generation fits Next.js Server Actions model; generates data URLs or SVG for flexible display
- `html5-qrcode`: Well-maintained, mobile-optimized, handles camera permissions gracefully, supports multiple cameras (front/back)
- Alternative `@zxing/library`: More powerful but heavier bundle; html5-qrcode sufficient for our use case

**Implementation Pattern**:
```typescript
// Server Action (generate)
import QRCode from 'qrcode';
const qrDataUrl = await QRCode.toDataURL(`attendance:${eventId}`);

// Client Component (scan)
import { Html5QrcodeScanner } from 'html5-qrcode';
// Initialize scanner in useEffect, handle onScanSuccess callback
```

**Best Practices**:
- Generate QR codes with event ID as payload: `attendance:{eventId}:{timestamp}`
- Store QR code image URL in Event model (Cloudinary or data URL)
- Validate scanned QR on server before displaying form
- Set scanner to use rear camera by default on mobile
- Provide manual event ID entry fallback for camera failures

**Alternatives Considered**:
- `react-qr-code` (generation): Client-side only, less flexible
- Native browser Barcode Detection API: Limited browser support (Chrome only)

---

### 2. Geolocation API and Distance Calculation

**Decision**: Browser Geolocation API with Haversine formula for distance calculation

**Rationale**:
- Native `navigator.geolocation.getCurrentPosition()`: No external dependencies, works on all modern browsers
- Haversine formula: Standard great-circle distance calculation, accurate for 100m radius verification
- GPS accuracy typically 5-50m on mobile devices; 100m radius provides buffer for device variance

**Implementation Pattern**:
```typescript
// Client hook (use-geolocation.ts)
const getLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

// Server-side validation (lib/geolocation.ts)
function haversineDistance(lat1, lon1, lat2, lon2): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
}
```

**Best Practices**:
- Request location with `enableHighAccuracy: true` for better precision
- Set reasonable timeout (10 seconds) to avoid infinite waiting
- Display clear error messages for permission denial or timeout
- Show loading spinner during GPS acquisition
- Validate distance server-side (don't trust client calculations)

**Edge Cases**:
- Indoor venues: GPS accuracy degrades; consider WiFi positioning APIs for future enhancement
- Permission denial: Display error with instructions to enable location in browser settings
- Timeout: Allow retry with option to contact moderator for manual verification

**Alternatives Considered**:
- IP-based geolocation: Too inaccurate (city-level precision)
- WiFi/Bluetooth beacons: Requires additional hardware infrastructure

---

### 3. Camera Access (MediaDevices API)

**Decision**: Native `navigator.mediaDevices.getUserMedia()` with React hooks for permission management

**Rationale**:
- Standard Web API, no additional libraries needed
- Works on iOS Safari, Chrome Android, desktop browsers
- Allows switching between front/back cameras
- Supports photo capture via Canvas API

**Implementation Pattern**:
```typescript
// Hook (use-camera.ts)
const useCamera = (facingMode: 'user' | 'environment') => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
    } catch (err) {
      setError(err.message);
    }
  };

  const capturePhoto = (videoElement: HTMLVideoElement): string => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d')?.drawImage(videoElement, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  return { stream, error, startCamera, capturePhoto };
};
```

**Best Practices**:
- Request 'environment' (rear) camera first for ID photo, then 'user' (front) for selfie
- Set ideal resolution 1280x720 (balance quality vs upload size)
- Display video preview before capture
- Allow retakes with clear UI
- Stop media stream after capture to release camera
- Compress images before upload (0.8 JPEG quality)

**Edge Cases**:
- No camera device: Display error with option to skip (moderator manual verification)
- Permission denial: Show instructions to enable camera in settings
- Multiple cameras: Provide toggle button to switch between devices

**Alternatives Considered**:
- `react-webcam` library: Adds dependency, native API sufficient
- File input (`<input type="file" accept="image/*" capture="camera">`): Less control over quality/preview

---

### 4. Digital Signature Canvas

**Decision**: HTML5 Canvas API with touch/mouse event handling via `react-signature-canvas` wrapper

**Rationale**:
- `react-signature-canvas`: Thin React wrapper around `signature_pad` library, handles touch/mouse gracefully
- Exports as transparent PNG (matches spec requirement)
- Responsive to different screen sizes
- Small bundle size (~10KB)

**Implementation Pattern**:
```typescript
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = () => {
  const sigRef = useRef<SignatureCanvas>(null);

  const handleClear = () => sigRef.current?.clear();
  
  const handleSave = (): string | null => {
    if (sigRef.current?.isEmpty()) return null;
    return sigRef.current.toDataURL('image/png'); // Transparent PNG
  };

  return (
    <SignatureCanvas
      ref={sigRef}
      canvasProps={{
        className: 'border rounded-md w-full h-40',
        style: { touchAction: 'none' } // Prevent scroll on touch
      }}
    />
  );
};
```

**Best Practices**:
- Set `touchAction: 'none'` to prevent page scroll during signing
- Validate signature is not empty before allowing form submission
- Provide clear "Clear" button for retries
- Use transparent background (PNG format)
- Set reasonable canvas dimensions (full width, 160px height)

**Edge Cases**:
- Empty signature: Block submission with validation error
- Touch vs mouse: Library handles both automatically
- High-DPI screens: Canvas auto-scales appropriately

**Alternatives Considered**:
- Custom Canvas implementation: More code, reinventing wheel
- SVG-based signature: More complex, PNG output required by spec

---

### 5. Cloudinary Integration

**Decision**: Cloudinary Node.js SDK with server-side upload from Next.js Server Actions

**Rationale**:
- Cloudinary free tier: 25GB storage, 25GB bandwidth/month (sufficient for ~50k images/year)
- Auto-format delivery (WebP/AVIF) for performance
- Image transformations (resize, compress) on-the-fly
- Signed uploads for security
- Folder organization: `attendance/{eventId}/{userId}/`

**Implementation Pattern**:
```typescript
// Server Action (lib/cloudinary.ts)
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadAttendancePhoto(
  base64Data: string,
  eventId: string,
  userId: string,
  type: 'front' | 'back' | 'signature'
): Promise<string> {
  const timestamp = Date.now();
  const attendanceId = `${timestamp}_${Math.random().toString(36).slice(2, 9)}`;
  
  const result = await cloudinary.uploader.upload(base64Data, {
    folder: `attendance/${eventId}/${userId}`,
    public_id: `${timestamp}_${attendanceId}_${type}`,
    resource_type: 'image',
    format: type === 'signature' ? 'png' : 'jpg',
  });

  return result.secure_url;
}
```

**Best Practices**:
- Use server-side uploads (keep API secret secure)
- Implement rate limiting on upload endpoint (prevent abuse)
- Set file size limits (2MB per photo/signature)
- Use signed URLs for sensitive images
- Enable auto-format and auto-quality for delivery
- Organize by folder structure per spec: `attendance/{eventId}/{userId}/{timestamp}_{attendanceId}_{type}.jpg`

**Edge Cases**:
- Upload failures: Retry logic with exponential backoff
- Network timeout: Set reasonable timeout (30 seconds)
- Invalid image data: Validate base64 format before upload

**Alternatives Considered**:
- AWS S3: More configuration overhead, Cloudinary simpler
- Vercel Blob Storage: Limited free tier, Cloudinary more mature

---

### 6. Role-Based Routing and Access Control

**Decision**: Next.js Middleware + Server Components for role-based routing and dashboard access control

**Rationale**:
- Middleware runs before page render, can redirect based on JWT role claim
- Server Components verify role server-side (prevent client tampering)
- Leverage existing JWT authentication from Phase 1

**Implementation Pattern**:
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.redirect('/login');

  const payload = await verifyJWT(token);
  const role = payload.role;

  if (request.nextUrl.pathname.startsWith('/dashboard/moderator') && role === 'Student') {
    return NextResponse.redirect('/dashboard/student');
  }
  if (request.nextUrl.pathname.startsWith('/dashboard/admin') && role !== 'Administrator') {
    return NextResponse.redirect('/dashboard');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/attendance/:path*'],
};
```

**Best Practices**:
- Verify JWT on every protected route request
- Redirect unauthorized users to their appropriate dashboard
- Display access denied message for clarity
- Use Server Components to re-verify role before rendering sensitive data
- Cache role in session for client-side UI decisions (hide/show buttons)

**Edge Cases**:
- Token expiration: Refresh token flow already implemented in Phase 1
- Role change during session: Next request triggers middleware re-check
- Direct URL access: Middleware catches and redirects

**Alternatives Considered**:
- Client-side only checks: Insecure, bypassable
- Custom HOC wrappers: More boilerplate, middleware cleaner

---

### 7. Form Validation and State Management

**Decision**: React Hook Form + Zod schemas for attendance form, Zustand for global QR scanner state (optional)

**Rationale**:
- React Hook Form: Already in dependencies, performant, integrates with Zod
- Zod: Type-safe schema validation, runtime checks, error messages
- Zustand: Lightweight state management if QR scanner needs global state (e.g., cross-page)

**Implementation Pattern**:
```typescript
// Zod schema (lib/validations/attendance.ts)
import { z } from 'zod';

export const attendanceSchema = z.object({
  eventId: z.string().cuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  frontPhotoUrl: z.string().url(),
  backPhotoUrl: z.string().url(),
  signatureUrl: z.string().url(),
});

// React Hook Form usage
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(attendanceSchema),
  defaultValues: { /* prefilled data */ },
});
```

**Best Practices**:
- Define Zod schemas for all server actions (event creation, attendance submission)
- Use same schemas on client (React Hook Form) and server (Server Action) for DRY
- Display field-level validation errors immediately (onBlur)
- Disable submit button until all steps complete
- Show progress indicator (Step 1/3, 2/3, 3/3)

**Alternatives Considered**:
- Formik: More boilerplate, React Hook Form more modern
- Manual validation: Error-prone, Zod provides better DX

---

### 8. Real-Time Connectivity Detection

**Decision**: Native `navigator.onLine` API with event listeners for online/offline state

**Rationale**:
- Browser API, no dependencies
- Fires `online` and `offline` events
- Sufficient for requirement "Real-time connectivity required"

**Implementation Pattern**:
```typescript
// Hook (use-online-status.ts)
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Usage in component
if (!isOnline) {
  return <OfflineError message="Internet connection required" />;
}
```

**Best Practices**:
- Display prominent offline warning banner when connection lost
- Prevent form submission when offline
- Show retry button once connection restored

**Edge Cases**:
- False positives: `navigator.onLine` may return true even if internet unreachable (connected to WiFi but no internet); consider adding ping check to API
- Connection loss mid-upload: Cloudinary upload will fail, handle error gracefully

**Alternatives Considered**:
- Polling API endpoint: More accurate but adds server load
- Libraries (`react-use` useNetworkState): Adds dependency for simple feature

---

## Dependencies to Add

```json
{
  "dependencies": {
    "qrcode": "^1.5.3",
    "html5-qrcode": "^2.3.8",
    "react-signature-canvas": "^1.0.6",
    "cloudinary": "^2.0.3"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.5"
  }
}
```

---

## Performance Considerations

1. **Image Optimization**:
   - Compress photos to 80% JPEG quality before upload
   - Target max 500KB per image
   - Use Cloudinary auto-format (WebP/AVIF) for delivery

2. **Code Splitting**:
   - Lazy load QR scanner library (dynamic import when scanner modal opens)
   - Separate bundles for student/moderator/admin dashboards

3. **Caching**:
   - Cache attendance history data (SWR or React Query)
   - Prefetch dashboard data on login

4. **Bundle Size**:
   - html5-qrcode: ~90KB gzipped (acceptable for attendance flow)
   - Cloudinary SDK: Server-side only (no client bundle impact)

---

## Security Considerations

1. **QR Code Validation**:
   - Verify QR payload format server-side
   - Check event exists and is active
   - Validate time window before displaying form

2. **Image Upload**:
   - Validate base64 image data format
   - Enforce file size limits (2MB)
   - Use signed Cloudinary uploads
   - Rate limit upload endpoints

3. **Location Spoofing**:
   - GPS coordinates can be faked; document this as acceptable risk
   - Moderator review available for disputes
   - Consider adding IP geolocation cross-check (future enhancement)

4. **Role Escalation**:
   - Never trust client-side role checks
   - Verify JWT role on every server action
   - Use middleware for route protection

---

## Accessibility Considerations

1. **QR Scanner**:
   - Keyboard shortcut to open scanner (Alt+Q)
   - ARIA labels for scanner modal
   - Screen reader announces scan success/failure

2. **Camera Capture**:
   - Focus trap in camera dialog
   - Clear instructions for positioning
   - Fallback to file upload if camera unavailable

3. **Signature Canvas**:
   - Keyboard users can skip signature (mark as "digital signature waived")
   - Touch target size ≥44×44px for clear/submit buttons
   - High contrast border on canvas

4. **Form Navigation**:
   - Step indicator accessible to screen readers
   - Clear error messages with actionable guidance
   - Focus management between steps

---

## Research Summary

All technical unknowns resolved. No blockers identified. Implementation can proceed to Phase 1 (Design & Contracts).

**Key Takeaways**:
- Native browser APIs (Geolocation, MediaDevices, Canvas) sufficient for 90% of functionality
- Minimal new dependencies (QR, signature, Cloudinary SDKs)
- Performance budget: ~150KB new JavaScript for attendance flow
- Security: Server-side validation critical for QR, location, uploads
- Accessibility: Keyboard navigation and fallbacks required for camera/signature
