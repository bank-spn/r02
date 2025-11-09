# Testing Guide - Thailand Post API Integration

## ภาพรวม

เอกสารนี้อธิบายวิธีการทดสอบ Thailand Post API integration ในโปรเจค Personal Parcel Tracker

## การเตรียมตัวก่อนทดสอบ

### 1. ติดตั้ง Dependencies

```bash
pnpm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ใน root directory:

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env` และใส่ API token:

```env
VITE_THAILAND_POST_API_URL=https://trackapi.thailandpost.co.th/post/api/v1/track
VITE_THAILAND_POST_API_TOKEN=Token eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9...
VITE_USE_MOCK_DATA=false
```

## Test Cases

### Test Case 1: ทดสอบด้วย Mock Data

**วัตถุประสงค์**: ทดสอบว่าระบบทำงานได้โดยไม่ต้องเรียก API จริง

**ขั้นตอน**:
1. ตั้งค่า `.env`:
   ```env
   VITE_USE_MOCK_DATA=true
   ```

2. รัน development server:
   ```bash
   pnpm dev
   ```

3. เปิดเว็บที่ `http://localhost:3000`

4. เพิ่มพัสดุใหม่ด้วย tracking number:
   - `EP123456789TH` (In transit)
   - `EP987654321TH` (Delivered)

5. คลิก "Details" และ "Refresh" เพื่อดึงข้อมูล

**ผลที่คาดหวัง**:
- ✅ แสดง tracking timeline ได้
- ✅ Status แสดงถูกต้อง
- ✅ ไม่มี error ใน console
- ✅ Loading state แสดงขณะ refresh

---

### Test Case 2: ทดสอบกับ Thailand Post API จริง

**วัตถุประสงค์**: ทดสอบการเชื่อมต่อกับ Thailand Post API

**ขั้นตอน**:
1. ตั้งค่า `.env`:
   ```env
   VITE_USE_MOCK_DATA=false
   VITE_THAILAND_POST_API_TOKEN=Token eyJ0eXAi...
   ```

2. รัน development server:
   ```bash
   pnpm dev
   ```

3. เพิ่มพัสดุใหม่ด้วย tracking number จริงจาก Thailand Post
   (ตัวอย่าง: `EY145587896TH`, `RC338848854TH`)

4. คลิก "Details" และ "Refresh"

5. ตรวจสอบ console log:
   ```
   Fetching from Thailand Post API
   Fetching tracking data for EY145587896TH from Thailand Post API...
   Successfully fetched tracking data for EY145587896TH
   Track count: 48/1500
   ```

**ผลที่คาดหวัง**:
- ✅ ดึงข้อมูลจาก API สำเร็จ
- ✅ แสดง tracking events ถูกต้อง
- ✅ วันที่แปลงจาก พ.ศ. เป็น ค.ศ. ถูกต้อง
- ✅ Status mapping ถูกต้อง
- ✅ แสดง track count ใน console

---

### Test Case 3: ทดสอบ Caching

**วัตถุประสงค์**: ทดสอบว่า caching ทำงานถูกต้อง

**ขั้นตอน**:
1. เพิ่มพัสดุและ refresh ครั้งแรก
2. ดู console log:
   ```
   Fetching from Thailand Post API
   ```

3. Refresh อีกครั้งภายใน 5 นาที
4. ดู console log:
   ```
   Using cached data for EY145587896TH
   ```

5. รอ 5 นาที แล้ว refresh อีกครั้ง
6. ดู console log:
   ```
   Fetching from Thailand Post API
   ```

**ผลที่คาดหวัง**:
- ✅ ครั้งแรกเรียก API
- ✅ ครั้งที่สองใช้ cache (ภายใน 5 นาที)
- ✅ หลัง 5 นาทีเรียก API ใหม่

---

### Test Case 4: ทดสอบ Force Refresh

**วัตถุประสงค์**: ทดสอบการ bypass cache

**ขั้นตอน**:
1. เพิ่มพัสดุและ refresh ครั้งแรก
2. Refresh ทันที (ภายใน 5 นาที)
3. ตรวจสอบว่าใช้ cache

