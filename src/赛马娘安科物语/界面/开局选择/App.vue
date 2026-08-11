<template>
  <div class="cc-card">
    <!-- 标题栏 -->
    <header class="cc-header">
      <span class="cc-view"><i class="fa-solid fa-medal"></i> {{ store.data.系统.当前视角 }}视角</span>
      <h2 class="cc-title">{{ title_text }}</h2>
      <p class="cc-sub">{{ subtitle_text }}</p>
    </header>

    <!-- 成功态 -->
    <div v-if="done" class="cc-done">
      <div class="done-check"><i class="fa-solid fa-circle-check"></i></div>
      <h3>角色创建完成！</h3>
      <div class="done-summary">
        <div class="done-row"><span>姓名</span><strong>{{ done_name }}</strong></div>
        <div class="done-row"><span>类型</span><strong>{{ done_type }}</strong></div>
        <div v-if="done_source" class="done-row"><span>继承之魂</span><strong>{{ done_source }}</strong></div>
        <div class="done-row"><span>五维</span><strong>{{ done_stats }}</strong></div>
        <div v-if="done_goal" class="done-row"><span>梦想</span><strong>{{ done_goal }}</strong></div>
      </div>

      <!-- 开场白预览：将作为你的消息发送 -->
      <div class="narrative-box">
        <div class="narrative-head"><i class="fa-solid fa-feather-pointed"></i> 你的开场白（将作为消息发送）</div>
        <p class="narrative-text">{{ narrative }}</p>
      </div>

      <button v-if="!sent" class="confirm-btn" type="button" @click="sendNarrative">
        <i class="fa-solid fa-paper-plane"></i> 发送开场白，开始物语
      </button>
      <p v-else class="sent-tip"><i class="fa-solid fa-check"></i> 开场白已发送，故事即将开始…</p>
    </div>

    <!-- 创建表单 -->
    <div v-else class="cc-body">
      <!-- 步骤1：类型 -->
      <section class="cc-step">
        <h3 class="step-title"><span class="step-no">1</span>{{ step1_label }}</h3>
        <div class="type-grid">
          <button
            v-for="opt in type_options"
            :key="opt.id"
            class="type-card"
            :class="{ active: selected_type === opt.id }"
            type="button"
            @click="selected_type = opt.id"
          >
            <i :class="opt.icon"></i>
            <b>{{ opt.label }}</b>
            <span>{{ opt.desc }}</span>
          </button>
        </div>
      </section>

      <!-- 步骤2：配置 -->
      <section v-if="selected_type !== 'none'" class="cc-step">
        <h3 class="step-title"><span class="step-no">2</span>{{ step2_label }}</h3>

        <!-- 原作角色 -->
        <div v-if="selected_type === 'original'" class="origin-picker">
          <div class="origin-grid">
            <button
              v-for="ch in original_chars"
              :key="ch.name"
              class="origin-chip"
              :class="{ active: origin_selected === ch.name }"
              type="button"
              @click="pickOriginal(ch)"
            >
              {{ ch.name }}
            </button>
          </div>
          <div v-if="origin_obj" class="origin-preview">
            <div class="preview-head">
              <strong>{{ origin_obj.name }}</strong>
              <span class="preview-tag">{{ origin_obj.tag }}</span>
            </div>
            <p class="preview-desc">{{ origin_obj.personality }}</p>
            <div class="preview-goal"><i class="fa-solid fa-star"></i> {{ origin_obj.goal }}</div>
            <div class="preview-stats">
              <span v-for="(v, k) in origin_obj.stats" :key="k" class="ps-cell">
                <b>{{ k }}</b><em>{{ v * 6 }}</em>
              </span>
            </div>
            <div class="preview-apt">
              <span v-for="(v, k) in origin_obj.apt" :key="k" class="pa-chip">
                <b>{{ k }}</b><em>{{ v }}</em>
              </span>
            </div>
            <div class="preview-skills">
              <i class="fa-solid fa-wand-magic-sparkles"></i> 初始技能：
              <em v-for="s in origin_obj.skills" :key="s" class="sk">{{ s }}</em>
            </div>
            <div class="preview-skills">
              <i class="fa-solid fa-crown"></i> 固有技能：
              <em class="sk unique">{{ origin_obj.unique }}</em>
            </div>
          </div>
          <p v-else class="origin-hint">请从上方选择一位继承名马之魂的赛马娘</p>
        </div>

        <!-- 自定义角色 -->
        <div v-else class="custom-form">
          <label class="field">
            <span class="field-label"><i class="fa-solid fa-tag"></i> 姓名</span>
            <input v-model="custom_name" class="text-input" placeholder="输入你的马娘名字" maxlength="12" />
          </label>

          <div class="field">
            <span class="field-label"><i class="fa-solid fa-gauge-high"></i> 五维（0~1200）</span>
            <div v-for="key in stat_keys" :key="key" class="stat-slider">
              <span class="ss-name">{{ stat_labels[key] }}</span>
              <input v-model.number="custom_stats[key]" type="range" min="0" max="1200" step="10" class="ss-range" />
              <span class="ss-value">{{ custom_stats[key] }}</span>
            </div>
          </div>

          <div class="field">
            <span class="field-label"><i class="fa-solid fa-tags"></i> 适性（S~G）</span>
            <div v-for="(group, gname) in apt_groups" :key="gname" class="apt-group">
              <span class="ag-name">{{ gname }}</span>
              <div class="ag-items">
                <label v-for="(val, k) in group" :key="k" class="ag-item">
                  <b>{{ k }}</b>
                  <select v-model="custom_apts[gname][k]" class="apt-select">
                    <option v-for="lv in apt_levels" :key="lv" :value="lv">{{ lv }}</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <label class="field">
            <span class="field-label"><i class="fa-solid fa-star"></i> 梦想 / 目标</span>
            <input v-model="custom_goal" class="text-input" placeholder="例如：称霸三冠" maxlength="30" />
          </label>
        </div>
      </section>

      <!-- 步骤3：确认 -->
      <section v-if="can_confirm" class="cc-step">
        <h3 class="step-title"><span class="step-no">3</span> 确认</h3>
        <button class="confirm-btn" type="button" :disabled="!can_confirm" @click="confirm">
          <i class="fa-solid fa-pen-nib"></i> 完成创建并写入档案
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { useDataStore } from './store';

