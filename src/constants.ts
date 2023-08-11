export const SYSTEM_USER_ID = 1;

export const RETRIEVED_MESSAGE_SYSTEM_NOTIFICATION = 'This message has been retrieved';

export const makeUserRedisOnlineKey = (userId: number) => `user-${userId}::online`;
