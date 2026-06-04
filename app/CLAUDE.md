<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Web App Stack

- React Router is used for navigation.
- Shadcn + tailwind are used for UI styling.
- Clerk handles authentication.
- Convex handles backend data, auth-aware functions, and realtime backend features.
- Shared domain enums/validators live in `shared/` when they are used by both Convex and React (vite).

## Auth And Routing

- root router owns all auth/onboarding redirects, derived only from useCurrentUser.
- `useCurrentUser` derives the frontend session state from Clerk + Convex.
- Do not add duplicated auth redirects inside nested layouts unless there is a specific local routing reason.
- Convex functions must derive auth server-side with `ctx.auth.getUserIdentity()`.
- Do not accept frontend-provided user IDs for authorization.
- Use `identity.tokenIdentifier` as the stable auth lookup key.

## UI Direction

- Keep screens mobile-first with centered constrained layouts by default. maybe not on home where screen on web can be taken advantage for the canvas/graph idea.
- Preserve light/dark theme support.
- Support En/Sp with i18n support. Also on clerk components maybe with clerk localization.
- Prefer existing shadcn components before adding custom primitives.
- Use lucide icons.

### i18n (En/Es)

- i18next + react-i18next, initialized in `src/lib/i18n.ts`. One broad namespace
  (`app`) per language; all keys live in `locales/<lng>/app.json` (alias `@locales`).
- Use the **type-safe selector API**: `t(($) => $.section.key)` (enabled via
  `types/i18n.d.ts`). Add new copy as nested keys in both `en` and `es` JSON files.
- Locale is detected + persisted via `i18next-browser-languagedetector`
  (localStorage key `tm.lang`). Switch with `useLocale().setLocale(...)`;
  `<LanguageSwitcher>` (full + compact variants) is the UI.
- **Clerk localization**: set once at mount in `src/main.tsx` from the persisted
  language (`enUS`/`esMX` from `@clerk/localizations`). `setLocale` reloads the page
  so Clerk re-reads the locale. Live (no-reload) Clerk locale switching is **deferred**
  — changing the `localization` prop reactively crashes Clerk
  (`removeChild`, clerk/javascript#1557). Revisit when Clerk fixes dynamic localization.

## Building A New Feature

When requirements are clear, build a feature back-to-front in this order, reusing the existing patterns at each layer:

1. **Schema** — add tables/indexes in `convex/schema.ts`; put validators shared by Convex and the app in `shared/enums.ts`. Add an index for every lookup (never `.filter()`).
2. **Convex functions** — derive auth with `getCurrentUserOrThrow` and role gates from `convex/lib/`; validate all args; throw `ConvexError` for client-facing errors; return bounded results (`.take()` / `.paginate()`).
3. **Convex tests** — colocate `*.test.ts` in `convex/`; use `convex-test` + `vitest`; seed data through existing mutations and promote roles via `t.run(ctx => ctx.db.patch(...))`. Run `npm run test:backend`.
4. **UI/UX** — Shadcn components first.
