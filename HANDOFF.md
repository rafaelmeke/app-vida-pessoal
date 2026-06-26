# 🌱 Painel de Vida Pessoal — Handoff / Estado do Sistema

_Documento de transferência e estado atual. Última atualização: 26/06/2026._

---

## 1. O que é

Um aplicativo pessoal para monitorar e organizar a vida do usuário (Mestre / rafaelsantos710@gmail.com): finanças, day trade, profissional, saúde, hábitos, família, metas, livros, viagens, bens, custos fixos e uma lista de "a fazer" anual. Construído do zero ao longo de uma conversa, partindo de um arquivo local até virar um app na nuvem, instalável no PC e no celular, com login e sincronização.

**Filosofia:** o usuário não programa. Ele pede mudanças em português e o assistente edita o código e republica.

---

## 2. Como acessar (produção)

- **Endereço do app:** https://lively-bavarois-74b67b.netlify.app
- **Login do app:** email + senha próprios (criados pelo usuário dentro do app). É a única credencial do dia a dia.
- **Instalado como ícone** no PC (Chrome → Instalar) e no celular (Adicionar à tela inicial).
- Dados sincronizam automaticamente entre aparelhos (status "Sincronizado ✓" na barra lateral).

---

## 3. Arquitetura

| Camada | Tecnologia | Observação |
|---|---|---|
| App | **1 arquivo HTML** (`vida-pessoal.html`) | HTML + CSS + JS puro, sem build. Gráficos via Chart.js (CDN). |
| Login + Banco | **Supabase** (free) | Auth email/senha + tabela `app_data` (1 linha JSONB por usuário) com RLS. |
| Hospedagem | **Netlify** (free) | Deploy do arquivo como `index.html`. |
| Persistência local | **localStorage** | Cache offline; espelhado para a nuvem a cada alteração. |

**Fluxo de dados:** cada alteração chama `save()` → grava no localStorage → dispara `cloudSave()` (debounce) → `cloudPush()` faz `upsert` do snapshot completo (`DB`) na tabela `app_data` do Supabase. No login, `cloudLoad()` baixa o snapshot da nuvem.

### Identificadores do Supabase
- Project ref: `wlljnqlccdfrhpdvjewl`
- URL: `https://wlljnqlccdfrhpdvjewl.supabase.co`
- Chave **publishable** (pública, segura no navegador, já colada no topo do `<script>`): `sb_publishable_N_xzqWc4VodffL4oEVsGzw_QeOij5Ph`
- Tabela `app_data (user_id uuid PK, data jsonb, updated_at)` com políticas RLS (own_select/insert/update). "Confirm email" desligado (entra direto).
- Org Netlify/Supabase: conta `rafaelsantos710`.

---

## 4. Áreas do app (menu lateral)

1. **Dashboard** — visão geral: patrimônio líquido, total parcelado, day trade do mês, peso; gráficos de patrimônio e day trade; card "A Fazer — próximos"; diário recente; habilidades.
2. **A Fazer** — lembretes/tarefas do ano (com "fazer até" e ✓) **+ Registro diário** (água, sono, humor, energia, estresse, gratidão, diário).
3. **Financeiro** (sub-abas):
   - Movimentações (receitas/despesas + gráfico por categoria)
   - Contas & Investimentos (valor por conta)
   - Dívidas & Parcelas (empréstimos + cartões + total parcelado)
   - **Custos Fixos** (mensais: aluguel, luz… com total mensal, anual e distribuição)
   - Meta financeira (patrimônio e renda)
4. **Profissional** — Day Trade (resultado por dia, evolução acumulada, **resultado por mês**, **resumo por ano**, taxa de acerto) e Salário (com tipo: salário/bônus/comissão; gráfico empilhado + linha de média).
5. **Habilidades** — violão, tênis, futvôlei, xadrez, inglês, memória, storytelling (prática + nível + meta).
6. **Saúde** — Registrar medição (peso, % gordura, treino, dieta, sem data) + gráficos (peso x gordura, água, dieta, humor/energia, estresse) + diário e histórico.
7. **Família** — momentos com filhos/namorada/família.
8. **Hábitos** — checklist diário com sequências (🔥).
9. **Livros** — estante com status, progresso e nota.
10. **Metas de Vida** — Roda da Vida (radar) + metas com prazo e progresso.
11. **Viagens** — destino, orçamento, quanto guardou + tickboxes (passagem/hospedagem/passeios).
12. **Bens** — carro, imóvel etc. com valor e distribuição.

