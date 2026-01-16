import express from "express";
const app = express();

app.get("/sse", (req, res) => {
  console.log("Client connected");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "Keep-Alive");
  let counter = 0;
  const sendData = () => {
    counter++;
    const payload = {
      time: new Date().toISOString(),
      count: counter,
    };
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    if (counter >= 100) {
      clearInterval(timer);
      res.end();
    }
  };
  const timer = setInterval(sendData, 1000);

  req.on("close", () => {
    console.log("Client disconnected");
    clearInterval(timer);
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
