# แจ้งเตือนใกล้ชนลิมิต Firestore ทางอีเมล (Cloud Monitoring) — Phase 3a

เป้าหมาย: ให้ Google ส่งอีเมลหาแอดมินเมื่อ document reads/writes ต่อวันใกล้ลิมิตฟรี
(Spark: **อ่าน 50k/วัน, เขียน 20k/วัน**) — เป็น backstop ตัวจริงที่เชื่อถือได้ ไม่กิน read/write ของแอป
(ตัวนับในแอป = Phase 3b เป็นแค่ค่าประมาณการช่วยมองเห็น)

> ⚠️ ทำครั้งเดียว ใน **Google Cloud Console** ของโปรเจกต์เดียวกับ Firebase (`pikar10tu` / โปรเจกต์ rxtu10)
> เป็นงาน **คลิกใน console** ไม่ใช่โค้ด — ทำเองตามขั้นตอนนี้

## ขั้นตอน

1. เปิด <https://console.cloud.google.com/monitoring/alerting> → เลือกโปรเจกต์ให้ตรง
2. **+ CREATE POLICY**
3. **Select a metric** → ปิด "Show only active resources" ออกถ้าหาไม่เจอ →
   ค้นหา **`Firestore`** → เลือก resource **Firestore Database / Cloud Firestore Database**
   → metric **`Document reads`** (`firestore.googleapis.com/document/read_count`)
4. **Transform data**:
   - Rolling window: **`1 day` (1440 min)** — แทนยอดสะสมทั้งวัน
   - Rolling window function: **`sum`**
5. **Configure trigger**:
   - Condition type: **Threshold**
   - Alert trigger: **Any time series violates**
   - Threshold position: **Above threshold**
   - Threshold value: **`40000`** (80% ของ 50k → เผื่อเวลาแก้ก่อนชนจริง)
6. **Notifications** → **Manage notification channels** → เพิ่ม **Email** = อีเมลแอดมิน
   (`prawich.aum@dome.tu.ac.th`) → กลับมาเลือก channel นั้น
7. ตั้งชื่อ policy เช่น **`Firestore reads ใกล้ลิมิตฟรี`** → **CREATE**

## ทำซ้ำสำหรับ "เขียน" (writes)

ทำ policy ที่ 2 เหมือนกัน แต่:
- metric = **`Document writes`** (`document/write_count`)
- threshold = **`16000`** (80% ของ 20k)

## หมายเหตุ / กับดัก

- ⚠️ **บาง alerting feature ต้องใช้ Blaze plan** — ถ้า console ฟ้องว่าใช้บน Spark ไม่ได้
  ให้อัปเป็น **Blaze** (ยังมี free quota เดิม 50k/20k จ่ายเฉพาะส่วนที่เกิน + ผูกบัตรไว้เฉยๆ ได้)
  หรือถ้าไม่อยากเปิด Blaze ให้พึ่ง **ตัวนับในแอป (Phase 3b)** ที่หน้า Admin เป็นหลักไปก่อน
- metric ของ Cloud Monitoring มี delay ~ไม่กี่นาที — ปกติ
- ตัวเลข threshold ปรับได้ตามพฤติกรรมจริงหลังเปิดตัว (ดูแนวโน้มจาก dashboard 2–3 วันแรก)
