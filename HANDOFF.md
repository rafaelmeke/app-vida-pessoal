# 🌱 Painel de Vida Pessoal — Handoff / Estado do Sistema

_Documento de transferência e estado atual. Última atualização: 17/09/2026 (v32)._

---

## 1. O que é

Um aplicativo pessoal para monitorar e organizar a vida do usuário (dono do app): finanças, day trade, profissional, saúde, hábitos, família, metas, livros, viagens, bens, custos fixos e uma lista de "a fazer" anual. Construído do zero ao longo de uma conversa, partindo de um arquivo local até virar um app na nuvem, instalável no PC e no celular, com login e sincronização.

**Filosofia:** o usuário não programa. Ele pede mudanças em português e o assistente edita o código e republica.

---

## 2. Como acessar (produção)

- **Endereço do app:** https://rafaelmeke.github.io/app-vida-pessoal/ (GitHub Pages; o antigo endereço Netlify não é mais usado)
- **Login do app:** email + senha do dono. É a única credencial do dia a dia. **Cadastro de novas contas está bloqueado** no banco (trigger `block_new_signups`).
- **Instalado como ícone** no PC (Chrome → Instalar) e no celular (Adicionar à tela inicial).
- Dados sincronizam automaticamente entre aparelhos (status "Sincronizado ✓" na barra lateral).

---

## 3. Arquitetura

| Camada | Tecnologia | Observação |
|---|---|---|
| App | **1 arquivo HTML** (`vida-pessoal.html`) | HTML + CSS + JS puro, sem build. Gráficos via Chart.js (CDN). |
| Login + Banco | **Supabase** (free) | Auth email/senha + tabela `app_data` (1 linha JSONB por usuário) com RLS. |
| Hospedagem | **GitHub Pages** (free) | Repositório `rafaelmeke/app-vida-pessoal`; deploy = commit do `vida-pessoal.html`. |
| Persistência local | **localStorage** | Cache offline; espelhado para a nuvem a cada alteração. |

**Fluxo de dados:** cada alteração chama `save()` → grava no localStorage → dispara `cloudSave()` (debounce) → `cloudPush()` chama a função `save_app_data` (v31: controle de versão + mescla, ver seção 13). No login, `cloudLoad()` baixa o snapshot da nuvem ou envia as alterações pendentes do aparelho.

### Identificadores do Supabase
- Project ref: `wlljnqlccdfrhpdvjewl`
- URL: `https://wlljnqlccdfrhpdvjewl.supabase.co`
- Chave **publishable** (pública, segura no navegador, já colada no topo do `<script>`): `sb_publishable_N_xzqWc4VodffL4oEVsGzw_QeOij5Ph`
- Tabela `app_data (user_id uuid PK, data jsonb, updated_at)` com políticas RLS (own_select/insert/update).
- Edge Function `lancar-ia` (IA por voz) e segredo `ANTHROPIC_API_KEY`.

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
3. **Publicar:** GitHub → `rafaelmeke/app-vida-pessoal` → Add file → Upload files → `vida-pessoal.html` → Commit com mensagem versionada ("vNN — …"). O Pages republica em 1–2 min; no celular, recarregar o app.
4. Os dados do usuário ficam intactos (estão no Supabase, separados do código).

### Padrões úteis no código
- Dados: objeto global `DB` com arrays por área (chaves em `KEYS`), salvos em `localStorage` (`vp_<chave>`).
- Cada área tem `add<X>()` e `render<X>()`; `renderAll()` chama todos.
- Edição genérica: objeto `SCHEMA` define os campos editáveis por store; `openEdit/saveEdit`.
- Botões de ação: helper `acts(store,id)` gera editar+excluir.
- Importações em massa: dá para injetar direto via JavaScript na página logada (o escopo global — `DB`, `uid`, `save`, `cloudPush` — é acessível) e depois `await cloudPush()` (em importações que reduzem muito os dados use `cloudPush(true,true)`).

---

## 9. As três senhas (não confundir)

