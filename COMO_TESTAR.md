
# Como Testar o WhatsApp

Você precisa rodar o comando no **Terminal** do VS Code.

## Passo a Passo

1.  **Abra o Terminal:**
    *   No menu superior, clique em **Terminal** -> **New Terminal**.
    *   OU use o atalho `Ctrl + '` (Aspas simples).
    *   Uma janela preta vai abrir na parte de baixo do VS Code.

2.  **Confira a Pasta:**
    *   Certifique-se que o texto no terminal termina com `leadtriage`.
    *   Se não estiver, digite: `cd .gemini/antigravity/scratch/leadtriage`

3.  **Rode o Comando:**
    *   Copie e cole o comando abaixo (substitua o número pelo seu WhatsApp pessoal):

```cmd
node scripts/test-send.js 5511999999999
```

*Exemplo: Se seu número for (11) 99999-8888, digite: `node scripts/test-send.js 5511999998888`*
