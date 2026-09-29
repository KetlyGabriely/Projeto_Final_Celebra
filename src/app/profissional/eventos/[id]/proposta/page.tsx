"use client";

import {
  FormEvent,
  use,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  buscarEventoPublicoPorId,
  enviarPropostaEvento,
} from "@/controllers/eventoController";

import type {
  Evento,
} from "@/models/Evento";

export default function PropostaEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();

  const [evento, setEvento] =
    useState<Evento | null>(null);

  const [titulo, setTitulo] =
    useState("");

  const [descricao, setDescricao] =
    useState("");

  const [valor, setValor] =
    useState("");

  const [validade, setValidade] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [enviando, setEnviando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState(false);

  /* =======================================================
     CARREGAR EVENTO
  ======================================================= */

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        setErro("");

        const data =
          await buscarEventoPublicoPorId(
            id
          );

        if (!data) {
          setErro(
            "Este evento não está mais disponível."
          );

          return;
        }

        setEvento(data);

        setTitulo(
          `Proposta para ${data.nome}`
        );
      } catch (error) {
        console.error(error);

        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o evento."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [id]);

  /* =======================================================
     ENVIAR
  ======================================================= */

  async function enviar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!evento) {
      return;
    }

    if (!titulo.trim()) {
      setErro(
        "Informe o título da proposta."
      );

      return;
    }

    if (!descricao.trim()) {
      setErro(
        "Descreva sua proposta."
      );

      return;
    }

    const valorConvertido =
      Number(
        valor
          .replace(/\./g, "")
          .replace(",", ".")
      );

    if (
      !valor.trim() ||
      Number.isNaN(valorConvertido) ||
      valorConvertido <= 0
    ) {
      setErro(
        "Informe um valor válido."
      );

      return;
    }

    try {
      setEnviando(true);
      setErro("");

      await enviarPropostaEvento({
        evento_id: evento.id,
        titulo,
        descricao,
        valor: valorConvertido,
        validade:
          validade || null,
      });

      setSucesso(true);
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a proposta."
      );
    } finally {
      setEnviando(false);
    }
  }

  /* =======================================================
     CARREGANDO
  ======================================================= */

  if (carregando) {
    return (
      <div className="prof-estado">
        <span>✦</span>

        <p>
          Preparando proposta...
        </p>
      </div>
    );
  }

  /* =======================================================
     EVENTO NÃO ENCONTRADO
  ======================================================= */

  if (!evento) {
    return (
      <div className="prof-eventos-vazio">
        <span>◇</span>

        <h2>
          Evento indisponível
        </h2>

        <p>{erro}</p>

        <button
          onClick={() =>
            router.push(
              "/profissional/eventos"
            )
          }
        >
          Voltar às oportunidades
        </button>
      </div>
    );
  }

  /* =======================================================
     SUCESSO
  ======================================================= */

  if (sucesso) {
    return (
      <div className="prof-proposta-sucesso">
        <span>✓</span>

        <span className="prof-dashboard-label">
          PROPOSTA ENVIADA
        </span>

        <h1>
          Sua proposta foi enviada.
        </h1>

        <p>
          O cliente poderá analisar sua
          proposta e decidir se deseja
          aceitá-la.
        </p>

        <div className="prof-proposta-sucesso-acoes">
          <button
            onClick={() =>
              router.push(
                "/profissional/orcamentos"
              )
            }
          >
            Ver meus orçamentos
          </button>

          <button
            onClick={() =>
              router.push(
                "/profissional/eventos"
              )
            }
          >
            Explorar outros eventos
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     FORMULÁRIO
  ======================================================= */

  return (
    <div className="prof-proposta-page">

      <button
        className="detalhe-interesse-voltar"
        onClick={() =>
          router.push(
            `/profissional/eventos/${evento.id}`
          )
        }
      >
        ← Voltar ao evento
      </button>

      <div className="prof-proposta-grid">

        {/* FORMULÁRIO */}

        <main className="prof-proposta-principal">

          <header className="prof-proposta-header">
            <span className="prof-dashboard-label">
              ENVIAR PROPOSTA
            </span>

            <h1>
              Prepare seu orçamento.
            </h1>

            <p>
              Apresente sua proposta para o
              cliente de forma clara e
              profissional.
            </p>
          </header>

          <form
            className="prof-proposta-form"
            onSubmit={enviar}
          >

            {/* TÍTULO */}

            <Campo label="Título da proposta">
              <input
                value={titulo}
                onChange={(event) =>
                  setTitulo(
                    event.target.value
                  )
                }
                placeholder="Ex: Buffet completo para casamento"
                required
              />
            </Campo>

            {/* DESCRIÇÃO */}

            <Campo label="Descrição da proposta">
              <textarea
                value={descricao}
                onChange={(event) =>
                  setDescricao(
                    event.target.value
                  )
                }
                placeholder="Descreva o que está incluso, diferenciais, condições e demais informações..."
                rows={8}
                required
              />
            </Campo>

            <div className="prof-proposta-duplo">

              {/* VALOR */}

              <Campo label="Valor da proposta">
                <div className="prof-proposta-dinheiro">
                  <span>R$</span>

                  <input
                    value={valor}
                    onChange={(event) =>
                      setValor(
                        event.target.value
                      )
                    }
                    inputMode="decimal"
                    placeholder="0,00"
                    required
                  />
                </div>
              </Campo>

              {/* VALIDADE */}

              <Campo label="Validade da proposta">
                <input
                  type="date"
                  value={validade}
                  onChange={(event) =>
                    setValidade(
                      event.target.value
                    )
                  }
                />
              </Campo>
            </div>

            {erro && (
              <div className="prof-erro-box">
                {erro}
              </div>
            )}

            <div className="prof-proposta-acoes">
              <button
                type="button"
                className="prof-proposta-cancelar"
                onClick={() =>
                  router.push(
                    `/profissional/eventos/${evento.id}`
                  )
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="prof-proposta-enviar"
                disabled={enviando}
              >
                {enviando
                  ? "Enviando..."
                  : "Enviar proposta"}
              </button>
            </div>
          </form>
        </main>

        {/* EVENTO */}

        <aside className="prof-proposta-evento">

          <span className="prof-dashboard-label">
            OPORTUNIDADE
          </span>

          <h2>
            {evento.nome}
          </h2>

          {evento.tipo_evento && (
            <p className="prof-proposta-tipo">
              {evento.tipo_evento}
            </p>
          )}

          <div className="prof-proposta-resumo">
            <Resumo
              titulo="Data"
              valor={
                evento.data_evento
                  ? formatarData(
                      evento.data_evento
                    )
                  : "A definir"
              }
            />

            <Resumo
              titulo="Local"
              valor={
                evento.cidade
                  ? `${evento.cidade}${
                      evento.estado
                        ? ` - ${evento.estado}`
                        : ""
                    }`
                  : "A definir"
              }
            />

            <Resumo
              titulo="Convidados"
              valor={
                evento.quantidade_convidados !=
                null
                  ? `${evento.quantidade_convidados} pessoas`
                  : "A definir"
              }
            />
          </div>

          <div className="prof-proposta-orcamento">
            <span>
              ORÇAMENTO PLANEJADO
            </span>

            <strong>
              {evento.orcamento_total != null
                ? formatarDinheiro(
                    evento.orcamento_total
                  )
                : "Não informado"}
            </strong>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTES
========================================================= */

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="prof-proposta-campo">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Resumo({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div>
      <span>{titulo}</span>
      <strong>{valor}</strong>
    </div>
  );
}

function formatarData(
  data: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(
    new Date(`${data}T12:00:00`)
  );
}

function formatarDinheiro(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(Number(valor));
}