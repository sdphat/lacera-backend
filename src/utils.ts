export const makeUserRedisOnlineKey = (userId: number) => `user-${userId}::online`;

export const makeSocketUserRoom = (userId: number) => `users/${userId}`;
