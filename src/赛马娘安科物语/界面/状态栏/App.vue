<template>
  <div class="statusbar" :class="{ 'is-race': is_race_phase }">
    <!-- 标题栏：始终可见 -->
    <header class="sb-header" @click="expanded = !expanded">
      <div class="sb-title-group">
        <span class="sb-name">{{ store.data.主角.姓名 || '未定名' }}</span>
        <span class="sb-level">Lv.{{ store.data.主角.等级 }}</span>
        <span class="sb-badge" :class="statusClass">{{ store.data.主角.状态 }}</span>
      </div>
      <div class="sb-meta">
        <span class="sb-phase" :class="{ active: is_race_phase }">{{ store.data.系统.当前阶段 }}</span>
        <span class="sb-date">{{ store.data.系统.日期 || '日期未定' }}</span>
        <span class="sb-view">{{ store.data.系统.当前视角 }}视角</span>
        <span class="sb-toggle">{{ expanded ? '▲' : '▼' }}</span>
      </div>
    </header>

    <!-- 摘要条：体力/干劲/羁绊 + 粉丝 -->
    <section class="sb-summary">
      <div class="bar-row">
        <span class="bar-label"><i class="fa-solid fa-heart-pulse"></i> 体力</span>
        <div class="bar-track">
          <div class="bar-fill stamina" :style="{ width: stamina_pct + '%' }"></div>
        </div>
        <span class="bar-value">{{ store.data.主角.体力 }}<small>/100</small></span>
      </div>
      <div class="bar-row">
        <span class="bar-label"><i class="fa-solid fa-fire"></i> 干劲</span>
        <div class="bar-track">
          <div class="bar-fill spirit" :style="{ width: spirit_pct + '%' }"></div>
        </div>
        <span class="bar-value">{{ store.data.主角.干劲 }}<small>/100</small></span>
      </div>
      <div class="bar-row">
        <span class="bar-label"><i class="fa-solid fa-handshake"></i> 羁绊</span>
        <div class="bar-track">
          <div class="bar-fill bond" :style="{ width: bond_pct + '%' }"></div>
        </div>
        <span class="bar-value">{{ store.data.主角.羁绊 }}<small>/100</small></span>
      </div>
      <div class="fan-row">
        <i class="fa-solid fa-users"></i>
        <span>粉丝</span>
        <strong>{{ formatFans }}</strong>
      </div>
    </section>

    <!-- 展开区 -->
    <div v-if="expanded" class="sb-body">
      <!-- Tab 切换 -->
      <nav class="sb-tabs">
        <button
          v-for="t in tabs"
          :key="t.key"
          class="sb-tab"
          :class="{ active: active_tab === t.key }"
          @click="active_tab = t.key"
        >
          <i :class="t.icon"></i> {{ t.label }}
        </button>
      </nav>

      <!-- 基础页 -->
      <template v-if="active_tab === 'base'">
        <!-- 五维面板 -->
        <section class="sb-section">
          <h3 class="sb-section-title"><i class="fa-solid fa-gauge-high"></i> 五维</h3>
          <div class="stat-grid">
            <div v-for="(stat, key) in stats" :key="key" class="stat-cell">
              <span class="stat-name">{{ stat.label }}</span>
              <div class="stat-track">
                <div class="stat-fill" :class="key" :style="{ width: stat.pct + '%' }"></div>
              </div>
              <span class="stat-value">{{ stat.value }}</span>
            </div>
          </div>
          <div class="stat-total">
            五维总值：<strong>{{ stat_total }}</strong>
            <span class="total-hint">/ 6000</span>
          </div>
        </section>

        <!-- 适性面板 -->
        <section class="sb-section">
          <h3 class="sb-section-title"><i class="fa-solid fa-tags"></i> 适性</h3>
          <div class="apt-grid">
            <div class="apt-group">
              <span class="apt-group-name">场地</span>
              <span v-for="(v, k) in store.data.主角.资质.场地适性" :key="k" class="apt-chip">
                <b>{{ k }}</b><em>{{ v }}</em>
              </span>
            </div>
            <div class="apt-group">
              <span class="apt-group-name">距离</span>
              <span v-for="(v, k) in store.data.主角.资质.距离适性" :key="k" class="apt-chip">
                <b>{{ k }}</b><em>{{ v }}</em>
              </span>
            </div>
            <div class="apt-group">
              <span class="apt-group-name">脚质</span>
              <span v-for="(v, k) in store.data.主角.资质.脚质适性" :key="k" class="apt-chip">
                <b>{{ k }}</b><em>{{ v }}</em>
              </span>
            </div>
          </div>
        </section>

        <!-- 赛事面板 -->
        <section class="sb-section">
          <h3 class="sb-section-title"><i class="fa-solid fa-flag-checkered"></i> 赛事</h3>
          <div v-if="store.data.赛事.名称" class="race-panel">
            <div class="race-head">
              <strong>{{ store.data.赛事.名称 }}</strong>
              <span class="race-tag">{{ store.data.赛事.等级 }}</span>
              <span class="race-tag">{{ store.data.赛事.距离类型 }}</span>
              <span class="race-tag">{{ store.data.赛事.场地 }}</span>
            </div>
            <div class="race-meta">
              <span>阶段对抗</span>
              <div class="stage-row">
                <span class="stage-chip" :class="stageClass(store.data.赛事.阶段对抗.前)">前 {{ store.data.赛事.阶段对抗.前 }}</span>
                <span class="stage-chip" :class="stageClass(store.data.赛事.阶段对抗.中)">中 {{ store.data.赛事.阶段对抗.中 }}</span>
                <span class="stage-chip" :class="stageClass(store.data.赛事.阶段对抗.后)">后 {{ store.data.赛事.阶段对抗.后 }}</span>
              </div>
            </div>
            <div class="bar-row">
              <span class="bar-label"><i class="fa-solid fa-battery-three-quarters"></i> 耐力余量</span>
              <div class="bar-track">
                <div class="bar-fill stamina" :style="{ width: stamina_remain_pct + '%' }"></div>
              </div>
              <span class="bar-value">{{ store.data.赛事.耐力余量 }}</span>
            </div>
            <div v-if="store.data.赛事.结果 !== '未出赛'" class="race-result">
              最近结果：<strong>{{ store.data.赛事.结果 }}</strong>
            </div>
          </div>
          <div v-else class="empty-note">当前无赛事，可在赛前阶段报名</div>
        </section>

        <!-- 成就面板 -->
        <section class="sb-section">
          <h3 class="sb-section-title"><i class="fa-solid fa-trophy"></i> 成就 <span class="ach-count">{{ achievements.length }}</span></h3>
          <div v-if="achievements.length" class="ach-list">
            <div v-for="a in achievements" :key="a.name" class="ach-item">
              <i class="fa-solid fa-medal"></i>
              <span class="ach-name">{{ a.name }}</span>
              <span class="ach-year">{{ a.year }}</span>
            </div>
          </div>
          <div v-else class="empty-note">尚未达成成就——去冲击经典三冠、八大競走吧！</div>
        </section>
      </template>

      <!-- 关系页：其他马娘好感 + 各自技能 -->
      <template v-else-if="active_tab === 'relation'">
        <section class="sb-section">
          <h3 class="sb-section-title"><i class="fa-solid fa-heart"></i> 马娘关系 <span class="ach-count">{{ relations.length }}</span></h3>
          <div v-if="relations.length" class="rel-list">
            <div v-for="rel in relations" :key="rel.name" class="rel-card">
              <div class="rel-head">
                <span class="rel-name">{{ rel.name }}</span>
                <span class="rel-bond" :class="bondTone(rel.好感)">{{ rel.好感 }}</span>
              </div>
              <div class="bar-row rel-bar">
                <div class="bar-track">
                  <div class="bar-fill bond" :style="{ width: rel.好感 + '%' }"></div>
                </div>
                <span class="bar-value"><small>好感</small></span>
              </div>
              <div v-if="rel.skills.length" class="rel-skills">
                <span v-for="(sk, skName) in rel.skills" :key="skName" class="rel-skill" :class="{ high: sk.掌握度 >= 60 }">
                  {{ skName }} <em>{{ sk.掌握度 }}%</em>
                </span>
              </div>
              <div v-else class="rel-noskills">尚未了解其技能</div>
            </div>
          </div>
          <div v-else class="empty-note">暂无认识的其他马娘——日常互动、比赛共斗会建立关系</div>
        </section>
      </template>

      <!-- 技能页：主角技能 -->
      <template v-else>
        <section class="sb-section">
          <h3 class="sb-section-title"><i class="fa-solid fa-wand-magic-sparkles"></i> 技能 <span class="ach-count">{{ skill_count }}</span></h3>
          <div v-if="!_.isEmpty(store.data.主角.技能)" class="skill-list">
            <div v-for="(info, name) in store.data.主角.技能" :key="name" class="skill-row">
              <span class="skill-name">{{ name }}</span>
              <div class="skill-track">
                <div
                  class="skill-fill"
                  :class="{ high: info.掌握度 >= 60 }"
                  :style="{ width: info.掌握度 + '%' }"
                ></div>
              </div>
              <span class="skill-value">{{ info.掌握度 }}%</span>
            </div>
          </div>
          <div v-else class="empty-note">尚未习得技能，训练中偶有领悟</div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { useDataStore } from './store';