const store = useDataStore();

const is_trainer = computed(() => store.data.系统.当前视角 === '训练员');

const title_text = computed(() => (is_trainer.value ? '担当契约书' : '梦想起跑线'));
const subtitle_text = computed(() =>
  is_trainer.value ? '决定你要签约的担当赛马娘' : '设定你自身的形象与梦想',
);
const step1_label = computed(() => (is_trainer.value ? ' 选择担当类型' : ' 选择自身类型'));
const step2_label = computed(() => (is_trainer.value ? ' 配置担当' : ' 配置自身'));

/* ---------- 原作角色数据（与图鉴一致的精选版） ---------- */
interface OriginChar {
  name: string;
  tag: string;
  personality: string;
  goal: string;
  stats: Record<string, number>; // 5★ 数值（界面显示 ×6）
  apt: Record<string, string>; // 适性扁平展示
  skills: string[]; // 初始技能
  unique: string; // 3星固有技能
}

const original_chars: OriginChar[] = [
  { name: '特别周', tag: '日本第一', personality: '纯洁努力的少女，把训练员当恩人', goal: '成为日本第一的赛马娘', stats: { 速度: 102, 耐力: 108, 力量: 120, 毅力: 110, 智慧: 110 }, apt: { 草地: 'A', 泥地: 'G', 短距离: 'F', 英里: 'C', 中距离: 'A', 长距离: 'A', 逃: 'G', 先行: 'A', 差: 'A', 追: 'C' }, skills: ['末脚', '营养补给', '誓不罢休'] , unique: '流星 Shooting star' },
  { name: '无声铃鹿', tag: '音速的疾驰', personality: '以音速为目标的安静女孩，外冷内热', goal: '领先位置不会让给任何人', stats: { 速度: 124, 耐力: 102, 力量: 94, 毅力: 122, 智慧: 108 }, apt: { 草地: 'A', 泥地: 'G', 短距离: 'D', 英里: 'A', 中距离: 'A', 长距离: 'E', 逃: 'A', 先行: 'C', 差: 'E', 追: 'G' }, skills: ['集中力', '一逃到底', '前途无量'] , unique: '最前端的风景…不会让给任何人！' },
  { name: '东海帝王', tag: '无败的梦想家', personality: '天真烂漫、不服输的少女，怕寂寞', goal: '无败的三冠赛马娘', stats: { 速度: 109, 耐力: 109, 力量: 102, 毅力: 112, 智慧: 118 }, apt: { 草地: 'A', 泥地: 'G', 短距离: 'F', 英里: 'E', 中距离: 'A', 长距离: 'B', 逃: 'D', 先行: 'A', 差: 'C', 追: 'E' }, skills: ['距离感', '闪电步伐', '轻巧舞步'] , unique: '究极帝王舞步' },
  { name: '丸善斯基', tag: '异次元的超级跑车', personality: '昭和复古大姐姐，自信华丽', goal: '异次元般的奔跑', stats: { 速度: 118, 耐力: 84, 力量: 105, 毅力: 122, 智慧: 121 }, apt: { 草地: 'A', 泥地: 'D', 短距离: 'B', 英里: 'A', 中距离: 'B', 长距离: 'C', 逃: 'A', 先行: 'E', 差: 'G', 追: 'G' }, skills: ['直线巧者', '变速', '先驱'] , unique: '红焰齿轮/LP1211-M' },
  { name: '目白麦昆', tag: '名门之至宝', personality: '优雅专一的名门大小姐，责任感重', goal: '目白家夙愿的天皇赏制霸', stats: { 速度: 87, 耐力: 136, 力量: 87, 毅力: 125, 智慧: 115 }, apt: { 草地: 'A', 泥地: 'E', 短距离: 'G', 英里: 'F', 中距离: 'A', 长距离: 'A', 逃: 'B', 先行: 'A', 差: 'D', 追: 'F' }, skills: ['春马娘○', '保持体力', '保持领先'] , unique: '显贵的使命仍需完成' },
  { name: '黄金船', tag: '黄金的电波', personality: '粗暴奔放的天才，爱恶作剧，大赛爆发', goal: '无论何处都要寻找有趣的东西', stats: { 速度: 106, 耐力: 124, 力量: 129, 毅力: 99, 智慧: 92 }, apt: { 草地: 'A', 泥地: 'G', 短距离: 'G', 英里: 'C', 中距离: 'A', 长距离: 'A', 逃: 'G', 先行: 'B', 差: 'B', 追: 'A' }, skills: ['小心波澜炮！', '追击', '看穿'] , unique: '不沉之舰，拔锚起航！' },
  { name: '伏特加', tag: '驰骋的青春', personality: '比谁都帅的纯情不良少女，重情义', goal: '成为比谁都帅的赛马娘', stats: { 速度: 124, 耐力: 79, 力量: 136, 毅力: 97, 智慧: 114 }, apt: { 草地: 'A', 泥地: 'G', 短距离: 'F', 英里: 'A', 中距离: 'A', 长距离: 'F', 逃: 'C', 先行: 'B', 差: 'A', 追: 'F' }, skills: ['直线回复', '超越姿态', '上升气流'] , unique: '切割×驱动! CUTTING×DRIVE！' },
  { name: '大树快车', tag: '快乐的疾风', personality: '在美利坚出生的元气少女，带来快乐', goal: '强有力的奔跑给大家带来快乐', stats: { 速度: 118, 耐力: 87, 力量: 119, 毅力: 113, 智慧: 113 }, apt: { 草地: 'A', 泥地: 'B', 短距离: 'A', 英里: 'A', 中距离: 'E', 长距离: 'G', 逃: 'C', 先行: 'A', 差: 'E', 追: 'G' }, skills: ['胜利射击', '直线巧者', '变速'] , unique: '胜利射击；victory shot' },
  { name: '小栗帽', tag: '地方的梦想', personality: '朴素单纯的梦想家，报答故乡', goal: '让故乡支持我的大家高兴', stats: { 速度: 124, 耐力: 81, 力量: 130, 毅力: 103, 智慧: 112 }, apt: { 草地: 'A', 泥地: 'B', 短距离: 'E', 英里: 'A', 中距离: 'A', 长距离: 'B', 逃: 'F', 先行: 'A', 差: 'A', 追: 'D' }, skills: ['末脚', '弯道加速○', '营养补给'] , unique: '胜利的鼓动' },
  { name: '神鹰', tag: '北美怪鸟', personality: '活泼奇特的变奏曲，以世界为目标', goal: '以世界为目标飞起来', stats: { 速度: 110, 耐力: 98, 力量: 103, 毅力: 121, 智慧: 118 }, apt: { 草地: 'A', 泥地: 'B', 短距离: 'F', 英里: 'A', 中距离: 'A', 长距离: 'B', 逃: 'E', 先行: 'A', 差: 'A', 追: 'C' }, skills: ['直线巧者', '鹰眼', '先行直线○'] , unique: '胜利者☆飞扑 Plancha☆ganador' },
  { name: '好歌剧', tag: '歌剧之王', personality: '华丽的霸王，自信到自负', goal: '最强最美丽的霸王', stats: { 速度: 91, 耐力: 132, 力量: 91, 毅力: 125, 智慧: 111 }, apt: { 草地: 'A', 泥地: 'E', 短距离: 'G', 英里: 'E', 中距离: 'A', 长距离: 'A', 逃: 'C', 先行: 'A', 差: 'A', 追: 'G' }, skills: ['准备突围', '加快节奏', '非根干距离○'] , unique: '献给维多利亚的舞蹈' },
  { name: '成田白仁', tag: '硬派独行者', personality: '多行少言，只求干脆利落地取胜', goal: '只需要奔跑然后取胜', stats: { 速度: 113, 耐力: 109, 力量: 122, 毅力: 108, 智慧: 98 }, apt: { 草地: 'A', 泥地: 'G', 短距离: 'F', 英里: 'B', 中距离: 'A', 长距离: 'A', 逃: 'G', 先行: 'A', 差: 'A', 追: 'D' }, skills: ['直线巧者', '好位追走', '中距离直线○'] , unique: 'Shadow Break 打破阴影' },
  { name: '鲁道夫象征', tag: '君临的皇帝', personality: '威严的皇帝，引导所有赛马娘', goal: '立于所有赛马娘顶点', stats: { 速度: 106, 耐力: 111, 力量: 101, 毅力: 118, 智慧: 114 }, apt: { 草地: 'A', 泥地: 'G', 短距离: 'E', 英里: 'C', 中距离: 'A', 长距离: 'A', 逃: 'B', 先行: 'A', 差: 'A', 追: 'C' }, skills: ['弯道巧者○', '束缚', '好位追走'] , unique: '汝等，瞻仰皇帝之神威吧' },
  { name: '气槽', tag: '冷酷的女帝', personality: '才貌双全的冷酷女帝', goal: '以「女帝」之姿指导大家', stats: { 速度: 111, 耐力: 105, 力量: 105, 毅力: 112, 智慧: 117 }, apt: { 草地: 'A', 泥地: 'G', 短距离: 'C', 英里: 'B', 中距离: 'A', 长距离: 'E', 逃: 'D', 先行: 'A', 差: 'A', 追: 'G' }, skills: ['随机应变', '加快节奏', '干扰'] , unique: '自尊之炎 Blazes of pride' },
  { name: '米浴', tag: '改变命运的少女', personality: '自认不幸的坚强少女，拼尽一切', goal: '改变自己会带来不幸的命运', stats: { 速度: 87, 耐力: 143, 力量: 86, 毅力: 125, 智慧: 109 }, apt: { 草地: 'A', 泥地: 'G', 短距离: 'E', 英里: 'C', 中距离: 'A', 长距离: 'A', 逃: 'B', 先行: 'A', 差: 'C', 追: 'G' }, skills: ['先行牵制', '直滑降', '深呼吸'] , unique: '蓝蔷薇追猎者 Blue rose chaser' },
  { name: '青云天空', tag: '云朵的胜负师', personality: '随性悠闲的云朵系少女，藏着胜负心', goal: '像漂游的云一样自由地赢', stats: { 速度: 120, 耐力: 120, 力量: 108, 毅力: 101, 智慧: 101 }, apt: { 草地: 'A', 泥地: 'G', 短距离: 'G', 英里: 'C', 中距离: 'A', 长距离: 'A', 逃: 'A', 先行: 'B', 差: 'D', 追: 'E' }, skills: ['疾步', '先行彷徨', '保持领先'] , unique: '愿者上钩' },
  { name: '美浦波旁', tag: '赛博格赛马娘', personality: '绝对严守指示的赛博格，目标三冠', goal: '成为三冠赛马娘', stats: { 速度: 117, 耐力: 88, 力量: 112, 毅力: 124, 智慧: 109 }, apt: { 草地: 'A', 泥地: 'G', 短距离: 'C', 英里: 'B', 中距离: 'A', 长距离: 'B', 逃: 'A', 先行: 'E', 差: 'G', 追: 'G' }, skills: ['雨天○', '先驱', '前途无量'] , unique: 'G00 1st.F∞;' },
  { name: '醒目飞鹰', tag: '偶像马娘', personality: '未来的顶级偶像，最爱粉丝互动', goal: '成为偶像马娘', stats: { 速度: 115, 耐力: 104, 力量: 104, 毅力: 122, 智慧: 105 }, apt: { 草地: 'E', 泥地: 'A', 短距离: 'B', 英里: 'A', 中距离: 'A', 长距离: 'E', 逃: 'A', 先行: 'D', 差: 'G', 追: 'G' }, skills: ['距离感', '领放的诀窍○', '安利'] , unique: '闪耀☆明星' },
  { name: '春乌拉拉', tag: '百折不挠', personality: '连败也不气馁的元气少女，最爱跑步', goal: '以第一名为目标继续努力', stats: { 速度: 115, 耐力: 79, 力量: 123, 毅力: 119, 智慧: 114 }, apt: { 草地: 'G', 泥地: 'A', 短距离: 'A', 英里: 'B', 中距离: 'G', 长距离: 'G', 逃: 'G', 先行: 'G', 差: 'A', 追: 'B' }, skills: ['隐身蓑衣', '短距齿轮', '十万马力'] , unique: '满怀期待地迎接顶点吧' },
];

