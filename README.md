**Frontend (Next.js + Tailwind) — Plaan**

**Stack**
- Next.js (App Router, TypeScript)
- Tailwind CSS v3.4+, PostCSS/Autoprefixer
- Data layer: React Query või SWR
- i18n: next-intl või next-i18next
- Analytics: GTM/Gtag + consent mode
- API kliendid: OpenAPI genereeritud (typescript-fetch või axios) + kerge adapter

**Moodulid**
- Auth: NextAuth.js (Credentials + Google/Facebook), SSR-sõbralik cookie-põhine sessioon
- Route-guards: server components + middleware (edge) kaitstud teedele
- UI: Headless UI/Radix + Tailwind komponendid; ikoonid (Heroicons)
- State: kerge lokaalne + React Query server-andmete jaoks

**Migreerimine**
- Kaardista Nuxt `pages` → Next App Router segmentid (sh dünaamilised teed)
- Teenused (`~/services`) → OpenAPI typed kliendid + hooks (useXxx)
- I18n tõlkefailid → `app/[locale]/...` struktuur
- Nuxt middleware → Next middleware + server actions

**Järgmised sammud**
- Lisada Next.js skeleton (package.json, tsconfig, tailwind config) kui install lubatud
- Kirjutada auth voog (NextAuth + backend endpointid)
- Luua layout’id ja baaslehed (index, login, videos, trainers, programs)

**Auth voog (paroolideta, 1 aasta seadepüsivus)**
- Sisselogimise UX:
  1) E-maili sisestus → POST `/auth/email-code/request` (ei avalda, kas email eksisteerib).
  2) Koodivorm (6 numbrit) → POST `/auth/email-code/verify` (device_name, challenge_id, code).
  3) Backend tagastab `access_token` + seab refresh-cookie 365 päevaks. Me hoiame access tokenit mälus (või secure cookie, kui SSR vajalik) ja uuendame taustal.
- OAuth (Google/Facebook/Stebby):
  - Nupu klik → Next.js API `/api/auth/oauth/{provider}` → provider → callback `/api/auth/oauth/{provider}/callback` → seab refresh-cookie ja alustab sessiooni.
  - Env: `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URL`, `FACEBOOK_APP_ID/SECRET/REDIRECT_URL`, `STEBBY_CLIENT_ID/SECRET/AUTH_URL/TOKEN_URL/USERINFO_URL/REDIRECT_URL`.
- Säilitamine:
  - Refresh: httpOnly Secure cookie (365 päeva), SameSite=Lax; Access: lühike (15 min) kas memory või non-httpOnly cookie SSR tarbeks. Soovitus: kasutada server-poolset `next/headers` lugemist ja edastada Authorization päis server-komponentides.
- Uuendamine:
  - `POST /auth/refresh` edge middleware’is või React Query `onError` handleris (401 korral), roteerib refresh’i.
- Logout:
  - `POST /auth/logout` + frontis cache reset + suunamine loginile.

**Komponendid/Lehed**
- `app/(auth)/login` — email sisestus + koodivorm; OAuth nupud; seadmenimi automaatselt (OS/UA) või käsitsi.
- `app/(protected)/*` — middleware kontrollib access tokenit, vajadusel käivitab refreshi.

**Turve**
- Rate limit login/verify; koodi bruteforce kaitse; ühekordne kood; pettusevastased mikroviited (aeglustused, CAPTCHAvajadus kui rünnak).
