import _ from 'lodash';

export type RaceBlock = {
  rank: number; // 当前名次
  total: number; // 总人数
  distance: number; // 当前行进距离 (m)
  total_distance: number; // 赛道总长度 (m)
  top3: string[]; // 当前前三名马娘名（按名次）
};

export type StageAdvantage = {
  前: number;
  中: number;
  后: number;
  total: number;
};

const RACE_BLOCK_RE = /<比赛>([\s\S]*?)<\/比赛>/gi;
const CHECK_BLOCK_RE = /<检定>([\s\S]*?)<\/检定>/gi;

/**
 * 从消息原文解析全部 <比赛> 块。
 * 返回按出现顺序排列的数组；最后一个即当前（最终）比赛状态。
 */
export function parseRaceBlocksFromMessage(raw: string): RaceBlock[] {
  if (!raw) return [];
  const blocks: RaceBlock[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(RACE_BLOCK_RE.source, RACE_BLOCK_RE.flags);
  while ((m = re.exec(raw)) !== null) {
    const fields = m[1].split('|').map((s) => s.trim());
    const [rankRaw = '', totalRaw = '', distRaw = '', totalDistRaw = '', top3Raw = ''] = fields;
    blocks.push({
      rank: Number(rankRaw) || 0,
      total: Number(totalRaw) || 0,
      distance: Number(distRaw) || 0,
      total_distance: Number(totalDistRaw) || 0,
      top3: top3Raw ? top3Raw.split(/[,，、]/).map((s) => s.trim()).filter(Boolean) : [],
    });
  }
  return blocks;
}

/**
 * 从消息原文中所有带「对抗阶段」的 <检定> 块聚合优势/劣势。
 * 各阶段对抗值 = 目标值 - 骰值（正值=检定优/占上风，负值=劣势）。
 */
export function parseStageAdvantageFromMessage(raw: string): StageAdvantage {
  const adv: StageAdvantage = { 前: 0, 中: 0, 后: 0, total: 0 };
  if (!raw) return adv;
  const re = new RegExp(CHECK_BLOCK_RE.source, CHECK_BLOCK_RE.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    const fields = m[1].split('|').map((s) => s.trim());
    const [, , targetRaw = '', rollRaw = '', , , stage = ''] = fields;
    if (!stage || !(stage in adv)) continue;
    const v = (Number(targetRaw) || 0) - (Number(rollRaw) || 0);
    adv[stage as keyof StageAdvantage] += v;
    adv.total += v;
  }
  return adv;
}

/** 获取当前消息楼层被 AI 使用的原文 */
export function getCurrentMessageRaw(): string {
  const id = getCurrentMessageId();
  if (id == null) return '';
  const msgs = getChatMessages(id, { role: 'all', hide_state: 'all' }) as ChatMessage[];
  return msgs[0]?.message ?? '';
}
