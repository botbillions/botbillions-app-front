export class DerivApiService {
  private ws: WebSocket | null = null;
  private token: string;
  private messageListeners: Set<(data: any) => void> = new Set();
  private onAuthenticatedCallback: () => void;
  private onErrorCallback: (error: Event) => void;

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
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const appId = process.env.NEXT_PUBLIC_DERIV_APPID || '1089';
    this.ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${appId}`);

    this.ws.onopen = () => {
      this.sendMessage({ authorize: this.token });
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.msg_type === 'authorize') {
        if (!data.error) this.onAuthenticatedCallback();
      }
      this.messageListeners.forEach(listener => listener(data));
    };

    this.ws.onerror = this.onErrorCallback;
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public addMessageHandler(handler: (data: any) => void) {
    this.messageListeners.add(handler);
  }

  public removeMessageHandler(handler: (data: any) => void) {
    this.messageListeners.delete(handler);
  }

  public sendMessage(message: Record<string, any>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.messageListeners.clear();
    }
  }
}