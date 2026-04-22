import axios from 'axios';
import http from 'http';
import https from 'https';

const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 30000,
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 30000,
});

const httpClient = axios.create({
  timeout: 10000,
  httpAgent,
  httpsAgent,
});

export default httpClient;
