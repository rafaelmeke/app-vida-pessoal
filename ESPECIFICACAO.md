# Especificação — App Vida Pessoal

> Documento de especificação (PRD) do app. Fonte da verdade mantida no Obsidian. IA: leia este arquivo inteiro antes de gerar qualquer código.

## 1. Visão geral
App pessoal (web) para centralizar e acompanhar áreas da vida: finanças, saúde, viagens, bens e tarefas, com um dashboard de visão geral.

## 2. Stack técnica
- Framework: Next.js (React)
- Deploy: Vercel
- Repositório: GitHub — rafaelmeke/app-vida-pessoal
- Banco de dados / autenticação: (a definir — sugestão: Supabase ou Vercel Postgres)
- Estilo: (a definir — sugestão: Tailwind CSS + shadcn/ui)

## 3. Funcionalidades por área

### 3.1 Dashboard
- Visão geral consolidada das demais áreas.
- Incluir o "to-do" pessoal (ver 3.6) no lugar de "habilidades", sem excluir habilidades.

### 3.2 Finanças
- Lançamentos de salário e gastos.
- Gráfico profissional: ao lançar dois salários no mesmo mês, somar numa barra única, usando mais de uma cor na mesma barra para separar os lançamentos (ex.: bônus, comissão).
- Linha de média do período sobre as barras.
- Botão para gerar um PDF geral (posicionado abaixo de "importar backup").
- Importar / exportar backup.

### 3.3 Saúde
- Trocar o "monitoramento diário" por lançamentos sem data fixa: peso, % de gordura, montagem de treino e dieta.
- Refletir esse acompanhamento no Dashboard.

### 3.4 Viagens
- Cadastrar viagem com itens marcáveis (tickar) para saber o que já foi comprado: passagem, hospedagem, passeios.
- Aba "Bens" posicionada abaixo de Viagens.

### 3.5 Bens
- Cadastrar carro, imóvel e demais bens/patrimônio.

### 3.6 Agenda e Tarefas
- Não é agenda diária: é uma lista de coisas a fazer/lembrar ao longo do tempo, com opção de "fazer até tal data".
- Incluir o monitoramento nesta aba.

## 4. Padrões de UX
- Todo item que tiver botão de excluir (X) deve ter também botão de editar.

## 5. Modelo de dados (rascunho)
- A definir. Entidades prováveis: Lancamento, Viagem, ItemViagem, Bem, Tarefa, MedidaSaude.

## 6. Decisões em aberto
- Banco de dados e autenticação.
- Biblioteca de gráficos.

## 7. Como a IA deve usar este documento
- Tratar as seções 1 a 4 como requisitos do produto.
- Onde houver "(a definir)", propor a melhor opção e confirmar antes de assumir.
- Gerar código incremental por área, começando pelo modelo de dados e pelo Dashboard.