/* ---------- 类型选项 ---------- */
const type_options = computed(() => {
  const base = [
    { id: 'original', icon: 'fa-solid fa-crown', label: '原作角色', desc: '继承历代名马之魂，套用真实面板' },
    { id: 'custom', icon: 'fa-solid fa-pen-nib', label: '自定义角色', desc: '自由设定姓名、五维与适性' },
  ];
  if (is_trainer.value) {
    base.push({ id: 'none', icon: 'fa-solid fa-user-clock', label: '暂不指定', desc: '由学园指派未来的担当' });
  }
  return base;
});

const selected_type = ref<'original' | 'custom' | 'none'>('custom');

/* ---------- 原作选择 ---------- */
const origin_selected = ref('');
const origin_obj = computed(() => original_chars.find(c => c.name === origin_selected.value));

function pickOriginal(ch: OriginChar) {
  origin_selected.value = ch.name;
}

/* ---------- 自定义表单 ---------- */
const stat_keys = ['速度', '耐力', '力量', '毅力', '智慧'];
const stat_labels: Record<string, string> = { 速度: '速度', 耐力: '耐力', 力量: '力量', 毅力: '毅力', 智慧: '智慧' };
const custom_name = ref('');
const custom_goal = ref('');
const custom_stats = reactive<Record<string, number>>({ 速度: 400, 耐力: 300, 力量: 350, 毅力: 300, 智慧: 350 });

