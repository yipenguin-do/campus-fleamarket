// /lib/sanitize.ts
/**
 * ユーザー入力を安全化（XSS対策）
 * 文字列中の HTML 特殊文字をエスケープします
 */
export function sanitize(input: string | null | undefined): string {
    if (!input) return '';
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  
  /**
   * オブジェクト内の文字列全てをサニタイズ
   */
  export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {};
    for (const key in obj) {
      const value = obj[key];
      sanitized[key] = typeof value === 'string' ? sanitize(value) : value;
    }
    return sanitized as T;
  }