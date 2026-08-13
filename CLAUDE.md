## ภาพรวมโปรเจกต์

- **ชื่อโปรเจกต์**: smtrack-v2
- **คำอธิบาย**: ระบบนี้เกี่ยวกับ iot telemetry monitoring system
- **Framework**: Next.js 16 (App Router)
- **ภาษา**: TypeScript
- **Package manager**: npm

## Tech Stack

| ส่วนประกอบ       | เทคโนโลยี                |
| ---------------- | ------------------------ |
| Framework        | Next.js 16 (App Router)  |
| ภาษา             | TypeScript               |
| Styling          | Tailwind CSS 4           |
| UI Components    | DaisyUI                  |
| State Management | Zustand + TanStack Query |
| Form             | <React Hook Form + Zod>  |
| Fetching/API     | axios + TanStack Query   |
| Database/Backend | REST API ภายนอก          |
| Auth             | Auth.js                  |
| Testing          | Jest + Playwright        |
| Lint/Format      | ESLint + Prettier        |

## โครงสร้างโฟลเดอร์

```
.
├── src/
│   ├── app/                # App Router pages & layouts
│   │   ├── (auth)/         # route group สำหรับหน้า auth
│   │   ├── (main)/         # route group สำหรับหน้าหลัก
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css     # global styles (ไม่มีโฟลเดอร์ styles/ แยกต่างหาก)
│   ├── components/
│   │   ├── ui/              # base UI components (button, input, ฯลฯ)
│   │   └── features/        # component เฉพาะ feature
│   ├── lib/                 # utility functions, API clients
│   ├── hooks/                # custom React hooks
│   ├── store/                # Zustand stores (auth, theme, notification feed/sound)
│   ├── types/                 # TypeScript types/interfaces
│   └── proxy.ts               # middleware-level auth guard (เช็ค token cookie)
├── public/                 # static assets
└── CLAUDE.md
```

## คำสั่งที่ใช้บ่อย

```bash
# ติดตั้ง dependencies
npm install

# รัน dev server
npm run dev

# build production
npm run build

# start production server
npm start

# lint
npm run lint

# format
npm format

# type check
npm typecheck

# test
npm test
```

> แก้คำสั่งด้านบนให้ตรงกับ package manager และ scripts ที่ตั้งไว้ใน `package.json` จริง

## แนวทางการเขียนโค้ด (Coding Conventions)

- ใช้ **TypeScript strict mode** เสมอ ห้ามใช้ `any` ถ้าไม่จำเป็นจริงๆ
- ใช้ **Server Components** เป็นค่าเริ่มต้น เพิ่ม `"use client"` เฉพาะ component ที่ต้องใช้ interactivity/state/browser API เท่านั้น
- ตั้งชื่อไฟล์ component เป็น `PascalCase.tsx` และไฟล์ util/hook เป็น `camelCase.ts`
- ใช้ named export สำหรับ component ทั่วไป ยกเว้น `page.tsx`, `layout.tsx` ที่ Next.js กำหนดให้ต้องเป็น default export
- จัดกลุ่ม import ตามลำดับ: external packages → internal alias (`@/...`) → relative imports
- ใช้ path alias `@/*` แทนการ import แบบ relative ลึกๆ (`../../../`)
- Component ควรมีขนาดเล็ก แยกความรับผิดชอบชัดเจน (single responsibility)
- ใช้ Zod สำหรับ validate ข้อมูล input/form/API response
- จัดการ error ด้วย `error.tsx` และ `not-found.tsx` ตามแนวทางของ App Router
- ใส่ `loading.tsx` หรือ `<Suspense>` สำหรับ route/section ที่โหลดข้อมูลแบบ async

## Styling

- ใช้ <Tailwind CSS> เป็นหลัก หลีกเลี่ยง inline style ยกเว้นกรณีจำเป็น
- ยึดตาม design tokens ที่กำหนดไว้ใน `tailwind.config.ts` (สี, spacing, font)
- Component UI พื้นฐานอยู่ใน `components/ui/` ห้ามสร้างซ้ำถ้ามีอยู่แล้ว
- รองรับ responsive design ด้วย mobile-first approach

## การจัดการ State และ Data Fetching

- ข้อมูลที่ fetch ได้ตั้งแต่ server ให้ fetch ใน Server Component โดยตรง ไม่ต้องผ่าน client state
- ใช้ <TanStack Query> สำหรับ client-side data fetching ที่ต้อง revalidate/cache
- Global state (เช่น auth session, theme) ใช้ <Zustand/Context> เท่าที่จำเป็น หลีกเลี่ยง global state ที่ไม่จำเป็น