const apt_levels = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
const apt_groups: Record<string, Record<string, string>> = {
  场地: { 草地: 'A', 泥地: 'C' },
  距离: { 短距离: 'C', 英里: 'B', 中距离: 'A', 长距离: 'B' },
  脚质: { 逃: 'C', 先行: 'A', 差: 'B', 追: 'C' },
};
const custom_apts = reactive<Record<string, Record<string, string>>>({
  场地: { ...apt_groups.场地 },
  距离: { ...apt_groups.距离 },
  脚质: { ...apt_groups.脚质 },
});

/* ---------- 确认可用性 ---------- */
const can_confirm = computed(() => {
  if (selected_type.value === 'none') return true;
  if (selected_type.value === 'original') return !!origin_selected.value;
  return custom_name.value.trim().length > 0;
});

/* ---------- 写入变量 ---------- */
const done = ref(false);
const done_name = ref('');
const done_type = ref('');
const done_source = ref('');
const done_stats = ref('');
const done_goal = ref('');

function confirm() {
  const s = store.data;
  s.系统.开局身份 = s.系统.当前视角;
  s.系统.当前阶段 = '开局选择';

  if (selected_type.value === 'none') {
    s.系统.担当类型 = '无';
    s.主角.姓名 = '';
    s.主角.是否原作 = false;
    s.主角.原作来源 = '';
    done_name.value = '（由学园指派）';
    done_type.value = '暂不指定';
    done_source.value = '';
    done_stats.value = '—';
    done_goal.value = '等待你的担当';
  } else if (selected_type.value === 'original' && origin_obj.value) {
    const o = origin_obj.value;
    s.系统.担当类型 = '原作角色';
    s.主角.姓名 = o.name;
    s.主角.是否原作 = true;
    s.主角.原作来源 = o.name;
    s.主角.五维 = {
      速度: o.stats.速度 * 6,
      耐力: o.stats.耐力 * 6,
      力量: o.stats.力量 * 6,
      毅力: o.stats.毅力 * 6,
      智慧: o.stats.智慧 * 6,
    };
    s.主角.资质 = {
      场地适性: { 草地: o.apt.草地, 泥地: o.apt.泥地 },
      距离适性: { 短距离: o.apt.短距离, 英里: o.apt.英里, 中距离: o.apt.中距离, 长距离: o.apt.长距离 },
      脚质适性: { 逃: o.apt.逃, 先行: o.apt.先行, 差: o.apt.差, 追: o.apt.追 },
    };
    const skills: Record<string, { 掌握度: number }> = {};
    for (const sk of o.skills) {
      skills[sk] = { 掌握度: Math.min(100, Math.round(s.主角.五维.智慧 / 10)) };
    }
    // 固有技能（3星固有）一并写入，掌握度满（100）
    if (o.unique) {
      skills[o.unique] = { 掌握度: 100 };
    }
    s.主角.技能 = skills;
    done_name.value = o.name;
    done_type.value = '原作角色';
    done_source.value = o.name;
    done_stats.value = `${s.主角.五维.速度}/${s.主角.五维.耐力}/${s.主角.五维.力量}/${s.主角.五维.毅力}/${s.主角.五维.智慧}`;
    done_goal.value = o.goal;
  } else {
    s.系统.担当类型 = '自定义';
    s.主角.姓名 = custom_name.value.trim();
    s.主角.是否原作 = false;
    s.主角.原作来源 = '';
    s.主角.五维 = {
      速度: custom_stats.速度,
      耐力: custom_stats.耐力,
      力量: custom_stats.力量,
      毅力: custom_stats.毅力,
      智慧: custom_stats.智慧,
    };
    s.主角.资质 = {
      场地适性: { ...custom_apts.场地 },
      距离适性: { ...custom_apts.距离 },
      脚质适性: { ...custom_apts.脚质 },
    };
    s.主角.技能 = {};
    done_name.value = s.主角.姓名;
    done_type.value = '自定义角色';
    done_source.value = '';
    done_stats.value = `${s.主角.五维.速度}/${s.主角.五维.耐力}/${s.主角.五维.力量}/${s.主角.五维.毅力}/${s.主角.五维.智慧}`;
    done_goal.value = custom_goal.value.trim() || '未设定';
  }

  // 通用初始化
  s.主角.等级 = 1;
  s.主角.经验值 = 0;
  s.主角.体力 = 100;
  s.主角.干劲 = 50;
  s.主角.粉丝数 = 0;
  s.主角.状态 = '正常';
  s.主角.羁绊 = 0;
  s.赛事.名称 = '';
  s.赛事.结果 = '未出赛';
  s.赛事.节点 = 0;

  done.value = true;
}

