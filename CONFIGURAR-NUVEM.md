# ☁️ Configurar a nuvem (login + sincronização entre PC e celular)

O app já está **pronto para a nuvem**. Enquanto você não colar as chaves, ele funciona normal no modo local. Quando colar, ele "liga" o login e passa a sincronizar.

São 9 passos, uma vez só (~15 min). Tudo gratuito, sem cartão. Pode me chamar a cada passo se travar.

---

## Parte 1 — Criar o banco na nuvem (Supabase)

**1. Criar conta e projeto**
- Acesse **supabase.com** → *Start your project* → entre com Google ou email.
- Clique em *New project*. Dê um nome (ex: `vida-pessoal`), crie uma **senha do banco** (anote num lugar seguro) e escolha a região *South America (São Paulo)*.
- Clique em *Create*. Espere ~2 minutos enquanto ele prepara.

**2. Criar a tabela de dados**
- No menu lateral, abra **SQL Editor** → *New query*.
- Cole o código abaixo e clique em **Run**:

```sql
create table if not exists app_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb,
  updated_at timestamptz default now()
);
alter table app_data enable row level security;
create policy "own_select" on app_data for select using (auth.uid() = user_id);
create policy "own_insert" on app_data for insert with check (auth.uid() = user_id);
create policy "own_update" on app_data for update using (auth.uid() = user_id);
```

Isso cria a tabela e garante que **cada usuário só enxerga os próprios dados**.

**3. Permitir login direto (sem confirmar email)**
- Vá em **Authentication → Sign In / Providers → Email**.
- Desligue a opção **"Confirm email"** e salve. (Assim você entra na hora, sem precisar clicar num link no email.)

**4. Copiar as 2 chaves**
- Vá em **Project Settings (engrenagem) → API**.
- Copie o **Project URL** e a chave **anon / public**. (A chave `anon` é segura de usar no app; **nunca** use a `service_role`.)

---

## Parte 2 — Colar as chaves no app

**5.** Abra o arquivo `vida-pessoal.html` num editor de texto (Bloco de Notas serve) e, lá no comecinho do código, troque estas duas linhas:

```js
const SUPABASE_URL='';        // cole a URL aqui, entre as aspas
const SUPABASE_ANON_KEY='';   // cole a chave anon aqui, entre as aspas
```

Ficando assim (exemplo):

```js
const SUPABASE_URL='https://abcd1234.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOi...sua-chave-grande...';
```

Salve o arquivo. (Se preferir, me manda as 2 chaves que eu já deixo coladas pra você — a chave anon é pública, pode compartilhar.)

---

## Parte 3 — Publicar para virar app (PC + celular)

**6. Hospedar grátis (Netlify)**
- Renomeie o arquivo para **`index.html`** e coloque-o sozinho dentro de uma pasta (ex: `vida-app`).
- Acesse **app.netlify.com/drop** e **arraste a pasta** para a área indicada.
- Em segundos ele gera um **link** (ex: `https://algo-aleatorio.netlify.app`). Esse é o endereço do seu app.

**7. Instalar no computador**
- Abra o link no Chrome → na barra de endereço aparece um ícone de *instalar* (ou menu ⋮ → *Instalar / Criar atalho → Abrir como janela*).
- Pronto: vira um ícone/programa que abre em janela própria.

**8. Instalar no celular**
- Abra o mesmo link no navegador do celular → menu → **"Adicionar à tela inicial"**.
- Vira um ícone de app na tela inicial.

**9. Criar sua conta e usar**
- Abra o app (PC ou celular) → toque em **Criar conta** → email + senha.
- Pronto! Tudo que você registrar aparece nos dois aparelhos, sincronizado. 🎉

---

## Dúvidas comuns
- **Esqueci a senha do banco do passo 1** — ela é só do Supabase, não atrapalha o uso do app. Pode redefinir no painel do Supabase.
- **Quero atualizar o app depois** — quando eu te entregar uma versão nova, você arrasta a pasta de novo no Netlify (mesmo site) que ele atualiza. As chaves continuam no arquivo.
- **Meus dados antigos (modo local)** — antes de logar a primeira vez, use **Exportar backup** no app local; depois de entrar na conta, use **Importar backup** para subir tudo pra nuvem.
- **Segurança** — cada conta só acessa os próprios dados (garantido pelas regras do passo 2). A chave `anon` no arquivo é segura e feita para isso.