4. เปิด browser console และรัน:
   ```javascript
   // Force refresh by clearing cache
   localStorage.clear();
   location.reload();
   ```

5. หรือแก้ไข code ใน `ParcelDetail.tsx` เพื่อส่ง `forceRefresh: true`

**ผลที่คาดหวัง**:
- ✅ เรียก API ใหม่แม้ว่ามี cache
- ✅ ข้อมูลอัพเดทล่าสุด

---

### Test Case 5: ทดสอบ Error Handling - Invalid Tracking Number

**วัตถุประสงค์**: ทดสอบการจัดการ tracking number ที่ไม่มีในระบบ

**ขั้นตอน**:
1. เพิ่มพัสดุด้วย tracking number ที่ไม่มีจริง:
   ```
   INVALID123456TH
   ```

2. คลิก "Details" และ "Refresh"

3. ตรวจสอบ console log และ UI

**ผลที่คาดหวัง**:
- ✅ ไม่ crash
- ✅ แสดง status "Unknown"
- ✅ Timeline ว่างเปล่า
- ✅ ไม่มี error ใน console (หรือมี warning เท่านั้น)

---

### Test Case 6: ทดสอบ Error Handling - API Token ไม่ถูกต้อง

**วัตถุประสงค์**: ทดสอบเมื่อ API token หมดอายุหรือไม่ถูกต้อง

**ขั้นตอน**:
1. ตั้งค่า `.env` ด้วย token ที่ไม่ถูกต้อง:
   ```env
   VITE_THAILAND_POST_API_TOKEN=Token INVALID_TOKEN
   ```

2. รัน development server
3. เพิ่มพัสดุและ refresh

**ผลที่คาดหวัง**:
- ✅ แสดง error message ใน UI
- ✅ Fallback ไปใช้ mock data (ถ้ามี)
- ✅ ไม่ crash
- ✅ แสดง error ใน console

---

### Test Case 7: ทดสอบ Error Handling - Network Timeout

**วัตถุประสงค์**: ทดสอบเมื่อ API ไม่ตอบกลับ

**ขั้นตอน**:
1. ปิด internet connection หรือใช้ browser developer tools เพื่อ throttle network
2. เพิ่มพัสดุและ refresh
3. รอ 30 วินาที (timeout)

**ผลที่คาดหวัง**:
- ✅ แสดง error message "Request timeout"
- ✅ ไม่ค้างที่ loading state
- ✅ Fallback ไปใช้ mock data (ถ้ามี)

---

### Test Case 8: ทดสอบ Status Mapping

**วัตถุประสงค์**: ทดสอบการแปลง status codes

**ขั้นตอน**:
1. ใช้ tracking numbers ที่มี status codes ต่างๆ
2. ตรวจสอบว่า status แสดงถูกต้อง

**Status Codes ที่ควรทดสอบ**:
- `103` (DEPOSIT) → `pending_dispatch`
- `201` (EXPORT_CENTER) → `in_transit`
- `301` (DELIVERY) → `delivered`
- `401` (RETURN) → `returned`
- `501` (CUSTOMS) → `customs_inspection`

**ผลที่คาดหวัง**:
- ✅ Status badge แสดงสีและข้อความถูกต้อง
- ✅ Timeline แสดงเหตุการณ์ครบถ้วน

---

### Test Case 9: ทดสอบ Date Conversion

**วัตถุประสงค์**: ทดสอบการแปลงวันที่จาก พ.ศ. เป็น ค.ศ.

**ขั้นตอน**:
1. ดึงข้อมูล tracking ที่มีวันที่ในรูปแบบ Thai:
   ```
   "19/07/2562 18:12:26+07:00"
   ```

2. ตรวจสอบว่าแสดงวันที่เป็น:
   ```
   July 19, 2019 18:12
   ```

**ผลที่คาดหวัง**:
- ✅ ปี 2562 (พ.ศ.) แปลงเป็น 2019 (ค.ศ.)
- ✅ เดือนและวันถูกต้อง
- ✅ เวลาและ timezone ถูกต้อง

---

### Test Case 10: ทดสอบ Multiple Tracking Numbers

**วัตถุประสงค์**: ทดสอบการจัดการหลายพัสดุพร้อมกัน