const store = useDataStore();

const expanded = useLocalStorage<boolean>('uma_statusbar:expanded', true);
const active_tab = useLocalStorage<string>('uma_statusbar:tab', 'base');

const tabs = [
  { key: 'base', label: '基础', icon: 'fa-solid fa-gauge-high' },
  { key: 'relation', label: '关系', icon: 'fa-solid fa-heart' },
  { key: 'skill', label: '技能', icon: 'fa-solid fa-wand-magic-sparkles' },
];

const is_race_phase = computed(() => store.data.系统.当前阶段 === '比赛');

const stamina_pct = computed(() => clamp_pct(store.data.主角.体力));
const spirit_pct = computed(() => clamp_pct(store.data.主角.干劲));
const bond_pct = computed(() => clamp_pct(store.data.主角.羁绊));
const stamina_remain_pct = computed(() => clamp_pct(store.data.赛事.耐力余量 / 12));

const statusClass = computed(() => {
  const map: Record<string, string> = { 正常: 'ok', 疲惫: 'tired', 受伤: 'injured', 低干劲: 'low' };
  return map[store.data.主角.状态] || 'ok';
});

const formatFans = computed(() => {
  const v = store.data.主角.粉丝数 || 0;
  return v >= 10000 ? (v / 10000).toFixed(1) + '万' : String(v);
});

