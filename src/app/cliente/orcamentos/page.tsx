"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  listarOrcamentosCliente,
  OrcamentoCliente,
} from "@/controllers/orcamentoController";

export default function OrcamentosClientePage() {
  const router = useRouter();

  const [orcamentos, setOrcamentos] =
    useState<OrcamentoCliente[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState("");

  const [filtro, setFiltro] =
    useState("todos");

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const data =
        await listarOrcamentosCliente();

      setOrcamentos(data);
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os orçamentos."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtrados =
    filtro === "todos"
      ? orcamentos
      : orcamentos.filter(
          (orcamento) =>
            orcamento.status === filtro
        );

  const pendentes = orcamentos.filter(
    (item) => item.status === "pendente"
  ).length;

  const aceitos = orcamentos.filter(
    (item) => item.status === "aceito"
  ).length;

  return (
    <div className="cliente-orcamentos-page">
      <section className="cliente-orcamentos-header">
        <div>
          <span className="dashboard-label">
            PROPOSTAS
          </span>

          <h1>Meus orçamentos</h1>

          <p>
            Consulte as propostas enviadas pelos
            profissionais e acompanhe suas
            decisões.
          </p>
        </div>
      </section>

      <section className="cliente-orcamentos-resumo">
        <Resumo
          numero={orcamentos.length}
          titulo="Recebidos"
        />

        <Resumo
          numero={pendentes}
          titulo="Aguardando decisão"
        />

        <Resumo
          numero={aceitos}
          titulo="Aceitos"
        />
      </section>

      <div className="cliente-orcamentos-toolbar">
        <div className="cliente-orcamentos-filtros">
          <button
            className={
              filtro === "todos"
                ? "ativo"
                : ""
            }
            onClick={() =>
              setFiltro("todos")
            }
          >
            Todos
          </button>

          <button
            className={
              filtro === "pendente"
                ? "ativo"
                : ""
            }
            onClick={() =>
              setFiltro("pendente")
            }
          >
            Pendentes
          </button>

          <button
            className={
              filtro === "aceito"
                ? "ativo"
                : ""
            }
            onClick={() =>
              setFiltro("aceito")
            }
          >
            Aceitos
          </button>

          <button
            className={
              filtro === "recusado"
                ? "ativo"
                : ""
            }
            onClick={() =>
              setFiltro("recusado")
            }
          >
            Recusados
          </button>
        </div>

        <button
          className="cliente-orcamentos-atualizar"
          onClick={carregar}
        >
          ↻ Atualizar
        </button>
      </div>

      {erro && (
        <div className="cliente-orcamentos-erro">
          <strong>
            Não foi possível carregar.
          </strong>

          <p>{erro}</p>

          <button onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      )}

      {carregando && (
        <div className="cliente-orcamentos-estado">
          <span>✦</span>
          <p>Carregando propostas...</p>
        </div>
      )}

      {!carregando &&
        !erro &&
        filtrados.length === 0 && (
          <div className="cliente-orcamentos-vazio">
            <span>◇</span>

            <h2>
              Nenhum orçamento encontrado
            </h2>

            <p>
              Quando um profissional enviar uma
              proposta, ela aparecerá aqui.
            </p>
          </div>
        )}

      {!carregando &&
        !erro &&
        filtrados.length > 0 && (
          <div className="cliente-orcamentos-lista">
            {filtrados.map(
              (orcamento) => (
                <OrcamentoCard
                  key={orcamento.id}
                  orcamento={orcamento}
                  onAbrir={() =>
                    router.push(
                      `/cliente/orcamentos/${orcamento.id}`
                    )
                  }
                />
              )
            )}
          </div>
        )}
    </div>
  );
}

function Resumo({
  numero,
  titulo,
}: {
  numero: number;
  titulo: string;
}) {
  return (
    <div className="cliente-orcamento-resumo-card">
      <strong>{numero}</strong>
      <span>{titulo}</span>
    </div>
  );
}

function OrcamentoCard({
  orcamento,
  onAbrir,
}: {
  orcamento: OrcamentoCliente;
  onAbrir: () => void;
}) {
  const valor = new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(Number(orcamento.valor));

  const data = new Intl.DateTimeFormat(
    "pt-BR"
  ).format(
    new Date(orcamento.criado_em)
  );

  return (
    <article className="cliente-orcamento-card">
      <div className="cliente-orcamento-icone">
        {orcamento.servicos
          ?.categorias_servico?.icone ||
          "✦"}
      </div>

      <div className="cliente-orcamento-conteudo">
        <div className="cliente-orcamento-topo">
          <div>
            <span>
              {orcamento.profissionais
                ?.nome_empresa ||
                "Profissional Celebra"}
            </span>

            <h3>
              {orcamento.titulo ||
                orcamento.servicos?.nome ||
                "Proposta comercial"}
            </h3>
          </div>

          <Status
            status={orcamento.status}
          />
        </div>

        <p>
          {orcamento.descricao}
        </p>

        <div className="cliente-orcamento-rodape">
          <strong>{valor}</strong>
          <span>Recebido em {data}</span>
        </div>
      </div>

      <button onClick={onAbrir}>
        Ver proposta →
      </button>
    </article>
  );
}

function Status({
  status,
}: {
  status: OrcamentoCliente["status"];
}) {
  const nomes = {
    pendente: "Pendente",
    aceito: "Aceito",
    recusado: "Recusado",
    cancelado: "Cancelado",
    expirado: "Expirado",
  };

  return (
    <span
      className={`cliente-orcamento-status cliente-status-${status}`}
    >
      {nomes[status]}
    </span>
  );
}