export class DerivApiService {
  addTemporaryMessageHandler(messageHandler: (data: any) => void) {
    throw new Error('Method not implemented.');
  }
  private ws: WebSocket | null = null;
  private token: string;
  // Um Set para armazenar múltiplos listeners de mensagens
  private messageListeners: Set<(data: any) => void> = new Set();
  private onErrorCallback: (error: Event) => void;
  private onAuthenticatedCallback: () => void;
  private reqId = 1;

  constructor(
    token: string,
    onAuthenticated: () => void,
    onError: (error: Event) => void
  ) {
    this.token = token;
    this.onAuthenticatedCallback = onAuthenticated;
    this.onErrorCallback = onError;
  }

  public connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const appId = process.env.NEXT_PUBLIC_DERIV_APPID || '1089';
    this.ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${appId}`);
    console.log("DerivApiService: Conectando...");

    this.ws.onopen = () => {
      console.log("DerivApiService: Conexão aberta. Autenticando...");
      this.sendMessage({ authorize: this.token });
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Itera sobre todos os listeners e envia os dados para cada um
      this.messageListeners.forEach(listener => listener(data));

      if (data.msg_type === 'authorize' && !data.error) {
        this.onAuthenticatedCallback();
      }
    };

    this.ws.onerror = this.onErrorCallback;
    this.ws.onclose = () => {
        console.log("DerivApiService: Conexão fechada.");
        // Lógica de reconexão pode ser adicionada aqui, se desejado.
    };
  }

  // NOVO: Método para adicionar um listener de mensagens
  public addMessageHandler(handler: (data: any) => void) {
    this.messageListeners.add(handler);
  }

  // NOVO: Método para remover um listener de mensagens
  public removeMessageHandler(handler: (data: any) => void) {
    this.messageListeners.delete(handler);
  }

  public sendMessage(message: Record<string, any>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const messageWithReqId = { ...message, req_id: this.reqId++ };
      this.ws.send(JSON.stringify(messageWithReqId));
    } else {
      console.error("DerivApiService: Não é possível enviar. WebSocket não está aberto.");
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.onclose = null; // Previne reconexão ao desconectar manualmente
      this.ws.close();
      this.ws = null;
      this.messageListeners.clear();
      console.log("DerivApiService: Desconectado.");
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}