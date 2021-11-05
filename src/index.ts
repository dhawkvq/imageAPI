import { app } from "./app";
import { SERVER_URL } from "./config";

app.listen(SERVER_URL, () =>
  console.log(`server listening on http://localhost:${SERVER_URL} 🚀`)
);
