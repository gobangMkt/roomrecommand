@echo off
cd /d "C:\Users\vltwn\my-claude-project\2.업무\5.roomrecommand\0.host"
if not exist node_modules npm install
start http://localhost:3002
npm run dev
pause
