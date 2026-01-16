import net from "node:net";

const html = `<h1>Hello from TCP Server</h1>`;

const headers = [
  "HTTP/1.1 200 OK",
  "Content-Type: text/html; charset=UTF-8",
  `Content-Length: ${Buffer.byteLength(html)}`,
  "Date: " + new Date().toUTCString(),
].join("\r\n");

const server = net.createServer((socket: net.Socket) => {
  socket.on("data", (data) => {
    if (/GET/.test(data.toString())) {
      socket.write(headers + "\r\n\r\n" + html);
      socket.end();
    }
  });
});

server.listen(8080, () => {
  console.log("TCP server started at port 8080", server.address());
});
