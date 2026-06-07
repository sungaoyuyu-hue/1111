export type IntentKey =
  | "trial_lesson"
  | "schedule_adjustment"
  | "lead_followup"
  | "parent_complaint"
  | "renewal_warning"
  | "invoice_refund"
  | "marketing_material"
  | "classroom_facility"
  | "teaching_research"
  | "system_permission"
  | "unknown";

export type Priority = "normal" | "high" | "urgent";

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  agentName: string;
  wechatId: string;
  officialOpenId: string;
  skills: string[];
  campus: string[];
  workload: number;
  available: boolean;
  responseMinutes: number;
}

export interface IntentDefinition {
  id: IntentKey;
  name: string;
  category: string;
  keywords: string[];
  ownerSkills: string[];
  clarificationQuestion: string;
}

export interface QuickRequest {
  id: string;
  label: string;
  text: string;
}

export const employees: Employee[] = [
  {
    id: "teacher-lina",
    name: "李娜",
    department: "初中数学组",
    role: "数学老师",
    agentName: "李娜助理",
    wechatId: "wecom-lina",
    officialOpenId: "oa-lina",
    skills: ["数学授课", "学生反馈", "试听课配合"],
    campus: ["A校区", "B校区"],
    workload: 3,
    available: true,
    responseMinutes: 15
  },
  {
    id: "academic-linshan",
    name: "林珊",
    department: "教务部",
    role: "教务主管",
    agentName: "林珊教务智能体",
    wechatId: "wecom-linshan",
    officialOpenId: "oa-linshan",
    skills: ["排课", "调课", "补课", "教师协调", "课表冲突"],
    campus: ["A校区", "B校区", "线上"],
    workload: 2,
    available: true,
    responseMinutes: 10
  },
  {
    id: "sales-wanghao",
    name: "王昊",
    department: "销售咨询部",
    role: "咨询主管",
    agentName: "王昊线索智能体",
    wechatId: "wecom-wanghao",
    officialOpenId: "oa-wanghao",
    skills: ["线索分配", "试听邀约", "客户转化", "顾问协同"],
    campus: ["A校区", "线上"],
    workload: 2,
    available: true,
    responseMinutes: 10
  },
  {
    id: "advisor-liujia",
    name: "刘佳",
    department: "销售咨询部",
    role: "课程顾问",
    agentName: "刘佳顾问智能体",
    wechatId: "wecom-liujia",
    officialOpenId: "oa-liujia",
    skills: ["试听课配合", "家长沟通", "报价说明", "报名跟进"],
    campus: ["A校区", "B校区"],
    workload: 1,
    available: true,
    responseMinutes: 12
  },
  {
    id: "student-zhaomin",
    name: "赵敏",
    department: "学管部",
    role: "学管主管",
    agentName: "赵敏学管智能体",
    wechatId: "wecom-zhaomin",
    officialOpenId: "oa-zhaomin",
    skills: ["续费预警", "家长安抚", "投诉处理", "学习反馈"],
    campus: ["A校区", "B校区", "线上"],
    workload: 2,
    available: true,
    responseMinutes: 10
  },
  {
    id: "finance-huanglu",
    name: "黄璐",
    department: "财务部",
    role: "财务主管",
    agentName: "黄璐财务智能体",
    wechatId: "wecom-huanglu",
    officialOpenId: "oa-huanglu",
    skills: ["发票", "退款", "对账", "收据", "合同金额"],
    campus: ["总部", "A校区", "B校区"],
    workload: 3,
    available: true,
    responseMinutes: 30
  },
  {
    id: "marketing-chenya",
    name: "陈雅",
    department: "市场部",
    role: "市场主管",
    agentName: "陈雅市场智能体",
    wechatId: "wecom-chenya",
    officialOpenId: "oa-chenya",
    skills: ["招生活动", "公开课", "公众号", "海报审核", "短视频"],
    campus: ["A校区", "B校区", "线上"],
    workload: 4,
    available: true,
    responseMinutes: 30
  },
  {
    id: "ops-zhengqi",
    name: "郑琦",
    department: "运营部",
    role: "校区运营",
    agentName: "郑琦运营智能体",
    wechatId: "wecom-zhengqi",
    officialOpenId: "oa-zhengqi",
    skills: ["教室", "物资", "设备保障", "校区值班", "接待"],
    campus: ["A校区", "B校区"],
    workload: 2,
    available: true,
    responseMinutes: 20
  },
  {
    id: "research-tangrui",
    name: "唐睿",
    department: "教研部",
    role: "教研负责人",
    agentName: "唐睿教研智能体",
    wechatId: "wecom-tangrui",
    officialOpenId: "oa-tangrui",
    skills: ["讲义", "试卷", "测评", "课程大纲", "公开课教案"],
    campus: ["总部", "线上"],
    workload: 2,
    available: true,
    responseMinutes: 60
  },
  {
    id: "it-mayuan",
    name: "马远",
    department: "IT/系统",
    role: "系统管理员",
    agentName: "马远系统智能体",
    wechatId: "wecom-mayuan",
    officialOpenId: "oa-mayuan",
    skills: ["账号权限", "系统报错", "数据导入", "消息规则", "网络设备"],
    campus: ["总部", "A校区", "B校区", "线上"],
    workload: 1,
    available: true,
    responseMinutes: 20
  }
];