const stats = computed(() => {
  const w = store.data.主角.五维 || {};
  const labels: Record<string, string> = { 速度: '速度', 耐力: '耐力', 力量: '力量', 毅力: '毅力', 智慧: '智慧' };
  return Object.keys(labels).map((key) => {
    const value = w[key] ?? 0;
    return { key, label: labels[key], value, pct: Math.min(100, (value / 1200) * 100) };
  });
});

const stat_total = computed(() => {
  const w = store.data.主角.五维 || {};
  return (w.速度 ?? 0) + (w.耐力 ?? 0) + (w.力量 ?? 0) + (w.毅力 ?? 0) + (w.智慧 ?? 0);
});

// 成就列表（按达成年份倒序，同一年按名称排序）
const achievements = computed(() => {
  const a = store.data.主角.成就 || {};
  return Object.entries(a)
    .map(([name, year]) => ({ name, year: String(year) }))
    .sort((x, y) => {
      if (x.year !== y.year) return y.year.localeCompare(x.year, 'zh');
      return x.name.localeCompare(y.name, 'zh');
    });
});

// 马娘关系列表：好感从高到低，含各自技能
const relations = computed(() => {
  const rel = store.data.主角.关系 || {};
  return Object.entries(rel)
    .map(([name, info]) => ({
      name,
      好感: Number(info?.好感 ?? 0),
      skills: Object.entries(info?.技能 ?? {}) as [string, { 掌握度: number }][],
    }))
    .sort((a, b) => b.好感 - a.好感);
});

const skill_count = computed(() => Object.keys(store.data.主角.技能 || {}).length);

