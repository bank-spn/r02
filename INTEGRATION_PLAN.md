# แผนการ Integrate Thailand Post API

## วิเคราะห์สถานะปัจจุบัน

### โครงสร้างโปรเจคที่มีอยู่
โปรเจค **Personal Parcel Tracker** เป็น web application ที่สร้างด้วย React, TypeScript, และ TailwindCSS โดยมีโครงสร้างแบบ full-stack ที่ประกอบด้วย client-side และ server-side ที่เตรียมไว้แล้ว ปัจจุบันระบบใช้ localStorage ในการจัดเก็บข้อมูลพัสดุ และมี API placeholder สำหรับการเชื่อมต่อกับ Thailand Post API ในอนาคต

### ฟีเจอร์หลักที่มีอยู่
ระบบมีฟีเจอร์หลักดังนี้ Dashboard สำหรับแสดงภาพรวมพัสดุทั้งหมด, ParcelDetail สำหรับแสดงรายละเอียดและ Timeline ของพัสดุแต่ละรายการ, AddParcelModal สำหรับเพิ่มพัสดุใหม่, และ Timeline component สำหรับแสดงประวัติการจัดส่ง นอกจากนี้ยังมี localStorage integration และ mock API data สำหรับการทดสอบ

### ข้อมูล Thailand Post API
จากเอกสารที่ได้รับมา Thailand Post API มีรายละเอียดดังนี้

**Endpoint**: `https://trackapi.thailandpost.co.th/post/api/v1/track`

**Method**: POST

**Headers**:
- Authorization: Token eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9...
- Content-Type: application/json

**Request Body**:
```json
{
  "status": "all",
  "language": "EN",
  "barcode": ["EY145587896TH", "RC338848854TH"]
}
```

