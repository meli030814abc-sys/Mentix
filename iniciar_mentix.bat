@echo off
title MENTIX - Servidor Web Local
cd /d "%~dp0"
echo ========================================================
echo   Iniciando MENTIX con Servidor Local...
echo   (Los videos de YouTube se reproducen aqui directamente)
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