## Testing

- เขียน unit test สำหรับ utility functions และ hooks
- เขียน component test ด้วย React Testing Library สำหรับ component ที่มี logic ซับซ้อน
- เขียน e2e test ด้วย Playwright สำหรับ user flow หลัก (login, checkout, ฯลฯ)
- รัน `<npm test>` และ `<npm typecheck>` ก่อน commit ทุกครั้ง

## สิ่งที่ควรทำ (Do)

- ตรวจสอบ types ให้ตรงกับ backend/API schema เสมอ
- ใช้ `next/image` แทน `<img>` เพื่อ optimize รูปภาพ
- ใช้ `next/link` สำหรับ internal navigation
- เขียน accessible markup (semantic HTML, aria-label เมื่อจำเป็น)
- อัปเดต README/CLAUDE.md เมื่อมีการเปลี่ยนแปลงโครงสร้างหรือ convention สำคัญ

## สิ่งที่ไม่ควรทำ (Don't)

- ห้าม hardcode ค่า secret/API key ในโค้ด ให้ใช้ environment variables (`.env.local`)
- ห้ามใส่ `"use client"` โดยไม่จำเป็น
- ห้ามแก้ไฟล์ใน `components/ui/` โดยตรงถ้าเป็น component จาก library (เช่น shadcn) ให้ extend/wrap แทน
- ห้าม commit โค้ดที่ยังไม่ผ่าน lint/typecheck

## หมายเหตุเพิ่มเติม

### Theme (light / dark / system)

- ธีมถูก stamp ลง `<html data-theme>` ด้วย inline script ใน `src/app/layout.tsx` ก่อน paint เพื่อกัน FOUC — ห้าม hardcode `data-theme` กลับเข้าไป
- logic อยู่ที่ `src/lib/theme.ts` (localStorage key `smtrack.theme`) และ `src/store/useThemeStore.ts` ส่วน UI คือ `src/components/layout/ThemeToggle.tsx`
- สีของกราฟ recharts มาจาก CSS variable ใต้ `.viz-root` ใน `globals.css` ซึ่งอ้างอิง `:root[data-theme='dark']` เท่านั้น ไม่ต้องพึ่ง `prefers-color-scheme`
- component ที่อ่านค่าเริ่มต้นจาก localStorage (เช่น token) ต้องกันด้วย `useHydrated()` (`src/hooks/useHydrated.ts`) ไม่งั้น hydration ไม่ตรง

### SSE stream การแจ้งเตือน

- `/stream?channels=device,notification` มี EventSource **ตัวเดียวทั้งแอป** อยู่ที่ `RealtimeFeedProvider` (`src/components/features/realtime/RealtimeFeedProvider.tsx`, mount ใน `src/app/(main)/layout.tsx`) ผลลัพธ์ฝั่งการแจ้งเตือนเก็บใน `src/store/useNotificationFeedStore.ts` ส่วน event `device` ใช้ patch React Query cache ของ `['devices']` ตรง ๆ — `src/app/(main)/layout.tsx` ยัง mount `NotificationToastEmitter` (`src/components/features/notifications/NotificationToastEmitter.tsx`) คู่กันเพื่อโชว์ toast ของแจ้งเตือนที่เข้ามาระหว่างเปิดแอป
- component ที่ต้องใช้ข้อมูล/สถานะ stream กลาง (`NotificationBell`, `RecentNotificationsTicker`) ให้อ่านจาก store ห้ามเรียก `useSse`/`useSseChannels` เพิ่มเอง
- ส่วน `useNotificationLiveFeed` / `useTelemetryLiveFeed` เป็น stream ราย serial คนละหน้าที่กัน ยังเปิด connection ของตัวเองตามปกติ
- API ไม่มี endpoint การแจ้งเตือนรวมทุกอุปกรณ์ ตัวเลขใน bell จึงนับเฉพาะ event ที่เข้ามาระหว่างเปิดแอป
- `useSseChannels` (`src/hooks/useSse.ts`) มี reconnect ในตัวด้วย exponential backoff + jitter (base 1s, cap 30s, ไม่จำกัดจำนวนครั้ง) เมื่อ connection หลุดจะไม่ค้าง `error` เฉย ๆ — จะลอง reconnect เองเรื่อย ๆ โดยไม่ต้อง refresh หน้า, สถานะระหว่างรอ retry คือ `reconnecting` (ดู `SseStatus`/`LiveStatus`)

