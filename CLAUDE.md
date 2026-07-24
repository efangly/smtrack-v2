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
├── app/                    # App Router pages & layouts
│   ├── (auth)/             # route group สำหรับหน้า auth
│   ├── (main)/             # route group สำหรับหน้าหลัก
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # base UI components (button, input, ฯลฯ)
│   └── features/           # component เฉพาะ feature
├── lib/                    # utility functions, helpers
├── hooks/                  # custom React hooks
├── types/                  # TypeScript types/interfaces
├── styles/                 # global styles
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

- `/notifications/stream` มี EventSource **ตัวเดียวทั้งแอป** อยู่ที่ `NotificationFeedProvider` (mount ใน `src/app/(main)/layout.tsx`) ผลลัพธ์เก็บใน `src/store/useNotificationFeedStore.ts`
- component ที่ต้องใช้ข้อมูล/สถานะ stream กลาง (`NotificationBell`, `RecentNotificationsTicker`, `ConnectionStatus`) ให้อ่านจาก store ห้ามเรียก `useSse` เพิ่มเอง
- ส่วน `useNotificationLiveFeed` / `useTelemetryLiveFeed` เป็น stream ราย serial คนละหน้าที่กัน ยังเปิด connection ของตัวเองตามปกติ
- API ไม่มี endpoint การแจ้งเตือนรวมทุกอุปกรณ์ ตัวเลขใน bell จึงนับเฉพาะ event ที่เข้ามาระหว่างเปิดแอป

### ข้อควรระวังเรื่อง e2e

Playwright ใช้ strict mode — ข้อความที่ assert ในเทส (เช่น `อุปกรณ์ทั้งหมด`, `การแจ้งเตือนล่าสุด`) ต้อง match ได้ตัวเดียวในหน้านั้น ระวังหัวข้อ dropdown/การ์ดที่ใช้คำซ้ำกัน
