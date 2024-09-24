import express from "express";
import App from "./Services/ExpressApp";
import { PORT, HOST } from "./Config";
import DatabaseCon from "./Services/Database";

const StartServer = async () => {
  await DatabaseCon();

  const app = express();
  await App(app);

  app.listen(PORT, HOST, () => {
    console.log(`Listening on port ${PORT}`);
    console.log(`Server is running at http://${HOST}:${PORT}`);
  });
};

StartServer();
