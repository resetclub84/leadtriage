@echo off
cd /d "%~dp0"
title TESTE WHATSAPP LEADTRIAGE
color 0A

echo ========================================================
echo      TESTE DE ENVIO WHATSAPP (LEADTRIAGE)
echo ========================================================
echo.
echo Este script vai testar se sua conexao com a Meta esta funcionando.
echo.
set /p phone="Digite o numero do celular para teste (Ex: 5511999998888): "
echo.
echo --------------------------------------------------------
echo Enviando mensagem para %phone%...
echo --------------------------------------------------------
echo.

call node scripts/test-send.js %phone%

echo.
echo ========================================================
echo Teste finalizado. Veja o resultado acima.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
