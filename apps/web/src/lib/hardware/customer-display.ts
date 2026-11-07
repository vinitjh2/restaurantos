/**
 * RestaurantOS Customer-Facing Display (CFD) Bridge
 * Synchronizes cart items, subtotal, GST breakdown, dynamic UPI QR,
 * and welcome banners to a secondary screen or pole display.
 */

export interface CFDMessage {
  type: 'CART_UPDATE' | 'ORDER_COMPLETED' | 'IDLE';
  items?: Array<{ name: string; quantity: number; price: number }>;
  subtotal?: number;
  taxAmount?: number;
  grandTotal?: number;
  upiQrDataUrl?: string;
  changeDue?: number;
  customerName?: string;
}

const CHANNEL_NAME = 'restaurantos_cfd_channel';

class CustomerFacingDisplayBridge {
  private channel: BroadcastChannel | null = null;
  private cfdWindow: Window | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
    }
  }

  /**
   * Cashier action: Opens the CFD in a secondary monitor or new popup window
   */
  openDisplayWindow(): Window | null {
    if (typeof window === 'undefined') return null;

    if (this.cfdWindow && !this.cfdWindow.closed) {
      this.cfdWindow.focus();
      return this.cfdWindow;
    }

    // Attempt to position on secondary display if multi-screen API is available
    const win = window.open(
      '/cfd',
      'RestaurantOS_CFD',
      'width=1024,height=768,menubar=no,toolbar=no,location=no,status=no'
    );
    this.cfdWindow = win;
    return win;
  }

  /**
   * Broadcast cart state update to customer display
   */
  broadcastUpdate(msg: CFDMessage): void {
    if (this.channel) {
      this.channel.postMessage(msg);
    }
  }

  /**
   * For the CFD window: Subscribes to updates from POS
   */
  subscribe(onMessage: (msg: CFDMessage) => void): () => void {
    if (!this.channel) return () => {};

    const handler = (event: MessageEvent<CFDMessage>) => {
      onMessage(event.data);
    };

    this.channel.addEventListener('message', handler);
    return () => this.channel?.removeEventListener('message', handler);
  }
}

export const cfdBridge = new CustomerFacingDisplayBridge();