**Response Structure**:
```json
{
  "response": {
    "items": {
      "ED852942182TH": [
        {
          "barcode": "ED852942182TH",
          "status": "103",
          "status_description": "DEPOSIT",
          "status_date": "19/07/2562 18:12:26+07:00",
          "statusDetail": "รับฝากสิ่งของ",
          "location": "KAD_SUAN",
          "postcode": "00131",
          "delivery_status": null,
          "delivery_description": null,
          "delivery_datetime": null,
          "receiver_name": null,
          "signature": null
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

## แผนการ Integration

### Phase 1: สร้าง Thailand Post API Service

**วัตถุประสงค์**: สร้าง service layer สำหรับเชื่อมต่อกับ Thailand Post API โดยแยกออกจาก business logic

**ไฟล์ที่ต้องสร้าง/แก้ไข**:
1. `client/src/services/thailandPostAPI.ts` - Service สำหรับเรียก Thailand Post API
2. `client/src/types/thailandPost.ts` - Type definitions สำหรับ Thailand Post API response
3. `client/src/utils/api.ts` - แก้ไขให้ใช้ Thailand Post service แทน mock data

**การทำงาน**:
- สร้าง function `fetchThailandPostTracking()` ที่รับ tracking number และเรียก API
- แปลง response จาก Thailand Post format เป็น format ที่ application ใช้
- จัดการ error handling และ rate limiting
- เก็บ API token ไว้ใน environment variable

### Phase 2: แปลง Status Mapping

**วัตถุประสงค์**: แปลง status code จาก Thailand Post API เป็น ParcelStatus ที่ application ใช้

**Status Mapping**:
- `103` (DEPOSIT) → `pending_dispatch`
- `201` (EXPORT_CENTER) → `in_transit`
- `202` (IMPORT_CENTER) → `in_transit`
- `301` (DELIVERY) → `delivered`
- `401` (RETURN) → `returned`
- `501` (CUSTOMS) → `customs_inspection`

**ไฟล์ที่ต้องสร้าง/แก้ไข**:
1. `client/src/utils/statusMapper.ts` - Function สำหรับแปลง status

### Phase 3: อัพเดท API Integration

**วัตถุประสงค์**: แก้ไข `fetchTrackingStatus()` function ให้เรียกใช้ Thailand Post API จริง

**การทำงาน**:
- แก้ไข `client/src/utils/api.ts` ให้เรียกใช้ `fetchThailandPostTracking()`
- เพิ่ม caching mechanism เพื่อลด API calls
- เพิ่ม retry logic สำหรับ network errors
- จัดการ rate limiting (1500 requests per day)

### Phase 4: Environment Configuration

**วัตถุประสงค์**: จัดการ configuration และ secrets

**ไฟล์ที่ต้องสร้าง/แก้ไข**:
1. `.env.example` - Template สำหรับ environment variables
2. `vite.config.ts` - อาจต้องแก้ไข config สำหรับ env variables

**Environment Variables**:
```
VITE_THAILAND_POST_API_URL=https://trackapi.thailandpost.co.th/post/api/v1/track
VITE_THAILAND_POST_API_TOKEN=Token eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9...
```

### Phase 5: เพิ่ม Error Handling และ Loading States

**วัตถุประสงค์**: ปรับปรุง UX เมื่อเรียก API

**ไฟล์ที่ต้องแก้ไข**:
1. `client/src/pages/ParcelDetail.tsx` - เพิ่ม loading state และ error display
2. `client/src/components/ParcelCard.tsx` - แสดง status การ sync

### Phase 6: Testing และ Documentation

**วัตถุประสงค์**: ทดสอบการทำงานและเขียน documentation

**งานที่ต้องทำ**:
- ทดสอบกับ tracking number จริง
- ทดสอบ error cases (invalid tracking number, network error, rate limit)
- อัพเดท README.md ด้วยข้อมูล API integration
- สร้าง documentation สำหรับ developers

## ข้อควรระวัง

### Security
- **ห้าม** เก็บ API token ใน code โดยตรง ต้องใช้ environment variables
- ใช้ HTTPS สำหรับการเรียก API
- Validate input ก่อนส่งไป API

### Rate Limiting
- Thailand Post API มี limit 1500 requests per day
- ควรใช้ caching เพื่อลด API calls
- แสดง warning เมื่อใกล้ถึง limit

### Data Format
- Thailand Post ใช้ Buddhist Era (พ.ศ.) สำหรับวันที่ ต้องแปลงเป็น Gregorian (ค.ศ.)
- Timezone เป็น +07:00 (Asia/Bangkok)
- Status code เป็นตัวเลข ต้องแปลงเป็น text

### User Experience
- แสดง loading indicator เมื่อกำลังเรียก API
- แสดง error message ที่เข้าใจง่ายเมื่อเกิด error
- เก็บ cache ของ tracking data เพื่อลดเวลารอ
- ให้ user สามารถ manual refresh ได้

## Timeline การพัฒนา

1. **Phase 1-2**: สร้าง service layer และ status mapping (30 นาที)
2. **Phase 3**: อัพเดท API integration (20 นาที)
3. **Phase 4**: Configuration และ environment setup (10 นาที)
4. **Phase 5**: Error handling และ UX improvements (20 นาที)
5. **Phase 6**: Testing และ documentation (20 นาที)

**รวมเวลาโดยประมาณ**: 100 นาที (1 ชั่วโมง 40 นาที)

## ผลลัพธ์ที่คาดหวัง

เมื่อเสร็จสิ้นการ integration ระบบจะสามารถ:
- เรียก Thailand Post API เพื่อดึงข้อมูล tracking จริง
- แสดงสถานะพัสดุแบบ real-time
- แปลง status และ format ข้อมูลให้เหมาะสมกับ UI
- จัดการ errors และ edge cases ได้อย่างเหมาะสม
- มี documentation ที่ชัดเจนสำหรับ developers

ระบบจะยังคงรองรับ mock data สำหรับการทดสอบ และสามารถ switch ระหว่าง mock กับ real API ได้ผ่าน environment variables
