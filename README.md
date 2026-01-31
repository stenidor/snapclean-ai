<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SnapClean AI – Studio photo produit

Édition de photos produit par IA (Gemini). Les images générées sont enregistrées dans **Firebase Storage** et **Firestore** pour une galerie future.

View your app in AI Studio: https://ai.studio/apps/drive/1DhkExINcq4pl7IzD9MybJeVtGNWwrR0g

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy [.env.example](.env.example) to `.env.local` and fill:
   - `GEMINI_API_KEY` – clé API Gemini (côté serveur uniquement, jamais exposée)
   - `VITE_FIREBASE_*` – config Firebase (Storage + Firestore)
3. Run: `npm run dev`

## Deploy on Vercel (Git → Vercel)

1. Push the repo to GitHub and import it in [Vercel](https://vercel.com).
2. In **Project → Settings → Environment Variables**, add:
   - **GEMINI_API_KEY** (build + preview + production)
   - **VITE_FIREBASE_API_KEY**, **VITE_FIREBASE_AUTH_DOMAIN**, **VITE_FIREBASE_PROJECT_ID**, **VITE_FIREBASE_STORAGE_BUCKET**, **VITE_FIREBASE_MESSAGING_SENDER_ID**, **VITE_FIREBASE_APP_ID** (build + preview + production)
3. Deploy. The app will build with `vite build` and serve from `dist`. La clé Gemini reste côté serveur (API route `/api/edit-image`).

## Firebase

- **Storage** : les images générées sont uploadées dans le bucket sous `generated/<timestamp>_<id>.<ext>`.
- **Firestore** : collection `generated_images` avec `imageUrl`, `prompt`, `createdAt` (pour une future galerie).

Configure les règles Storage/Firestore dans la console Firebase selon ton usage (lecture/écriture).
