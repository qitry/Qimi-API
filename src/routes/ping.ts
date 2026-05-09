import type { Request, Response } from 'express';
import { success, error } from '../../lib/utils/response';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function pingHandler(req: Request, res: Response): Promise<void> {
  const { host, count } = req.query;

  if (!host || typeof host !== 'string') {
    res.status(200).json(error(400, '请提供 host 参数', null));
    return;
  }

  const pingCount = count ? parseInt(count as string, 10) : 4;

  if (isNaN(pingCount) || pingCount < 1 || pingCount > 10) {
    res.status(200).json(error(400, 'ping 次数必须在 1-10 之间', null));
    return;
  }

  try {
    const command = `ping -c ${pingCount} ${host}`;
    const { stdout } = await execAsync(command, { timeout: 10000 });

    const result = parsePingOutput(stdout);

    if (!result) {
      res.status(200).json(error(400, 'ping 失败，请检查主机地址', null));
      return;
    }

    res.status(200).json(success(result));
  } catch (err) {
    if (err instanceof Error && 'killed' in err && err.killed) {
      res.status(200).json(error(400, 'ping 超时', null));
    } else {
      res.status(200).json(error(400, 'ping 失败，请检查主机地址或网络连接', null));
    }
  }
}

function parsePingOutput(output: string) {
  const lines = output.split('\n');

  const packetsLine = lines.find((line) => line.includes('packets transmitted'));
  const rttLine = lines.find((line) => line.includes('rtt min/avg/max/'));

  if (!packetsLine || !rttLine) {
    return null;
  }

  const packetsMatch = packetsLine.match(/(\d+)\s+packets transmitted,\s+(\d+)\s+received/);
  const rttMatch = rttLine.match(/rtt min\/avg\/max\/(?:mdev|stddev) = ([\d.]+)\/([\d.]+)\/([\d.]+)/);

  if (!packetsMatch || !rttMatch) {
    return null;
  }

  const transmitted = parseInt(packetsMatch[1]);
  const received = parseInt(packetsMatch[2]);
  const loss = transmitted > 0 ? (((transmitted - received) / transmitted) * 100).toFixed(1) : '0.0';

  const min = parseFloat(rttMatch[1]);
  const avg = parseFloat(rttMatch[2]);
  const max = parseFloat(rttMatch[3]);

  return {
    host: lines[0].split(' ')[1],
    transmitted,
    received,
    loss: `${loss}%`,
    statistics: {
      min: `${min.toFixed(2)}ms`,
      avg: `${avg.toFixed(2)}ms`,
      max: `${max.toFixed(2)}ms`,
    },
  };
}