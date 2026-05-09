import type { Express } from 'express';

import {
  weatherHandler,
  ipHandler,
  historyHandler,
  lunarHandler,
  sixtyHandler,
  bingHandler,
  qrcodeHandler,
  exchangeRateHandler,
  base64Handler,
  timestampHandler,
  regexHandler,
  unitHandler,
  passwordHandler,
  colorHandler,
  pingHandler,
  dnsHandler,
  quoteHandler,
  avatarHandler,
  abstractAvatarHandler,
} from './someapi';

import { playerHandler, namesHandler, skinHandler } from './minecraft';

import {
  weiboHotHandler,
  baiduHotHandler,
  douyinHotHandler,
  bilibiliHotHandler,
  zhihuHotHandler,
  qqnewsHotHotHandler,
  qqnewsCurationHotHandler,
  news163ToutiaoHotHandler,
} from './hot';

export function registerRoutes(app: Express): void {
  app.get('/api/weather', weatherHandler);
  app.get('/api/ip', ipHandler);
  app.get('/api/history', historyHandler);
  app.get('/api/lunar', lunarHandler);
  app.get('/api/60s', sixtyHandler);
  app.get('/api/bing', bingHandler);
  app.get('/api/qrcode', qrcodeHandler);
  app.get('/api/exchange-rate', exchangeRateHandler);
  app.get('/api/base64', base64Handler);
  app.get('/api/timestamp', timestampHandler);
  app.get('/api/regex', regexHandler);
  app.get('/api/unit', unitHandler);
  app.get('/api/password', passwordHandler);
  app.get('/api/color', colorHandler);
  app.get('/api/ping', pingHandler);
  app.get('/api/dns', dnsHandler);
  app.get('/api/quote', quoteHandler);
  app.get('/api/avatar', avatarHandler);
  app.get('/api/abstract-avatar', abstractAvatarHandler);

  app.get('/api/minecraft/player', playerHandler);
  app.get('/api/minecraft/names', namesHandler);
  app.get('/api/minecraft/skin', skinHandler);

  app.get('/api/hot/weibo', weiboHotHandler);
  app.get('/api/hot/baidu', baiduHotHandler);
  app.get('/api/hot/douyin', douyinHotHandler);
  app.get('/api/hot/bilibili', bilibiliHotHandler);
  app.get('/api/hot/zhihu', zhihuHotHandler);
  app.get('/api/hot/qqnews-hot', qqnewsHotHotHandler);
  app.get('/api/hot/qqnews-curation', qqnewsCurationHotHandler);
  app.get('/api/hot/news163-toutiao', news163ToutiaoHotHandler);
}