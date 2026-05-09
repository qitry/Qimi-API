import type { Request, Response } from 'express';
import { success, error } from '../../lib/utils/response';

export default async function passwordHandler(req: Request, res: Response): Promise<void> {
  const { length, uppercase, lowercase, numbers, symbols } = req.query;

  const pwdLength = length ? parseInt(length as string, 10) : 12;

  if (isNaN(pwdLength) || pwdLength < 4 || pwdLength > 128) {
    res.status(200).json(error(400, '密码长度必须在 4-128 之间', null));
    return;
  }

  const useUppercase = uppercase !== 'false';
  const useLowercase = lowercase !== 'false';
  const useNumbers = numbers !== 'false';
  const useSymbols = symbols !== 'false';

  if (!useUppercase && !useLowercase && !useNumbers && !useSymbols) {
    res.status(200).json(error(400, '至少选择一种字符类型', null));
    return;
  }

  try {
    let chars = '';
    let password = '';

    if (useUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    for (let i = 0; i < pwdLength; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const strength = calculateStrength(password);

    res.status(200).json(
      success({
        password,
        length: pwdLength,
        strength,
        options: {
          uppercase: useUppercase,
          lowercase: useLowercase,
          numbers: useNumbers,
          symbols: useSymbols,
        },
      })
    );
  } catch (err) {
    res.status(200).json(error(400, '密码生成失败', null));
  }
}

function calculateStrength(password: string): string {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return '弱';
  if (score <= 4) return '中';
  if (score <= 6) return '强';
  return '非常强';
}