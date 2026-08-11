import _ from 'lodash';

export type CheckResult = {
  name: string;
  type: string;
  target: number;
  roll: number;
  result: string;
  modifier: string;
  stage: string;
  remark: string;
};

const BLOCK_RE = /<检定>([\s\S]*?)<\/检定>/gi;

/**
 * 从当前消息原文解析全部检定格式块。
 * 正则替换只作用于渲染层，消息原文（getChatMessages 返回的 message 字段）
 * 保留 AI 输出的 <检定>...</检定> 原始文本，可在此直接解析。
 */
export function parseChecksFromMessage(raw: string): CheckResult[] {
  if (!raw) return [];
  const blocks: CheckResult[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(BLOCK_RE.source, BLOCK_RE.flags);
  while ((m = re.exec(raw)) !== null) {
    const fields = m[1].split('|').map((s) => s.trim());
    const [name = '', type = '', targetRaw = '', rollRaw = '', result = '', modifier = '', stage = '', remark = ''] = fields;
    blocks.push({
      name,
      type,
      target: Number(targetRaw) || 0,
      roll: Number(rollRaw) || 0,
      result: result || '成功',
      modifier,
      stage,
      remark,
    });
  }
  return blocks;
}

/** 获取当前消息楼层被 AI 使用的原文 */
export function getCurrentMessageRaw(): string {
  const id = getCurrentMessageId();
  if (id == null) return '';
  const msgs = getChatMessages(id, { role: 'all', hide_state: 'all' }) as ChatMessage[];
  return msgs[0]?.message ?? '';
}
