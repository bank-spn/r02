# Thailand Post API Integration Guide

## ภาพรวม

โปรเจค Personal Parcel Tracker ได้ทำการ integrate เข้ากับ Thailand Post Track & Trace API เรียบร้อยแล้ว ระบบสามารถดึงข้อมูลการติดตามพัสดุแบบ real-time จาก Thailand Post API และแสดงผลในรูปแบบที่เข้าใจง่ายสำหรับผู้ใช้

## สถาปัตยกรรม

### Service Layer Architecture

```
┌─────────────────────────────────────────────────┐
│              User Interface (React)              │
│         (Dashboard, ParcelDetail, etc.)         │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           API Abstraction Layer                  │
│            (client/src/utils/api.ts)            │
│  • fetchTrackingStatus()                        │
│  • Mock data fallback                           │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│         Thailand Post API Service               │
│   (client/src/services/thailandPostAPI.ts)     │
│  • fetchThailandPostTracking()                  │
│  • Response caching (5 min)                     │
│  • Error handling & retry                       │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│            Status Mapper Utility                │
│      (client/src/utils/statusMapper.ts)        │
│  • mapThailandPostStatus()                      │
│  • convertThaiDateToISO()                       │
│  • getMostRecentStatus()                        │
└─────────────────────────────────────────────────┘
```

## ไฟล์ที่สร้างใหม่

### 1. Type Definitions
**ไฟล์**: `client/src/types/thailandPost.ts`

ประกอบด้วย TypeScript type definitions สำหรับ:
- `ThailandPostTrackingEvent` - โครงสร้างข้อมูล tracking event จาก API
- `ThailandPostAPIResponse` - โครงสร้าง response จาก API
- `ThailandPostAPIRequest` - โครงสร้าง request body
- `THAILAND_POST_STATUS_CODES` - mapping ของ status codes

### 2. Status Mapper
**ไฟล์**: `client/src/utils/statusMapper.ts`

Functions สำหรับแปลงข้อมูลจาก Thailand Post format:
- `mapThailandPostStatus()` - แปลง status code เป็น ParcelStatus
- `convertThaiDateToISO()` - แปลงวันที่จาก Buddhist Era เป็น ISO 8601
- `getMostRecentStatus()` - หา status ล่าสุดจาก tracking events

### 3. Thailand Post API Service
**ไฟล์**: `client/src/services/thailandPostAPI.ts`

Service layer สำหรับเชื่อมต่อกับ Thailand Post API:
- `fetchThailandPostTracking()` - เรียก API และแปลง response
- `fetchMultipleTrackings()` - เรียก API สำหรับหลาย tracking numbers
- `isThailandPostAPIConfigured()` - ตรวจสอบว่า API ถูก configure แล้ว
- `clearCache()` - ล้าง cache
- Response caching (5 นาที) เพื่อลด API calls

## การตั้งค่า (Configuration)

### Environment Variables

สร้างไฟล์ `.env` ใน root directory:

```bash
# Thailand Post API Configuration
VITE_THAILAND_POST_API_URL=https://trackapi.thailandpost.co.th/post/api/v1/track
VITE_THAILAND_POST_API_TOKEN=Token eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9...
VITE_USE_MOCK_DATA=false
```

