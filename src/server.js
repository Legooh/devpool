import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const app = await createApp(config);

app.listen(config.port, () => {
  console.log(`GoTicket DevPool Edition disponível em http://localhost:${config.port}`);
});