/* ---------- 发送叙事开场白（作为玩家消息） ---------- */
const sent = ref(false);
const narrative = computed(() => {
  const name = store.data.主角.姓名 || '我';
  if (is_trainer.value) {
    return `四月，特雷森学园。樱花在中央大道两侧落成浅粉色的地毯，空气里飘着青草与泥土的味道。

我推开了事务所的门。窗边的办公桌上摊着一份《担当契约书》，签字栏还空着——今天，我将迎来作为训练员的第一个重要决定。

「……你就是我的训练员？」面前的赛马娘打量着我，眼神里既有戒备，又藏着期待。${name}——从这一刻起，我们成为了签约搭档。我会带着你，一起跑向最高的舞台。`;
  }
  return `四月，特雷森学园。我的蹄铁在柏油路上敲出清脆的声响，风从耳边掠过，带着青草与泥土的香气。

今天是我作为赛马娘入学特雷森的第一天。站在大门口，我按住自己的左胸——那里跳动的，是继承自名马之魂的血液。我来这里，是为了三冠，那个只属于最顶尖赛马娘的荣誉。

「我是你的训练员。」面前的男人语气平淡却莫名让人安心，「先说说看——你的梦想，是什么？」

我深吸一口气，说出了我的名字：${name}。从这一刻起，我们成为了搭档。我会和训练员一起，向着最高的舞台奔跑。`;
});