### ตัวแปรแต่ละตัว

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_THAILAND_POST_API_URL` | Endpoint URL ของ Thailand Post API | Yes |
| `VITE_THAILAND_POST_API_TOKEN` | JWT Bearer token สำหรับ authentication | Yes |
| `VITE_USE_MOCK_DATA` | ใช้ mock data แทน real API (true/false) | No (default: false) |

### การใช้ Mock Data

สำหรับการพัฒนาและทดสอบโดยไม่ต้องเรียก API จริง:

```bash
VITE_USE_MOCK_DATA=true
```

ระบบจะใช้ mock data ที่กำหนดไว้ใน `client/src/utils/api.ts` แทน

## Status Mapping

Thailand Post ใช้ status codes เป็นตัวเลข ระบบจะแปลงเป็น ParcelStatus ดังนี้:

| Thailand Post Status | Status Code | Application Status |
|---------------------|-------------|-------------------|
| DEPOSIT, ACCEPTANCE | 100-103 | `pending_dispatch` |
| EXPORT_CENTER, IN_TRANSIT | 200-207, 300 | `in_transit` |
| AWAITING_COLLECTION | 304 | `arrived_at_destination` |
| DELIVERY, SUCCESSFUL_DELIVERY | 301, 302, 402 | `delivered` |
| RETURN, REFUSED, UNCLAIMED | 303, 400-401, 600-602 | `returned` |
| CUSTOMS_CLEARANCE | 500-501 | `customs_inspection` |
| อื่นๆ | - | `unknown` |

## การแปลงวันที่

Thailand Post ส่งวันที่ในรูปแบบ Buddhist Era (พ.ศ.):
```
"19/07/2562 18:12:26+07:00"
```

ระบบจะแปลงเป็น ISO 8601 format:
```
"2019-07-19T18:12:26+07:00"
```

**สูตรการแปลง**: Gregorian Year = Buddhist Year - 543

## การใช้งาน

### เรียก API ผ่าน fetchTrackingStatus

```typescript
import { fetchTrackingStatus } from "@/utils/api";

// Fetch tracking data (with cache)
const response = await fetchTrackingStatus("EP123456789TH");

// Force refresh (bypass cache)
const response = await fetchTrackingStatus("EP123456789TH", true);
```

### เรียก API โดยตรงผ่าน Service

```typescript
import { fetchThailandPostTracking } from "@/services/thailandPostAPI";

const response = await fetchThailandPostTracking("EP123456789TH");
```

### ตรวจสอบการตั้งค่า API

```typescript
import { isThailandPostAPIConfigured } from "@/services/thailandPostAPI";

if (isThailandPostAPIConfigured()) {
  console.log("API is configured");
} else {
  console.log("API is not configured, using mock data");
}
```

## Error Handling

### Types of Errors

1. **Configuration Error**: API token ไม่ได้ตั้งค่า
   ```
   "Thailand Post API is not configured. Please set VITE_THAILAND_POST_API_TOKEN..."
   ```

2. **Network Error**: ไม่สามารถเชื่อมต่อกับ API
   ```
   "Thailand Post API error: 500 Internal Server Error"
   ```

3. **Timeout Error**: API ไม่ตอบกลับภายใน 30 วินาที
   ```
   "Request timeout: Thailand Post API did not respond in time"
   ```

4. **API Error**: API ส่ง error response
   ```
   "Unknown error from Thailand Post API"
   ```

### Fallback Mechanism

เมื่อเกิด error ระบบจะ:
1. แสดง error message ให้ผู้ใช้เห็น
2. Fallback ไปใช้ mock data (ถ้ามี)
3. Return status "unknown" ถ้าไม่มีข้อมูล

## Caching Strategy

### Cache Duration
- **5 นาที** สำหรับ tracking data
- Cache จะถูกเก็บใน memory (Map)
- Cache จะหายเมื่อ refresh หน้าเว็บ

### Cache Management

```typescript
import { clearCache, getCacheStats } from "@/services/thailandPostAPI";

// Clear specific tracking number
clearCache("EP123456789TH");

// Clear all cache
clearCache();

// Get cache statistics
const stats = getCacheStats();
console.log(`Cache size: ${stats.size}`);
console.log(`Cached tracking numbers:`, stats.entries);
```

## Rate Limiting

Thailand Post API มีข้อจำกัด:
- **1,500 requests per day** ต่อ API token
- ระบบใช้ caching เพื่อลด API calls
- แสดง track count ใน console เมื่อเรียก API

```
Track count: 48/1500
```

## Testing

### ทดสอบด้วย Mock Data

1. ตั้งค่า environment variable:
   ```bash
   VITE_USE_MOCK_DATA=true
   ```

2. ใช้ tracking numbers ที่มี mock data:
   - `EP123456789TH` - In transit
   - `EP987654321TH` - Delivered

### ทดสอบด้วย Real API

1. ตั้งค่า API token ใน `.env`
2. ตั้งค่า `VITE_USE_MOCK_DATA=false`
3. ใช้ tracking number จริงจาก Thailand Post

### ทดสอบ Error Cases

```typescript
// Test with invalid tracking number
await fetchTrackingStatus("INVALID123");

