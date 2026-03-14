
import "dotenv/config";

import { app } from "./app.js";
import { fileExists } from "./utils/common.js";

const PORT = process.env.PORT || 4000;
const dotenvPath = "./.env";

if (!await fileExists(dotenvPath)) {
    console.error(`The file ${dotenvPath} does not exist.`);
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`Meta Ads Management Server: http://localhost:${PORT}/`);
})

