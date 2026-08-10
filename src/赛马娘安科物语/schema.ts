// MVU 变量结构脚本（Zod v4）。禁止任何 import 语句；z / _ 已由运行时全局注入。
// 赛马娘安科物语 —— 双重视角安科养成游戏变量结构。

export const Schema = z.object({
  系统: z.object({
    当前阶段: z.enum(['开局选择', '养成', '赛前', '比赛', '结算']).prefault('开局选择'),
    当前视角: z.enum(['训练员', '马娘']).prefault('训练员'),
    开局身份: z.enum(['训练员', '马娘']).prefault('训练员'),
    担当类型: z.enum(['原作角色', '自定义', '无']).prefault('自定义'),
    周期: z.coerce.number().transform(v => _.clamp(v, 1, 999)).prefault(1),
    日期: z.string().prefault(''),
    当前赛事: z.string().prefault(''),
  }).prefault({}),

  主角: z.object({
    姓名: z.string().prefault(''),
    是否原作: z.boolean().prefault(false),
    原作来源: z.string().prefault(''),
    等级: z.coerce.number().transform(v => _.clamp(v, 1, 30)).prefault(1),
    经验值: z.coerce.number().transform(v => _.clamp(v, 0, 9999)).prefault(0),
    五维: z.object({
      速度: z.coerce.number().transform(v => _.clamp(v, 0, 1200)).prefault(0),
      耐力: z.coerce.number().transform(v => _.clamp(v, 0, 1200)).prefault(0),
      力量: z.coerce.number().transform(v => _.clamp(v, 0, 1200)).prefault(0),
      毅力: z.coerce.number().transform(v => _.clamp(v, 0, 1200)).prefault(0),
      智慧: z.coerce.number().transform(v => _.clamp(v, 0, 1200)).prefault(0),
    }).prefault({ 速度: 0, 耐力: 0, 力量: 0, 毅力: 0, 智慧: 0 }),
    体力: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(100),
    干劲: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(50),
    粉丝数: z.coerce.number().transform(v => _.clamp(v, 0, 9999999)).prefault(0),
    状态: z.enum(['正常', '疲惫', '受伤', '低干劲']).prefault('正常'),
    羁绊: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
    资质: z.object({
      场地适性: z.object({
        草地: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('A'),
        泥地: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('C'),
      }).prefault({ 草地: 'A', 泥地: 'C' }),
      距离适性: z.object({
        短距离: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('C'),
        英里: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('B'),
        中距离: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('A'),
        长距离: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('B'),
      }).prefault({ 短距离: 'C', 英里: 'B', 中距离: 'A', 长距离: 'B' }),
      脚质适性: z.object({
        逃: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('C'),
        先行: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('A'),
        差: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('B'),
        追: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('C'),
      }).prefault({ 逃: 'C', 先行: 'A', 差: 'B', 追: 'C' }),
    }).prefault({ 场地适性: { 草地: 'A', 泥地: 'C' }, 距离适性: { 短距离: 'C', 英里: 'B', 中距离: 'A', 长距离: 'B' }, 脚质适性: { 逃: 'C', 先行: 'A', 差: 'B', 追: 'C' } }),
    技能: z.record(z.string(), z.object({
      掌握度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
    }).prefault({ 掌握度: 0 })).prefault({}),
  }).prefault({}),

  赛事: z.object({
    名称: z.string().prefault(''),
    距离类型: z.enum(['短距离', '英里', '中距离', '长距离']).prefault('中距离'),
    场地: z.enum(['草地', '泥地']).prefault('草地'),
    等级: z.enum(['未胜利', '公开赛', 'G3', 'G2', 'G1']).prefault('未胜利'),
    节点: z.coerce.number().transform(v => _.clamp(v, 0, 4)).prefault(0),
    结果: z.enum(['未出赛', '完赛', '优胜', '大败']).prefault('未出赛'),
    阶段对抗: z.object({
      前: z.coerce.number().transform(v => _.clamp(v, -999, 999)).prefault(0),
      中: z.coerce.number().transform(v => _.clamp(v, -999, 999)).prefault(0),
      后: z.coerce.number().transform(v => _.clamp(v, -999, 999)).prefault(0),
    }).prefault({ 前: 0, 中: 0, 后: 0 }),
    耐力余量: z.coerce.number().transform(v => _.clamp(v, 0, 1200)).prefault(0),
    消耗系数: z.coerce.number().transform(v => _.clamp(v, 0.5, 3)).prefault(1),
    对手: z.record(z.string(), z.object({
      五维: z.object({
        速度: z.coerce.number().transform(v => _.clamp(v, 0, 1200)).prefault(0),
        耐力: z.coerce.number().transform(v => _.clamp(v, 0, 1200)).prefault(0),
        力量: z.coerce.number().transform(v => _.clamp(v, 0, 1200)).prefault(0),
        毅力: z.coerce.number().transform(v => _.clamp(v, 0, 1200)).prefault(0),
        智慧: z.coerce.number().transform(v => _.clamp(v, 0, 1200)).prefault(0),
      }).prefault({ 速度: 0, 耐力: 0, 力量: 0, 毅力: 0, 智慧: 0 }),
      资质: z.object({
        场地适性: z.object({
          草地: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('B'),
          泥地: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('C'),
        }).prefault({ 草地: 'B', 泥地: 'C' }),
        距离适性: z.object({
          短距离: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('C'),
          英里: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('B'),
          中距离: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('B'),
          长距离: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('C'),
        }).prefault({ 短距离: 'C', 英里: 'B', 中距离: 'B', 长距离: 'C' }),
        脚质适性: z.object({
          逃: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('C'),
          先行: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('B'),
          差: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('B'),
          追: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']).prefault('C'),
        }).prefault({ 逃: 'C', 先行: 'B', 差: 'B', 追: 'C' }),
      }).prefault({ 场地适性: { 草地: 'B', 泥地: 'C' }, 距离适性: { 短距离: 'C', 英里: 'B', 中距离: 'B', 长距离: 'C' }, 脚质适性: { 逃: 'C', 先行: 'B', 差: 'B', 追: 'C' } }),
      干劲: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(50),
    }).prefault({ 五维: { 速度: 0, 耐力: 0, 力量: 0, 毅力: 0, 智慧: 0 }, 资质: { 场地适性: { 草地: 'B', 泥地: 'C' }, 距离适性: { 短距离: 'C', 英里: 'B', 中距离: 'B', 长距离: 'C' }, 脚质适性: { 逃: 'C', 先行: 'B', 差: 'B', 追: 'C' } }, 干劲: 50 })).prefault({}),
  }).prefault({}),
});

export type Schema = z.output<typeof Schema>;