// Test with network error (disconnect internet)
await fetchTrackingStatus("EP123456789TH");

// Test force refresh
await fetchTrackingStatus("EP123456789TH", true);
```

## UI/UX Improvements

### Loading States
- แสดง spinner เมื่อกำลังเรียก API
- Disable refresh button ระหว่าง loading

### Error Display
- แสดง error message ในรูปแบบ alert box
- ให้ผู้ใช้สามารถปิด error message ได้
- แสดง error ที่เข้าใจง่าย

### Success Feedback
- อัพเดท timeline ทันทีเมื่อได้ข้อมูลใหม่
- แสดง "Last Updated" timestamp

## Security Considerations

### API Token Security
- ⚠️ **ห้าม** commit `.env` เข้า Git
- เก็บ API token ใน environment variables เท่านั้น
- ใช้ `.env.example` สำหรับ template

### HTTPS
- Thailand Post API ใช้ HTTPS
- ตรวจสอบ SSL certificate

### Input Validation
- Validate tracking number format ก่อนส่งไป API
- Sanitize user input

## Troubleshooting

### ปัญหา: API ไม่ทำงาน

**วิธีแก้**:
1. ตรวจสอบว่า API token ถูกต้อง
2. ตรวจสอบว่า token ยังไม่หมดอายุ
3. ตรวจสอบ network connection
4. ดู console log สำหรับ error details

### ปัญหา: Cache ไม่ update

**วิธีแก้**:
1. ใช้ force refresh: `fetchTrackingStatus(trackingNumber, true)`
2. Clear cache: `clearCache(trackingNumber)`
3. Refresh หน้าเว็บ

### ปัญหา: วันที่แสดงผิด

**วิธีแก้**:
1. ตรวจสอบ timezone setting
2. ตรวจสอบการแปลง Buddhist Era → Gregorian
3. ดู console log สำหรับ date conversion errors

## API Response Example

### Request
```json
{
  "status": "all",
  "language": "EN",
  "barcode": ["EP123456789TH"]
}
```

### Response
```json
{
  "response": {
    "items": {
      "EP123456789TH": [
        {
          "barcode": "EP123456789TH",
          "status": "103",
          "status_description": "DEPOSIT",
          "status_date": "19/07/2562 18:12:26+07:00",
          "statusDetail": "รับฝากสิ่งของ [เคาน์เตอร์บริการไปรษณีย์]",
          "location": "BANGKOK",
          "postcode": "10100"
        }
      ]
    },
    "track_count": {
      "track_date": "27/08/2562",
      "count_number": 48,
      "track_count_limit": 1500
    }
  },
  "message": "successful",
  "status": true
}
```

### Transformed Response (Application Format)
```json
{
  "status": "pending_dispatch",
  "history": [
    {
      "timestamp": "2019-07-19T18:12:26+07:00",
      "location": "รับฝากสิ่งของ [เคาน์เตอร์บริการไปรษณีย์]",
      "message": "DEPOSIT"
    }
  ],
  "lastUpdated": "2025-11-09T18:30:00.000Z"
}
```

## Future Enhancements

### Planned Features
1. **Webhook Support**: รับ notification เมื่อสถานะพัสดุเปลี่ยน
2. **Batch Tracking**: ดึงข้อมูลหลาย tracking numbers พร้อมกัน
3. **Push Notifications**: แจ้งเตือนผ่าน browser notification
4. **Export Data**: Export tracking history เป็น PDF/CSV
5. **Analytics**: แสดง statistics การจัดส่ง

### Performance Improvements
1. **Persistent Cache**: เก็บ cache ใน localStorage
2. **Background Sync**: Auto-refresh tracking data
3. **Optimistic Updates**: แสดงผลก่อนรอ API response

## Support & Documentation

### Official Documentation
- Thailand Post API: https://trackapi.thailandpost.co.th/
- Project README: `/README.md`
- Integration Plan: `/INTEGRATION_PLAN.md`

### Contact
สำหรับคำถามหรือปัญหา กรุณาเปิด issue ใน GitHub repository

---

**Last Updated**: November 9, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
