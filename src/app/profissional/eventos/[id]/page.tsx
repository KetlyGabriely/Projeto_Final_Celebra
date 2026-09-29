"use client";

import {
  use,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  buscarEventoPublicoPorId,
} from "@/controllers/eventoController";

import type {
  Evento,
} from "@/models/Evento";

export default function EventoProfissionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();

  const [evento, setEvento] =
    useState<Evento | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

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

  if (carregando) {
    return (
      <div className="prof-estado">
        <span>✦</span>

        <p>
          Carregando oportunidade...
        </p>
      </div>
    );
  }

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

  return (
    <div className="prof-evento-detalhe-page">
      <button
        className="detalhe-interesse-voltar"
        onClick={() =>
          router.push(
            "/profissional/eventos"
          )
        }
      >
        ← Explorar eventos
      </button>

      <section className="prof-evento-detalhe-header">
        <div>
          <div className="prof-evento-detalhe-labels">
            <span className="prof-dashboard-label">
              OPORTUNIDADE
            </span>

            <span className="prof-evento-disponivel">
              ● Disponível
            </span>
          </div>

          <h1>{evento.nome}</h1>

          <p>
            {evento.tipo_evento ||
              "Evento"}

            {evento.tema
              ? ` · ${evento.tema}`
              : ""}
          </p>
        </div>
      </section>

      <div className="prof-evento-detalhe-grid">

        {/* ESQUERDA */}

        <main className="prof-evento-detalhe-principal">

          <section className="prof-evento-detalhe-card">
            <div className="prof-evento-secao-titulo">
              <span>01</span>

              <div>
                <h2>
                  Sobre o evento
                </h2>

                <p>
                  Informações fornecidas pelo
                  cliente.
                </p>
              </div>
            </div>

            <div className="prof-evento-texto">
              {evento.descricao ||
                "O cliente não adicionou uma descrição."}
            </div>
          </section>

          <section className="prof-evento-detalhe-card">
            <div className="prof-evento-secao-titulo">
              <span>02</span>

              <div>
                <h2>
                  Informações
                </h2>

                <p>
                  Dados para avaliar a
                  oportunidade.
                </p>
              </div>
            </div>

            <div className="prof-evento-detalhes-info">
              <InfoDetalhe
                titulo="Data"
                valor={
                  evento.data_evento
                    ? formatarDataLonga(
                        evento.data_evento
                      )
                    : "A definir"
                }
              />

              <InfoDetalhe
                titulo="Horário"
                valor={
                  evento.horario
                    ? evento.horario.slice(
                        0,
                        5
                      )
                    : "A definir"
                }
              />

              <InfoDetalhe
                titulo="Convidados"
                valor={
                  evento.quantidade_convidados !=
                  null
                    ? `${evento.quantidade_convidados} pessoas`
                    : "A definir"
                }
              />

              <InfoDetalhe
                titulo="Tipo"
                valor={
                  evento.tipo_evento ||
                  "Não informado"
                }
              />
            </div>
          </section>

          <section className="prof-evento-detalhe-card">
            <div className="prof-evento-secao-titulo">
              <span>03</span>

              <div>
                <h2>
                  Local
                </h2>

                <p>
                  Localização planejada para o
                  evento.
                </p>
              </div>
            </div>

            <div className="prof-evento-local">
              <strong>
                {evento.cidade
                  ? `${evento.cidade}${
                      evento.estado
                        ? ` - ${evento.estado}`
                        : ""
                    }`
                  : "Local a definir"}
              </strong>

              {evento.endereco && (
                <p>
                  {evento.endereco}
                </p>
              )}
            </div>
          </section>
        </main>

        {/* DIREITA */}

        <aside className="prof-evento-detalhe-lateral">
          <section className="prof-evento-oportunidade-card">
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

            <p>
              Envie uma proposta personalizada
              para este cliente.
            </p>

            <button
              onClick={() =>
                router.push(
                  `/profissional/eventos/${evento.id}/proposta`
                )
              }
            >
              Enviar proposta
            </button>
          </section>

          <section className="prof-evento-aviso">
            <span>✦</span>

            <div>
              <strong>
                Nova oportunidade
              </strong>

              <p>
                O cliente publicou este evento
                para receber propostas de
                profissionais.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function InfoDetalhe({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="prof-evento-detalhe-info">
      <span>{titulo}</span>
      <strong>{valor}</strong>
    </div>
  );
}

function formatarDataLonga(
  data: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "long",
    }
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