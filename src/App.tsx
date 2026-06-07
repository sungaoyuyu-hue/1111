import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Inbox,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UsersRound,
  Workflow,
  Zap
} from "lucide-react";
import { employees, quickRequests } from "./data/demoData";
import { routeRequest, type RouteResult } from "./lib/agentEngine";

type Employee = (typeof employees)[number];

type ConversationItem = {
  id: string;
  kind: "user" | "agent";
  text: string;
  result?: RouteResult;
};

const formatConfidence = (value: number) => `${Math.round(value * 100)}%`;

const getInitials = (name: string) => name.slice(-2);

function App() {
  const [activeEmployeeId, setActiveEmployeeId] = useState(employees[0]?.id ?? "");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<RouteResult[]>([]);
  const [conversation, setConversation] = useState<ConversationItem[]>([
    {
      id: "welcome",
      kind: "agent",
      text: "我在。把工作直接说出来，我会替你找到人、发消息、同步提醒。"
    }
  ]);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  const activeEmployee = useMemo(
    () => employees.find((employee) => employee.id === activeEmployeeId) ?? employees[0],
    [activeEmployeeId]
  );

  const activeResult =
    history.find((result) => result.id === activeResultId) ?? history[0] ?? null;

  const completed = history.filter((result) => !result.needsClarification);
  const pendingClarifications = history.filter((result) => result.needsClarification);

  const submitRequest = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || isRouting || !activeEmployee) return;

    const userItem: ConversationItem = {
      id: `user-${Date.now()}`,
      kind: "user",
      text: trimmed
    };

    setConversation((items) => [...items, userItem]);
    setInput("");
    setIsRouting(true);

    window.setTimeout(() => {
      const routed = routeRequest(trimmed, activeEmployee.id);
      setHistory((items) => [routed, ...items].slice(0, 12));
      setActiveResultId(routed.id);
      setConversation((items) => [
        ...items,
        {
          id: `agent-${routed.id}`,
          kind: "agent",
          text: routed.needsClarification
            ? routed.clarificationQuestion
            : `已对接 ${routed.assignee.name}，工作消息和公众号提醒已发送。`,
          result: routed
        }
      ]);
      setIsRouting(false);
    }, 520);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitRequest(input);
  };

  return (
    <main className="app-shell">
      <section className="phone-shell" aria-label="微信小程序 Demo">
        <MiniHeader activeEmployee={activeEmployee} />
        <EmployeeSwitcher
          employees={employees}
          activeEmployeeId={activeEmployeeId}
          onChange={setActiveEmployeeId}
        />
        <div className="quick-row" aria-label="常用一句话">
          {quickRequests.slice(0, 5).map((item) => (
            <button
              className="quick-chip"
              key={item.id}
              type="button"
              onClick={() => submitRequest(item.text)}
              disabled={isRouting}
            >
              {item.label}
            </button>
          ))}
        </div>
        <ChatPane items={conversation} isRouting={isRouting} />
        <form className="composer" onSubmit={handleSubmit}>
          <input
            aria-label="一句话工作需求"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="比如：帮我安排一个数学试听"
          />
          <button className="icon-button primary" type="submit" title="发送" disabled={isRouting}>
            <Send size={20} />
          </button>
        </form>
      </section>

      <section className="workspace" aria-label="协作工作台">
        <div className="workspace-head">
          <div>
            <p className="eyebrow">AI Agent 协作中枢</p>
            <h1>一句话发起，自动找到对接人</h1>
          </div>
          <div className="live-pill">
            <span className="pulse" />
            本地模拟
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard icon={<Workflow size={18} />} label="今日对接" value={completed.length} tone="green" />
          <MetricCard
            icon={<Clock3 size={18} />}
            label="待澄清"
            value={pendingClarifications.length}
            tone="amber"
          />
          <MetricCard icon={<Bell size={18} />} label="公众号提醒" value={history.length} tone="blue" />
        </div>

        <div className="work-grid">
          <div className="panel wide">
            <PanelTitle icon={<Sparkles size={18} />} title="当前路由" />
            {activeResult ? <RouteSummary result={activeResult} /> : <EmptyState />}
          </div>
          <div className="panel">
            <PanelTitle icon={<Inbox size={18} />} title="工作消息" />
            <WorkMessages results={history} />
          </div>
          <div className="panel">
            <PanelTitle icon={<Bell size={18} />} title="公众号提醒" />
            <OfficialFeed results={history} />
          </div>
          <div className="panel wide">
            <PanelTitle icon={<Bot size={18} />} title="Agent 追踪" />
            {activeResult ? <TraceTimeline result={activeResult} /> : <EmptyTrace />}
          </div>
          <div className="panel wide">
            <PanelTitle icon={<UsersRound size={18} />} title="员工智能体" />
            <Directory employees={employees} />
          </div>
        </div>

        {history.length > 0 && (
          <div className="history-strip" aria-label="历史对接">
            {history.map((result) => (
              <button
                className={`history-item ${result.id === activeResult?.id ? "active" : ""}`}
                key={result.id}
                type="button"
                onClick={() => setActiveResultId(result.id)}
              >
                <span>{result.intent.name}</span>
                <ChevronRight size={15} />
                <strong>{result.needsClarification ? "需澄清" : result.assignee.name}</strong>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function MiniHeader({ activeEmployee }: { activeEmployee: Employee }) {
  return (
    <header className="mini-header">
      <div className="mini-title">
        <span className="mini-dot" />
        智协小程序
      </div>
      <div className="mini-user">
        <span>{activeEmployee.name}</span>
        <strong>{activeEmployee.role}</strong>
      </div>
    </header>
  );
}

function EmployeeSwitcher({
  employees: staff,
  activeEmployeeId,
  onChange
}: {
  employees: Employee[];
  activeEmployeeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="employee-switcher" aria-label="员工身份">
      {staff.slice(0, 6).map((employee) => (
        <button
          className={`employee-pill ${employee.id === activeEmployeeId ? "active" : ""}`}
          key={employee.id}
          type="button"
          onClick={() => onChange(employee.id)}
        >
          <span className="avatar">{getInitials(employee.name)}</span>
          <span>
            <strong>{employee.name}</strong>
            <small>{employee.department}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

function ChatPane({ items, isRouting }: { items: ConversationItem[]; isRouting: boolean }) {
  return (
    <div className="chat-pane" aria-live="polite">
      {items.map((item) => (
        <div className={`chat-row ${item.kind}`} key={item.id}>
          {item.kind === "agent" && (
            <div className="chat-avatar">
              <Bot size={17} />
            </div>
          )}
          <div className="bubble">
            <p>{item.text}</p>
            {item.result && !item.result.needsClarification && (
              <div className="bubble-meta">
                <span>{item.result.intent.name}</span>
                <span>{formatConfidence(item.result.confidence)}</span>
              </div>
            )}
          </div>
        </div>
      ))}
      {isRouting && (
        <div className="chat-row agent">
          <div className="chat-avatar">
            <Bot size={17} />
          </div>
          <div className="bubble typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone: "green" | "amber" | "blue";
}) {
  return (
    <div className={`metric-card ${tone}`}>
      <div className="metric-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function PanelTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="panel-title">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <MessageCircle size={28} />
      <p>等待第一条工作需求</p>
    </div>
  );
}

function EmptyTrace() {
  return (
    <div className="empty-trace">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function RouteSummary({ result }: { result: RouteResult }) {
  if (result.needsClarification) {
    return (
      <div className="clarify-box">
        <AlertCircle size={22} />
        <div>
          <strong>{result.intent.name}</strong>
          <p>{result.clarificationQuestion}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="route-summary">
      <div className="intent-line">
        <div>
          <span className="label">识别意图</span>
          <strong>{result.intent.name}</strong>
        </div>
        <span className="confidence">{formatConfidence(result.confidence)}</span>
      </div>

      <div className="handoff-card">
        <div className="handoff-person">
          <span className="avatar large">{getInitials(result.assignee.name)}</span>
          <div>
            <strong>{result.assignee.name}</strong>
            <span>{result.assignee.role}</span>
          </div>
        </div>
        <div className="match-reasons">
          {result.matchedReasons.map((reason) => (
            <span key={reason}>{reason}</span>
          ))}
        </div>
      </div>

      <div className="message-preview">
        <div>
          <UserRoundCheck size={17} />
          <strong>工作消息</strong>
        </div>
        <p>{result.workMessage.body}</p>
      </div>

      <div className="message-preview official">
        <div>
          <Bell size={17} />
          <strong>{result.publicNotice.title}</strong>
        </div>
        <p>{result.publicNotice.body}</p>
      </div>
    </div>
  );
}

function WorkMessages({ results }: { results: RouteResult[] }) {
  const messages = results.filter((result) => !result.needsClarification);

  if (messages.length === 0) {
    return <p className="muted-line">暂无</p>;
  }

  return (
    <div className="message-list">
      {messages.slice(0, 5).map((result) => (
        <div className="message-item" key={result.id}>
          <span className="avatar">{getInitials(result.assignee.name)}</span>
          <div>
            <strong>{result.assignee.name}</strong>
            <p>{result.workMessage.body}</p>
          </div>
          <CheckCircle2 size={18} />
        </div>
      ))}
    </div>
  );
}

function OfficialFeed({ results }: { results: RouteResult[] }) {
  if (results.length === 0) {
    return <p className="muted-line">暂无</p>;
  }

  return (
    <div className="official-feed">
      {results.slice(0, 5).map((result) => (
        <div className={`official-item ${result.needsClarification ? "warning" : ""}`} key={result.id}>
          <Bell size={16} />
          <div>
            <strong>{result.publicNotice.title}</strong>
            <p>{result.publicNotice.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TraceTimeline({ result }: { result: RouteResult }) {
  return (
    <div className="trace-list">
      {result.trace.map((step) => (
        <div className="trace-step" key={step.id}>
          <div className="trace-icon">
            {step.status === "done" ? <CheckCircle2 size={17} /> : <Zap size={17} />}
          </div>
          <div>
            <strong>{step.agent}</strong>
            <p>{step.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Directory({ employees: staff }: { employees: Employee[] }) {
  return (
    <div className="directory-grid">
      {staff.map((employee) => (
        <div className="directory-item" key={employee.id}>
          <span className="avatar">{getInitials(employee.name)}</span>
          <div>
            <strong>{employee.name}</strong>
            <p>{employee.role}</p>
            <div className="capability-row">
              {employee.skills.slice(0, 3).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>
          <div className="agent-badge" title={`${employee.name} 的个人智能体`}>
            <ShieldCheck size={15} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
