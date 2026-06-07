# 教培 AI 智能体协作 Demo

一个本地可跑的微信小程序式 demo：员工只输入一句话，系统自动识别意图、匹配对接人、生成工作消息，并模拟公众号即时提醒。

## 启动

```powershell
cd "C:\Users\Administrator\Documents\New project 8\ai-agent-wechat-demo"
npm install
npm run dev
```

默认地址：

```text
http://127.0.0.1:5173/
```

## 验证

```powershell
npm run build
npm run verify:e2e
```

`verify:e2e` 会用本机 Chrome 执行一次完整路径：打开 demo、点击快捷需求、输入一句话、检查桌面和手机宽度下的派单结果，并生成截图：

- `screenshots/desktop-after-routing.png`
- `screenshots/mobile-after-routing.png`

## 核心文件

- `src/data/demoData.ts`：教培员工、岗位能力、意图和快捷需求。
- `src/lib/agentEngine.ts`：本地规则版多 Agent 路由引擎。
- `src/App.tsx`：微信小程序式入口、工作消息、公众号提醒和 Agent 追踪。
- `docs/workflows.md`：业务角色、样例需求和派单规则。
- `docs/acceptance.md`：验收路径、测试输入和真实接口留口建议。

## 后续接真实系统

当前 demo 不调用外部 AI 或微信接口，所有消息都是本地模拟。真实落地时可以把 `agentEngine.ts` 中的消息生成部分替换为后端接口：

- 企业微信/飞书/钉钉：发送工作消息、待办卡片、接单动作。
- 微信公众号：发送模板消息或订阅消息提醒。
- 教培 ERP：读取员工、校区、班级、课程、学员、订单和课时数据。
- Dify/CrewAI/AgentScope：替换本地关键词规则，提供更强的意图识别和任务规划。
