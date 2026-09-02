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

  const options = {
    body:
      data.message ||
      "Você recebeu uma nova notificação no AuraMeets.",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification.data?.url || "/";

  event.waitUntil(
    clients.openWindow(url),
  );
});