**ขั้นตอน**:
1. เพิ่มพัสดุ 5-10 รายการ
2. Refresh ทีละรายการ
3. ตรวจสอบ performance และ API rate limit

**ผลที่คาดหวัง**:
- ✅ ทุกรายการดึงข้อมูลได้
- ✅ ไม่เกิน rate limit (1500/day)
- ✅ Cache ทำงานถูกต้องสำหรับแต่ละรายการ

---

## Manual Testing Checklist

### UI/UX Testing
- [ ] Loading spinner แสดงขณะ refresh
- [ ] Error message แสดงชัดเจน
- [ ] Error message สามารถปิดได้
- [ ] Timeline แสดงเรียงตามเวลา (ล่าสุดก่อน)
- [ ] Status badge แสดงสีถูกต้อง
- [ ] Responsive design ทำงานบนมือถือ

### Functionality Testing
- [ ] เพิ่มพัสดุใหม่ได้
- [ ] ลบพัสดุได้
- [ ] Refresh tracking data ได้
- [ ] Cache ทำงานถูกต้อง
- [ ] Fallback ไป mock data เมื่อ API error

### Performance Testing
- [ ] API response time < 3 วินาที
- [ ] Cache response time < 100ms
- [ ] ไม่มี memory leak
- [ ] ไม่มี infinite loop

### Security Testing
- [ ] API token ไม่ถูก expose ใน client-side code
- [ ] Input validation ทำงาน
- [ ] XSS protection
- [ ] HTTPS ใช้งานได้

## Automated Testing (Future)

### Unit Tests
```typescript
// Example unit test for status mapper
describe('mapThailandPostStatus', () => {
  it('should map DEPOSIT to pending_dispatch', () => {
    expect(mapThailandPostStatus('103')).toBe('pending_dispatch');
  });
  
  it('should map DELIVERY to delivered', () => {
    expect(mapThailandPostStatus('301')).toBe('delivered');
  });
});
```

### Integration Tests
```typescript
// Example integration test for API service
describe('fetchThailandPostTracking', () => {
  it('should fetch tracking data successfully', async () => {
    const response = await fetchThailandPostTracking('EP123456789TH');
    expect(response.status).toBeDefined();
    expect(response.history).toBeInstanceOf(Array);
  });
});
```

## Debugging Tips

### Enable Verbose Logging
เปิด browser console และดู logs:
```javascript
// Check if API is configured
console.log('API configured:', isThailandPostAPIConfigured());

// Check cache stats
console.log('Cache stats:', getCacheStats());

// Clear cache manually
clearCache();
```

### Network Debugging
1. เปิด Browser DevTools → Network tab
2. Filter by "track"
3. ดู request/response headers และ body
4. ตรวจสอบ status code และ timing

### Common Issues

**Issue**: "Thailand Post API is not configured"
- **Solution**: ตรวจสอบว่า `VITE_THAILAND_POST_API_TOKEN` ถูกตั้งค่าใน `.env`

**Issue**: "Request timeout"
- **Solution**: ตรวจสอบ internet connection หรือเพิ่ม timeout duration

**Issue**: วันที่แสดงผิด
- **Solution**: ตรวจสอบ `convertThaiDateToISO()` function

**Issue**: Status ไม่ถูกต้อง
- **Solution**: ตรวจสอบ `mapThailandPostStatus()` function

## Test Report Template

```markdown
# Test Report - Thailand Post API Integration

**Date**: YYYY-MM-DD
**Tester**: [Name]
**Version**: 1.0.0

## Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| Mock Data | ✅ Pass | - |
| Real API | ✅ Pass | - |
| Caching | ✅ Pass | - |
| Force Refresh | ✅ Pass | - |
| Invalid Tracking | ✅ Pass | - |
| Invalid Token | ✅ Pass | - |
| Network Timeout | ✅ Pass | - |
| Status Mapping | ✅ Pass | - |
| Date Conversion | ✅ Pass | - |
| Multiple Tracking | ✅ Pass | - |

## Issues Found
- None

## Recommendations
- All tests passed successfully
- System is ready for production
```

---

**Last Updated**: November 9, 2025
**Status**: Ready for Testing ✅
