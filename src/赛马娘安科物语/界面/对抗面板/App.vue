<template>
  <div class="ck-card">
    <!-- 头部 -->
    <div class="ck-head">
      <span class="ck-title"><i class="fa-solid fa-dice-d6"></i> 检定 / 对抗</span>
      <span v-if="check_name" class="ck-name">{{ check_name }}</span>
    </div>

    <!-- 检定结果区 -->
    <div v-if="has_check" class="ck-body">
      <div class="ck-result-row">
        <div class="ck-die">
          <span class="die-label">骰值</span>
          <span class="die-value" :class="result_class">{{ roll_value }}</span>
        </div>
        <div class="ck-target">
          <span class="target-label">目标值</span>
          <span class="target-value">{{ target_value }}</span>
        </div>
        <div class="ck-verdict" :class="result_class">
          <i :class="result_icon"></i>
          {{ result_text }}
        </div>
      </div>

      <div v-if="modifier" class="ck-mod">
        <i class="fa-solid fa-sliders"></i> 修正：{{ modifier }}
      </div>

      <div v-if="stage_label" class="ck-stage">
        <i class="fa-solid fa-flag"></i> 阶段对抗（{{ stage_label }}）
        <div class="stage-chips">
          <span v-for="s in stage_list" :key="s.key" class="stage-chip" :class="stage_class(s.value)">
            前 {{ s.value }}
          </span>
        </div>
      </div>

      <div v-if="remark" class="ck-remark">
        <i class="fa-solid fa-comment-dots"></i> {{ remark }}
      </div>
    </div>

    <!-- 空态：仅展示当前比赛阶段对抗值 -->
    <div v-else-if="has_race_clash" class="ck-body">
      <div class="ck-result-row race">
        <div class="ck-verdict" :class="race_verdict_class">
          <i :class="race_verdict_icon"></i>
          {{ race_verdict_text }}
        </div>
      </div>
      <div class="ck-stage">
        <i class="fa-solid fa-flag"></i> 当前比赛阶段对抗
        <div class="stage-chips">
          <span v-for="s in stage_list" :key="s.key" class="stage-chip" :class="stage_class(s.value)">
            {{ s.key }} {{ s.value > 0 ? '+' : '' }}{{ s.value }}
          </span>
        </div>
      </div>
    </div>

    <!-- 无数据 -->
    <div v-else class="ck-body empty">
      尚未进行检定或对抗
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { useDataStore } from './store';

const store = useDataStore();

const check = store.data.系统.最近检定 || {};
const has_check = computed(() => !!(check.名称 || check.骰值 > 0 || check.目标值 > 0));

const check_name = computed(() => check.名称 || '');
const roll_value = computed(() => check.骰值 ?? 0);
const target_value = computed(() => check.目标值 ?? 0);
const result_text = computed(() => check.结果 || '成功');
const modifier = computed(() => check.修正 || '');
const remark = computed(() => check.备注 || '');
const stage_label = computed(() => check.对抗阶段 || '');

const result_class = computed(() => {
  const map: Record<string, string> = { 大成功: 'crit', 成功: 'succ', 普通失败: 'fail', 大失败: 'fumble' };
  return map[result_text.value] || 'succ';
});
const result_icon = computed(() => {
  const map: Record<string, string> = {
    大成功: 'fa-solid fa-star',
    成功: 'fa-solid fa-circle-check',
    普通失败: 'fa-solid fa-circle-xmark',
    大失败: 'fa-solid fa-biohazard',
  };
  return map[result_text.value] || 'fa-solid fa-circle-check';
});

/* 比赛三阶段对抗（无检定时展示） */
const clash = store.data.赛事.阶段对抗 || {};
const has_race_clash = computed(() => !!(clash.前 || clash.中 || clash.后));
const stage_list = computed(() => [
  { key: '前', value: Number(clash.前 ?? 0) },
  { key: '中', value: Number(clash.中 ?? 0) },
  { key: '后', value: Number(clash.后 ?? 0) },
]);
const stage_total = computed(() => stage_list.value.reduce((a, b) => a + b.value, 0));
const race_verdict_class = computed(() => {
  if (stage_total.value > 0) return 'succ';
  if (stage_total.value < 0) return 'fail';
  return 'neu';
});
const race_verdict_icon = computed(() => {
  if (stage_total.value > 0) return 'fa-solid fa-arrow-trend-up';
  if (stage_total.value < 0) return 'fa-solid fa-arrow-trend-down';
  return 'fa-solid fa-equals';
});
const race_verdict_text = computed(() => {
  const t = stage_total.value;
  return t > 0 ? `总优势 +${t}` : t < 0 ? `总劣势 ${t}` : '势均力敌';
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
  .ck-name { font-size: 0.8rem; opacity: 0.92; }
}

.ck-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  &.empty { color: var(--c-muted); font-style: italic; text-align: center; padding: 18px; }
}

.ck-result-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  &.race { justify-content: center; }
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
}
</style>
