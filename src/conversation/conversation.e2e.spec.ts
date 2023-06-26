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
        token: `Wah ${accessToken}`,
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

    client.on('create', (message) => {
      console.log('Create:' + message);
    });

    client.on('create:error', (err) => console.log(err));

    client.on('update', (message) => {
      console.log('Update: ' + message);
    });

    client.emit('fetchAll');

    client.emit('create', {
      conversationId: 11,
      content: 'Hello from nowhere',
      postDate: new Date(2020, 10, 5),
    });
  });
});
