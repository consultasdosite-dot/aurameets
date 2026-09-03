self.addEventListener("push", (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = {
        message: event.data.text(),
      };
    }
  }

  const title = data.title || "AuraMeets";
  const url = data.url || "/admin";

  const options = {
    body:
      data.message ||
      "Você recebeu uma nova notificação administrativa no AuraMeets.",
    icon: "/icon.png",
    badge: "/icon.png",
    vibrate: [200, 100, 200],
    tag: data.tag || `aurameets-${Date.now()}`,
    renotify: true,
    requireInteraction: false,
    data: {
      url,
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const destino = new URL(
    event.notification.data?.url || "/admin",
    self.location.origin,
  ).href;

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((janelas) => {
        for (const janela of janelas) {
          if ("focus" in janela) {
            if ("navigate" in janela) {
              return janela
                .navigate(destino)
                .then(() => janela.focus());
            }

            return janela.focus();
          }
        }

        return clients.openWindow(destino);
      }),
  );
});