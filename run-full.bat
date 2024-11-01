@echo off
echo Iniciando extraccion de tarjetas Trello para tableros Sistema Soporte y Sistemas Comercial
call npm run dev -- --board "" --fromDate "" --labels "" --archived ""
pause