1. **Conta do app** (email/senha que o usuário criou) — uso diário. **É a que importa.**
2. **Supabase** — só para administrar o banco. Raramente usada.
3. **GitHub** — só para publicar o código. Raramente usada.
4. **Anthropic (console)** — só para créditos da IA. A chave fica apenas no segredo do Supabase.

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
- `index.html` — redireciona a raiz do site para o app.
- `supabase/functions/lancar-ia/index.ts` — código da Edge Function.
- `.github/workflows/keep-alive.yml` — robô que mantém o Supabase acordado.
- `HANDOFF.md` — este documento.
- Backups em JSON ficam no seu computador/celular (não vão para o GitHub).
- Histórico antigo do código (v1–v32, com os guias antigos COMECE-AQUI/CONFIGURAR-NUVEM/ESPECIFICACAO): repositório **privado** `rafaelmeke/app-vida-pessoal-historico`. Este repositório público recomeçou do zero em 17/09/2026, sem dados pessoais.

---

## 12. Changelog

**v32 (17/09/2026) — Anexos no armazenamento da nuvem + repositório limpo:**
- Dietas e treinos anexados agora vão para o **Supabase Storage** (bucket privado `anexos`, até 20 MB por arquivo) em vez de ficarem dentro dos dados em base64. Os dados caíram de ~2,1 MB para ~0,1 MB → sincronização e cópias do banco bem mais leves (e o celular não estoura o limite do navegador).
- Itens de anexo guardam `path` (em vez de `data`). Miniaturas, ver e baixar buscam o arquivo na hora (`anexoBlob`, com cache). Sem login (modo local) continua salvando em base64 (máx. 2,5 MB).
- **Migração automática** (`migrarAnexos`): ao abrir o app logado, anexos antigos em base64 sobem para o Storage e o campo `data` é removido. O banco guarda a versão anterior como cópia `auto`.
- **Exportar backup** baixa os arquivos e os inclui no JSON; **Importar** sobe de novo para o Storage. **Excluir anexo** apaga o arquivo; **Apagar tudo** apaga também a pasta do usuário.
- Proteção de senhas vazadas: verificado que exige plano Pro (não ativado).
- Repositório GitHub recomeçado sem histórico (o antigo virou privado: `app-vida-pessoal-historico`).

**v31 (17/09/2026) — Revisão de segurança, sincronização e hospedagem:**
- **Sincronização sem sobrescrever:** `cloudPush()` chama `save_app_data(p_data, p_base, p_force)`. Se outro aparelho salvou depois (conflito), o app mescla item a item (`mergeSnap`, base em `vp_base`) e tenta de novo — exclusões e inclusões dos dois lados são mantidas. `vp_cloud_at` guarda a versão da nuvem; `vp_dirty` marca alteração ainda não enviada (enviada no próximo login/abertura).
- **Trava contra apagar em massa:** gravação comum que reduza os registros para menos de 60% (com ≥30 itens) é bloqueada; só passa com confirmação (importar backup, "Apagar tudo" digitando APAGAR).
- **Histórico automático no banco:** trigger `app_data_historico` guarda a versão anterior em `private.app_data_snapshots` (tipo `auto`, no máx. 1/hora ou sempre que os dados encolherem muito; 24 mais recentes, 7 dias). A foto diária (`diario`, cron 06:00 UTC) fica 45 dias + 1 por mês para sempre.
- **Site:** bibliotecas com versão fixa e SRI (Chart.js 4.4.1, supabase-js 2.116.0), Content-Security-Policy (só conecta no Supabase do app), `no-referrer`. Se uma biblioteca não carregar, o app avisa em vez de travar.
- **Login:** mensagem "Entrando…", tempo limite de 20 s e erros traduzidos. **Sair** envia pendências, pede confirmação se algo não subiu e limpa os dados do aparelho.
- **Senha do diário** agora é guardada como hash (senhas antigas são convertidas ao desbloquear).
- **Pessoas configuráveis:** lista "Para quem" e apelidos ficam em `settings.pessoas` / `settings.apelidos` (⚙️ ao lado do campo). Nenhum nome pessoal fica no código público; a Edge Function v31 recebe os apelidos do app.
- **Keep-alive:** robô agora chama `rpc/ping` (consulta real ao banco) e só aceita HTTP 200.

