import { SetMetadata } from '@nestjs/common';
import { SubscribeMessage, WsResponse } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export interface ExtendedSocket extends Socket {
  error?: string;
  user?: { id: number };
}

export type ExtendedWsResponse<SuccessType> = WsResponse<SuccessType | { error?: string }>;

export const ERROR_EVENT_KEY = 'errorEvent';

export const ErrorEvent = (errorEvent: string) => SetMetadata(ERROR_EVENT_KEY, errorEvent);

/**
 * Subscribe to message with error event handler
 * @param message Message event
 * @param errorEvent Error event, default is `<message>:error`
 * @returns Decorator
 */
export const ExtendedSubscribeMessage = (message: string, errorEvent?: string): MethodDecorator => {
  const _errorEvent = errorEvent || `${message}:error`;
  const subscribeMessageDecorator = SubscribeMessage(message);
  const errorEventDecorator = ErrorEvent(_errorEvent);
  return (target, propertyKey, descriptor) => {
    subscribeMessageDecorator(target, propertyKey, descriptor);
    errorEventDecorator(target, propertyKey, descriptor);
  };
};
