# 🌱 Painel de Vida Pessoal

App pessoal (um único arquivo HTML) para acompanhar finanças, day trade, saúde, hábitos, metas, leitura, viagens e bens — com login e sincronização na nuvem (Supabase) e lançamento de gastos por voz com IA (Claude).

- **App:** https://rafaelmeke.github.io/app-vida-pessoal/
- **Código:** `vida-pessoal.html` (publicado pelo GitHub Pages a cada commit)
- **Documentação técnica:** [`HANDOFF.md`](HANDOFF.md)
- **IA por voz:** `supabase/functions/lancar-ia/index.ts` (Edge Function; a chave fica só no segredo do Supabase)
- **Banco acordado:** `.github/workflows/keep-alive.yml`

Os dados de cada usuário ficam no Supabase, protegidos por RLS; nada pessoal fica neste repositório.