## 13. Segurança e recuperação (v31)

- **Restaurar uma versão anterior (Supabase → SQL Editor):**
  1. Ver cópias: `select id, tipo, taken_at, data_updated_at from private.app_data_snapshots order by taken_at desc limit 30;`
  2. Restaurar: `update public.app_data a set data = s.data from private.app_data_snapshots s where s.id = <ID> and a.user_id = s.user_id;` (a versão atual vira cópia `auto` antes).
  3. No app: Sair e entrar de novo em cada aparelho.
- Backup em JSON pelo próprio app continua recomendado (fica fora da nuvem).
- "Leaked password protection" do Supabase Auth só existe no plano Pro (projeto está no Free) — fica desligado; compense com uma senha forte e única no app.
- Anexos: bucket privado `anexos` (pasta `<id do usuário>/<diets|treinos>/<id>`), regras `anexos_*_own` — cada usuário só lê/grava a própria pasta. Os arquivos NÃO entram nas cópias do banco: para guardar anexos use o **Exportar backup** do app (inclui os arquivos).
- A chave `publishable` no código e no robô é pública por natureza; a proteção real é RLS + cadastro bloqueado + função IA restrita ao dono.

**v30 (17/09/2026) — Categorias novas e campos de controle:**
- **Despesas (18):** Mercado, Restaurantes e delivery, Bebidas alcoólicas, Moradia, Contas e assinaturas, Carro e transporte, Saúde, Esporte, Filhos, Cuidados pessoais, Vestuário, Casa e utilidades, Eletrônicos, Presentes, Lazer e viagens, Educação, Impostos e taxas, Outro.
- **Receitas (6):** Salário/Pró-labore, Comissões e bônus, Consultoria, Day trade, Venda, Outro (a pedido, sem Reembolso nem Rendimentos/Dividendos).
- Os selects de categoria mudam conforme o tipo (`CATS_DESP`/`CATS_REC`, `fillCats`). Custos fixos usam a lista de despesas.
- **Campos novos em cada movimentação** (IA, formulário do Financeiro e ✏️ editar): `pag` (Pix/Débito/Crédito/Dinheiro/Boleto), `cartao` (se crédito; sugestões vêm dos nomes em Cartões), `essencial` (essencial/superfluo), `pessoa` (lista configurável; ver v31).
- **Parcelado:** valor = total; `lancarMov()` cria 1 lançamento por mês (`parcela` "k/N", `grupo`, `total`).
- **Financeiro → Movimentações:** novo quadro "🧭 Controle do mês" (essencial x supérfluo, para quem, forma de pagamento) e selos no histórico.
- **Reclassificação com aprovação:** card "🔁 Reclassificar" (aviso no Dashboard) sugere a nova categoria dos lançamentos e custos fixos antigos (`sugerirCat`); nada muda até "Aplicar nos marcados". Depois grava `settings.reclass30`. Lançamentos novos levam `v:30` e não entram na lista.
- Edge Function `lancar-ia` v30: recebe `categoriasDespesa/categoriasReceita/pagamentos/pessoas/cartoes` e devolve também pagamento, cartão, parcelas, essencial e pessoa (continua aceitando o formato da v29).
- Assistente entende "supérfluo/essencial" e agrupa "alimentação" = mercado + restaurantes.

