import type { Request, Response } from 'express';
import { success, error } from '../../lib/utils/response';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function dnsHandler(req: Request, res: Response): Promise<void> {
  const { domain, type } = req.query;

  if (!domain || typeof domain !== 'string') {
    res.status(200).json(error(400, '请提供 domain 参数', null));
    return;
  }

  const recordType = type && typeof type === 'string' ? type : 'A';

  try {
    const command = `dig ${domain} ${recordType} +short`;
    const { stdout } = await execAsync(command, { timeout: 5000 });

    const records = stdout
      .trim()
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.trim());

    if (records.length === 0) {
      res.status(200).json(error(400, `未找到 ${recordType} 记录`, null));
      return;
    }

    res.status(200).json(
      success({
        domain,
        type: recordType,
        records,
        count: records.length,
      })
    );
  } catch (err) {
    res.status(200).json(error(400, 'DNS 查询失败，请检查域名或网络连接', null));
  }
}