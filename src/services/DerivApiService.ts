export class DerivApiService {
  private ws: WebSocket | null = null;
  private token: string;
  private onMessageCallback: (data: any) => void;
  private onErrorCallback: (error: Event) => void;
  private onAuthenticatedCallback: () => void;
  private reqId = 1;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(
    token: string,
    onMessage: (data: any) => void,
    onAuthenticated: () => void,
    onError: (error: Event) => void
  ) {
    this.token = token;
    this.onMessageCallback = onMessage;
    this.onAuthenticatedCallback = onAuthenticated;
    this.onErrorCallback = onError;
  }

  public connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn("DerivApiService: WebSocket já está conectado.");
      return;
    }

    const appId = process.env.NEXT_PUBLIC_DERIV_APPID || '1089';
    this.ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${appId}`);

    this.ws.onopen = () => {
      console.log("DerivApiService: Conexão WebSocket aberta. Autenticando...");
      this.reconnectAttempts = 0;
      this.sendMessage({ authorize: this.token });
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.msg_type === 'authorize') {
        if (data.error) {
          console.error("DerivApiService: Falha na autenticação.", data.error);
          this.onErrorCallback(new ErrorEvent('AuthenticationError', { message: data.error.message }));
        } else {
          console.log("DerivApiService: Autenticado com sucesso.");
          this.onAuthenticatedCallback();
        }
        return;
      }
      this.onMessageCallback(data);
    };

    this.ws.onerror = (error) => {
      console.error("DerivApiService: Erro no WebSocket.", error);
      this.onErrorCallback(error);
    };

    this.ws.onclose = (event) => {
      console.log("DerivApiService: Conexão fechada. Motivo:", event);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          console.log(`DerivApiService: Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          this.connect();
        }, Math.pow(2, this.reconnectAttempts) * 1000);
      } else {
        console.error("DerivApiService: Máximo de tentativas de reconexão atingido");
        this.onErrorCallback(new ErrorEvent('MaxReconnectAttempts', { message: 'Máximo de tentativas de reconexão atingido' }));
      }
    };
  }

  public sendMessage(message: Record<string, any>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const messageWithReqId = message.subscribe ? message : { ...message, req_id: this.reqId++ };
      this.ws.send(JSON.stringify(messageWithReqId));
    } else {
      console.error("DerivApiService: Não é possível enviar mensagem, WebSocket não está aberto.");
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}