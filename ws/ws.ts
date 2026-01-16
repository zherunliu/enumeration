import ws from "ws";
const wss = new ws.Server({ port: 8080 }, () => {
  console.log("WebSocket started at port 8080");
});
enum State {
  HEART = 1,
  MESSAGE = 2,
}
wss.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("message", (e) => {
    // socket.send("From Server: " + e.toString());
    wss.clients.forEach((client) => {
      client.send(JSON.stringify({ type: State.MESSAGE, data: e.toString() }));
    });
  });

  // Heartbeat mechanism
  let heartInterval: NodeJS.Timeout;
  const heartChecker = () => {
    if (socket.readyState === ws.OPEN) {
      socket.send(JSON.stringify({ type: State.HEART, data: "ping" }));
    } else {
      clearInterval(heartInterval);
    }
  };
  heartInterval = setInterval(heartChecker, 3000);
});
