// lancar-ia — entende uma frase falada/digitada e devolve lançamentos (receita/despesa) estruturados.
// Usa o Claude (Anthropic). A chave fica no segredo ANTHROPIC_API_KEY do Supabase (nunca no site).
// Só aceita chamadas do dono do app (usuário logado cujo id está em ALLOWED_USER_IDS).
// verify_jwt=false porque a autenticação é feita aqui dentro (valida o token no /auth/v1/user + lista de ids).
// v30: categorias separadas por tipo + campos pagamento, cartão, parcelas, essencial/supérfluo e "para quem".
// v31: nomes de pessoas vêm dos dados do usuário (settings), não ficam no código público.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const MODEL = Deno.env.get("LANCAR_IA_MODEL") ?? "claude-sonnet-5";
const ALLOWED = (Deno.env.get("ALLOWED_USER_IDS") ?? "558d790f-2078-4532-a91a-bb2603b6ca16")
  .split(",").map((s) => s.trim()).filter(Boolean);
const ORIGINS = ["https://rafaelmeke.github.io"];

const DESP_PADRAO = ["Mercado", "Restaurantes e delivery", "Bebidas alcoólicas", "Moradia", "Contas e assinaturas", "Carro e transporte", "Saúde", "Esporte", "Filhos", "Cuidados pessoais", "Vestuário", "Casa e utilidades", "Eletrônicos", "Presentes", "Lazer e viagens", "Educação", "Impostos e taxas", "Outro"];
const REC_PADRAO = ["Salário/Pró-labore", "Comissões e bônus", "Consultoria", "Day trade", "Venda", "Outro"];
const PAG_PADRAO = ["Pix", "Débito", "Crédito", "Dinheiro", "Boleto"];
const PES_PADRAO = ["Eu", "Filhos", "Parceiro(a)", "Família", "Amigos", "Outros"];

function cors(req: Request) {
  const o = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.includes(o) ? o : ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });
}
const lista = (v: unknown, padrao: string[], max = 40) =>
  Array.isArray(v) && v.length ? v.map((x) => String(x).slice(0, 60)).slice(0, max) : padrao;