function sendNarrative() {
  if (sent.value) return;
  try {
    const name = is_trainer.value ? (store.data.主角.姓名 || '训练员') : '玩家';
    SillyTavern.addOneMessage({
      name,
      is_user: true,
      is_system: false,
      mes: narrative.value,
    });
    SillyTavern.generate();
    sent.value = true;
  } catch (e) {
    console.error('发送开场白失败', e);
    alert('发送失败：请复制上方开场白手动发送');
  }
}
</script>

<style lang="scss" scoped>
.cc-card {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  background: var(--c-surface);
  border: 2px solid var(--c-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(43, 45, 66, 0.15);
  font-size: 14px;
}

.cc-header {
  padding: 16px 18px;
  background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%);
  color: #fff;
}

.cc-view {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.75rem;
  margin-bottom: 8px;
  i { margin-right: 4px; }
}

.cc-title {
  font-size: 1.25rem;
  font-weight: 800;
}

.cc-sub {
  font-size: 0.8rem;
  opacity: 0.9;
}

.cc-body {
  padding: 14px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cc-step {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--c-primary-dark);
}

.step-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: var(--c-primary);
  color: #fff;
  border-radius: 50%;
  font-size: 0.75rem;
  margin-right: 6px;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.type-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 2px solid var(--c-border);
  border-radius: 10px;
  background: var(--c-surface-alt);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.2s;

  i { font-size: 1.2rem; color: var(--c-muted); }
  b { font-size: 0.95rem; color: var(--c-ink); }
  span { font-size: 0.72rem; color: var(--c-muted); }

  &:hover { border-color: var(--c-primary); }
  &.active {
    border-color: var(--c-primary);
    background: #e8f5ee;
    i { color: var(--c-primary); }
  }
}