### สอง backend service — เลือก client ให้ถูก

| Resource | Client | Base URL |
| --- | --- | --- |
| อุปกรณ์, โพรบ, ซ่อม, config, telemetry, กราฟ, การแจ้งเตือน, backup, เฟิร์มแวร์ | `apiClient` | `NEXT_PUBLIC_API_BASE_URL` |
| login/refresh, ผู้ใช้, วอร์ด, โรงพยาบาล, reset password, health | `authApiClient` | `NEXT_PUBLIC_AUTH_API_BASE_URL` |

- ทั้งสองตัวสร้างจาก `createApiClient` ใน `src/lib/apiClient.ts` แต่ **เฉพาะ `authApiClient` เท่านั้นที่มี 401 auto-refresh**
- interceptor `toApiError` ถูกลงทะเบียนก่อน interceptor refresh ดังนั้น refresh handler จะได้ `ApiError` ไม่ใช่ `AxiosError` — `ApiError` จึงพก `config` ติดไปด้วยเพื่อให้ retry request เดิมได้ อย่าถอด field นี้ออก
- envelope ของสอง service ไม่เหมือนกัน: log service ส่ง `statusCode` มาด้วย ส่วน auth service มีแค่ `{ message, success, data }` — `toApiError` จึง fallback ไปใช้ HTTP status
- endpoint ที่ผลลัพธ์เป็น **string ไม่ใช่ entity**: `DELETE /ward/:id` และ `PATCH /reset/:id`
- `POST /user` รับ **JSON เท่านั้น** (handler ไม่อ่าน FormFile) ส่วน `PUT /user/:id`, `POST /register`, `POST|PUT /hospital` รับไฟล์ผ่าน form field ชื่อ `image` — ใช้ `toFormData`/`hasFile` จาก `src/lib/api/formData.ts` เลือกโหมดให้อัตโนมัติ

### เมนูตั้งค่า (`/settings/*`)

- โครง: `/settings` redirect ไป `/settings/account` แล้วมี `notifications` (ตั้งค่าเสียงแจ้งเตือน), `users`, `hospitals`, `devices`, `firmware`, `backup` เป็น sub-route
- ไม่มีเมนู/route แยกสำหรับ "วอร์ด" อีกต่อไป — จัดการวอร์ดของแต่ละโรงพยาบาลผ่าน section ในโมดัลแก้ไขโรงพยาบาล (`HospitalWardsSection`, เปิดจาก `HospitalFormDialog` ที่ `/settings/hospitals`) แทน
- `<h1>ตั้งค่า</h1>` อยู่ที่ `src/app/(main)/settings/layout.tsx` **ที่เดียว** — หน้าย่อยใส่ได้แค่หัวข้อระดับการ์ด
- เมนูย่อยประกาศใน `NavItem.children` (`src/components/layout/navItems.ts`) พร้อม `can` predicate ส่วน `SidebarNav` เป็นตัวกรองตาม role (ต้องผ่าน `useHydrated()` ก่อน ไม่งั้น hydration ไม่ตรง)
- `src/proxy.ts` เช็คแค่ว่ามี token cookie **ไม่ได้เช็ค role** — หน้าที่จำกัดสิทธิ์ต้องครอบด้วย `SettingsGuard` (รับ prop เป็น key ไม่ใช่ function เพราะ page เป็น Server Component ส่ง function ข้าม boundary ไม่ได้)
- สิทธิ์ใน `src/lib/permissions.ts` ต้องตรงกับ `RolesGuard` ของ smtrack-authentication เสมอ — มี `src/lib/permissions.test.ts` ล็อกตารางนี้ไว้
- `/settings/devices` เป็นทะเบียนอุปกรณ์ (เพิ่ม/แก้ไข) ส่วน `/devices` ยังเป็นหน้า monitoring เหมือนเดิม — backend ไม่มี endpoint ลบอุปกรณ์
- `/settings/firmware` จัดการคลังเฟิร์มแวร์ (แยกจาก `hardware.firmware` ที่เป็นเวอร์ชันติดตั้งจริงบนอุปกรณ์แต่ละตัวใน `DeviceFormDialog`) — `version` เป็นค่าคงที่หลังสร้าง (แก้ไม่ได้, backend เมินถ้าส่งไปตอนอัปเดต), อัปโหลดซ้ำ version เดิมได้ 409, ดาวน์โหลดไฟล์ต้องลิงก์ตรงไป `GET /firmware/download/:version` (stream binary ดิบ ไม่ผ่าน `apiClient`/envelope)