async function usuario(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = req.headers.get("apikey") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const r = await fetch(`${url}/auth/v1/user`, { headers: { Authorization: auth, apikey: key } });
  if (!r.ok) return null;
  const u = await r.json();
  return u?.id ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { erro: "método não permitido" }, 405);

  const uid = await usuario(req);
  if (!uid) return json(req, { erro: "não autenticado" }, 401);
  if (!ALLOWED.includes(uid)) return json(req, { erro: "usuário não autorizado" }, 403);

  // deno-lint-ignore no-explicit-any
  let body: any;
  try { body = await req.json(); } catch { return json(req, { erro: "json inválido" }, 400); }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (body?.teste) return json(req, { ok: true, chave: !!apiKey, modelo: MODEL, versao: 31 });
  if (!apiKey) return json(req, { erro: "sem_chave", detalhe: "Segredo ANTHROPIC_API_KEY não configurado no Supabase" }, 503);

  const texto = String(body.texto ?? "").trim().slice(0, 600);
  if (!texto) return json(req, { erro: "texto vazio" }, 400);
  const hoje = /^\d{4}-\d{2}-\d{2}$/.test(body.hoje ?? "") ? body.hoje : new Date().toISOString().slice(0, 10);
  const diaSemana = String(body.diaSemana ?? "").slice(0, 20);
  const antigas = lista(body.categorias, DESP_PADRAO); // compatibilidade com o app v29
  const catsDesp = lista(body.categoriasDespesa, body.categoriasDespesa ? DESP_PADRAO : antigas);
  const catsRec = lista(body.categoriasReceita, body.categoriasReceita ? REC_PADRAO : antigas);
  const pags = lista(body.pagamentos, PAG_PADRAO, 10);
  const pessoas = lista(body.pessoas, PES_PADRAO, 12);
  const cartoes = lista(body.cartoes, [], 20);
  // apelidos: { "Filhos": ["nome1","nome2"], ... } — só para a IA reconhecer quem é quem
  const apel: string[] = [];
  if (body.apelidos && typeof body.apelidos === "object") {
    for (const [k, v] of Object.entries(body.apelidos).slice(0, 12)) {
      if (!pessoas.includes(String(k)) || !Array.isArray(v)) continue;
      const nomes = v.map((x) => String(x).slice(0, 30)).filter(Boolean).slice(0, 8);
      if (nomes.length) apel.push(`${nomes.join("/")} → ${k}`);
    }
  }
  const todas = [...new Set([...catsDesp, ...catsRec])];

  const system = `Você registra lançamentos financeiros pessoais (Brasil, reais) a partir de uma frase falada em português.
Hoje é ${hoje}${diaSemana ? ` (${diaSemana})` : ""}. Use SEMPRE a ferramenta registrar_lancamentos.

Regras:
- tipo: "despesa" para gastei/paguei/comprei/torrei/saiu/custou; "receita" para recebi/ganhei/caiu/entrou/vendi/salário/comissão/bônus/consultoria.
- valor: número positivo em reais e SEMPRE o valor TOTAL. "mil e duzentos"=1200; "1.200"=1200; "12,50"=12.5; "50 conto"=50; "2 mil"=2000; "1k"=1000. Parcelado "3x de 150" = valor 450 e parcelas 3.
- parcelas: 1 se à vista ou não mencionado; "em 3x", "parcelado em 10 vezes" = esse número.
- data: AAAA-MM-DD. Sem menção = hoje. "ontem", "anteontem", "sexta", "sexta passada", "dia 5" (mês atual; se ficar no futuro, mês anterior) — calcule a partir de hoje. Nunca invente data futura (para compra parcelada, a data é a da compra).
- Se a frase tiver UMA só referência de data, ela vale para TODOS os itens; só use datas diferentes quando cada item tiver a sua.
- categoria de DESPESA: exatamente uma destas: ${catsDesp.join(", ")}.
  Dicas: mercado/supermercado/atacadão/feira/compras de casa de comida → Mercado; restaurante/ifood/delivery/lanche/padaria/almoço/jantar/café/pizza/hambúrguer/conveniência/energético/refrigerante → Restaurantes e delivery; cerveja/chopp/vinho/drink/gin/bebida em bar → Bebidas alcoólicas; aluguel/condomínio/luz/água/gás/IPTU → Moradia; internet/celular/Claro/Vivo/streaming/Netflix/Disney/Spotify/Apple/iCloud/Claude/apps → Contas e assinaturas; gasolina/combustível/Uber/99/estacionamento/pedágio/lava-jato/oficina/IPVA/seguro do carro → Carro e transporte; farmácia/remédio/melatonina/suplemento/médico/dentista/exame/bioimpedância/plano de saúde → Saúde; academia/Wellhub/quadra/aluguel de quadra/tênis/futvôlei/aula de esporte/material esportivo → Esporte; pensão/escola dos filhos/coisas para os filhos/passeio ou almoço com os filhos → Filhos; cabelo/barbearia/perfume/cosméticos → Cuidados pessoais; roupa/sapato/tênis de vestir → Vestuário; utensílios/móveis/decoração/Temu para casa/limpeza → Casa e utilidades; celular novo/fone/capa/carregador/notebook → Eletrônicos; presente → Presentes; cinema/show/festa/balada/bar (entrada)/passeio/viagem/hotel/passagem → Lazer e viagens; curso/faculdade/livro → Educação; impostos/IR/DARF/taxas/tarifas bancárias/multas → Impostos e taxas; resto → Outro.
- categoria de RECEITA: exatamente uma destas: ${catsRec.join(", ")}.
  Dicas: salário/pró-labore → Salário/Pró-labore; comissão/bônus/PLR → Comissões e bônus; consultoria/planejamento financeiro para cliente/honorários/freela → Consultoria; lucro de day trade → Day trade; vendi algo → Venda; resto → Outro.
- pagamento: uma destas se a frase indicar (${pags.join(", ")}); "no cartão"/"crédito"/nome de cartão = Crédito; senão "".
- cartao: se for crédito e a frase citar um cartão, use o nome mais parecido desta lista: ${cartoes.length ? cartoes.join(", ") : "(nenhum cadastrado)"}; senão "".
- essencial (só despesa): "essencial" para necessidades (moradia, contas, mercado, saúde, filhos, educação, impostos, combustível/transporte para trabalhar); "superfluo" para desejos (restaurante/delivery, bebidas, lazer, presentes, eletrônicos, vestuário não necessário, compras por impulso). Receita = "".
- pessoa: para quem foi o gasto/receita, uma destas: ${pessoas.join(", ")}. ${apel.length ? "Nomes conhecidos: " + apel.join("; ") + ". " : ""}filhos → Filhos; namorada/namorado/esposa/marido → a pessoa parceira da lista; mãe/pai/irmão/família → Família; amigos → Amigos; se não houver indício → Eu.
- descricao: curta (até 60 caracteres), sem o valor, com o essencial (ex.: "Uber para o trabalho", "Condomínio setembro").
- Vários gastos na mesma frase = vários itens.
- Se faltar o valor ou a frase não for um lançamento financeiro, devolva itens vazio e diga em "pergunta", numa frase curta e objetiva, o que falta (ex.: "Qual foi o valor do mercado?").`;

  const tool = {
    name: "registrar_lancamentos",
    description: "Registra os lançamentos entendidos na frase.",
    input_schema: {
      type: "object",
      properties: {
        itens: {
          type: "array",
          items: {
            type: "object",
            properties: {
              tipo: { type: "string", enum: ["despesa", "receita"] },
              valor: { type: "number", description: "valor TOTAL em reais" },
              categoria: { type: "string", enum: todas },
              data: { type: "string", description: "AAAA-MM-DD" },
              descricao: { type: "string" },
              pagamento: { type: "string", enum: ["", ...pags] },
              cartao: { type: "string" },
              parcelas: { type: "integer", minimum: 1, maximum: 48 },
              essencial: { type: "string", enum: ["", "essencial", "superfluo"] },
              pessoa: { type: "string", enum: pessoas },
            },
            required: ["tipo", "valor", "categoria", "data", "descricao", "pagamento", "parcelas", "essencial", "pessoa"],
          },
        },
        pergunta: { type: "string", description: "Vazio se entendeu tudo; senão, o que falta." },
      },
      required: ["itens"],
    },
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        system,
        tools: [tool],
        tool_choice: { type: "tool", name: "registrar_lancamentos" },
        messages: [{ role: "user", content: texto }],
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("anthropic", r.status, JSON.stringify(data).slice(0, 300));
      return json(req, { erro: "ia_falhou", status: r.status, detalhe: data?.error?.message ?? "" }, 502);
    }
    const use = (data.content ?? []).find((c: { type: string }) => c.type === "tool_use");
    const out = use?.input ?? { itens: [] };
    const itens = (Array.isArray(out.itens) ? out.itens : [])
      .map((i: Record<string, unknown>) => {
        const tipo = i.tipo === "receita" ? "receita" : "despesa";
        const cats = tipo === "receita" ? catsRec : catsDesp;
        const pag = pags.includes(String(i.pagamento)) ? String(i.pagamento) : "";
        return {
          tipo,
          valor: Math.round(Math.abs(Number(i.valor) || 0) * 100) / 100,
          categoria: cats.includes(String(i.categoria)) ? String(i.categoria) : "Outro",
          data: /^\d{4}-\d{2}-\d{2}$/.test(String(i.data)) ? String(i.data) : hoje,
          descricao: String(i.descricao ?? "").slice(0, 80),
          pagamento: pag,
          cartao: pag === "Crédito" ? String(i.cartao ?? "").slice(0, 40) : "",
          parcelas: Math.min(48, Math.max(1, Math.round(Number(i.parcelas) || 1))),
          essencial: tipo === "despesa" && ["essencial", "superfluo"].includes(String(i.essencial)) ? String(i.essencial) : "",
          pessoa: pessoas.includes(String(i.pessoa)) ? String(i.pessoa) : "",
        };
      })
      .filter((i: { valor: number }) => i.valor > 0)
      .slice(0, 10);
    return json(req, { itens, pergunta: String(out.pergunta ?? ""), modelo: MODEL, uso: data.usage ?? null });
  } catch (e) {
    return json(req, { erro: "ia_indisponivel", detalhe: String(e).slice(0, 200) }, 504);
  } finally {
    clearTimeout(timer);
  }
});
