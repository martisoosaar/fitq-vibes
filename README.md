**FitQ Vibes — Next.js Monoliit**

- Eesmärk: Koondada front ja back ühte Next.js teenusesse, et lihtsustada deploy’d ja vähendada keerukust.
- Sisu: `frontend` (React + Next.js + Tailwind CSS; sisaldab ka API route’e), `docs` (OpenAPI, arhitektuur).

**Staatus**
- Uuendatud suund: Next.js + Tailwind, API Next.js route handleritega. Laravel skeleton jäeti arhiveeritud näitena, kuid ei kasutata edaspidi.

**Struktuur**
- `frontend/` — Next.js App Router (TypeScript, Tailwind, React Query/SWR, i18n, GTM/consent) + `app/api/*` backend endpointid.
- `docs/openapi/` — OpenAPI 3.0 leping, kliendigeneratsiooni alus.

**Otsused, mida vaja kinnitada**
- Auth: NextAuth.js (Credentials+OAuth) + Laravel Sanctum vs puhas JWT (access/refresh cookie’d).
- Admin: jätkame Voyager’iga või liigume Filament/Nova’le.
- DB: MySQL 8 või Postgres 15; Redis job’ideks/cache’iks.

**Kohalik arendus (siht)**
- Docker Compose: `frontend`, `backend`, `db`, `redis`, `mailhog`. (Lisame failid, kui ülalotsused kinnitatud.)

**Kiired järgmised sammud**
1) Täiendada Next.js API auth endpointid (paroolideta + OAuth stubid) ja lisada DB-kiht (Prisma + Postgres/MySQL).
2) Kirjeldada OpenAPI skeem (server: http://localhost:3000/api) ja genereerida typed kliendid.
3) Viia videod/treenerid/programmid uutele API-dele samm-sammult.
