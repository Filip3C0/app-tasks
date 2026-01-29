'use strict';

importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

function getSenderId() {
  const params = new URLSearchParams(self.location.search);
  return params.get('senderId');
}

const senderId = getSenderId();
if (!senderId) {
  console.warn('[fcm-sw] senderId ausente na querystring');
} else {
  firebase.initializeApp({ messagingSenderId: senderId });
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification || {};
    if (!title && !body) return;

    self.registration.showNotification(title || 'Chamado', {
      body: body || '',
      data: payload.data,
    });
  });
}