**v29 (17/09/2026) — Lançamento inteligente por voz (Claude):**
- Barra **🎙️** no topo do Dashboard: fale (🎤 do app ou microfone do teclado do iPhone) ou digite, ex.: "paguei mil e duzentos do condomínio e 80 de Uber ontem" → **Entender**.
- A frase vai para a Edge Function do Supabase **`lancar-ia`** (código em `supabase/functions/lancar-ia/index.ts`), que chama o **Claude Sonnet 5** (`claude-sonnet-5`) e devolve os itens (tipo, valor, categoria, data, descrição).
- Aparece um **cartão editável**; nada é gravado sem **✓ Lançar** (`✕ Cancelar` descarta). Vários itens por frase; entende "ontem", "sexta", "dia 5", "mil e duzentos" etc.
- Se a IA falhar (sem chave, sem crédito, fora do ar), o app usa o parser simples antigo e marca o cartão como "sem IA".
- **Segurança:** a chave fica só no segredo `ANTHROPIC_API_KEY` do Supabase (Edge Functions → Secrets), nunca no site público. A função exige login e só aceita o usuário dono (ALLOWED_USER_IDS) e a origem rafaelmeke.github.io. Modelo trocável pelo segredo opcional `LANCAR_IA_MODEL`.
- **Custo:** ~US$ 0,005 por frase (~1,7 mil tokens de entrada + ~130 de saída) → ~R$ 4/mês com 5 lançamentos/dia. Conta Anthropic só pré-paga (sem recarga automática): o gasto máximo é o saldo de créditos.
- **Datas no fuso local:** `today()` e afins agora usam a data de Brasília (antes usavam UTC e "viravam o dia" às 21h).

**v28 (17/09/2026) — Aviso de backup com ✕:**
- O aviso "🛟 Recomendo exportar" do Dashboard ganhou um botão **✕** ao lado de "Exportar backup" (`fecharAvisoBackup()`).
- Fechar só esconde o aviso: ele volta sozinho após 7 dias se o backup continuar pendente (chave local `vp_backupdismiss`, por aparelho; não vai para a nuvem). Exportar o backup continua zerando o lembrete.

**v27 (17/09/2026) — Registros e Hábitos:**
- As abas "A Fazer" e "Hábitos" viraram uma só: **📝 Registros e Hábitos** (seção `afazer`; a seção `habitos` saiu).
- O **Registro diário** agora tem "Práticas do dia" (uma linha por habilidade com tempo em min e "como foi" 1-5; só as preenchidas viram práticas em `sessions`) e "Hábitos do dia" (marca os hábitos na data escolhida em `habitlog`). Tudo salvo no botão único **Salvar dia** (`renderDayForm()` + `addDaily()`).
- "Suas habilidades" continua embaixo; "Adicionar habilidade" e "Novo hábito" viraram linhas compactas.
- Removida a "Reflexão do Dia" do cartão "Novo lembrete".
- Formato dos dados não mudou (Supabase `app_data` sem alterações). Hospedagem atual: GitHub Pages — https://rafaelmeke.github.io/app-vida-pessoal/ (deploy = commit do `vida-pessoal.html`).
- Login verificado na versão publicada (sessão ativa, requisição de login chega ao Supabase) e `updated_at` da `app_data` atualizado após "Salvar dia".

**v2 (28/06/2026):**
- **Bens:** novos tipos (joias, obras de arte, antiguidades). Bens agora entram no **patrimônio líquido** (investido + bens − dívidas).
- **Metas de Vida:** Roda da Vida agora é **mensal** (seletor de mês); o radar compara o mês selecionado com o mês anterior.
- **Leitura:** a aba "Livros" virou **"Leitura"** (livros, cursos, estudos) com campo de tipo.
- **Hábitos + Habilidades unificados** numa aba só ("Hábitos & Habilidades") com quadros-resumo; o registro de prática inclui os ticks dos hábitos do dia; nível das habilidades exibido em 20 barras verticais.
- **Meta financeira:** agora compara a meta com investido + bens (patrimônio) e com salário + receitas (renda do mês), mostrando quanto falta; nova seção de **ideias de renda extra**.
- **Day Trade:** campo de resultado em % com símbolo, campo de **ativo** (Índice/Dólar/Cripto/Bolsa/Forex); gráfico de evolução acumulada só com linha (sem pontos) e com eixo de valores também à direita.
- Histórico/versões versionado no GitHub a cada atualização.
