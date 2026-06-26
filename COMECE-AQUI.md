# 🌱 Painel de Vida Pessoal — Guia do Projeto

Bem-vindo, Mestre! Este é o ponto de partida do seu sistema de monitoramento pessoal.
Você não precisa saber programar para usar a versão 1 — é só abrir e usar.

---

## ▶️ Como usar agora (v1)

1. Dê dois cliques no arquivo **`vida-pessoal.html`** — ele abre no seu navegador (Chrome, Edge, etc.).
2. Use o menu lateral para navegar entre **Dashboard, Financeiro, Profissional, Habilidades, Saúde, Família, Hábitos, Livros, Metas de Vida e Viagens**.
3. Preencha os formulários e clique em salvar. Os dados ficam guardados **no seu navegador** automaticamente.
4. O **Dashboard** resume tudo: patrimônio líquido, total parcelado, day trade do mês, peso, habilidades e diário recente.

### O que cada área faz (v2)
- **Financeiro** — abas internas: Movimentações (receitas/despesas) · Contas & Investimentos (valor por conta) · Dívidas & Parcelas (empréstimos + cartões + total parcelado) · Meta financeira. Calcula automaticamente seu **patrimônio líquido** (investido − dívidas).
- **Profissional** — Day Trade (resultado por dia, acumulado, % de acerto, evolução da banca) e Salário (histórico mensal).
- **Habilidades** — Violão, Tênis, Futvôlei, Xadrez e Inglês já vêm prontos. Registre cada prática (duração + nota) e acompanhe nível atual vs. meta.
- **Saúde** — monitoramento diário: peso, % de gordura, água (litros), sono, treino, seguiu a dieta (sim/não) e um campo de **diário** pra escrever algo do dia.
- **Família & Relacionamentos** — registre momentos com filhos, namorada e família; marque os marcantes e veja quanto tempo dedica a cada um. (É o fator que mais pesa na felicidade a longo prazo.)
- **Hábitos & Sequências** — checklist diário com contador de dias seguidos (🔥). Já vêm sugestões: inglês, treino, água, esporte e leitura.
- **Saúde** — além de peso, % de gordura, água, sono, treino e dieta, agora registra **humor, energia, estresse e gratidão**, virando gráficos de como você está.
- **Livros** — estante com status (quero ler / lendo / lido), progresso de página e nota, com meta de leitura no ano.
- **Metas de Vida** — a visão do topo: a **Roda da Vida** (nota 0-10 por área da vida, em gráfico radar) e suas grandes metas com prazo e progresso.
- **Viagens Futuras** — lista de viagens com destino, data alvo, orçamento e quanto você já guardou (barra de progresso por viagem).
- **Habilidades** — agora inclui **Memória** e **Storytelling** além de violão, tênis, futvôlei, xadrez e inglês.

### 📱 No celular
Envie o arquivo `vida-pessoal.html` para o celular (WhatsApp, e-mail, Google Drive) e abra no navegador do telefone. O layout se adapta à tela.

### 💾 Backup e mover entre aparelhos (importante!)
Como os dados ficam salvos no navegador de **cada** aparelho, eles **não sincronizam sozinhos** entre PC e celular ainda. Para mover ou fazer cópia de segurança:

- **Exportar backup** (menu lateral) → gera um arquivo `.json` com tudo.
- **Importar backup** → carrega esse arquivo em outro aparelho.

Faça isso de vez em quando para não perder nada. A sincronização automática vem na Fase 2 (abaixo).

---

## 🗺️ Roadmap — para onde isso pode crescer

### ✅ Fase 1 — App local (PRONTO, é o que você tem agora)
Painel completo, bonito, funciona offline, registro manual, gráficos e backup. Zero instalação, zero custo, zero código pra você mexer.

### 🔜 Fase 2 — Sincronização na nuvem
Fazer os dados sincronizarem automaticamente entre celular e PC, com login. Caminhos possíveis (do mais fácil ao mais robusto):
- **Supabase** ou **Firebase** (banco de dados grátis na nuvem) — ideal para isso.
- App vira um **PWA** ("instalável" como app de verdade na tela inicial do celular).

### 🚀 Fase 3 — Inteligência e automação
- Lembretes e relatórios automáticos (ex.: resumo semanal por e-mail).
- Importar dados em vez de digitar tudo (planilhas, apps de saúde, banco).
- Insights automáticos ("seu sono caiu 12% nas semanas que você gastou mais").

---

## 🤖 Como evoluir usando o Claude / Claude Code

Você não precisa aprender a programar — precisa aprender a **pedir bem**. O fluxo é:

1. **Descreva o que quer mudar**, em português normal. Exemplos de pedidos:
   - "Adiciona uma seção de Hábitos com check diário."
   - "Quero um campo de humor (1 a 5) no registro de saúde."
   - "Coloca uma meta de economia que mostra quanto falta."
   - "Deixa o app instalável no celular (PWA)."
   - "Agora quero sincronizar entre celular e PC."
2. **Eu altero o código** e te devolvo o arquivo atualizado.
3. Você testa abrindo o arquivo. Se algo não ficou bom, é só dizer.

> Dica: peça **uma mudança de cada vez**. Fica mais fácil testar e voltar atrás se precisar.

### Sobre o Claude Code (terminal)
O Claude Code é a versão para desenvolvedores que roda no terminal e mexe direto nos arquivos do projeto. É poderoso, mas tem uma curva. **Para começar, você não precisa dele** — aqui mesmo nesta conversa eu consigo criar e editar todos os arquivos do seu projeto. Quando o app crescer (Fase 2/3, com nuvem e login), aí vale a pena dar esse passo, e eu te guio.

---

## 📂 Arquivos do projeto
- `vida-pessoal.html` — o app (abra este).
- `COMECE-AQUI.md` — este guia.
- `vida-pessoal-backup-*.json` — seus backups (criados quando você exporta).

---

## ✅ Próximo passo sugerido
Abra o `vida-pessoal.html`, cadastre 2–3 dias de dados em cada seção pra sentir como funciona, e me diga **o que falta ou o que você mudaria**. A partir do seu uso real, a gente molda o resto.