function bondTone(v: number): string {
  if (v >= 80) return 'deep';
  if (v >= 50) return 'mid';
  if (v >= 20) return 'low';
  return 'cold';
}

function clamp_pct(v: number): number {
  return Math.max(0, Math.min(100, v));
}

function stageClass(v: number): string {
  if (v > 0) return 'pos';
  if (v < 0) return 'neg';
  return 'neu';
}
</script>

<style lang="scss" scoped>
.statusbar {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  background-color: var(--c-surface);
  border: 2px solid var(--c-border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(43, 45, 66, 0.14);
  font-size: 13px;
  transition: border-color 0.3s;

  &.is-race {
    border-color: var(--c-danger);
  }
}

.sb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%);
  color: #fff;
  cursor: pointer;
  user-select: none;

  &:hover {
    filter: brightness(1.05);
  }
}

.sb-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.sb-name {
  font-weight: 800;
  font-size: 1.02rem;
  white-space: nowrap;
}

.sb-level {
  background: var(--c-gold);
  color: var(--c-ink);
  font-weight: 800;
  font-size: 0.72rem;
  padding: 2px 7px;
  border-radius: 10px;
  font-family: var(--font-num);
}

.sb-badge {
  font-size: 0.68rem;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  &.ok { background: rgba(255, 255, 255, 0.18); }
  &.tired { background: var(--c-warning); color: var(--c-ink); }
  &.injured { background: var(--c-danger); }
  &.low { background: var(--c-gold); color: var(--c-ink); }
}

.sb-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  opacity: 0.95;
  white-space: nowrap;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.sb-phase {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 700;
  &.active {
    background: var(--c-danger);
  }
}

.sb-toggle {
  font-size: 0.8rem;
  opacity: 0.8;
}

.sb-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 14px;
  background: var(--c-surface-alt);
  border-bottom: 2px solid var(--c-border);
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar-label {
  width: 78px;
  font-size: 0.78rem;
  color: var(--c-muted);
  white-space: nowrap;
  i { margin-right: 4px; }
}

