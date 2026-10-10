# Lucky Draw

React, TypeScript, and Vite lucky-draw experience.

## Run

```bash
npm install
npm run dev
```

## Pages

- Registration (`/`) collects participant details and creates a ticket.
- QR Ticket (`/qr`) displays a scannable code containing the ticket details.
- Spin & Win (`/spin`) provides an animated prize wheel.

Participant details are kept in browser local storage so the QR and wheel pages can use the active ticket after navigation or refresh.

## API

The frontend reads its API base URL from `VITE_API_URL` in `.env`. Registration sends a JSON `POST /users` request and uses the returned backend UUID as the entry ticket ID.
