import { app } from './app.js';
import { clientApp } from './routers/clients.js';
import { transactionApp } from './routers/transactions.js';
import {Assetrouter} from './routers/server_assets.js'

const PORT = process.env.PORT || 3000;

app.use(transactionApp)
app.use(clientApp)
app.use(Assetrouter)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});