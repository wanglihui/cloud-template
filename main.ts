import express  = require('express');
import registryClient, {RegistryClient} from 'cloud-registry-client';
import {scannerDecoration, registerControllerToRouter} from 'ts-express-restful';
import * as path from 'path';
import * as bodyParser from 'body-parser';
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.raw());
const router = express.Router();

scannerDecoration(path.resolve(__dirname, 'server'), [/\.js$/, /\.js\.map$/, /\.\d.ts$/]);
registerControllerToRouter(router);

app.use('/api/v1', router);

import * as http from 'http';
import * as net from 'net';
async function main() {
    await startServer({
        registry: "http://localhost:5000/api/v1/app"
    });
}

interface IServerConfig {
    port?: number|string;
    registry?: string | boolean;
}

async function startServer(options?: IServerConfig) {
    let defaultOptions = {
        port: 0,
        registry: false,
    }
    options = Object.assign(defaultOptions, options) as IServerConfig;
    const server = http.createServer(app);
    server.on('listening', async () => {
        let addr = (server.address() as net.AddressInfo);
        console.log(`SERVER STARTED LISTENING ON ${addr.address}:${addr.port}...`);
        if (options!.registry) {
            registryClient.init({
                url: options!.registry as string,
            });

            try {
                await registryClient.registry({
                    name: require(path.resolve(process.cwd(), 'package.json')).name,
                    ip: addr.address as string,
                    port: addr.port as number,
                })
            } catch(err) {
                console.error(`注册程序失败，系统将自动退出：`, err);
                process.exit(-1);
            }
        }
    });
    server.on('error', (err) => {
        console.error(`server started error:`, err);
        throw err;
    });
    server.listen(options.port);
    return server;
}

main()
.catch( (err) => {
    console.error('系统启动失败：', err);
    process.exit(-1);
})
