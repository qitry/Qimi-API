import type { Express } from 'express';

import weatherHandler from './weather';
import ipHandler from './ip';
import searchHandler from './search';
import historyHandler from './history';
import suggestHandler from './suggest';
import baiduSearchHandler from './baidu-search';
import lunarHandler from './lunar';
import sixtyHandler from './60s';
import bingHandler from './bing';
import qrcodeHandler from './qrcode';
import exchangeRateHandler from './exchange-rate';

import weiboHotHandler from './hot-weibo';
import baiduHotHandler from './hot-baidu';
import douyinHotHandler from './hot-douyin';
import bilibiliHotHandler from './hot-bilibili';
import zhihuHotHandler from './hot-zhihu';
import qqnewsHotHotHandler from './hot-qqnews-hot';
import qqnewsCurationHotHandler from './hot-qqnews-curation';
import news163ToutiaoHotHandler from './hot-news163-toutiao';

export function registerRoutes(app: Express): void {
  app.get('/api/weather', weatherHandler);
  app.get('/api/ip', ipHandler);
  app.get('/api/search', searchHandler);
  app.get('/api/history', historyHandler);
  app.get('/api/suggest', suggestHandler);
  app.get('/api/baidu-search', baiduSearchHandler);
  app.get('/api/lunar', lunarHandler);
  app.get('/api/60s', sixtyHandler);
  app.get('/api/bing', bingHandler);
  app.get('/api/qrcode', qrcodeHandler);
  app.get('/api/exchange-rate', exchangeRateHandler);

  app.get('/api/hot/weibo', weiboHotHandler);
  app.get('/api/hot/baidu', baiduHotHandler);
  app.get('/api/hot/douyin', douyinHotHandler);
  app.get('/api/hot/bilibili', bilibiliHotHandler);
  app.get('/api/hot/zhihu', zhihuHotHandler);
  app.get('/api/hot/qqnews-hot', qqnewsHotHotHandler);
  app.get('/api/hot/qqnews-curation', qqnewsCurationHotHandler);
  app.get('/api/hot/news163-toutiao', news163ToutiaoHotHandler);
}
