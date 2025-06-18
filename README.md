# Meu App

Bem-vindo ao projeto **Meu App**! Este é um projeto construído com **Next.js**, uma ferramenta para criar aplicações web modernas. Este README explica como configurar e rodar o projeto no seu computador (Windows, macOS ou Linux) de forma simples, mesmo que você não tenha muita experiência técnica.

## Pré-requisitos

Antes de começar, você precisa instalar algumas ferramentas no seu computador. Vamos te guiar passo a passo.

### 1. Instalar o Node.js

O Node.js é necessário para rodar o projeto. Siga os passos para o seu sistema operacional:

- **Windows e macOS**:
  - Acesse o site oficial do Node.js: [nodejs.org](https://nodejs.org).
  - Baixe a versão **LTS** (recomendada para maior estabilidade).
  - Execute o instalador e siga as instruções, aceitando as opções padrão.
  - Para verificar a instalação:
    - No Windows, abra o **Prompt de Comando** (pressione Win+R, digite `cmd`, pressione Enter) ou o **PowerShell** (digite `powershell` no menu Iniciar).
    - No macOS, abra o **Terminal** (busque por "Terminal" no Spotlight).
    - Digite:
      ```bash
      node -v
      ```
    - Você deve ver a versão do Node.js (ex.: v20.x.x).

- **Linux**:
  - Abra o **Terminal** (geralmente Ctrl+Alt+T).
  - Instale o Node.js com o gerenciador de pacotes:
    - **Ubuntu/Debian**:
      ```bash
      sudo apt update
      sudo apt install nodejs npm
      ```
    - **Fedora**:
      ```bash
      sudo dnf install nodejs
      ```
    - **Arch Linux**:
      ```bash
      sudo pacman -S nodejs npm
      ```
  - Verifique com:
    ```bash
    node -v
    ```

### 2. Instalar o Git (opcional, apenas se for clonar o repositório)

O Git é necessário apenas se você quiser baixar o projeto usando o comando `git clone`. Se preferir baixar como ZIP (explicado abaixo), pule esta etapa.

- **Windows e macOS**:
  - Acesse [git-scm.com](https://git-scm.com).
  - Baixe o instalador para o seu sistema.
  - Execute o instalador, aceitando as opções padrão.
  - Verifique a instalação:
    - No Windows, abra o **Prompt de Comando** (`cmd`) ou **PowerShell**.
    - No macOS, abra o **Terminal**.
    - Digite:
      ```bash
      git --version
      ```

- **Linux**:
  - No **Terminal**, instale o Git:
    - **Ubuntu/Debian**:
      ```bash
      sudo apt update
      sudo apt install git
      ```
    - **Fedora**:
      ```bash
      sudo dnf install git
      ```
    - **Arch Linux**:
      ```bash
      sudo pacman -S git
      ```
  - Verifique com:
    ```bash
    git --version
    ```

## Baixar o Projeto

Você pode baixar o projeto de duas formas: **clonando com Git** ou **baixando como ZIP**. Escolha a que preferir.

### Opção 1: Baixar como ZIP

- Acesse o repositório do projeto no seu navegador (ex.: GitHub, GitLab, etc.).
- Clique no botão verde **Code** (ou similar) e selecione **Download ZIP**.
- Salve o arquivo ZIP em uma pasta no seu computador (ex.: `C:\Projetos` no Windows Sheppard:Windows ou `~/Documentos` no macOS/Linux).
- Descompacte o arquivo ZIP:
  - **Windows**: Clique com o botão direito no arquivo ZIP e selecione "Extrair Tudo". Escolha uma pasta e clique em "Extrair".
  - **macOS**: Clique duas vezes no arquivo ZIP, e ele será descompactado automaticamente.
  - **Linux**: Clique com o botão direito no ZIP e selecione "Extrair Aqui", ou use:
    ```bash
    unzip nome-do-arquivo.zip
    ```
- Abra o terminal na pasta descompactada:
  - **Windows (Prompt de Comando)**:
    - Abra o **Prompt de Comando** (Win+R, digite `cmd`, Enter).
    - Navegue com:
      ```bash
      cd C:\Caminho\Para\my-app
      ```
      Exemplo:
      ```bash
      cd C:\Projetos\my-app
      ```
  - **Windows (PowerShell)**:
    - Abra o **PowerShell** (digite `powershell` no menu Iniciar).
    - Navegue com:
      ```bash
      cd C:\Caminho\Para\my-app
      ```
  - **macOS/Linux (Terminal)**:
    - Abra o **Terminal** e navegue com:
      ```bash
      cd ~/Caminho/Para/my-app
      ```
      Exemplo:
      ```bash
      cd ~/Documentos/my-app
      ```

### Opção 2: Clonar com Git

- Abra o terminal:
  - **Windows**: Use **Prompt de Comando** (`cmd`) ou **PowerShell**.
  - **macOS/Linux**: Use o **Terminal**.
- Navegue até a pasta onde deseja salvar o projeto:
  ```bash
  cd C:\Caminho\Para\Sua\Pasta  # Windows
  cd ~/Caminho/Para/Sua/Pasta   # macOS/Linux
  ```
- Clone o repositório:
  ```bash
  git clone https://seu-repositorio.git
  cd my-app
  ```
- Mude para a branch `develop`:
  ```bash
  git checkout develop
  ```

## Criar Certificados para HTTPS

Para rodar o projeto com HTTPS localmente (usando `npm run dev:https`), você precisa criar uma pasta `certificates` na raiz do projeto (dentro da pasta `my-app`) com certificados SSL. Siga os passos para o seu sistema operacional.

### Windows

- **Instalar o OpenSSL**:
  - Baixe o OpenSSL em [slproweb.com](https://slproweb.com/products/Win32OpenSSL.html) (escolha "Win64 OpenSSL").
  - Instale e adicione o caminho da pasta `bin` (ex.: `C:\Program Files\OpenSSL-Win64\bin`) às variáveis de ambiente:
    - Pesquise "Variáveis de ambiente" no Windows.
    - Adicione o caminho à variável `Path`.
  - Verifique com:
    ```bash
    openssl version
    ```

- **Criar a pasta de certificados**:
  - No terminal (Prompt de Comando ou PowerShell), na pasta `my-app`, crie a pasta:
    ```bash
    mkdir certificates
    cd certificates
    ```
  - Gere os certificados:
    ```bash
    openssl req -x509 -newkey rsa:2048 -keyout localhost.key -out com.crt -days 365 -nodes -subj "/C=BR/ST=SaoPaulo/L=SaoPaulo/O=MeuApp/OU=Dev/CN=meuapp.local"
    ```

- **Adicionar meuapp.local ao hosts**:
  - Abra o **Prompt de Comando** como administrador (digite `cmd` no menu Iniciar, clique com o botão direito, selecione "Executar como administrador").
  - Edite o arquivo `hosts`:
    ```bash
    notepad C:\Windows\System32\drivers\etc\hosts
    ```
  - Adicione a linha:
    ```
    127.0.0.1 meuapp.local
    ```
  - Salve e feche.

### macOS

- **Instalar o OpenSSL** (geralmente já está instalado):
  - Verifique com:
    ```bash
    openssl version
    ```
  - Se não estiver instalado, use o Homebrew:
    ```bash
    brew install openssl
    ```

- **Criar a pasta de certificados**:
  - No **Terminal**, na pasta `my-app`, crie a pasta:
    ```bash
    mkdir certificates
    cd certificates
    ```
  - Gere os certificados:
    ```bash
    openssl req -x509 -newkey rsa:2048 -keyout localhost.key -out com.crt -days 365 -nodes -subj "/C=BR/ST=SaoPaulo/L=SaoPaulo/O=MeuApp/OU=Dev/CN=meuapp.local"
    ```

- **Adicionar meuapp.local ao hosts**:
  - No **Terminal**, edite o arquivo `hosts`:
    ```bash
    sudo nano /etc/hosts
    ```
  - Adicione a linha:
    ```
    127.0.0.1 meuapp.local
    ```
  - Salve (Ctrl+O, Enter, Ctrl+X).

### Linux

- **Instalar o OpenSSL**:
  - No **Terminal**, instale:
    - **Ubuntu/Debian**:
      ```bash
      sudo apt update
      sudo apt install openssl
      ```
    - **Fedora**:
      ```bash
      sudo dnf install openssl
      ```
    - **Arch Linux**:
      ```bash
      sudo pacman -S openssl
      ```

- **Criar a pasta de certificados**:
  - Na pasta `my-app`, crie a pasta:
    ```bash
    mkdir certificates
    cd certificates
    ```
  - Gere os certificados:
    ```bash
    openssl req -x509 -newkey rsa:2048 -keyout localhost.key -out com.crt -days 365 -nodes -subj "/C=BR/ST=SaoPaulo/L=SaoPaulo/O=MeuApp/OU=Dev/CN=meuapp.local"
    ```

- **Adicionar meuapp.local ao hosts**:
  - No **Terminal**, edite o arquivo `hosts`:
    ```bash
    sudo nano /etc/hosts
    ```
  - Adicione a linha:
    ```
    127.0.0.1 meuapp.local
    ```
  - Salve (Ctrl+O, Enter, Ctrl+X).

## Instalar Dependências e Rodar o Projeto

- **Instalar as dependências**:
  - No terminal (Prompt de Comando, PowerShell ou Terminal), na pasta `my-app`, execute:
    ```bash
    npm install
    ```

- **Iniciar o projeto com HTTPS**:
  - Execute:
    ```bash
    npm run dev:https
    ```
  - No Linux ou macOS, se houver erro de permissão, use:
    ```bash
    sudo npm run dev-sudo:https
    ```

- **Acessar o projeto**:
  - O terminal mostrará o link `https://meuapp.local:443`.
  - Segure **Ctrl** e clique no link para abrir no navegador.
  - Se aparecer um aviso de segurança (certificado autoassinado), clique em "Avançado" e "Prosseguir".

## Scripts Disponíveis

No `package.json`, você pode usar:
- `npm run dev`: Inicia o projeto em modo de desenvolvimento sem HTTPS.
- `npm run dev:https`: Inicia com HTTPS.
- `npm run dev-sudo:https`: Inicia com HTTPS (com `sudo`, para Linux/macOS).
- `npm run build`: Gera a versão otimizada para produção.
- `npm run start`: Inicia em modo de produção (sem HTTPS).
- `npm run start:https`: Inicia em modo de produção com HTTPS.
- `npm run lint`: Verifica erros de formatação no código.

## Notas Adicionais

- Certifique-se de que a porta 443 está livre antes de rodar `npm run dev:https`.
- Verifique se a pasta `certificates` contém os arquivos `localhost.key` e `com.crt`.
- Para dúvidas, entre em contato com a equipe de desenvolvimento.

Boa sorte com o projeto! 🚀