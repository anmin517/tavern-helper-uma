<template>
  <div class="ck-card">
    <!-- 头部 -->
    <div class="ck-head">
      <span class="ck-title"><i class="fa-solid fa-dice-d6"></i> 检定 / 对抗</span>
      <span v-if="checks.length" class="ck-count">共 {{ checks.length }} 次</span>
    </div>

    <!-- 比赛状态条：名次/总人数 + 行进距离 -->
    <div v-if="race" class="ck-race">
      <div class="race-row">
        <span class="race-rank"><i class="fa-solid fa-medal"></i> {{ race.rank }}<small>/{{ race.total }} 着</small></span>
        <span class="race-dist"><i class="fa-solid fa-ruler-horizontal"></i> {{ race.distance }}m<small>/{{ race.total_distance }}m</small></span>
      </div>
      <div class="race-progress">
        <div class="race-bar" :style="{ width: race_pct + '%' }"></div>
      </div>
    </div>

    <!-- 多检定竖排 -->
    <div v-if="checks.length" class="ck-body stack">
      <div v-for="(ck, i) in checks" :key="i" class="ck-item">
        <div class="ck-result-row">
          <div class="ck-die">
            <span class="die-label">骰值</span>
            <span class="die-value" :class="result_class(ck)">{{ ck.roll }}</span>
          </div>
          <div class="ck-target">
            <span class="target-label">目标值</span>
            <span class="target-value">{{ ck.target }}</span>
          </div>
          <div class="ck-verdict" :class="result_class(ck)">
            <i :class="result_icon(ck)"></i>
            {{ ck.result }}
          </div>
        </div>
        <div class="ck-sub">
          <span class="ck-name">{{ ck.name || '未命名检定' }}</span>
          <span v-if="ck.type" class="ck-type">{{ ck.type }}</span>
          <span v-if="ck.stage" class="ck-stage-badge">阶段·{{ ck.stage }}</span>
        </div>
        <div v-if="ck.modifier" class="ck-mod">
          <i class="fa-solid fa-sliders"></i> 修正：{{ ck.modifier }}
        </div>
        <div v-if="ck.remark" class="ck-remark">
          <i class="fa-solid fa-comment-dots"></i> {{ ck.remark }}
        </div>
      </div>
    </div>

    <!-- 比赛阶段对抗聚合（块带 对抗阶段 字段时展示） -->
    <div v-if="has_staged_checks" class="ck-body">
      <div class="ck-stage">
        <i class="fa-solid fa-flag"></i> 比赛阶段对抗
        <div class="stage-chips">
          <span v-for="s in stage_list" :key="s.key" class="stage-chip" :class="stage_class(s.value)">
            {{ s.key }} {{ s.value > 0 ? '+' : '' }}{{ s.value }}
          </span>
        </div>
        <div class="stage-total">
          总{{ race_verdict_text }}
        </div>
      </div>
    </div>

    <!-- 无数据 -->
    <div v-else-if="!checks.length" class="ck-body empty">
      尚未进行检定或对抗
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { parseChecksFromMessage, parseRaceStatusFromMessage, getCurrentMessageRaw, type CheckResult } from './store';

const raw = getCurrentMessageRaw();
const checks = computed<CheckResult[]>(() => parseChecksFromMessage(raw));
const race = computed(() => parseRaceStatusFromMessage(raw));
const race_pct = computed(() => {
  if (!race.value || !race.value.total_distance) return 0;
  return Math.min(100, Math.max(0, Math.round((race.value.distance / race.value.total_distance) * 100)));
});

const result_class = (ck: CheckResult) => {
  const map: Record<string, string> = { 大成功: 'crit', 成功: 'succ', 普通失败: 'fail', 大失败: 'fumble' };
  return map[ck.result] || 'succ';
};
const result_icon = (ck: CheckResult) => {
  const map: Record<string, string> = {
    大成功: 'fa-solid fa-star',
    成功: 'fa-solid fa-circle-check',
    普通失败: 'fa-solid fa-circle-xmark',
    大失败: 'fa-solid fa-biohazard',
  };
  return map[ck.result] || 'fa-solid fa-circle-check';
};