.origin-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.origin-chip {
  padding: 5px 12px;
  border: 1.5px solid var(--c-border);
  border-radius: 16px;
  background: var(--c-surface-alt);
  font-size: 0.8rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover { border-color: var(--c-gold); }
  &.active {
    background: var(--c-gold);
    border-color: var(--c-gold);
    color: #fff;
    font-weight: 700;
  }
}

.origin-hint {
  font-size: 0.8rem;
  color: var(--c-muted);
  font-style: italic;
}

.origin-preview {
  border: 1.5px solid var(--c-border);
  border-radius: 10px;
  padding: 12px;
  background: var(--c-surface-alt);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-head {
  display: flex;
  align-items: center;
  gap: 8px;
  strong { font-size: 1.05rem; }
}

.preview-tag {
  background: var(--c-primary);
  color: #fff;
  font-size: 0.68rem;
  padding: 2px 8px;
  border-radius: 10px;
}

.preview-desc {
  font-size: 0.8rem;
  color: var(--c-ink);
}

.preview-goal {
  font-size: 0.8rem;
  color: var(--c-gold);
  font-weight: 700;
  i { margin-right: 4px; }
}

.preview-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ps-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 4px 10px;
  b { font-size: 0.68rem; color: var(--c-muted); }
  em { font-style: normal; font-weight: 800; font-family: var(--font-num); font-size: 0.9rem; }
}