---

## 5. Recursos transversais

- **⚡ Lançamento rápido (com voz):** barra no topo de todas as telas. Fala ou digita ("gastei 50 no almoço", "pesei 82", "day trade -300", "joguei tênis 1h") e o app entende e lança na área certa, pedindo confirmação.
- **✏️ Editar / excluir** em todos os itens de todas as listas (janela de edição genérica).
- **📄 Gerar PDF geral** (barra lateral) — relatório com resumo financeiro e todas as áreas; salvar como PDF pela impressão.
- **⬇️⬆️ Backup** export/import em JSON.
- **Login + sync na nuvem** (Supabase).

---

## 6. Dados já carregados

- **Day Trade 2025:** 239 dias importados de planilha (total +R$ 29.071,86; 47% de acerto).
- **Day Trade 2026:** 98 dias importados (total −R$ 1.226,00; 35% de acerto).
- Importação feita lendo o CSV e injetando no app via JavaScript (com proteção contra duplicar).

---

## 7. Como usar no dia a dia

- Abrir o ícone do app (PC/celular) e entrar com email + senha.
- Lançar coisas pela **barra de Lançamento rápido** ou indo na aba específica.
- Day trade: aba Profissional → "Resultado do dia", ou "day trade -300" na barra rápida.
- Tudo salva e sincroniza sozinho.

---

## 8. Como evoluir o sistema (fluxo de manutenção)

1. O usuário pede a mudança em português (uma de cada vez).
2. O assistente edita o arquivo `vida-pessoal.html`.
3. **Redeploy** (mantendo o mesmo endereço): Netlify → projeto `lively-bavarois-74b67b` → Deploys → "browse files to upload" → enviar `vida-pessoal.html` → **"Rename and deploy"** (renomeia para index.html).
4. Os dados do usuário ficam intactos (estão no Supabase, separados do código).

### Padrões úteis no código
- Dados: objeto global `DB` com arrays por área (chaves em `KEYS`), salvos em `localStorage` (`vp_<chave>`).
- Cada área tem `add<X>()` e `render<X>()`; `renderAll()` chama todos.
- Edição genérica: objeto `SCHEMA` define os campos editáveis por store; `openEdit/saveEdit`.
- Botões de ação: helper `acts(store,id)` gera editar+excluir.
- Importações em massa: dá para injetar direto via JavaScript na página logada (o escopo global — `DB`, `uid`, `save`, `cloudPush` — é acessível) e depois `await cloudPush()`.

---

## 9. As três senhas (não confundir)

1. **Conta do app** (email/senha que o usuário criou) — uso diário. **É a que importa.**
2. **Supabase** — só para administrar o banco. Raramente usada.
3. **Netlify** — só para a hospedagem/redeploy. Raramente usada.

A chave `publishable` do Supabase no código é pública e segura (a segurança real vem das regras RLS, que isolam os dados por usuário).

---

## 10. Limitações conhecidas / próximos passos sugeridos

- **% no day trade** está 0 nos lançamentos importados (a planilha não tinha %).
- **Bens** ainda não entram no cálculo do patrimônio líquido (poderiam entrar).
- **Custos fixos** poderiam aparecer como cartão no Dashboard e/ou ser cruzados com a renda ("quanto sobra").
- **Lançamento por voz/IA mais inteligente (Nível 2)** ou **WhatsApp (Nível 3)** ficaram como evolução futura.
- Resumos mensais de receitas x despesas no Financeiro (similar ao do day trade) é uma boa próxima adição.

---

## 11. Arquivos do projeto (pasta "App Vida Pessoal")
- `vida-pessoal.html` — o app (fonte única; é o que é publicado).
- `COMECE-AQUI.md` — guia rápido de uso.
- `CONFIGURAR-NUVEM.md` — passo a passo da nuvem (Supabase + Netlify).
- `HANDOFF.md` — este documento.
- `vida-pessoal-backup-*.json` — backups eventuais.
