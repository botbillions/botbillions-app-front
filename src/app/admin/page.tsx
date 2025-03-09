"use client";

import Body from "@/components/Body";
import Container from "@/components/Container";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MenuItemST } from "@/components/Sidebar/styles";
import Configuracoes from "@/components/icons/Configuracoes";
import { useSidebar } from "@/contexts/SidebarContext";
import { signOutAction } from "@/services/actions/supabase-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as S from './styles';

export default function AdminPage() {
  const { collapsed } = useSidebar();
  const [file, setFile] = useState<File | null>(null);
  const [botName, setBotName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  // Manipular upload via seleção
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/xml") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Por favor, selecione um arquivo XML válido.");
    }
  };

  // Manipular drag-and-drop
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading")
    if (!file || !botName) {
      setError("Por favor, selecione um arquivo XML e insira um nome para o bot.");
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
        setStatus("success");
        setFile(null);
        setBotName("");
        setTimeout(() => router.push("/admin"), 2000); // Redireciona ou recarrega
      } else {
        setError(result.error || "error");
      }
    } catch (err) {
      setError("Erro ao enviar o arquivo. Tente novamente.");
    }
  };

  return (
    <S.Wrapper>
      <Sidebar logout={async () => await signOutAction()}>
        <MenuItemST
          collapsed={collapsed ? "collapsed" : undefined}
          icon={<Configuracoes />}
          active
        >
          Configurações Admin
        </MenuItemST>
      </Sidebar>
      <Container>
        <Header name="Importar Bot" />
        <Body>
          <form onSubmit={handleSubmit}>
            <S.UploadArea
              $isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <p>
                Arraste e solte o arquivo XML aqui ou clique para selecionar
              </p>
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

            {status === "success" && <S.Message>Bot importado com sucesso!</S.Message>}
            {status === "error" && <S.Message>Erro ao salvar BOT</S.Message>}

            <S.Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Salvando ..." : "Salvar Bot"}
            </S.Button>
          </form>
        </Body>
      </Container>
    </S.Wrapper>
  );
}