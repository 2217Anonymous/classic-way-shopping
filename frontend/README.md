# Classic Way Shopping

A Next.js storefront for **Classic Way** fashion and everyday essentials.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
npm start
```

## Project Structure

- `src/app/` — Next.js App Router pages
- `src/components/` — UI, layout, home, shop, product, and blog components
- `src/data/` — Static product, blog, and category data
- `src/store/` — Redux Toolkit store (cart, wishlist, compare, UI)
- `src/lib/shopConfig.ts` — Shop, product, and blog layout configurations

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with all sections |
| `/shop/[slug]` | Shop layouts (sidebar, banner, list, column variants) |
| `/product/[slug]` | Product detail or layout demo |
| `/blog/[slug]` | Blog list/detail layouts or individual posts |
| `/cart`, `/checkout`, `/wishlist`, `/compare` | Shopping flows |
| `/about-us`, `/contact-us`, `/faq`, `/offer`, `/terms` | Static pages |

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Redux Toolkit
- Swiper, Remix Icon
