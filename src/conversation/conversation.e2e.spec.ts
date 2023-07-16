#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
import { io } from 'socket.io-client';

describe('Conversation e2e', () => {
  let client: ReturnType<typeof io>;

  it('can fetch conversations', async () => {
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '+841234567',
        password: '12345678',
      }),
    });

    const refreshToken = (await loginResponse.json()).refreshToken;

    const accessTokenResponse = await fetch('http://localhost:3001/auth/refresh', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    const accessToken = (await accessTokenResponse.json()).accessToken;

    client = io('http://localhost:3001/conversation', {
      auth: {
        token: `Bearer ${accessToken}`,
      },
    });

    client.on('errorEvent', (err) => {
      console.log('ErrOr: ' + err.error);
    });

    client.on('fetchAll', (conversations) => {
      console.log(conversations);
    });

    client.on('fetchAll:error', (err) => {
      console.log('Fetch all error: ', err);
    });

    client.on('createPrivate', (message) => {
      console.log('CreatePrivate:' + message);
    });

    client.on('createGroup', (message) => {
      console.log('CreateGroup: ' + message);
    });

    client.on('create:error', (err) => console.log(err));

    client.on('update', (message) => {
      console.log('Update: ' + message);
    });

    client.emit('createPrivate', {
      targetId: 1,
    });

    client.emit('createGroup', {
      participantIds: [1, 3],
      title: 'Learning with friends 😊',
    });
  });
});
