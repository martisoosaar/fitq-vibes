**Legacy → Next.js (MySQL) migratsioon**

Soovituslik voog, et tuua andmed vanast live-baasist uude Prisma skeemi.

1) Turvalisus
- Kasuta read-only kasutajat migreerimiseks ja/või roteeri paroolid pärast migreerimist.
- Ära pane paroole püsivalt repo failidesse; kasuta `.env.local`.

2) Ekspordi legacy andmed (alternatiivid)
- A. Off-line dump: tee dump ja lae see lokaalselt sisse
  - `mysqldump -h <host> -u <user> -p --databases <db> > legacy.sql`
  - Lae dump konteinerisse: `docker cp legacy.sql <container>:/tmp/legacy.sql`
  - Taasta dump uude baasi (nt `fitq_legacy`): `mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS fitq_legacy;" && mysql -u root -p fitq_legacy < /tmp/legacy.sql`
- B. Otselink (vajab võrku): seadista `LEGACY_DATABASE_URL` ja kasuta import-skripti otse (ei soovita ilma IP whitelisti ja read-only rollita).

3) Sea env ja Prisma
- `cp frontend/.env.example frontend/.env.local` ja täida:
  - `DATABASE_URL=mysql://fitq:fitq@localhost:3306/fitqvibes`
  - `LEGACY_DATABASE_URL=mysql://user:pass@localhost:3306/fitq_legacy`
- Prisma:
  - `cd frontend && npm run prisma:generate && npm run prisma:migrate`

4) Täienda importeri päringud ja käivita
- Fail: `frontend/scripts/import-legacy.js`. Värskenda SQL päringud vastavalt legacy skeemile (tabeli/veerunimed).
- Käivita: `cd frontend && npm run import:legacy`

5) Kontrolli andmeid
- `/api/videos`, `/api/trainers`, `/api/programs` peaksid tagastama reaandmeid; lehed `/videos`, `/trainers`, `/programs` SSR-is kuvavad need.