/* 比赛三阶段对抗：从各块的 对抗阶段 字段聚合 */
const staged_checks = computed(() => checks.value.filter((c) => !!c.stage));
const has_staged_checks = computed(() => staged_checks.value.length >= 1);
const stage_map = computed(() => {
  const m: Record<string, number> = { 前: 0, 中: 0, 后: 0 };
  for (const ck of staged_checks.value) {
    if (ck.stage in m) {
      // 阶段对抗值 = 目标值 - 骰值（正值=检定更优，即我方占优）
      m[ck.stage] = ck.target - ck.roll;
    }
  }
  return m;
});
const stage_list = computed(() => [
  { key: '前', value: stage_map.value.前 },
  { key: '中', value: stage_map.value.中 },
  { key: '后', value: stage_map.value.后 },
]);
const stage_total = computed(() => stage_list.value.reduce((a, b) => a + b.value, 0));
const race_verdict_text = computed(() => {
  const t = stage_total.value;
  return t > 0 ? `优势 +${t}` : t < 0 ? `劣势 ${t}` : '势均力敌';
});

function stage_class(v: number): string {
  if (v > 0) return 'pos';
  if (v < 0) return 'neg';
  return 'neu';
}
</script>

<style lang="scss" scoped>
.ck-card {
  width: 100%;
  max-width: 680px;
  margin: 6px auto;
  background: var(--c-surface);
  border: 2px solid var(--c-border);
  border-radius: 12px;
  overflow: hidden;
  font-size: 13px;
  box-shadow: 0 3px 12px rgba(43, 45, 66, 0.12);
}

.ck-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%);
  color: #fff;
  .ck-title { font-weight: 800; font-size: 0.9rem; i { margin-right: 6px; } }
  .ck-count { font-size: 0.8rem; opacity: 0.92; }
}

.ck-race {
  padding: 10px 14px;
  background: var(--c-surface-alt);
  border-bottom: 1px solid var(--c-border);
  .race-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--c-primary-dark);
    .race-rank { i { margin-right: 6px; color: var(--c-warning); } }
    .race-dist { i { margin-right: 6px; color: var(--c-warning); } }
    small { font-size: 0.72rem; font-weight: 400; color: var(--c-muted); margin-left: 4px; }
  }
  .race-progress {
    margin-top: 8px;
    height: 8px;
    border-radius: 6px;
    background: var(--c-track);
    overflow: hidden;
    .race-bar {
      height: 100%;
      border-radius: 6px;
      background: linear-gradient(90deg, var(--c-primary), var(--c-primary-dark));
      transition: width 0.3s ease;
    }
  }
}

.ck-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  &.stack { gap: 14px; }
  &.empty { color: var(--c-muted); font-style: italic; text-align: center; padding: 18px; }
}

.ck-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--c-border);
  &:last-child { border-bottom: none; padding-bottom: 0; }
}

.ck-result-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.ck-die {
  display: flex;
  flex-direction: column;
  align-items: center;
  .die-label { font-size: 0.68rem; color: var(--c-muted); }
  .die-value {
    font-family: var(--font-num);
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.2;
  }
}

.ck-target {
  display: flex;
  flex-direction: column;
  align-items: center;
  .target-label { font-size: 0.68rem; color: var(--c-muted); }
  .target-value { font-family: var(--font-num); font-size: 1.4rem; font-weight: 700; }
}

.ck-verdict {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 1.1rem;
  font-weight: 800;
  padding: 8px 14px;
  border-radius: 10px;
  i { font-size: 1rem; }
}

.crit {
  color: #fff;
  background: linear-gradient(135deg, #d4a017, #b8860b);
  box-shadow: 0 0 0 3px rgba(212, 160, 23, 0.25);
}
.succ { color: #fff; background: var(--c-success); }
.fail { color: #fff; background: #9a8f80; }
.fumble { color: #fff; background: var(--c-danger); }
.neu { color: var(--c-primary-dark); background: var(--c-track); }

.ck-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  .ck-name { font-weight: 700; color: var(--c-primary-dark); }
  .ck-type {
    font-size: 0.72rem;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--c-track);
    color: var(--c-muted);
  }
  .ck-stage-badge {
    font-size: 0.72rem;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--c-primary);
    color: #fff;
  }
}

.ck-mod,
.ck-remark {
  font-size: 0.8rem;
  color: var(--c-muted);
  i { margin-right: 4px; color: var(--c-warning); }
}

.ck-stage {
  font-size: 0.8rem;
  color: var(--c-muted);
  i { margin-right: 4px; color: var(--c-warning); }
  .stage-chips {
    display: flex;
    gap: 6px;
    margin-top: 6px;
    flex-wrap: wrap;
  }
  .stage-chip {
    font-family: var(--font-num);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 8px;
    &.pos { background: #d9f2e4; color: #1e7a50; }
    &.neg { background: #fbe3e3; color: #b13a3a; }
    &.neu { background: var(--c-track); color: var(--c-muted); }
  }
  .stage-total {
    margin-top: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--c-primary-dark);
  }
}
</style>
