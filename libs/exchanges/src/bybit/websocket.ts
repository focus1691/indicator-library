import { WSClientConfigurableOptions } from 'bybit-api'

export const wsConfig: WSClientConfigurableOptions = {
  market: 'v5'
}

export interface WebSocketEvent {
  type: 'open' | 'reconnected' | 'error';
  data: any;
}
