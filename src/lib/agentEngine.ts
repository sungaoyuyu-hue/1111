import {
  employees,
  intentDefinitions,
  type Employee,
  type IntentDefinition,
  type IntentKey,
  type Priority
} from "../data/demoData";

export type { Employee, IntentDefinition, IntentKey, Priority };

export interface AgentTraceStep {
  id: string;
  agent: string;
  detail: string;
  status: "done" | "pending";
}

export interface CandidateMatch {
  employee: Employee;
  score: number;
  reasons: string[];
}

export interface HandoffTask {
  id: string;
  title: string;
  requesterId: string;
  assigneeId: string;
  intentId: IntentKey;
  priority: Priority;
  status: "sent" | "needs_clarification";
  summary: string;
  createdAt: string;
}

export interface HandoffMessage {
  id: string;
  channel: "work_wechat";
  to: string;
  title: string;
  body: string;
}

export interface PublicNotice {
  id: string;
  channel: "official_account";
  to: string;
  title: string;
  body: string;
  actionUrl: string;
}

export interface RouteResult {
  id: string;
  input: string;
  requester: Employee;
  assignee: Employee;
  intent: {
    id: IntentKey;
    name: string;
    category: string;
  };
  confidence: number;
  matchedReasons: string[];
  candidates: CandidateMatch[];
  task: HandoffTask;
  workMessage: HandoffMessage;
  publicNotice: PublicNotice;
  trace: AgentTraceStep[];
  needsClarification: boolean;
  clarificationQuestion: string;
  createdAt: string;
}

const unknownIntent: IntentDefinition = {
  id: "unknown",
  name: "待澄清",
  category: "人工分派",
  keywords: [],
  ownerSkills: ["教师协调", "顾问协同", "校区值班"],
  clarificationQuestion: "请补充你想处理的事项类型、涉及对象和期望完成时间。"
};

const urgentWords = ["紧急", "马上", "尽快", "今晚", "今天", "明天", "课前", "投诉", "坏了", "客户来了"];

const makeId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const includes = (input: string, keyword: string) => input.toLowerCase().includes(keyword.toLowerCase());

function getRequester(requesterId: string) {
  return employees.find((employee) => employee.id === requesterId) ?? employees[0];
}

function detectIntent(input: string) {
  const ranked = intentDefinitions
    .map((definition) => {
      const hits = definition.keywords.filter((keyword) => includes(input, keyword));
      const score = hits.reduce((total, keyword) => total + Math.max(6, keyword.length * 2), 0);
      return { definition, hits, score };
    })
    .sort((left, right) => right.score - left.score);

  const best = ranked[0];

  if (!best || best.score === 0) {
    return {
      definition: unknownIntent,
      hits: [],
      confidence: 0.26
    };
  }

  const secondScore = ranked[1]?.score ?? 0;
  const separation = Math.max(0, best.score - secondScore);
  const confidence = Math.min(0.96, 0.52 + best.score / 90 + separation / 120);

  return {
    definition: best.definition,
    hits: best.hits,
    confidence: Number(confidence.toFixed(2))
  };
}

function detectPriority(input: string): Priority {
  const urgent = urgentWords.some((word) => includes(input, word));
  if (urgent && (includes(input, "投诉") || includes(input, "今晚") || includes(input, "课前"))) {
    return "urgent";
  }
  return urgent ? "high" : "normal";
}

function hasContext(input: string, intentId: IntentKey) {
  if (intentId === "unknown") return false;
  if (input.trim().length < 8) return false;

  const hasTime = /(今天|今晚|明天|后天|下周|周[一二三四五六日天]|上午|下午|晚上|\d{1,2}[点:：])/.test(input);
  const hasPersonOrObject = /(家长|妈妈|爸爸|学生|老师|客户|名单|班|校区|教室|发票|退款|账号|系统|试卷|海报)/.test(input);

  if (["classroom_facility", "system_permission", "invoice_refund", "parent_complaint"].includes(intentId)) {
    return hasPersonOrObject;
  }

  if (["trial_lesson", "schedule_adjustment", "teaching_research"].includes(intentId)) {
    return hasPersonOrObject || hasTime;
  }

  return true;
}

