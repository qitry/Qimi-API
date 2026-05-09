import type { Request, Response } from 'express';
import { success, error } from '../../../lib/utils/response';

const COMMON_REGEX = {
  email: {
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: '邮箱地址',
  },
  phone: {
    pattern: '^1[3-9]\\d{9}$',
    description: '中国大陆手机号',
  },
  url: {
    pattern: '^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$',
    description: 'URL 地址',
  },
  idCard: {
    pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$',
    description: '中国大陆身份证号',
  },
  ipv4: {
    pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$',
    description: 'IPv4 地址',
  },
  chinese: {
    pattern: '^[\\u4e00-\\u9fa5]+$',
    description: '中文字符',
  },
  number: {
    pattern: '^\\d+$',
    description: '纯数字',
  },
  username: {
    pattern: '^[a-zA-Z0-9_]{3,16}$',
    description: '用户名 (3-16位字母数字下划线)',
  },
  password: {
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$',
    description: '强密码 (至少8位，包含大小写字母和数字)',
  },
};

export default async function regexHandler(req: Request, res: Response): Promise<void> {
  const { pattern, text, preset } = req.query;

  let regexPattern: string | undefined;
  let description: string = '自定义正则';

  if (preset && typeof preset === 'string') {
    const presetRegex = COMMON_REGEX[preset as keyof typeof COMMON_REGEX];
    if (presetRegex) {
      regexPattern = presetRegex.pattern;
      description = presetRegex.description;
    } else {
      res.status(200).json(error(400, '不支持的预设正则，可用的预设：' + Object.keys(COMMON_REGEX).join(', '), null));
      return;
    }
  } else if (pattern && typeof pattern === 'string') {
    regexPattern = pattern;
  } else {
    res.status(200).json(
      success({
        availablePresets: Object.keys(COMMON_REGEX),
        presets: COMMON_REGEX,
      })
    );
    return;
  }

  if (!text || typeof text !== 'string') {
    res.status(200).json(error(400, '请提供 text 参数', null));
    return;
  }

  try {
    const regex = new RegExp(regexPattern, 'g');
    const matches = text.match(regex);
    const isValid = regex.test(text);

    res.status(200).json(
      success({
        pattern: regexPattern,
        description,
        text,
        isValid,
        matches: matches || [],
        matchCount: matches ? matches.length : 0,
      })
    );
  } catch (err) {
    res.status(200).json(error(400, '无效的正则表达式', null));
  }
}