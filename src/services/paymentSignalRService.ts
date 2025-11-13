import * as signalR from '@microsoft/signalr';

class PaymentSignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private apiBaseUrl: string;

  constructor() {
    // Get API base URL from axios config
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://saveplus-api-production.up.railway.app';
  }

  /**
   * Initialize SignalR connection
   */
  async connect(): Promise<void> {
    if (this.isConnected || this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('PaymentHub already connected');
      return;
    }

    try {
      // Build connection with automatic transport fallback
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${this.apiBaseUrl}/hubs/payment`)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 0s, 2s, 10s, 30s, 60s
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            if (retryContext.previousRetryCount === 3) return 30000;
            return 60000;
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Setup event handlers
      this.setupConnectionHandlers();

      // Start connection
      await this.connection.start();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('PaymentHub connected successfully');
    } catch (error) {
      console.error('Error connecting to PaymentHub:', error);
      this.isConnected = false;
      
      // Retry connection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        console.log(`Retrying connection in ${delay}ms... (attempt ${this.reconnectAttempts})`);
        setTimeout(() => this.connect(), delay);
      }
    }
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    this.connection.onclose((error) => {
      this.isConnected = false;
      console.log('PaymentHub connection closed', error);
    });

    this.connection.onreconnecting((error) => {
      this.isConnected = false;
      console.log('PaymentHub reconnecting...', error);
    });

    this.connection.onreconnected((connectionId) => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('PaymentHub reconnected', connectionId);
    });
  }

  /**
   * Subscribe to payment updates for a specific appointment
   */
  async subscribeToAppointment(
    appointmentId: number,
    onPaymentCompleted: (data: PaymentCompletedEvent) => void
  ): Promise<void> {
    if (!this.connection) {
      await this.connect();
    }

    if (this.connection?.state !== signalR.HubConnectionState.Connected) {
      console.error('Cannot subscribe - PaymentHub not connected');
      return;
    }

    try {
      // Subscribe to appointment group
      await this.connection.invoke('SubscribeToAppointment', appointmentId.toString());
      
      // Listen for PaymentCompleted events
      this.connection.on('PaymentCompleted', onPaymentCompleted);
      
      console.log(`Subscribed to payment updates for appointment ${appointmentId}`);
    } catch (error) {
      console.error('Error subscribing to appointment:', error);
    }
  }

  /**
   * Unsubscribe from appointment payment updates
   */
  async unsubscribeFromAppointment(appointmentId: number): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('UnsubscribeFromAppointment', appointmentId.toString());
      this.connection.off('PaymentCompleted');
      console.log(`Unsubscribed from appointment ${appointmentId}`);
    } catch (error) {
      console.error('Error unsubscribing from appointment:', error);
    }
  }

  /**
   * Subscribe to all tenant payments (for admin dashboard)
   */
  async subscribeToTenantPayments(
    tenantId: number,
    onNewPayment: (data: NewPaymentEvent) => void
  ): Promise<void> {
    if (!this.connection) {
      await this.connect();
    }

    if (this.connection?.state !== signalR.HubConnectionState.Connected) {
      console.error('Cannot subscribe - PaymentHub not connected');
      return;
    }

    try {
      await this.connection.invoke('SubscribeToTenantPayments', tenantId.toString());
      this.connection.on('NewPayment', onNewPayment);
      console.log(`Subscribed to tenant ${tenantId} payment updates`);
    } catch (error) {
      console.error('Error subscribing to tenant payments:', error);
    }
  }

  /**
   * Unsubscribe from tenant payment updates
   */
  async unsubscribeFromTenantPayments(tenantId: number): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('UnsubscribeFromTenantPayments', tenantId.toString());
      this.connection.off('NewPayment');
      console.log(`Unsubscribed from tenant ${tenantId} payments`);
    } catch (error) {
      console.error('Error unsubscribing from tenant payments:', error);
    }
  }

  /**
   * Disconnect from hub
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.isConnected = false;
        console.log('PaymentHub disconnected');
      } catch (error) {
        console.error('Error disconnecting from PaymentHub:', error);
      }
    }
  }

  /**
   * Get connection state
   */
  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Event types
export interface PaymentCompletedEvent {
  appointmentId: number;
  paymentId: number;
  amount: number;
  status: string;
  method: string;
  completedAt: string;
}

export interface NewPaymentEvent {
  tenantId: number;
  paymentId: number;
  amount: number;
  patientName: string;
  status: string;
  method: string;
  appointmentId?: number;
}

// Export singleton instance
export const paymentSignalRService = new PaymentSignalRService();
export default paymentSignalRService;