function rankEmployees(input: string, intent: IntentDefinition, requester: Employee): CandidateMatch[] {
  const intentSkillSet = new Set(intent.ownerSkills);
  const priority = detectPriority(input);

  return employees
    .filter((employee) => employee.id !== requester.id)
    .map((employee) => {
      const skillHits = employee.skills.filter((skill) => intentSkillSet.has(skill));
      const campusHits = employee.campus.filter((campus) => includes(input, campus));
      const reasons: string[] = [];
      let score = 0;

      if (skillHits.length > 0) {
        score += skillHits.length * 28;
        reasons.push(`能力匹配：${skillHits.slice(0, 2).join("、")}`);
      }

      if (campusHits.length > 0) {
        score += 10;
        reasons.push(`校区匹配：${campusHits[0]}`);
      }

      if (employee.available) {
        score += 12;
        reasons.push("当前可接单");
      } else {
        score -= 18;
        reasons.push("当前不可用，已降权");
      }

      const workloadScore = Math.max(0, 12 - employee.workload * 2);
      score += workloadScore;
      reasons.push(`负载${employee.workload}/5`);

      if (priority !== "normal" && employee.responseMinutes <= 20) {
        score += 8;
        reasons.push(`响应约${employee.responseMinutes}分钟`);
      }

      return { employee, score, reasons };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);
}

function buildClarification(input: string, intent: IntentDefinition, confidence: number) {
  if (intent.id === "unknown" || confidence < 0.5) {
    return "我还没判断出这是教务、销售、学管、财务、市场、运营还是系统问题。请补充事项类型和期望完成时间。";
  }

  if (!hasContext(input, intent.id)) {
    return intent.clarificationQuestion;
  }

  return "";
}

function createTask(
  input: string,
  requester: Employee,
  assignee: Employee,
  intent: IntentDefinition,
  priority: Priority,
  needsClarification: boolean
): HandoffTask {
  return {
    id: makeId("TASK"),
    title: `${intent.name}：${input.slice(0, 24)}${input.length > 24 ? "..." : ""}`,
    requesterId: requester.id,
    assigneeId: assignee.id,
    intentId: intent.id,
    priority,
    status: needsClarification ? "needs_clarification" : "sent",
    summary: `${requester.name}发起：${input}`,
    createdAt: new Date().toISOString()
  };
}

function createWorkMessage(input: string, requester: Employee, assignee: Employee, task: HandoffTask): HandoffMessage {
  const priorityText: Record<Priority, string> = {
    normal: "普通",
    high: "高优先级",
    urgent: "紧急"
  };

  return {
    id: makeId("MSG"),
    channel: "work_wechat",
    to: assignee.wechatId,
    title: "新的智能对接任务",
    body: `${requester.name}需要你对接：${input}。优先级：${priorityText[task.priority]}，任务号：${task.id}。`
  };
}

function createPublicNotice(assignee: Employee, task: HandoffTask): PublicNotice {
  const statusText = task.status === "needs_clarification" ? "待补充" : "待接单";

  return {
    id: makeId("OA"),
    channel: "official_account",
    to: assignee.officialOpenId,
    title: "公众号提醒：新的对接任务",
    body: `${task.title}，状态：${statusText}，请进入小程序处理。`,
    actionUrl: `/mini/task/${task.id}`
  };
}

export function routeRequest(input: string, requesterId: string): RouteResult {
  const trimmed = input.trim();
  const requester = getRequester(requesterId);
  const createdAt = new Date().toISOString();

  const intentResult = detectIntent(trimmed);
  const candidates = rankEmployees(trimmed, intentResult.definition, requester);
  const fallbackAssignee = employees.find((employee) => employee.id === "academic-linshan") ?? employees[0];
  const assignee = candidates[0]?.employee ?? fallbackAssignee;
  const clarificationQuestion = buildClarification(trimmed, intentResult.definition, intentResult.confidence);
  const needsClarification = Boolean(clarificationQuestion);
  const priority = detectPriority(trimmed);
  const task = createTask(trimmed, requester, assignee, intentResult.definition, priority, needsClarification);
  const workMessage = createWorkMessage(trimmed, requester, assignee, task);
  const publicNotice = createPublicNotice(assignee, task);

  const trace: AgentTraceStep[] = [
    {
      id: "trace-personal",
      agent: requester.agentName,
      detail: `收到一句话需求，提取原文并确认发起人是${requester.department}${requester.name}。`,
      status: "done"
    },
    {
      id: "trace-intent",
      agent: "意图识别 Agent",
      detail:
        intentResult.definition.id === "unknown"
          ? "未命中稳定业务关键词，转入澄清流程。"
          : `识别为「${intentResult.definition.name}」，命中关键词：${intentResult.hits.join("、")}。`,
      status: "done"
    },
    {
      id: "trace-directory",
      agent: "组织能力 Agent",
      detail: `检索员工能力、校区、可用性和负载，首选${assignee.name}（${assignee.role}）。`,
      status: "done"
    },
    {
      id: "trace-dispatch",
      agent: "派单 Agent",
      detail: needsClarification
        ? `信息不足，先生成待澄清任务：${clarificationQuestion}`
        : `生成任务${task.id}，并模拟发送企业微信工作消息。`,
      status: "done"
    },
    {
      id: "trace-notice",
      agent: "公众号提醒 Agent",
      detail: `生成公众号模板提醒，接收人：${assignee.name}，入口：${publicNotice.actionUrl}。`,
      status: "done"
    }
  ];

  return {
    id: makeId("ROUTE"),
    input: trimmed,
    requester,
    assignee,
    intent: {
      id: intentResult.definition.id,
      name: intentResult.definition.name,
      category: intentResult.definition.category
    },
    confidence: intentResult.confidence,
    matchedReasons: candidates[0]?.reasons ?? ["需要人工确认"],
    candidates,
    task,
    workMessage,
    publicNotice,
    trace,
    needsClarification,
    clarificationQuestion,
    createdAt
  };
}
