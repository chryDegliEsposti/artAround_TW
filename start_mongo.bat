@echo off
echo ===================================================
echo   Avvio MongoDB Server 7.0 per ArtAround
echo ===================================================
if not exist "E:\MongoDB_data\db" mkdir "E:\MongoDB_data\db"
"E:\MongoDB_Server_7.0\mongodb-win32-x86_64-windows-7.0.14\bin\mongod.exe" --dbpath "E:\MongoDB_data\db" --bind_ip 127.0.0.1 --port 27017
pause
