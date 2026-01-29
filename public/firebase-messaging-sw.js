'use strict';

importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging-compat.js');

// Ensure activation without reloads
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Config público do projeto (ok expor em SW)
firebase.initializeApp({
  apiKey: 'AIzaSyA06MYTTaz9avNLBVCm3OgAygK9zGCnsRM',
  authDomain: 'tasks-field-services.firebaseapp.com',
  projectId: 'tasks-field-services',
  messagingSenderId: '869022037892',
  appId: '1:869022037892:web:7691f20abf38d588498fd1',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  if (!title && !body) return;

  self.registration.showNotification(title || 'Chamado', {
    body: body || '',
    data: payload.data,
  });
});
