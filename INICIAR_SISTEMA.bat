@echo off
title LEADTRIAGE - SISTEMA DE GESTAO
color 0B

echo ========================================================
echo        INICIANDO LEADTRIAGE V2.0 PRO
echo ========================================================
echo.
echo 1. Verificando ambiente e limpando porta 3000...
taskkill /F /IM node.exe >nul 2>&1
cd /d "%~dp0"

echo 2. Iniciando Servidor...
echo    (Aguarde a mensagem "Ready in..." e depois uma janela vai abrir)
echo.

start "" "http://localhost:3000"
npm run dev
pause
