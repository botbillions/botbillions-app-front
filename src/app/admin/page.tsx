"use client";

import Body from "@/components/Body";
import Container from "@/components/Container";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MenuItemST } from "@/components/Sidebar/styles";
import Configuracoes from "@/components/icons/Configuracoes";
import { useSidebar } from "@/contexts/SidebarContext";
import { signOutAction } from "@/services/actions/auth/supabase-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as S from "./styles";

type Strategy = {
  type: 'martingale';
  multiplier: number;
} | null;

type Preview = {
  prompts: { id: string; text: string }[];
  welcomeMessage: string | null;
  tradeOptions: {
    symbol: string;
    contractType: string;
    duration: number;
    durationUnit: string;
    currency: string;
  };
  strategy: Strategy;
  xmlContent: string;
};

export default function AdminPage() {
  const { collapsed } = useSidebar();
  const [file, setFile] = useState<File | null>(null);
  const [botName, setBotName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error" | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/xml") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Por favor, selecione um arquivo XML válido.");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/xml") {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Por favor, solte um arquivo XML válido.");
    }
  };

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    if (!file || !botName) {
      setError("Por favor, selecione um arquivo XML e insira um nome para o bot.");
      setStatus(null);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("botName", botName);

    try {
      const response = await fetch("/api/import-bot", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setPreview({
          prompts: result.preview.prompts,
          welcomeMessage: result.preview.welcomeMessage,
          tradeOptions: result.tradeOptions,
          strategy: result.strategy,
          xmlContent: result.xmlContent,
        });
        setStatus(null);
      } else {
        setError(result.error || "Erro ao gerar preview.");
        setStatus("error");
      }
    } catch (err) {
      setError("Erro ao processar o arquivo. Tente novamente.");
      setStatus("error");
    }
  };

  const handleConfirm = async () => {
    if (!preview || !botName) return;

    setStatus("loading");
    try {
      const response = await fetch("/api/save-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botName,
          prompts: preview.prompts,
          welcomeMessage: preview.welcomeMessage,
          tradeOptions: preview.tradeOptions,
          strategy: preview.strategy,
          xmlContent: preview.xmlContent,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setStatus("success");
        setFile(null);
        setBotName("");
        setPreview(null);
        setTimeout(() => router.push("/admin"), 2000);
      } else {
        setError(result.error || "Erro ao salvar o bot.");
        setStatus("error");
      }
    } catch (err) {
      setError("Erro ao salvar o bot. Tente novamente.");
      setStatus("error");
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setStatus(null);
  };

  return (
    <S.Wrapper>
      <Sidebar logout={async () => await signOutAction()}>
        <MenuItemST collapsed={collapsed ? "collapsed" : undefined} icon={<Configuracoes />} active>
          Configurações Admin
        </MenuItemST>
      </Sidebar>
      <Container>
        <Header name="Importar Bot" />
        <Body>
          {!preview ? (
            <form onSubmit={handlePreview}>
              <S.UploadArea
                $isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <p>Arraste e solte o arquivo XML aqui ou clique para selecionar</p>
                <S.InputFile
                  type="file"
                  accept=".xml"
                  onChange={handleFileChange}
                  id="fileInput"
                />
                <S.UploadLabel htmlFor="fileInput">Selecionar Arquivo</S.UploadLabel>
                {file && <p>Arquivo: {file.name}</p>}
              </S.UploadArea>

              <div>
                <label>Nome do Bot</label>
                <S.InputText
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="Digite o nome do bot"
                />
              </div>

              {error && <S.Message $error>{error}</S.Message>}
              {status === "loading" && <S.Message>Processando...</S.Message>}

              <S.Button type="submit" disabled={status === "loading"}>
                Visualizar Bot
              </S.Button>
            </form>
          ) : (
            <div>
              <h2>Preview do Bot: {botName}</h2>
              <p>
                <strong>Mensagem de Boas-Vindas:</strong>{" "}
                {preview.welcomeMessage || "Nenhuma encontrada"}
              </p>
              <h3>Estratégia Reconhecida:</h3>
              {preview.strategy ? (
                <p>
                  <strong>Tipo:</strong> {preview.strategy.type} <br />
                  <strong>Multiplicador:</strong> {preview.strategy.multiplier}x
                </p>
              ) : (
                <p>Nenhuma estratégia de recuperação (Martingale) foi identificada.</p>
              )}
              <h3>Opções de Negociação:</h3>
              <p>
                <strong>Símbolo:</strong> {preview.tradeOptions.symbol} <br />
                <strong>Tipo de Contrato:</strong> {preview.tradeOptions.contractType} <br />
                <strong>Duração:</strong> {preview.tradeOptions.duration} {preview.tradeOptions.durationUnit} <br />
                <strong>Moeda:</strong> {preview.tradeOptions.currency}
              </p>
              <h3>Prompts Reconhecidos:</h3>
              {preview.prompts.length > 0 ? (
                <ul>
                  {preview.prompts.map((prompt, index) => (
                    <li key={prompt.id}>
                      {index + 1}: {prompt.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum prompt encontrado.</p>
              )}

              {error && <S.Message $error>{error}</S.Message>}
              {status === "success" && <S.Message>Bot importado com sucesso!</S.Message>}
              {status === "error" && <S.Message $error>Erro ao salvar o bot</S.Message>}
              {status === "loading" && <S.Message>Salvando...</S.Message>}

              <S.Button onClick={handleConfirm} disabled={status === "loading"}>
                Confirmar e Salvar
              </S.Button>
              <S.Button onClick={handleCancel} disabled={status === "loading"}>
                Cancelar e Refazer
              </S.Button>
            </div>
          )}
        </Body>
      </Container>
    </S.Wrapper>
  );
}