# RxTU10 — Class Dashboard

Gamified class dashboard สำหรับนักศึกษาเภสัชศาสตร์ ธรรมศาสตร์ รุ่น 10 (Rx 2565)
รวมระบบสะสมสัตว์เลี้ยง, การต่อสู้, มินิเกม, leaderboard และเครื่องมือคำนวณทางเภสัชกรรม

🔗 **Live:** https://pikar10tu.github.io/RxTU10-Selection-Tracking/

## Tech Stack

- Vanilla JavaScript (ES Modules) — ไม่มี build step
- Firebase (Authentication + Firestore)
- Tailwind CSS (CDN) + custom CSS
- Deploy: GitHub Pages

## โครงสร้างไฟล์

```
index.html          — HTML shell + modal templates
css/style.css       — สไตล์ทั้งหมด (Light/Material theme)
js/
  config.js         — Firebase init + ค่าคงที่ของระบบ
  data.js           — ข้อมูลเกม (pets, drugs, rarity, elements)
  app.js            — business logic หลัก
  tabs/
    leaderboard.js  — แท็บ Rank
    admin.js        — แท็บ Admin Panel
firestore.rules     — Firestore Security Rules (deploy ผ่าน Firebase Console)
```

## ฟีเจอร์

- 🐾 **Pet System** — gacha/ไข่, วิวัฒนาการยีน (grade), ตีบวก (forge), รายได้รายวัน
- ⚔️ **Battle** — PvP, Tower (หอคอยไร้สิ้นสุด), ส่งสัตว์ผจญภัย (expedition)
- 🎮 **Mini-games** — ทายชื่อเพื่อน, ทายยา, Color Tiles
- 🧪 **Gene Lab** — fusion / mutation ของสัตว์เลี้ยง
- 🧮 **เครื่องคิดเลขเภสัช** — CrCl, BMI, BSA, eGFR, Vancomycin AUC ฯลฯ
- 🏆 **Leaderboard** — 6 หมวด (เหรียญ, PvP, tower, quiz, drug, pet)
- ⚙️ **Admin Panel** — ภาพรวม, announcement, จัดการข่าว/สมาชิก/เหรียญ

## พัฒนาต่อ

เปิด `index.html` ผ่าน local server (เช่น Live Server ของ VS Code) —
ต้องเสิร์ฟผ่าน HTTP ไม่ใช่เปิดไฟล์ตรงๆ เพราะใช้ ES Modules

## License

MIT
