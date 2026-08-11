<template>
  <div class="race-card">
    <!-- 头部 -->
    <div class="race-head">
      <span class="race-title"><i class="fa-solid fa-flag-checkered"></i> 比赛状态</span>
      <span v-if="blocks.length" class="race-live"><i class="fa-solid fa-circle"></i> LIVE</span>
    </div>

    <!-- 空态：非比赛阶段 -->
    <div v-if="!blocks.length" class="race-empty">
      当前未处于比赛阶段
    </div>

    <template v-else>
      <!-- 名次 + 行进距离 -->
      <div class="race-row">
        <div class="race-stat">
          <span class="stat-label">当前名次</span>
          <span class="stat-rank">{{ cur.rank }}<small>/{{ cur.total }} 着</small></span>
        </div>
        <div class="race-stat">
          <span class="stat-label">行进距离</span>
          <span class="stat-dist">{{ cur.distance }}m<small>/{{ cur.total_distance }}m</small></span>
        </div>
      </div>
      <div class="race-progress">
        <div class="race-bar" :style="{ width: race_pct + '%' }"></div>
      </div>

      <!-- 优势/劣势积累 -->
      <div class="race-adv">
        <span class="adv-label"><i class="fa-solid fa-scale-balanced"></i> 优势积累</span>
        <div class="adv-chips">
          <span v-for="s in adv_list" :key="s.key" class="adv-chip" :class="adv_class(s.value)">
            {{ s.key }} {{ s.value > 0 ? '+' : '' }}{{ s.value }}
          </span>
        </div>
        <div class="adv-total" :class="adv_class(adv.total)">
          总{{ adv.total > 0 ? '优势 +' : adv.total < 0 ? '劣势 ' : '势均力敌 ' }}{{ adv.total !== 0 ? adv.total : '' }}
        </div>
      </div>

      <!-- 当前前三名 -->
      <div v-if="cur.top3.length" class="race-top3">
        <span class="top3-label"><i class="fa-solid fa-medal"></i> 当前前三</span>
        <div class="top3-list">
          <div v-for="(name, i) in cur.top3" :key="i" class="top3-item" :class="'medal-' + (i + 1)">
            <span class="top3-medal">{{ i + 1 }}</span>
            <span class="top3-name">{{ name }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { parseRaceBlocksFromMessage, parseStageAdvantageFromMessage, getCurrentMessageRaw, type RaceBlock, type StageAdvantage } from './store';

const raw = getCurrentMessageRaw();
const blocks = computed<RaceBlock[]>(() => parseRaceBlocksFromMessage(raw));
const cur = computed<RaceBlock>(() => blocks.value[blocks.value.length - 1] || { rank: 0, total: 0, distance: 0, total_distance: 0, top3: [] });
const adv = computed<StageAdvantage>(() => parseStageAdvantageFromMessage(raw));

const race_pct = computed(() => {
  if (!cur.value.total_distance) return 0;
  return Math.min(100, Math.max(0, Math.round((cur.value.distance / cur.value.total_distance) * 100)));
});

const adv_list = computed(() => [
  { key: '前', value: adv.value.前 },
  { key: '中', value: adv.value.中 },
  { key: '后', value: adv.value.后 },
]);

function adv_class(v: number): string {
  if (v > 0) return 'pos';
  if (v < 0) return 'neg';
  return 'neu';
}
</script>

<style lang="scss" scoped>
.race-card {
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

.race-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(135deg, #1e7a50 0%, #145c3b 100%);
  color: #fff;
  .race-title { font-weight: 800; font-size: 0.9rem; i { margin-right: 6px; } }
  .race-live {
    font-size: 0.72rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    i { font-size: 0.5rem; color: #ffd166; animation: pulse 1.2s ease infinite; }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.race-empty {
  padding: 18px;
  color: var(--c-muted);
  font-style: italic;
  text-align: center;
}

.race-row {
  display: flex;
  gap: 14px;
  padding: 14px 14px 6px;
  .race-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    .stat-label { font-size: 0.68rem; color: var(--c-muted); }
    .stat-rank, .stat-dist {
      font-family: var(--font-num);
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--c-primary-dark);
      small { font-size: 0.75rem; font-weight: 400; color: var(--c-muted); margin-left: 3px; }
    }
  }
}

.race-progress {
  margin: 8px 14px;
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

.race-adv {
  padding: 10px 14px;
  border-top: 1px solid var(--c-border);
  .adv-label, .top3-label {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--c-primary-dark);
    i { margin-right: 5px; color: var(--c-warning); }
  }
  .adv-chips {
    display: flex;
    gap: 6px;
    margin-top: 6px;
    flex-wrap: wrap;
  }
  .adv-chip {
    font-family: var(--font-num);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 8px;
    &.pos { background: #d9f2e4; color: #1e7a50; }
    &.neg { background: #fbe3e3; color: #b13a3a; }
    &.neu { background: var(--c-track); color: var(--c-muted); }
  }
  .adv-total {
    margin-top: 8px;
    font-size: 0.9rem;
    font-weight: 800;
    &.pos { color: #1e7a50; }
    &.neg { color: #b13a3a; }
    &.neu { color: var(--c-muted); }
  }
}

.race-top3 {
  padding: 10px 14px 14px;
  border-top: 1px solid var(--c-border);
  .top3-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
  }
  .top3-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 12px;
    border-radius: 10px;
    &.medal-1 { background: linear-gradient(135deg, #fdf3d0, #f5e6b8); border: 1px solid #e4c76a; }
    &.medal-2 { background: linear-gradient(135deg, #ececec, #e0e0e0); border: 1px solid #c9c9c9; }
    &.medal-3 { background: linear-gradient(135deg, #f6e3d5, #efd5c0); border: 1px solid #dfb08c; }
    .top3-medal {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-num);
      font-size: 0.72rem;
      font-weight: 800;
      color: #fff;
      background: #c9a227;
      &.medal-2 + & { background: #9e9e9e; }
      &.medal-3 + & { background: #c47a3d; }
    }
    .top3-name { font-weight: 700; color: #3d3d3a; }
  }
}
</style>