.preview-apt {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.pa-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  padding: 2px 7px;
  background: #fff;
  font-size: 0.7rem;
  b { color: var(--c-muted); font-weight: 600; }
  em { font-style: normal; font-weight: 800; font-family: var(--font-num); color: var(--c-primary-dark); }
}

.preview-skills {
  font-size: 0.75rem;
  color: var(--c-muted);
  i { margin-right: 4px; color: var(--c-warning); }
  .sk {
    font-style: normal;
    background: #fff;
    border: 1px solid var(--c-border);
    border-radius: 6px;
    padding: 1px 7px;
    margin-right: 4px;
    &.unique {
      background: linear-gradient(135deg, #fff8e1, #ffe9b3);
      border-color: var(--c-warning);
      color: #8a6d00;
      font-weight: 700;
    }
  }
}

.custom-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--c-primary-dark);
  i { margin-right: 4px; }
}

.text-input {
  border: 1.5px solid var(--c-border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.95rem;
  font-family: inherit;
  background: #fff;
  color: var(--c-ink);
  &:focus { outline: 2px solid var(--c-primary); border-color: transparent; }
}

.stat-slider {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ss-name {
  width: 44px;
  font-size: 0.8rem;
  font-weight: 700;
}

.ss-range {
  flex: 1;
  accent-color: var(--c-primary);
}

.ss-value {
  width: 44px;
  text-align: right;
  font-family: var(--font-num);
  font-weight: 700;
  font-size: 0.85rem;
}

.apt-group {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 6px;
}

.ag-name {
  width: 44px;
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--c-muted);
  padding-top: 3px;
}

.ag-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.ag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  padding: 3px 6px;
  background: #fff;
  b { font-size: 0.7rem; color: var(--c-muted); }
}

.apt-select {
  border: none;
  background: var(--c-surface-alt);
  font-family: var(--font-num);
  font-weight: 800;
  color: var(--c-primary-dark);
  font-size: 0.8rem;
  padding: 1px 2px;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--c-primary), var(--c-primary-dark));
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 3px 10px rgba(46, 139, 87, 0.3);

  &:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.cc-done {
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.done-check {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--c-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.cc-done h3 {
  font-size: 1.2rem;
  color: var(--c-primary-dark);
}

.done-summary {
  width: 100%;
  max-width: 420px;
  border: 1.5px solid var(--c-border);
  border-radius: 10px;
  padding: 12px 16px;
  background: var(--c-surface-alt);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.done-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  span { color: var(--c-muted); }
  strong { color: var(--c-ink); font-family: var(--font-num); }
}

.done-tip {
  font-size: 0.8rem;
  color: var(--c-muted);
  i { color: var(--c-warning); margin-right: 4px; }
}

.narrative-box {
  width: 100%;
  max-width: 440px;
  border: 1.5px solid var(--c-border);
  border-radius: 10px;
  background: var(--c-surface-alt);
  padding: 10px 14px;
  text-align: left;
}

.narrative-head {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--c-primary-dark);
  margin-bottom: 6px;
  i { margin-right: 4px; }
}

.narrative-text {
  font-size: 0.82rem;
  color: var(--c-ink);
  line-height: 1.7;
  white-space: pre-wrap;
  max-height: 220px;
  overflow-y: auto;
}

.sent-tip {
  font-size: 0.85rem;
  color: var(--c-primary-dark);
  font-weight: 700;
  i { margin-right: 5px; }
}

@media (max-width: 560px) {
  .type-grid { grid-template-columns: 1fr; }
  .stat-slider { flex-wrap: wrap; }
}
</style>
