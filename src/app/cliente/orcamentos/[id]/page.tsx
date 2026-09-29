"use client";

import {
  use,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  aceitarOrcamento,
  buscarOrcamentoClientePorId,
  OrcamentoCliente,
  recusarOrcamento,
} from "@/controllers/orcamentoController";

export default function DetalhesOrcamentoClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();

  const [orcamento, setOrcamento] =
    useState<OrcamentoCliente | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [processando, setProcessando] =
    useState(false);

  const [erro, setErro] = useState("");

  const [confirmacao, setConfirmacao] =
    useState<"aceitar" | "recusar" | null>(
      null
    );

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        setErro("");

        const data =
          await buscarOrcamentoClientePorId(
            id
          );

        if (!data) {
          setErro(
            "Este orçamento não foi encontrado."
          );

          return;
        }

        setOrcamento(data);
      } catch (error) {
        console.error(error);

        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o orçamento."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [id]);

  async function confirmarDecisao() {
    if (!orcamento || !confirmacao) {
      return;
    }

    try {
      setProcessando(true);
      setErro("");

      if (confirmacao === "aceitar") {
        await aceitarOrcamento(
          orcamento.id
        );

        setOrcamento({
          ...orcamento,
          status: "aceito",
        });
      }

      if (confirmacao === "recusar") {
        await recusarOrcamento(
          orcamento.id
        );

        setOrcamento({
          ...orcamento,
          status: "recusado",
        });
      }

      setConfirmacao(null);
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o orçamento."
      );
    } finally {
      setProcessando(false);
    }
  }

  if (carregando) {
    return (
      <div className="cliente-orcamento-estado">
        <span>✦</span>
        <p>Carregando proposta...</p>
      </div>
    );
  }

  if (!orcamento) {
    return (
      <div className="cliente-orcamento-estado">
        <span>◇</span>

        <h2>
          Orçamento indisponível
        </h2>

        <p>{erro}</p>

        <button
          onClick={() =>
            router.push(
              "/cliente/orcamentos"
            )
          }
        >
          Voltar aos orçamentos
        </button>
      </div>
    );
  }

  const valor =
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(
      Number(orcamento.valor)
    );

  const dataCriacao =
    new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
    }).format(
      new Date(orcamento.criado_em)
    );

  const validade = orcamento.validade
    ? new Intl.DateTimeFormat(
        "pt-BR"
      ).format(
        new Date(
          `${orcamento.validade}T12:00:00`
        )
      )
    : "Sem data definida";

  const profissional =
    orcamento.profissionais
      ?.nome_empresa ||
    "Profissional Celebra";

  const servico =
    orcamento.servicos?.nome ||
    "Serviço";

  return (
    <div className="cliente-proposta-page">
      <button
        className="cliente-proposta-voltar"
        onClick={() =>
          router.push(
            "/cliente/orcamentos"
          )
        }
      >
        ← Meus orçamentos
      </button>

      <div className="cliente-proposta-grid">
        <section className="cliente-proposta-principal">
          <div className="cliente-proposta-cabecalho">
            <div>
              <span className="dashboard-label">
                PROPOSTA COMERCIAL
              </span>

              <h1>
                {orcamento.titulo ||
                  "Proposta para seu evento"}
              </h1>

              <p>
                Enviada por{" "}
                <strong>
                  {profissional}
                </strong>
              </p>
            </div>

            <StatusProposta
              status={orcamento.status}
            />
          </div>

          <div className="cliente-proposta-divisor" />

          <div className="cliente-proposta-servico">
            <span>Serviço</span>

            <strong>{servico}</strong>

            {orcamento.servicos
              ?.categorias_servico
              ?.nome && (
              <small>
                {
                  orcamento.servicos
                    .categorias_servico
                    .nome
                }
              </small>
            )}
          </div>

          <div className="cliente-proposta-divisor" />

          <h2>Sobre a proposta</h2>

          <div className="cliente-proposta-descricao">
            {orcamento.descricao}
          </div>

          <div className="cliente-proposta-divisor" />

          <div className="cliente-proposta-infos">
            <InfoProposta
              titulo="Enviada em"
              valor={dataCriacao}
            />

            <InfoProposta
              titulo="Validade"
              valor={validade}
            />

            <InfoProposta
              titulo="Origem"
              valor={
                orcamento.origem ===
                "interesse"
                  ? "Interesse em serviço"
                  : "Evento"
              }
            />
          </div>
        </section>

        <aside className="cliente-proposta-lateral">
          <div className="cliente-proposta-valor">
            <span>
              VALOR DA PROPOSTA
            </span>

            <strong>{valor}</strong>

            {orcamento.status ===
              "pendente" && (
              <>
                <p>
                  Analise as informações da
                  proposta antes de tomar sua
                  decisão.
                </p>

                <button
                  className="cliente-btn-aceitar"
                  onClick={() =>
                    setConfirmacao(
                      "aceitar"
                    )
                  }
                >
                  Aceitar proposta
                </button>

                <button
                  className="cliente-btn-recusar"
                  onClick={() =>
                    setConfirmacao(
                      "recusar"
                    )
                  }
                >
                  Recusar proposta
                </button>
              </>
            )}

            {orcamento.status ===
              "aceito" && (
              <div className="cliente-decisao cliente-decisao-aceito">
                <span>✓</span>

                <div>
                  <strong>
                    Proposta aceita
                  </strong>

                  <p>
                    Você aceitou este
                    orçamento.
                  </p>
                </div>
              </div>
            )}

            {orcamento.status ===
              "recusado" && (
              <div className="cliente-decisao">
                <span>×</span>

                <div>
                  <strong>
                    Proposta recusada
                  </strong>

                  <p>
                    Você recusou este
                    orçamento.
                  </p>
                </div>
              </div>
            )}

            {orcamento.status ===
              "cancelado" && (
              <div className="cliente-decisao">
                <span>×</span>

                <div>
                  <strong>
                    Proposta cancelada
                  </strong>

                  <p>
                    Esta proposta foi
                    cancelada.
                  </p>
                </div>
              </div>
            )}

            {orcamento.status ===
              "expirado" && (
              <div className="cliente-decisao">
                <span>!</span>

                <div>
                  <strong>
                    Proposta expirada
                  </strong>

                  <p>
                    O prazo desta proposta
                    terminou.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="cliente-proposta-profissional">
            <span className="dashboard-label">
              PROFISSIONAL
            </span>

            <h3>
              {profissional}

              {orcamento.profissionais
                ?.verificado && (
                <span> ✓</span>
              )}
            </h3>
          </div>
        </aside>
      </div>

      {erro && (
        <div className="cliente-proposta-erro">
          {erro}
        </div>
      )}

      {confirmacao && (
        <div
          className="cliente-confirmacao-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget &&
              !processando
            ) {
              setConfirmacao(null);
            }
          }}
        >
          <div className="cliente-confirmacao-modal">
            <span className="dashboard-label">
              CONFIRMAÇÃO
            </span>

            <h2>
              {confirmacao === "aceitar"
                ? "Aceitar esta proposta?"
                : "Recusar esta proposta?"}
            </h2>

            <p>
              {confirmacao === "aceitar"
                ? `Você está prestes a aceitar a proposta de ${valor} enviada por ${profissional}.`
                : "Após confirmar, esta proposta será marcada como recusada."}
            </p>

            <div className="cliente-confirmacao-acoes">
              <button
                type="button"
                onClick={() =>
                  setConfirmacao(null)
                }
                disabled={processando}
              >
                Voltar
              </button>

              <button
                type="button"
                className={
                  confirmacao ===
                  "aceitar"
                    ? "confirmar-aceite"
                    : "confirmar-recusa"
                }
                onClick={
                  confirmarDecisao
                }
                disabled={processando}
              >
                {processando
                  ? "Processando..."
                  : confirmacao ===
                      "aceitar"
                    ? "Sim, aceitar"
                    : "Sim, recusar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoProposta({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="cliente-proposta-info">
      <span>{titulo}</span>
      <strong>{valor}</strong>
    </div>
  );
}

function StatusProposta({
  status,
}: {
  status: OrcamentoCliente["status"];
}) {
  const nomes = {
    pendente: "Aguardando decisão",
    aceito: "Aceito",
    recusado: "Recusado",
    cancelado: "Cancelado",
    expirado: "Expirado",
  };

  return (
    <span
      className={`cliente-proposta-status cliente-status-${status}`}
    >
      {nomes[status]}
    </span>
  );
}