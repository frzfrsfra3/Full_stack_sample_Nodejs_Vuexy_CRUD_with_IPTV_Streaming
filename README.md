# IPTV System


- **frontend**: User Interface with vuejs 3  / vuetify 
- **realbackend**: Backend in nodejs with support streaming ffmpeg

## Requirements
- Node.js (v18+)
- MySQL
- FFmpeg

## Run the project

### backend
```bash
cd realbackend
cp .env.example .env   
npm install
npm run setup          # creating database with seed
npm start
```

### frontend
```bash
cd frontend
npm install
npm run dev
```
