# IPTV System

مشروع لإدارة بث IPTV يتكون من:
- **frontend**: واجهة مستخدم Vue.js مع Vuetify.
- **realbackend**: خادم Express/Node.js مع MySQL و FFmpeg.

## المتطلبات
- Node.js (v18+)
- MySQL
- FFmpeg

## تشغيل المشروع

### backend
```bash
cd realbackend
cp .env.example .env   # عدّل بيانات الاتصال
npm install
npm run setup          # إنشاء قاعدة البيانات والبذور
npm start
```