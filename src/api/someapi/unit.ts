import type { Request, Response } from 'express';
import { success, error } from '../../../lib/utils/response';

const UNIT_CONVERSIONS = {
  length: {
    m: { name: '米', factor: 1 },
    km: { name: '千米', factor: 1000 },
    cm: { name: '厘米', factor: 0.01 },
    mm: { name: '毫米', factor: 0.001 },
    mi: { name: '英里', factor: 1609.344 },
    yd: { name: '码', factor: 0.9144 },
    ft: { name: '英尺', factor: 0.3048 },
    in: { name: '英寸', factor: 0.0254 },
  },
  weight: {
    kg: { name: '千克', factor: 1 },
    g: { name: '克', factor: 0.001 },
    mg: { name: '毫克', factor: 0.000001 },
    t: { name: '吨', factor: 1000 },
    lb: { name: '磅', factor: 0.45359237 },
    oz: { name: '盎司', factor: 0.02834952 },
  },
  temperature: {
    c: { name: '摄氏度' },
    f: { name: '华氏度' },
    k: { name: '开尔文' },
  },
  data: {
    b: { name: '字节', factor: 1 },
    kb: { name: '千字节', factor: 1024 },
    mb: { name: '兆字节', factor: 1048576 },
    gb: { name: '吉字节', factor: 1073741824 },
    tb: { name: '太字节', factor: 1099511627776 },
  },
};

export default async function unitHandler(req: Request, res: Response): Promise<void> {
  const { type, value, from, to } = req.query;

  if (!type || (type !== 'length' && type !== 'weight' && type !== 'temperature' && type !== 'data')) {
    res.status(200).json(
      success({
        availableTypes: ['length', 'weight', 'temperature', 'data'],
        conversions: UNIT_CONVERSIONS,
      })
    );
    return;
  }

  if (value === undefined || from === undefined || to === undefined) {
    res.status(200).json(error(400, '请提供 value, from, to 参数', null));
    return;
  }

  const numValue = parseFloat(value as string);
  if (isNaN(numValue)) {
    res.status(200).json(error(400, '无效的数值', null));
    return;
  }

  try {
    let result: number;
    let fromUnit: string;
    let toUnit: string;

    if (type === 'temperature') {
      result = convertTemperature(numValue, from as string, to as string);
      fromUnit = UNIT_CONVERSIONS.temperature[from as keyof typeof UNIT_CONVERSIONS.temperature]?.name || from as string;
      toUnit = UNIT_CONVERSIONS.temperature[to as keyof typeof UNIT_CONVERSIONS.temperature]?.name || to as string;
    } else {
      const units = UNIT_CONVERSIONS[type as keyof typeof UNIT_CONVERSIONS] as Record<string, { name: string; factor: number }>;
      const fromFactor = units[from as string]?.factor;
      const toFactor = units[to as string]?.factor;

      if (!fromFactor || !toFactor) {
        res.status(200).json(
          error(400, `不支持的单位，可用的单位：${Object.keys(units).join(', ')}`, null)
        );
        return;
      }

      result = (numValue * fromFactor) / toFactor;
      fromUnit = units[from as string].name;
      toUnit = units[to as string].name;
    }

    res.status(200).json(
      success({
        value: numValue,
        from: `${numValue} ${fromUnit}`,
        to: `${result.toFixed(6).replace(/\.?0+$/, '')} ${toUnit}`,
        result,
        unit: toUnit,
      })
    );
  } catch (err) {
    res.status(200).json(error(400, '单位转换失败', null));
  }
}

function convertTemperature(value: number, from: string, to: string): number {
  let celsius: number;

  if (from === 'c') {
    celsius = value;
  } else if (from === 'f') {
    celsius = (value - 32) * (5 / 9);
  } else if (from === 'k') {
    celsius = value - 273.15;
  } else {
    throw new Error('不支持的温度单位');
  }

  if (to === 'c') {
    return celsius;
  } else if (to === 'f') {
    return celsius * (9 / 5) + 32;
  } else if (to === 'k') {
    return celsius + 273.15;
  } else {
    throw new Error('不支持的目标单位');
  }
}