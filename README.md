# LeadTriage SaaS MVP

A minimal viable product for a premium medical clinic lead management system.

## Setup

1.  **Database**: Ensure Docker is running.
    ```bash
    docker-compose up -d
    ```

2.  **Environment**:
    Copy `.env.example` to `.env` (already done).
    Set `GEMINI_API_KEY` in `.env`.

3.  **Dependencies**:
    ```bash
    npm install
    ```

4.  **Database Setup**:
    ```bash
    npx prisma db push
    npm run seed # (Optional - see below)
    ```

5.  **Run Dev Server**:
    ```bash
    npm run dev
    ```

## Testing Webhooks

**Send a new lead:**

```bash
curl -X POST http://localhost:3000/api/webhooks/lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Webhook",
    "phone": "5511999999999",
    "message": "Quero agendar uma consulta para hipertrofia.",
    "source": "web"
  }'
```

**Payload for n8n/Sheets:**

The system expects a JSON body with keys matching the `Lead` model fields (name, phone, message, source, etc.).

## Features
*   **AI Triaging**: Automatically categorizes leads using Gemini.
*   **CRM**: Simple status pipeline (New, Triaging, Contacted, etc.).
*   **Actions**: One-click WhatsApp and Google Form links.