export const intentDefinitions: IntentDefinition[] = [
  {
    id: "trial_lesson",
    name: "安排试听",
    category: "招生转化",
    keywords: ["试听", "体验课", "公开课试听", "约课", "新家长", "咨询", "报名"],
    ownerSkills: ["试听邀约", "试听课配合", "家长沟通", "报名跟进"],
    clarificationQuestion: "要安排哪个年级/科目的试听？如果有期望时间，也一起告诉我。"
  },
  {
    id: "schedule_adjustment",
    name: "调课/补课",
    category: "教务排课",
    keywords: ["调课", "补课", "换老师", "请假", "课表", "排课", "冲突", "代课"],
    ownerSkills: ["排课", "调课", "补课", "教师协调", "课表冲突"],
    clarificationQuestion: "请补充班级、科目、原上课时间和期望调整时间。"
  },
  {
    id: "lead_followup",
    name: "线索跟进",
    category: "销售咨询",
    keywords: ["线索", "名单", "跟进", "转化", "顾问", "回访", "咨询名单", "暑假班"],
    ownerSkills: ["线索分配", "客户转化", "顾问协同", "报名跟进"],
    clarificationQuestion: "请补充线索来源、人数和希望多久内完成首轮跟进。"
  },
  {
    id: "parent_complaint",
    name: "家长反馈/投诉",
    category: "学员服务",
    keywords: ["投诉", "不满意", "家长", "妈妈", "爸爸", "反馈", "情绪", "安抚", "老师问题"],
    ownerSkills: ["家长安抚", "投诉处理", "学习反馈", "学生反馈"],
    clarificationQuestion: "请告诉我是哪个学生/家长，以及主要不满意的问题。"
  },
  {
    id: "renewal_warning",
    name: "续费预警",
    category: "学管续费",
    keywords: ["续费", "课时", "快没课", "到期", "停课", "剩余", "消课", "续报"],
    ownerSkills: ["续费预警", "学习反馈", "家长沟通"],
    clarificationQuestion: "请补充班级或学生范围，我会让学管筛出需要续费提醒的名单。"
  },
  {
    id: "invoice_refund",
    name: "发票/退款",
    category: "财务",
    keywords: ["发票", "退款", "退费", "收据", "对账", "金额", "开票", "6800", "付款"],
    ownerSkills: ["发票", "退款", "对账", "收据", "合同金额"],
    clarificationQuestion: "请补充家长姓名、金额、订单或收款记录，财务会据此核对。"
  },
  {
    id: "marketing_material",
    name: "市场物料/活动",
    category: "市场招生",
    keywords: ["海报", "朋友圈", "公众号", "招生", "活动", "地推", "素材", "推文", "短视频"],
    ownerSkills: ["招生活动", "公开课", "公众号", "海报审核", "短视频"],
    clarificationQuestion: "请补充活动主题、投放渠道和希望上线时间。"
  },
  {
    id: "classroom_facility",
    name: "教室/设备保障",
    category: "校区运营",
    keywords: ["教室", "投影", "空调", "物资", "桌椅", "设备", "坏了", "校区", "接待"],
    ownerSkills: ["教室", "物资", "设备保障", "校区值班", "接待"],
    clarificationQuestion: "请补充校区、教室号和影响的上课时间。"
  },
  {
    id: "teaching_research",
    name: "教研内容",
    category: "教学教研",
    keywords: ["讲义", "试卷", "测评", "教案", "课程大纲", "讲评", "入学测试"],
    ownerSkills: ["讲义", "试卷", "测评", "课程大纲", "公开课教案"],
    clarificationQuestion: "请补充年级、科目、使用时间和需要的材料类型。"
  },
  {
    id: "system_permission",
    name: "系统/权限",
    category: "IT支持",
    keywords: ["登录", "权限", "账号", "密码", "系统", "报错", "数据导入", "导入", "网络"],
    ownerSkills: ["账号权限", "系统报错", "数据导入", "消息规则", "网络设备"],
    clarificationQuestion: "请补充系统名称、账号或报错现象，最好带上影响的操作。"
  }
];

export const quickRequests: QuickRequest[] = [
  {
    id: "quick-trial",
    label: "数学试听",
    text: "帮我安排一个初一数学试听，家长今晚能来校区"
  },
  {
    id: "quick-schedule",
    label: "紧急调课",
    text: "明天下午三点创新班数学老师请假了，帮我尽快换个老师或调课"
  },
  {
    id: "quick-parent",
    label: "家长反馈",
    text: "乐乐妈妈说最近作业反馈太少，情绪有点大，谁来处理一下"
  },
  {
    id: "quick-invoice",
    label: "开发票",
    text: "家长要开上个月的发票，金额好像是6800，麻烦财务确认下"
  },
  {
    id: "quick-device",
    label: "教室设备",
    text: "A校区302教室投影又坏了，今晚七点还有课"
  },
  {
    id: "quick-research",
    label: "入学测评",
    text: "下周一要给初一新生做入学测评，试卷和讲评模板还没准备"
  }
];