### `device.ward` คือวอร์ดของ auth service

`ward` ของอุปกรณ์ (log service, `Device.ward: string` ใน `src/lib/api/devices.ts`) เป็น **free text**
เก็บเป็นสตริงเปล่าๆ และไม่ได้ผูก foreign key จริงกับตาราง
`Wards` ของ auth service — วอร์ดฝั่ง auth service มาจาก `hospital.ward[]` ที่ backend preload ติดมากับ
`Hospital` (`src/lib/api/hospitals.ts`, `HospitalWardSchema`: `id` เป็น `WID-...`, `wardName`, `wardSeq`,
`hosId`) เดียวกับที่ `HospitalWardsSection` (เปิดจากโมดัลแก้ไขโรงพยาบาลใน `/settings/hospitals`) ใช้ CRUD ผ่าน `src/lib/api/wards.ts`

**ความสัมพันธ์ที่ต้องรักษา**: ค่าที่เก็บในฟิลด์ `ward` ของอุปกรณ์ ต้องตรงกับ `hospital.ward[].id` ของวอร์ด
ที่อุปกรณ์นั้นสังกัดอยู่จริง (ไม่ใช่ผูก foreign key ในฐานข้อมูล แต่เป็น "ค่าที่ควรเท่ากัน" ระหว่างสอง
service) — ข้อมูลเก่าบางส่วนยังเก็บเป็น **ชื่อวอร์ด** ตรงๆ (เช่น `"ICU"`, `"OPD"`) แทนที่จะเป็น id แต่
ข้อมูลที่ migrate ใหม่/อุปกรณ์ที่ลงทะเบียนผ่าน hospital-ward selector เก็บเป็น **`hospital.ward[].id`**
(`"WID-xxxx"`) แล้ว — **เวลาย้าย ward ของอุปกรณ์ไปสังกัดวอร์ดอื่น ให้เขียน `hospital.ward[].id` ของวอร์ด
ปลายทาง (string `WID-...`) ทับลงในฟิลด์ `ward` เดิม ผ่าน `updateDevice` (`PUT /device/:id`) เหมือนแก้ฟิลด์
อื่น** ไม่มี endpoint/field พิเศษสำหรับ "ย้าย ward" ต่างหาก

เพราะฟิลด์นี้เก็บได้ทั้งชื่อ (ของเก่า) และ wardId (ของใหม่) ปนกัน โค้ดที่ต้อง "จับคู่" device เข้ากับ
วอร์ดของ auth service (เช่น filter ในหน้า devices) ต้องเทียบกับได้ทั้ง `ward.id` และ `ward.wardName` เสมอ
(case-insensitive) — ดูตัวอย่างจริงที่ `matchesWard()` ใน `src/components/features/devices/DeviceList.tsx`

ช่องวอร์ดในฟอร์มอุปกรณ์ยังคงห้ามทำเป็น `<select>` ที่ส่ง ward id ไปตรงๆ เพราะจะทำให้ค่าเดิมหายตอนแก้ไข
ข้อมูลเก่าที่เก็บเป็นชื่อ ใช้ `<input>` + `<datalist>` ที่รวบรวมค่าที่มีอยู่จากอุปกรณ์เดิมแทน (ดู
`DeviceFormDialog.tsx`) เพื่อรองรับทั้งการพิมพ์ชื่อ (backward-compat กับข้อมูลเก่า) และการวางค่า
`hospital.ward[].id` ที่ได้จากฟอร์ม/ฟีเจอร์ย้าย ward

### ข้อควรระวังเรื่อง e2e

Playwright ใช้ strict mode — ข้อความที่ assert ในเทส (เช่น `อุปกรณ์ทั้งหมด`, `การแจ้งเตือนล่าสุด`) ต้อง match ได้ตัวเดียวในหน้านั้น ระวังหัวข้อ dropdown/การ์ดที่ใช้คำซ้ำกัน

การ match ชื่อ role ของ Playwright เป็น **substring** โดยค่าเริ่มต้น — เมนู `อุปกรณ์` กับ `จัดการอุปกรณ์` จึงชนกัน ต้องใส่ `{ exact: true }` (ดู `e2e/devices.spec.ts`)