.bar-track {
  flex: 1;
  height: 11px;
  background: var(--c-track);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.35s ease;
  &.stamina { background: linear-gradient(90deg, var(--c-primary), #4caf7d); }
  &.spirit { background: linear-gradient(90deg, var(--c-warning), #ffb703); }
  &.bond { background: linear-gradient(90deg, #e76f51, var(--c-danger)); }
}

.bar-value {
  width: 52px;
  text-align: right;
  font-family: var(--font-num);
  font-weight: 700;
  font-size: 0.82rem;
  small { color: var(--c-muted); font-weight: 400; }
}

.fan-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--c-muted);
  strong {
    color: var(--c-gold);
    font-family: var(--font-num);
    font-size: 0.9rem;
  }
}

.sb-body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sb-tabs {
  display: flex;
  gap: 6px;
  border-bottom: 2px solid var(--c-border);
  padding-bottom: 8px;
}

.sb-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid var(--c-border);
  background: var(--c-surface-alt);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--c-muted);
  cursor: pointer;
  transition: all 0.2s;
  i { font-size: 0.72rem; }
  &:hover { border-color: var(--c-primary); color: var(--c-primary-dark); }
  &.active {
    background: var(--c-primary);
    border-color: var(--c-primary-dark);
    color: #fff;
  }
}

.rel-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rel-card {
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--c-surface-alt);
}

.rel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .rel-name { font-weight: 800; font-size: 0.9rem; color: var(--c-primary-dark); }
  .rel-bond {
    font-family: var(--font-num);
    font-weight: 800;
    font-size: 0.82rem;
    padding: 2px 9px;
    border-radius: 10px;
    &.deep { background: #d9f2e4; color: #1e7a50; }
    &.mid { background: #fdeeda; color: #b06e1a; }
    &.low { background: #e6f1fb; color: #185fa5; }
    &.cold { background: var(--c-track); color: var(--c-muted); }
  }
}

.rel-bar {
  margin-top: 6px;
  .bar-value { width: auto; }
}

.rel-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}

.rel-skill {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
  background: var(--c-track);
  color: var(--c-muted);
  em { font-style: normal; font-family: var(--font-num); font-weight: 700; margin-left: 3px; }
  &.high { background: #d9f2e4; color: #1e7a50; }
}

.rel-noskills {
  margin-top: 8px;
  font-size: 0.72rem;
  color: var(--c-muted);
  font-style: italic;
}

.sb-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sb-section-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--c-primary-dark);
  border-left: 4px solid var(--c-primary);
  padding-left: 8px;
  i { margin-right: 5px; }
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.stat-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 6px 9px;
  background: var(--c-surface-alt);
}

.stat-name {
  width: 40px;
  font-size: 0.78rem;
  font-weight: 700;
}

.stat-track {
  flex: 1;
  height: 9px;
  background: var(--c-track);
  border-radius: 5px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.35s ease;
  &.速度 { background: linear-gradient(90deg, #ef476f, #ff5d8f); }
  &.耐力 { background: linear-gradient(90deg, #118ab2, #48cae4); }
  &.力量 { background: linear-gradient(90deg, #e07a5f, #f4a261); }
  &.毅力 { background: linear-gradient(90deg, #6d6875, #9a8c98); }
  &.智慧 { background: linear-gradient(90deg, #457b9d, #a8dadc); }
}

.stat-value {
  width: 42px;
  text-align: right;
  font-family: var(--font-num);
  font-weight: 700;
  font-size: 0.8rem;
}

.stat-total {
  font-size: 0.8rem;
  color: var(--c-muted);
  text-align: right;
  strong { color: var(--c-ink); font-family: var(--font-num); }
  .total-hint { font-size: 0.7rem; }
}

.apt-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.apt-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.apt-group-name {
  width: 44px;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--c-muted);
}

.apt-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  padding: 2px 7px;
  background: var(--c-surface-alt);
  font-size: 0.72rem;
  b { color: var(--c-muted); font-weight: 600; }
  em {
    font-style: normal;
    font-weight: 800;
    font-family: var(--font-num);
    color: var(--c-primary-dark);
  }
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skill-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-name {
  width: 120px;
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skill-track {
  flex: 1;
  height: 9px;
  background: var(--c-track);
  border-radius: 5px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, #8d99ae, var(--c-muted));
  transition: width 0.35s ease;
  &.high { background: linear-gradient(90deg, var(--c-primary), #4caf7d); }
}

.skill-value {
  width: 42px;
  text-align: right;
  font-family: var(--font-num);
  font-weight: 700;
  font-size: 0.78rem;
}

.empty-note {
  font-size: 0.78rem;
  color: var(--c-muted);
  font-style: italic;
  padding: 6px 0;
}

.ach-count {
  font-size: 0.72rem;
  color: var(--c-warning);
  font-weight: 700;
  margin-left: 2px;
}

.ach-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ach-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 3px 10px;
  background: var(--c-surface-alt);
  font-size: 0.78rem;
  i { color: var(--c-warning); font-size: 0.72rem; }
}

.ach-name {
  font-weight: 700;
  color: var(--c-primary-dark);
}

.ach-year {
  font-size: 0.68rem;
  color: var(--c-muted);
  font-family: var(--font-num);
  border-left: 1px solid var(--c-border);
  padding-left: 6px;
}

.race-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 10px;
  background: var(--c-surface-alt);
}

.race-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  strong { font-size: 0.95rem; }
}

.race-tag {
  background: var(--c-primary);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

.race-meta {
  font-size: 0.78rem;
  color: var(--c-muted);
}

.stage-row {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.stage-chip {
  padding: 3px 10px;
  border-radius: 6px;
  font-family: var(--font-num);
  font-weight: 700;
  font-size: 0.8rem;
  &.pos { background: #d8f3dc; color: var(--c-primary-dark); }
  &.neg { background: #f8d7da; color: var(--c-danger); }
  &.neu { background: var(--c-track); color: var(--c-muted); }
}

.race-result {
  font-size: 0.8rem;
  strong { color: var(--c-gold); }
}

@media (max-width: 600px) {
  .stat-grid { grid-template-columns: 1fr; }
  .sb-meta { font-size: 0.68rem; }
  .sb-name { font-size: 0.92rem; }
}
</style>
