import { supabase } from "@/services/supabase";

import type {
  CriarEvento,
  Evento,
} from "@/models/Evento";

/* =========================================================
   DESCOBRIR CLIENTE LOGADO
========================================================= */

async function buscarClienteLogado() {
  const {
    data: usuarioData,
    error: usuarioError,
  } = await supabase.auth.getUser();

  if (usuarioError) {
    throw new Error(usuarioError.message);
  }

  if (!usuarioData.user) {
    throw new Error(
      "Você precisa estar autenticado."
    );
  }

  const {
    data: cliente,
    error: clienteError,
  } = await supabase
    .from("clientes")
    .select("id")
    .eq(
      "usuario_id",
      usuarioData.user.id
    )
    .maybeSingle();

  if (clienteError) {
    throw new Error(clienteError.message);
  }

  if (!cliente) {
    throw new Error(
      "Perfil de cliente não encontrado."
    );
  }

  return cliente;
}

/* =========================================================
   LISTAR EVENTOS DO CLIENTE
========================================================= */

export async function listarEventosCliente(): Promise<
  Evento[]
> {
  const cliente =
    await buscarClienteLogado();

  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("cliente_id", cliente.id)
    .order("criado_em", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Evento[];
}

/* =========================================================
   CRIAR EVENTO
========================================================= */

export async function criarEvento(
  dados: CriarEvento
): Promise<Evento> {
  const cliente =
    await buscarClienteLogado();

  if (!dados.nome.trim()) {
    throw new Error(
      "Informe o nome do evento."
    );
  }

  if (
    dados.quantidade_convidados != null &&
    dados.quantidade_convidados < 0
  ) {
    throw new Error(
      "A quantidade de convidados é inválida."
    );
  }

  if (
    dados.orcamento_total != null &&
    dados.orcamento_total < 0
  ) {
    throw new Error(
      "O orçamento informado é inválido."
    );
  }

  const { data, error } = await supabase
    .from("eventos")
    .insert({
      cliente_id: cliente.id,

      nome: dados.nome.trim(),

      tipo_evento:
        dados.tipo_evento?.trim() ||
        null,

      tema:
        dados.tema?.trim() ||
        null,

      descricao:
        dados.descricao?.trim() ||
        null,

      data_evento:
        dados.data_evento ||
        null,

      horario:
        dados.horario ||
        null,

      cidade:
        dados.cidade?.trim() ||
        null,

      estado:
        dados.estado?.trim() ||
        null,

      endereco:
        dados.endereco?.trim() ||
        null,

      quantidade_convidados:
        dados.quantidade_convidados ??
        null,

      orcamento_total:
        dados.orcamento_total ??
        null,

      status:
        dados.status ||
        "rascunho",

      visivel_profissionais:
        dados.visivel_profissionais ??
        false,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Evento;
}

/* =========================================================
   BUSCAR EVENTO DO CLIENTE POR ID
========================================================= */

export async function buscarEventoClientePorId(
  eventoId: string
): Promise<Evento | null> {
  const cliente = await buscarClienteLogado();

  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("id", eventoId)
    .eq("cliente_id", cliente.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Evento | null;
}

/* =========================================================
   ALTERAR VISIBILIDADE DO EVENTO
========================================================= */

export async function alterarVisibilidadeEvento(
  eventoId: string,
  visivel: boolean
): Promise<Evento> {
  const cliente = await buscarClienteLogado();

  const { data, error } = await supabase
    .from("eventos")
    .update({
      visivel_profissionais: visivel,

      // Ao disponibilizar o evento aos profissionais,
      // ele também passa para publicado.
      ...(visivel
        ? { status: "publicado" }
        : {}),
    })
    .eq("id", eventoId)
    .eq("cliente_id", cliente.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Evento;
}

/* =========================================================
   CANCELAR EVENTO
========================================================= */

export async function cancelarEvento(
  eventoId: string
): Promise<Evento> {
  const cliente = await buscarClienteLogado();

  const { data, error } = await supabase
    .from("eventos")
    .update({
      status: "cancelado",
      visivel_profissionais: false,
    })
    .eq("id", eventoId)
    .eq("cliente_id", cliente.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Evento;
}

/* =========================================================
   ATUALIZAR EVENTO
========================================================= */

export async function atualizarEvento(
  eventoId: string,
  dados: CriarEvento
): Promise<Evento> {
  const cliente = await buscarClienteLogado();

  if (!dados.nome.trim()) {
    throw new Error("Informe o nome do evento.");
  }

  if (
    dados.quantidade_convidados != null &&
    dados.quantidade_convidados < 0
  ) {
    throw new Error(
      "A quantidade de convidados é inválida."
    );
  }

  if (
    dados.orcamento_total != null &&
    dados.orcamento_total < 0
  ) {
    throw new Error(
      "O orçamento informado é inválido."
    );
  }

  const { data, error } = await supabase
    .from("eventos")
    .update({
      nome: dados.nome.trim(),

      tipo_evento:
        dados.tipo_evento?.trim() || null,

      tema:
        dados.tema?.trim() || null,

      descricao:
        dados.descricao?.trim() || null,

      data_evento:
        dados.data_evento || null,

      horario:
        dados.horario || null,

      cidade:
        dados.cidade?.trim() || null,

      estado:
        dados.estado?.trim().toUpperCase() || null,

      endereco:
        dados.endereco?.trim() || null,

      quantidade_convidados:
        dados.quantidade_convidados ?? null,

      orcamento_total:
        dados.orcamento_total ?? null,

      visivel_profissionais:
        dados.visivel_profissionais ?? false,

      atualizado_em:
        new Date().toISOString(),
    })
    .eq("id", eventoId)
    .eq("cliente_id", cliente.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Evento;
}

/* =========================================================
   LISTAR EVENTOS DISPONÍVEIS PARA PROFISSIONAIS
========================================================= */

export async function listarEventosPublicos(): Promise<
  Evento[]
> {
  const {
    data: usuarioData,
    error: usuarioError,
  } = await supabase.auth.getUser();

  if (usuarioError) {
    throw new Error(usuarioError.message);
  }

  if (!usuarioData.user) {
    throw new Error(
      "Você precisa estar autenticado."
    );
  }

  const {
    data: profissional,
    error: profissionalError,
  } = await supabase
    .from("profissionais")
    .select("id")
    .eq(
      "usuario_id",
      usuarioData.user.id
    )
    .maybeSingle();

  if (profissionalError) {
    throw new Error(
      profissionalError.message
    );
  }

  if (!profissional) {
    throw new Error(
      "Perfil profissional não encontrado."
    );
  }

  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("visivel_profissionais", true)
    .eq("status", "publicado")
    .order("data_evento", {
      ascending: true,
      nullsFirst: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Evento[];
}

/* =========================================================
   BUSCAR EVENTO PÚBLICO POR ID
========================================================= */

export async function buscarEventoPublicoPorId(
  eventoId: string
): Promise<Evento | null> {
  const {
    data: usuarioData,
    error: usuarioError,
  } = await supabase.auth.getUser();

  if (usuarioError) {
    throw new Error(usuarioError.message);
  }

  if (!usuarioData.user) {
    throw new Error(
      "Você precisa estar autenticado."
    );
  }

  const {
    data: profissional,
    error: profissionalError,
  } = await supabase
    .from("profissionais")
    .select("id")
    .eq(
      "usuario_id",
      usuarioData.user.id
    )
    .maybeSingle();

  if (profissionalError) {
    throw new Error(
      profissionalError.message
    );
  }

  if (!profissional) {
    throw new Error(
      "Perfil profissional não encontrado."
    );
  }

  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("id", eventoId)
    .eq("visivel_profissionais", true)
    .eq("status", "publicado")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Evento | null;
}

/* =========================================================
   ENVIAR PROPOSTA PARA EVENTO
========================================================= */

export type CriarPropostaEvento = {
  evento_id: string;
  titulo: string;
  descricao: string;
  valor: number;
  validade?: string | null;
};

export async function enviarPropostaEvento(
  dados: CriarPropostaEvento
) {
  /* USUÁRIO LOGADO */

  const {
    data: usuarioData,
    error: usuarioError,
  } = await supabase.auth.getUser();

  if (usuarioError) {
    throw new Error(usuarioError.message);
  }

  if (!usuarioData.user) {
    throw new Error(
      "Você precisa estar autenticado."
    );
  }

  /* PROFISSIONAL */

  const {
    data: profissional,
    error: profissionalError,
  } = await supabase
    .from("profissionais")
    .select("id")
    .eq(
      "usuario_id",
      usuarioData.user.id
    )
    .maybeSingle();

  if (profissionalError) {
    throw new Error(
      profissionalError.message
    );
  }

  if (!profissional) {
    throw new Error(
      "Perfil profissional não encontrado."
    );
  }

  /* EVENTO */

  const {
    data: evento,
    error: eventoError,
  } = await supabase
    .from("eventos")
    .select("id, cliente_id, nome, visivel_profissionais, status")
    .eq("id", dados.evento_id)
    .eq("visivel_profissionais", true)
    .eq("status", "publicado")
    .maybeSingle();

  if (eventoError) {
    throw new Error(
      eventoError.message
    );
  }

  if (!evento) {
    throw new Error(
      "Este evento não está mais disponível."
    );
  }

  /* VALIDAÇÕES */

  if (!dados.titulo.trim()) {
    throw new Error(
      "Informe um título para a proposta."
    );
  }

  if (!dados.descricao.trim()) {
    throw new Error(
      "Descreva sua proposta."
    );
  }

  if (
    !Number.isFinite(dados.valor) ||
    dados.valor <= 0
  ) {
    throw new Error(
      "Informe um valor válido."
    );
  }

  /* VERIFICA SE JÁ EXISTE PROPOSTA */

  const {
    data: propostaExistente,
    error: existenteError,
  } = await supabase
    .from("orcamentos")
    .select("id")
    .eq(
      "profissional_id",
      profissional.id
    )
    .eq("evento_id", evento.id)
    .eq("origem", "evento")
    .maybeSingle();

  if (existenteError) {
    throw new Error(
      existenteError.message
    );
  }

  if (propostaExistente) {
    throw new Error(
      "Você já enviou uma proposta para este evento."
    );
  }

  /* CRIA ORÇAMENTO */

  const {
    data: proposta,
    error: propostaError,
  } = await supabase
    .from("orcamentos")
    .insert({
      cliente_id:
        evento.cliente_id,

      profissional_id:
        profissional.id,

      evento_id:
        evento.id,

      servico_id: null,
      interesse_id: null,

      origem: "evento",

      titulo:
        dados.titulo.trim(),

      descricao:
        dados.descricao.trim(),

      valor:
        dados.valor,

      validade:
        dados.validade || null,

      status: "pendente",
    })
    .select("*")
    .single();

  if (propostaError) {
    throw new Error(
      propostaError.message
    );
  }

  return proposta;
}