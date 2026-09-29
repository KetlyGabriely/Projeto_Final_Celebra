"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  criarEvento,
} from "@/controllers/eventoController";

export default function NovoEventoPage() {
  const router = useRouter();

  const [nome, setNome] =
    useState("");

  const [tipo, setTipo] =
    useState("");

  const [tema, setTema] =
    useState("");

  const [descricao, setDescricao] =
    useState("");

  const [dataEvento, setDataEvento] =
    useState("");

  const [horario, setHorario] =
    useState("");

  const [cidade, setCidade] =
    useState("");

  const [estado, setEstado] =
    useState("");

  const [endereco, setEndereco] =
    useState("");

  const [convidados, setConvidados] =
    useState("");

  const [orcamento, setOrcamento] =
    useState("");

  const [publicar, setPublicar] =
    useState(true);

  const [enviando, setEnviando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  async function salvar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!nome.trim()) {
      setErro(
        "Informe o nome do evento."
      );
      return;
    }

    try {
      setEnviando(true);
      setErro("");

      const valorOrcamento =
        orcamento.trim()
          ? Number(
              orcamento
                .replace(/\./g, "")
                .replace(",", ".")
            )
          : null;

      if (
        valorOrcamento != null &&
        (Number.isNaN(valorOrcamento) ||
          valorOrcamento < 0)
      ) {
        setErro(
          "Informe um orçamento válido."
        );
        return;
      }

      const quantidade =
        convidados.trim()
          ? Number(convidados)
          : null;

      if (
        quantidade != null &&
        (!Number.isInteger(quantidade) ||
          quantidade < 0)
      ) {
        setErro(
          "Informe uma quantidade válida de convidados."
        );
        return;
      }

      const evento =
        await criarEvento({
          nome,
          tipo_evento: tipo,
          tema,
          descricao,

          data_evento: dataEvento,
          horario,

          cidade,
          estado,
          endereco,

          quantidade_convidados:
            quantidade,

          orcamento_total:
            valorOrcamento,

          status: publicar
            ? "publicado"
            : "rascunho",

          visivel_profissionais:
            publicar,
        });

      router.push(
        `/cliente/eventos/${evento.id}`
      );
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o evento."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="novo-evento-page">
      <button
        className="cliente-proposta-voltar"
        onClick={() =>
          router.push(
            "/cliente/eventos"
          )
        }
      >
        ← Meus eventos
      </button>

      <div className="novo-evento-header">
        <span className="dashboard-label">
          NOVO EVENTO
        </span>

        <h1>
          Vamos criar algo especial.
        </h1>

        <p>
          Conte um pouco sobre o evento que
          você está planejando.
        </p>
      </div>

      <form
        className="novo-evento-form"
        onSubmit={salvar}
      >
        <section className="novo-evento-secao">
          <div className="novo-evento-secao-titulo">
            <span>01</span>

            <div>
              <h2>
                Sobre o evento
              </h2>

              <p>
                Comece pelas informações
                principais.
              </p>
            </div>
          </div>

          <div className="novo-evento-campos">
            <Campo
              label="Nome do evento *"
            >
              <input
                value={nome}
                onChange={(e) =>
                  setNome(
                    e.target.value
                  )
                }
                placeholder="Ex.: Casamento Ana & Lucas"
                required
              />
            </Campo>

            <div className="novo-evento-duplo">
              <Campo label="Tipo de evento">
                <select
                  value={tipo}
                  onChange={(e) =>
                    setTipo(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione
                  </option>

                  <option value="Casamento">
                    Casamento
                  </option>

                  <option value="Aniversário">
                    Aniversário
                  </option>

                  <option value="Formatura">
                    Formatura
                  </option>

                  <option value="Corporativo">
                    Corporativo
                  </option>

                  <option value="Debutante">
                    Debutante
                  </option>

                  <option value="Outro">
                    Outro
                  </option>
                </select>
              </Campo>

              <Campo label="Tema">
                <input
                  value={tema}
                  onChange={(e) =>
                    setTema(
                      e.target.value
                    )
                  }
                  placeholder="Ex.: Clássico e elegante"
                />
              </Campo>
            </div>

            <Campo label="Descrição">
              <textarea
                value={descricao}
                onChange={(e) =>
                  setDescricao(
                    e.target.value
                  )
                }
                placeholder="Conte aos profissionais o que você está imaginando para este evento..."
                rows={5}
              />
            </Campo>
          </div>
        </section>

        <section className="novo-evento-secao">
          <div className="novo-evento-secao-titulo">
            <span>02</span>

            <div>
              <h2>
                Quando e onde
              </h2>

              <p>
                Informe a data e o local
                planejados.
              </p>
            </div>
          </div>

          <div className="novo-evento-campos">
            <div className="novo-evento-duplo">
              <Campo label="Data">
                <input
                  type="date"
                  value={dataEvento}
                  onChange={(e) =>
                    setDataEvento(
                      e.target.value
                    )
                  }
                />
              </Campo>

              <Campo label="Horário">
                <input
                  type="time"
                  value={horario}
                  onChange={(e) =>
                    setHorario(
                      e.target.value
                    )
                  }
                />
              </Campo>
            </div>

            <Campo label="Endereço">
              <input
                value={endereco}
                onChange={(e) =>
                  setEndereco(
                    e.target.value
                  )
                }
                placeholder="Local ou endereço do evento"
              />
            </Campo>

            <div className="novo-evento-duplo">
              <Campo label="Cidade">
                <input
                  value={cidade}
                  onChange={(e) =>
                    setCidade(
                      e.target.value
                    )
                  }
                  placeholder="Cidade"
                />
              </Campo>

              <Campo label="Estado">
                <input
                  value={estado}
                  onChange={(e) =>
                    setEstado(
                      e.target.value
                    )
                  }
                  placeholder="SP"
                  maxLength={2}
                />
              </Campo>
            </div>
          </div>
        </section>

        <section className="novo-evento-secao">
          <div className="novo-evento-secao-titulo">
            <span>03</span>

            <div>
              <h2>
                Planejamento
              </h2>

              <p>
                Essas informações ajudam os
                profissionais a preparar
                propostas melhores.
              </p>
            </div>
          </div>

          <div className="novo-evento-campos">
            <div className="novo-evento-duplo">
              <Campo label="Convidados">
                <input
                  type="number"
                  min="0"
                  value={convidados}
                  onChange={(e) =>
                    setConvidados(
                      e.target.value
                    )
                  }
                  placeholder="Ex.: 150"
                />
              </Campo>

              <Campo label="Orçamento total">
                <div className="novo-evento-dinheiro">
                  <span>R$</span>

                  <input
                    value={orcamento}
                    onChange={(e) =>
                      setOrcamento(
                        e.target.value
                      )
                    }
                    inputMode="decimal"
                    placeholder="0,00"
                  />
                </div>
              </Campo>
            </div>

            <label className="novo-evento-publicar">
              <input
                type="checkbox"
                checked={publicar}
                onChange={(e) =>
                  setPublicar(
                    e.target.checked
                  )
                }
              />

              <div>
                <strong>
                  Publicar para profissionais
                </strong>

                <span>
                  Profissionais poderão
                  encontrar seu evento e enviar
                  propostas.
                </span>
              </div>
            </label>
          </div>
        </section>

        {erro && (
          <div className="cliente-proposta-erro">
            {erro}
          </div>
        )}

        <div className="novo-evento-acoes">
          <button
            type="button"
            className="novo-evento-cancelar"
            onClick={() =>
              router.push(
                "/cliente/eventos"
              )
            }
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="novo-evento-salvar"
            disabled={enviando}
          >
            {enviando
              ? "Criando..."
              : publicar
                ? "Criar e publicar"
                : "Salvar rascunho"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="novo-evento-campo">
      <span>{label}</span>
      {children}
    </label>
  );
}