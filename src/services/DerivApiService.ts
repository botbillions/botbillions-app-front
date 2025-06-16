export class DerivApiService {
  private ws: WebSocket | null = null;
  private token: string;
  private onMessageCallback: (data: any) => void;
  private onErrorCallback: (error: Event) => void;
  private onAuthenticatedCallback: () => void; // Renomeado de onOpen para mais clareza
  private reqId = 1;

  constructor(
    token: string,
    onMessage: (data: any) => void,
    onAuthenticated: () => void, // Callback para quando a API estiver autenticada
    onError: (error: Event) => void
  ) {
    this.token = token;
    this.onMessageCallback = onMessage;
    this.onAuthenticatedCallback = onAuthenticated;
    this.onErrorCallback = onError;
  }

  /**
   * Inicia a conexão WebSocket e se autentica.
   */
  public connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn("DerivApiService: WebSocket já está conectado.");
      return;
    }

    const appId = process.env.NEXT_PUBLIC_DERIV_APPID || '1089';
    this.ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${appId}`);

    this.ws.onopen = () => {
      console.log("DerivApiService: Conexão WebSocket aberta. Autenticando...");
      // Envia a mensagem de autorização assim que a conexão abre.
      this.sendMessage({ authorize: this.token });
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Tratamento específico da resposta de autorização.
      // Este é o portão de entrada. Só depois daqui o bot pode operar.
      if (data.msg_type === 'authorize') {
        if (data.error) {
          console.error("DerivApiService: Falha na autenticação.", data.error);
          // Notifica o hook sobre o erro de autenticação para que ele possa parar.
          this.onErrorCallback(new ErrorEvent('AuthenticationError', { message: data.error.message }));
        } else {
          console.log("DerivApiService: Autenticado com sucesso.");
          // A MUDANÇA PRINCIPAL: Chama o callback de autenticação SÓ UMA VEZ, AQUI.
          // Isso sinaliza ao hook que ele pode começar a enviar os pedidos de ticks.
          this.onAuthenticatedCallback();
        }
        // Não encaminha a mensagem 'authorize' para o callback geral para evitar lógica duplicada.
        // O hook não precisa saber sobre a mensagem de autorização, só precisa saber se FOI autorizado.
        return;
      }
      
      // Encaminha todas as outras mensagens (ticks, proposals, etc.) para o hook que a instanciou.
      this.onMessageCallback(data);
    };

    this.ws.onerror = (error) => {
      console.error("DerivApiService: Erro no WebSocket.", error);
      this.onErrorCallback(error);
    };

    this.ws.onclose = () => {
      console.log("DerivApiService: Conexão fechada.");
      // Opcional: Você pode querer um callback para onclose também.
    };
  }

  /**
   * Envia uma mensagem para o WebSocket, adicionando um req_id.
   * @param message O objeto da mensagem a ser enviada.
   */
  public sendMessage(message: Record<string, any>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Adiciona req_id se não for uma subscrição que não precisa dele (como 'authorize')
      const messageWithReqId = message.subscribe ? message : { ...message, req_id: this.reqId++ };
      this.ws.send(JSON.stringify(messageWithReqId));
    } else {
      console.error("DerivApiService: Não é possível enviar mensagem, WebSocket não está aberto.");
    }
  }

  /**
   * Fecha a conexão WebSocket.
   */
  public disconnect() {
    if (this.ws) {
      // Idealmente, você deveria cancelar todas as subscrições (com 'forget') antes de fechar.
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Verifica se a conexão está aberta e pronta.
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
