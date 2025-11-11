import * as signalR from '@microsoft/signalr';
import type { MessageDTO } from '@/types/conversation';

class ChatHubService {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private startPromise: Promise<void> | null = null;

  /**
   * Initialize SignalR connection
   */
  async start(token: string): Promise<void> {
    // Already connected
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // Return existing promise if already starting
    if (this.startPromise) {
      return this.startPromise;
    }

    this.startPromise = this._doStart(token);
    
    try {
      await this.startPromise;
    } finally {
      this.startPromise = null;
    }
  }

  private async _doStart(token: string): Promise<void> {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://saveplusapi-production.up.railway.app/api';
    const hubUrl = apiUrl.replace('/api', '/hubs/chat');

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
            return null;
          }
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
        },
      })
      .configureLogging(signalR.LogLevel.None)
      .build();

    // Setup connection event handlers
    newConnection.onclose((error) => {
      if (error) {
        console.error('SignalR connection closed:', error);
      }
      this.connection = null; // Clear connection on close
      this.handleReconnect(token);
    });

    newConnection.onreconnecting((error) => {
      if (error) {
        console.warn('SignalR reconnecting...', error);
      }
    });

    newConnection.onreconnected(() => {
      this.reconnectAttempts = 0;
    });

    try {
      await newConnection.start();
      // Only set connection if start succeeds
      this.connection = newConnection;
      this.reconnectAttempts = 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isAbortError = errorMessage.includes('stopped during negotiation') || 
                          errorMessage.includes('connection was stopped');
      
      if (isAbortError) {
        // Abort error from React cleanup - ignore
        return;
      }
      
      // Real error - attempt reconnect
      console.error('SignalR connection failed:', error);
      this.handleReconnect(token);
      throw error;
    }
  }

  /**
   * Handle manual reconnection with exponential backoff
   */
  private async handleReconnect(token: string): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(async () => {
      try {
        await this.start(token);
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }, delay);
  }

  /**
   * Stop SignalR connection
   */
  async stop(): Promise<void> {
    this.startPromise = null;
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        // Ignore errors during stop
      }
      this.connection = null;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Join a conversation room
   */
  async joinConversation(conversationId: number): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinConversation', conversationId.toString());
    }
  }

  /**
   * Leave a conversation room
   */
  async leaveConversation(conversationId: number): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveConversation', conversationId.toString());
    }
  }

  /**
   * Join tenant group (for staff)
   */
  async joinTenantGroup(tenantId: number): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinTenantGroup', tenantId.toString());
    }
  }

  /**
   * Leave tenant group
   */
  async leaveTenantGroup(tenantId: number): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveTenantGroup', tenantId.toString());
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(conversationId: number, isTyping: boolean): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('SendTypingIndicator', conversationId.toString(), isTyping);
    }
  }

  /**
   * Listen for new messages
   */
  onReceiveMessage(callback: (message: MessageDTO) => void): void {
    if (this.connection) {
      this.connection.on('ReceiveMessage', callback);
    }
  }

  /**
   * Listen for messages marked as read
   */
  onMessagesRead(callback: (data: { MessageIds: number[] }) => void): void {
    this.connection?.on('MessagesRead', callback);
  }

  /**
   * Listen for conversation updates (for conversation list)
   */
  onConversationUpdated(callback: (data: { ConversationId: number }) => void): void {
    this.connection?.on('ConversationUpdated', callback);
  }

  /**
   * Listen for typing indicator
   */
  onUserTyping(callback: (data: { UserId: string; UserName: string; Role: string; IsTyping: boolean }) => void): void {
    this.connection?.on('UserTyping', callback);
  }

  /**
   * Remove all event listeners
   */
  offAllListeners(): void {
    if (this.connection) {
      this.connection.off('ReceiveMessage');
      this.connection.off('MessagesRead');
      this.connection.off('ConversationUpdated');
      this.connection.off('UserTyping');
    }
  }

  /**
   * Get connection state
   */
  getState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export default new ChatHubService();
