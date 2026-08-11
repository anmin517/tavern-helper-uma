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

export type RaceStatus = {
  rank: number; // 当前名次
  total: number; // 总人数
  distance: number; // 当前行进距离 (m)
  total_distance: number; // 赛道总长度 (m)
};

const BLOCK_RE = /<检定>([\s\S]*?)<\/检定>/gi;
const RACE_STATUS_RE = /<比赛>([\s\S]*?)<\/比赛>/gi;

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

/**
 * 从当前消息原文解析比赛状态块 <比赛>名次|总人数|行进距离|总长度</比赛>。
 * 返回最近一次（消息内最后一个）比赛状态；无则返回 null。
 */
export function parseRaceStatusFromMessage(raw: string): RaceStatus | null {
  if (!raw) return null;
  const re = new RegExp(RACE_STATUS_RE.source, RACE_STATUS_RE.flags);
  let m: RegExpExecArray | null;
  let last: RaceStatus | null = null;
  while ((m = re.exec(raw)) !== null) {
    const fields = m[1].split('|').map((s) => s.trim());
    const [rankRaw = '', totalRaw = '', distRaw = '', totalDistRaw = ''] = fields;
    last = {
      rank: Number(rankRaw) || 0,
      total: Number(totalRaw) || 0,
      distance: Number(distRaw) || 0,
      total_distance: Number(totalDistRaw) || 0,
    };
  }
  return last;
}

/** 获取当前消息楼层被 AI 使用的原文 */
export function getCurrentMessageRaw(): string {
  const id = getCurrentMessageId();
  if (id == null) return '';
  const msgs = getChatMessages(id, { role: 'all', hide_state: 'all' }) as ChatMessage[];
  return msgs[0]?.message ?? '';
}
