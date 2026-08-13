# GPC 2026 BurstSFC 论文与实验迁移手册

_当前修改版、冻结实验、论文成品、审稿状态与跨机器续作说明；快照日期：2026-08-13。_

---

## 📋 文档目的

本手册用于把 `BurstSFC2026_GPC_goal_20260812` 从当前 Windows 工作机迁移到另一台 Windows、Linux 或 macOS 机器，并让接手者能够：

1. 找到唯一权威的论文、实验数据和发布门禁；
2. 在不破坏冻结证据的前提下完成首次验收；
3. 理解 Round-01 后已经做过的论文、代码和实验修改；
4. 区分 canonical 证据、辅助结果、旧结果和不可使用的历史 PDF；
5. 继续按 GPC 2026 标准返修、补实验、编译和开展下一轮五人独立审稿；
6. 在生成新版本后重新建立可验证的 release manifest。

> ⚠️ **重要边界：** GitHub 仓库 `sungaoyuyu-hue/1111` 当前保存的是审稿 JSON 和本迁移手册，不包含约 150–160 MiB 的完整论文、数据和代码。另一台机器仍需通过保字节归档、云盘或其他文件传输方式取得本手册列出的项目目录。

审稿摘要的 GitHub 同目录副本见 [current_version_review_summary.json](./current_version_review_summary.json)；完整项目内的权威位置为 `review_cycles/current_version_review_summary.json`。

```mermaid
flowchart LR
    accTitle: BurstSFC 跨机器迁移流程
    accDescr: 从旧机冻结项目打包开始，经新机解包、环境重建、只读完整性验证、测试和论文编译检查，最终进入后续返修或新版本重新冻结

    freeze_snapshot[冻结当前字节快照] --> pack_project[打包必需目录]
    pack_project --> transfer_archive[传输归档与哈希]
    transfer_archive --> rebuild_env[重建 Python 和 TeX 环境]
    rebuild_env --> verify_manifest{旧 manifest 通过?}
    verify_manifest -->|是| run_tests[运行 54 项测试]
    verify_manifest -->|否| repair_transfer[修复漏文件或字节漂移]
    repair_transfer --> verify_manifest
    run_tests --> compile_check[隔离目录编译论文]
    compile_check --> continue_revision[继续返修和实验]
    continue_revision --> freeze_new[编译并冻结新版本]
```

## 🎯 当前版本总览

| 项目 | 当前值 |
| --- | --- |
| 目标会议 | GPC 2026，Springer LNCS，当前采用不超过 16 页（含参考文献）的约束[^1] |
| 论文标题 | `Limited-Visibility Burst-Aware SFC Orchestration in Edge--Cloud Networks` |
| 论文定位 | 面向 edge--Cloud SFC 的有限可见性、突发感知、运行时编排耦合 |
| 权威主 TeX | `overleaf_burst_sfc_lNCS/BurstSFC2026.tex` |
| 权威 PDF | `overleaf_burst_sfc_lNCS/$out/BurstSFC2026.pdf` |
| PDF 状态 | 15 页，466,849 bytes，无 Type 3 字体，无 fatal/undefined/overfull/rerun 问题 |
| PDF SHA-256 | `809f54a94f50f843a30b5fe9add12f15ff8f00de8dd75748a3557c6e46652ca1` |
| 权威 release manifest | `experiment_results/canonical_gpc/release_manifest.json` |
| manifest SHA-256 | `d5a32359e7fe16daf7a3a7ad7af9b0a727e24954eec5afdf74a3b9e5ef0b4c0d` |
| 冻结范围 | 126 个 source、112 个 result，共 147,209,092 bytes |
| 当前审稿轮次 | Round-02 已完成 5/5 人，均分 6.86/10 |
| 停止条件 | 同一轮 5 位全新审稿人均不低于 9/10，且全部 `major_blocker=false` |
| 当前停止条件 | **未满足**；理论、实验统计、创新性和 artifact 仍有重大阻塞项 |

论文明确不声称：

- 信息论隐私或差分隐私保证；
- 真实跨域租约、共识或分布式原子提交；
- 生产网络部署已经完成；
- 能耗、碳排放或 green-computing 改进；
- 对外部论文原系统的性能复现或全面优越性。

论文当前只支持一个较窄的结论：在单进程离散事件模拟器中，把陈旧公开描述符、完整动作候选、有限 Boolean 确认、stage authorization、持久扩容状态和串行最终检查组合起来，可以形成一个可审计的 active-flow burst 处理机制。

## 📦 应迁移的目录和文件

### 推荐续作包

以下目录应保持原始相对结构并按字节复制：

| 路径 | 约占用 | 迁移级别 | 用途 |
| --- | ---: | --- | --- |
| `sfc_autoresearch/` | 144.30 MiB | 必须 | 仿真代码、数据集、结果、模型、预注册和测试 |
| `overleaf_burst_sfc_lNCS/` | 6.24 MiB | 必须 | LNCS 论文源码、图、旧/新构建产物和固定发布 PDF |
| `experiment_results/` | 0.15 MiB | 必须 | 根级权威 manifest 与权威 integrity report |
| `review_cycles/` | 0.09 MiB | 必须 | Round-01/02 审稿报告、分数和修改依据 |
| `tmp/` | 8.33 MiB | 建议 | 最终逐页视觉 QA、contact sheet、编译谱系和排障证据 |
| 顶层审计文档 | 小于 0.1 MiB | 建议 | 理论、公式、证据重写和多 agent 审计历史 |
| `MIGRATION_GUIDE_GPC2026.md` | 很小 | 必须 | 本迁移手册 |

推荐包约 159.64 MiB、约 554 个文件。严格 frozen release 注册集为 238 个文件加固定 PDF/log，约 140.86 MiB；为避免人工精简导致漏文件，续作时优先复制上述完整目录。

### 不应迁移或不应依赖

| 路径 | 处理方式 | 原因 |
| --- | --- | --- |
| `.venv/` | 不复制，必须重建 | 约 252 MiB，包含旧机 Windows CPython 路径和二进制扩展，不可跨机复用 |
| `__pycache__/` | 可删除/忽略 | Python 缓存，不是科学输入 |
| `sfc_autoresearch/tmp/` | 可不带，但建议保留排障材料 | smoke 和内部审计临时输出，不是 canonical 结果 |
| `当前论文/BurstSFC2026_现在进度.pdf` | 不作为当前论文 | 旧 Tectonic 检查点，160,067 bytes |
| `overleaf_burst_sfc_lNCS/output/` | 可保留追溯，但禁止作为发布稿 | 2026-08-08 的旧编译，旧 PDF 为 19 页 |
| `sfc_autoresearch/experiment_results/...` 中未注册旧表 | 可保留追溯，不得支持当前结论 | 只有 `release_scope.py` 的 allowlist 才是发布证据 |
| `.claude/`、`.ssh/`、GitHub 凭据 | 不打包 | 与研究运行无关且属于机器/账户凭据 |

### 数据集不可遗漏

`sfc_autoresearch/datasets/` 共 15 个文件、136,816,707 bytes，完整重跑无需再次联网。四个最大数据文件是：

| 相对路径 | bytes | SHA-256 |
| --- | ---: | --- |
| `datasets/sndlib/abilene-dynamic-native.tgz` | 49,203,514 | `2f311130d77e40db88da1aa6db8055b6fce8d077bf4bae87398563e1b84e70ce` |
| `datasets/sndlib/geant-dynamic-native.tgz` | 39,570,674 | `92d72a808d6de9d26be66844c098d3f32d5b9bb6c69af170e82b73118faef0df` |
| `datasets/sndlib/abilene-traffic-compact.csv.gz` | 27,041,977 | `e4a79e0638bf7a6ce35b7f34b39e82d2828216e8926a6686052d63da50b96db8` |
| `datasets/sndlib/geant-traffic-compact.csv.gz` | 20,865,993 | `11353f1a926c0d2b39bcc1fbb8e5c14f0d879f81fdee73aac0f1009414e372ba` |

Topology Zoo 使用 8 个已冻结 JSON：`Nsfnet`、`BsonetEurope`、`Aarnet`、`Renater2006`、`Iij`、`Uunet`、`Uninett2011` 和 `TataNld`。数据来源记录在 `datasets/topology_zoo/SOURCE.md`，锁定 TopoHub commit `db1a31247ffd4ed5875d584c91fed305a3f94a1e`。SNDlib 与 Topology Zoo/TopoHub 的来源分别见官方资源[^2][^3]。

## 🔄 从旧机器打包和传输

### Windows 保字节归档

从项目父目录运行。不要先把项目加入会自动转换换行符的 Git 工作树；当前 CSV 多为 CRLF，而 Python/TeX 主要为 LF，换行转换会导致 manifest 全面漂移。

```powershell
$MigrationRoot = 'D:\work\exp6\BurstSFC2026_GPC_goal_20260812'
$MigrationParent = Split-Path -Parent $MigrationRoot
$MigrationArchive = Join-Path $MigrationParent 'BurstSFC2026_migration_20260813.zip'

Set-Location -LiteralPath $MigrationParent
tar.exe -a -cf $MigrationArchive `
  'BurstSFC2026_GPC_goal_20260812/sfc_autoresearch' `
  'BurstSFC2026_GPC_goal_20260812/overleaf_burst_sfc_lNCS' `
  'BurstSFC2026_GPC_goal_20260812/experiment_results' `
  'BurstSFC2026_GPC_goal_20260812/review_cycles' `
  'BurstSFC2026_GPC_goal_20260812/tmp' `
  'BurstSFC2026_GPC_goal_20260812/MIGRATION_GUIDE_GPC2026.md' `
  'BurstSFC2026_GPC_goal_20260812/evidence_rewrite_changelog.md' `
  'BurstSFC2026_GPC_goal_20260812/multi_agent_correctness_ccfb_audit.md' `
  'BurstSFC2026_GPC_goal_20260812/paper_method_formula_proof_audit.md' `
  'BurstSFC2026_GPC_goal_20260812/theory_proof_reaudit.md'

Get-FileHash -Algorithm SHA256 -LiteralPath $MigrationArchive
Get-Item -LiteralPath $MigrationArchive | Select-Object FullName,Length
```

将输出的归档 SHA-256 与归档一起传输，在新机解压前后再次计算。普通 GitHub blob 不适合作为这个约 160 MiB 归档的传输通道；GitHub 对普通仓库大文件有明确限制，完整归档应使用云盘、Git LFS、GitHub Release 或分卷传输[^4]。

### Linux/macOS 保字节归档

```bash
MIGRATION_ROOT=/path/to/BurstSFC2026_GPC_goal_20260812
MIGRATION_PARENT=/path/to
MIGRATION_ARCHIVE="$MIGRATION_PARENT/BurstSFC2026_migration_20260813.tar.gz"

cd "$MIGRATION_PARENT"
tar -czf "$MIGRATION_ARCHIVE" \
  BurstSFC2026_GPC_goal_20260812/sfc_autoresearch \
  BurstSFC2026_GPC_goal_20260812/overleaf_burst_sfc_lNCS \
  BurstSFC2026_GPC_goal_20260812/experiment_results \
  BurstSFC2026_GPC_goal_20260812/review_cycles \
  BurstSFC2026_GPC_goal_20260812/tmp \
  BurstSFC2026_GPC_goal_20260812/MIGRATION_GUIDE_GPC2026.md \
  BurstSFC2026_GPC_goal_20260812/evidence_rewrite_changelog.md \
  BurstSFC2026_GPC_goal_20260812/multi_agent_correctness_ccfb_audit.md \
  BurstSFC2026_GPC_goal_20260812/paper_method_formula_proof_audit.md \
  BurstSFC2026_GPC_goal_20260812/theory_proof_reaudit.md

sha256sum "$MIGRATION_ARCHIVE"
```

### 新机器解包原则

- 解包到任意路径均可；发布清单只使用 POSIX 项目相对路径。
- Linux 文件系统大小写敏感，目录名和文件名必须原样保留。
- 不要让编辑器自动格式化 CSV、JSON、Python 或 TeX。
- 若一定要经 Git 传项目文件，先对目标仓库设置 `git config core.autocrlf false`，并在 commit 前验证哈希；不要把 `.venv` 提交进去。
- 解包后先安装依赖并运行旧 manifest 验证，再运行任何会重写结果的命令。

## ⚙️ 运行环境重建

### Python 环境

冻结参考环境是 64-bit CPython 3.11.9。`requirements.txt` 直接固定：

```text
numpy==2.0.2
scipy==1.13.1
matplotlib==3.9.4
```

参考机还观察到 Matplotlib 的传递依赖 `Pillow 12.3.0`、`contourpy 1.3.3`、`cycler 0.12.1`、`fonttools 4.63.0`、`kiwisolver 1.5.0`、`packaging 26.3`、`pyparsing 3.3.2`、`python-dateutil 2.9.0.post0` 和 `six 1.17.0`。它们不应通过复制旧 venv 获取。

Windows：

```powershell
$MigrationRoot = 'D:\path\to\BurstSFC2026_GPC_goal_20260812'
Set-Location -LiteralPath $MigrationRoot
py -3.11 -m venv .venv
& '.\.venv\Scripts\python.exe' -m pip install --upgrade pip
& '.\.venv\Scripts\python.exe' -m pip install -r '.\sfc_autoresearch\requirements.txt'
& '.\.venv\Scripts\python.exe' -c "import sys,numpy,scipy,matplotlib; print(sys.version); print(numpy.__version__,scipy.__version__,matplotlib.__version__)"
```

Linux/macOS：

```bash
MIGRATION_ROOT=/path/to/BurstSFC2026_GPC_goal_20260812
cd "$MIGRATION_ROOT"
python3.11 -m venv .venv
./.venv/bin/python -m pip install --upgrade pip
./.venv/bin/python -m pip install -r sfc_autoresearch/requirements.txt
./.venv/bin/python -c 'import sys,numpy,scipy,matplotlib; print(sys.version); print(numpy.__version__,scipy.__version__,matplotlib.__version__)'
```

`psutil` 是可选依赖。当前 frozen factorial 在 Windows 使用 `rss_windows_working_set_sampled`；其他平台可能使用 `psutil`、Linux `/proc` 或最终的 `tracemalloc`。最后一种测的是 Python allocation peak，不是 RSS，因此跨平台重跑时资源遥测标签和数值可以改变。

### 论文和 PDF 门禁工具

需要：

| 工具 | 用途 | 当前参考版本 |
| --- | --- | --- |
| `pdflatex` | LNCS PDF 编译 | MiKTeX 25.12 / pdfTeX 1.40.28 |
| `bibtex` | `refs_burst.bib` 处理 | MiKTeX-BibTeX 4.2 / BibTeX 0.99e |
| `pdfinfo` | 页数和 PDF 元数据门禁 | Poppler 24.04.0 |
| `pdffonts` | 嵌入字体和 Type 3 检查 | Poppler 24.04.0 |
| `pdftoppm` | 逐页视觉 QA | 可选但建议安装 |

项目已携带 `llncs.cls` 和 `splncs04.bst`。TeX 还需要 `lmodern`、`graphicx`、`booktabs`、`amsmath`、`amssymb`、`algorithm`、`algorithmic` 和 `url`。

参考机硬件为 Intel Core Ultra 7 265K、20 核/20 线程、约 68.4 GB RAM；这不是最低要求。建议至少保留 2 GiB 可用磁盘和 2 GiB RAM。仿真不使用 CUDA；部分网格会启用最多 8 个 CPU worker。

### 清除实验环境覆盖

在验证或重跑前，确认以下变量未被 shell、IDE 或 CI 设置，否则结果可能漂移：

```text
SFC_RUN_MODE
SFC_ALGORITHM_LEVEL
SFC_FLOW_COUNT
SFC_DOMAIN_COUNT
SFC_BURST_LEVEL
SFC_NOISE_LEVEL
SFC_QUERY_BUDGET
SFC_CLOUD_SPLIT
SFC_SCALE_BUDGET
```

## 📄 修改后的论文版本

### 文件组成

权威入口 `overleaf_burst_sfc_lNCS/BurstSFC2026.tex` 依次输入：

| 文件 | 当前作用 |
| --- | --- |
| `abstract.tex` | 收窄后的 simulator-level 摘要 |
| `intro.tex` | 动机、研究边界、贡献和 GPC 主题定位 |
| `works.tex` | Related Work 与 closest-work design-space 表 |
| `problem.tex` | 系统、公开描述符、请求、完整动作、事件和确认状态机 |
| `algorithm.tex` | 候选构建、公开排序、有限确认、提交和复杂度 |
| `evaluation.tex` | 方法、统计口径、canonical/learning/factorial/trace/topology/failure 证据 |
| `conclusion.tex` | 收窄结论与生产部署缺口 |
| `refs_burst.bib` | 39 条 BibTeX 记录，当前正文引用 32 条 |
| `figures/system_workflow.pdf` | 主稿当前唯一实际引用的图 |

`generated_values.tex` 当前未被主 TeX 直接 `\input`，但数值同步器和 release manifest 都登记了它，迁移时不能删除。`figures/` 中其余图当前未在正文引用，但 frozen manifest 仍锁定；旧 manifest 验收前不要精简。

### Round-01 后的论文修改

#### 标题、摘要和主张

- 标题从 `Burst-Resilient` 改为 `Burst-Aware`，避免把有限模拟证据表述为普遍韧性。
- 摘要删除旧的性能数字堆叠和错误的 `3/540` rule-of-three 表述。
- 摘要改为描述完整动作、固定 complete-chain Cloud split、私有 issuer registry、单次串行 commit gate 和基于声明峰值的 admission envelope。
- 结论明确限定为 simulator-level control mechanism，并明确否认隐私证明、真实分布式提交和绿色计算贡献。

#### Introduction

- 不再声称 burst handling、privacy-aware placement、trust、scaling 或 edge--Cloud orchestration 本身存在空白。
- 将贡献收窄为 active-flow burst 下的 operational coupling、可审计状态转换和分区证据。
- 明确映射到 GPC 的 workflow/service orchestration 与 heterogeneous resource management 主题[^1]。
- 加入“无能耗/碳排指标，因此无 green claim”的显式边界。

#### Related Work

- 加入 Kibalya、VNF-P、ElasticSFC、Mao、Yi、Ali El Amine 2026 和 Zhang 2026 等近邻工作。
- 新增 closest-work design-space Table 1，比较 active burst、limited view、Boolean/bound、trust、scale/Cloud、commit 和 evidence。
- 将 pSMART、MQL-SCS、RA-SFCM 明确标记为 common-simulator adaptations，不能把本项目数值归因于原论文系统。
- BibTeX 从 32 条扩展到 39 条，并修正 PPDM 卷期页码等信息。

#### Problem Definition

- 用“直接发布的 conservative envelope”替代未经校准的鲁棒/概率保证。
- 加入逐 stage authorization；只有每个 stage 都允许 Cloud 时才启用固定 `0.65` complete-chain Cloud split，否则只允许 edge-only 完整动作。
- 用全局 event/round、policy filtration、participant-local conjunction、opaque response handle、一次性 registry、最终 revalidation 和持久 scale 状态闭合可执行语义。
- 说明 confirmation 中已安装的 scale 不会在失败 commit 后回滚，而是持续占用全局 budget，与实现一致。
- 删除对有限在线状态机的新 NP-hardness 主张，只引用 unrestricted joint placement/routing 已知 NP-hard。
- 将未实现的优化目标改写为 implemented development score，并把主结论建立在分项指标上。

#### Algorithm Design

- 候选构建从 stage capability/authorization 开始，并在完整动作级排序和查询。
- 当前 allocation 在 burst 中最多重试一次，随后从 remainder 去重，避免同一事件重复消费 query。
- token/response 绑定 request、完整 action、branch fraction、authorization、checked demand、time horizon 和 scale plan。
- commit 前重新构造并验证动作签名、authorization 和 participant capacity。
- 重新校正 exact/beam construction、route storage、ranking 和 participant-message 复杂度。

#### Evaluation

- 主比较与消融统一为 seeds 21--50，独立单位是 seeded episode。
- 主/消融采用 paired two-sided Wilcoxon + 各自十项 Holm family；学习比较采用 10 initializations × 30 paired test seeds 的 20,000 次 crossed bootstrap。
- 用 `0/30` episode 的 one-sided Clopper--Pearson 上界 `0.0950` 替代旧的 within-episode 机会计数。
- 新增 144-cell、4,320-episode 的 frozen factorial confirmation。
- 新增 K×Q 探索、8 个 Topology Zoo 正常/四倍负载压力实验、SNDlib measured/causal replay、扩容启动延迟/失败、控制面计时和 controlled switch-failure。
- 公开 topology stress 的负结果：Proposed 在四倍负载下 SLA-V 约 `.1070`、U 约 `.0961`，因此只支持正常负载 graph-interface 验证，不支持普遍高负载韧性。
- 明确 SNDlib annotated replay 回调不是完全在线 detector；只有 causal protocol 不使用未来 peak/ranking。

#### Conclusion 和版面

- 结论由“优越方法”改为“有限可见性下的 simulator-level operational coupling”。
- 把 leases、concurrency、RTT、crypto cost、VNF boot/state transfer、failures、rollback 列为生产部署前必须补的内容。
- 加入 `lmodern`，当前 PDF 无 Type 3 字体。
- Figure 1 重绘；当前 `system_workflow.pdf` SHA-256 为 `8e2b1d58ba9a09bff4cb47d3d59375dd43a7cd99f1cdcac21e7eedb9ca662205`。

### 当前论文成品与历史文件

权威成品：

| 文件 | 状态 | SHA-256 |
| --- | --- | --- |
| `overleaf_burst_sfc_lNCS/$out/BurstSFC2026.pdf` | 当前 15 页候选稿 | `809f54a94f50f843a30b5fe9add12f15ff8f00de8dd75748a3557c6e46652ca1` |
| `overleaf_burst_sfc_lNCS/$out/BurstSFC2026.log` | 当前发布 log | `ad6808a81559cf54a8551662123dae9201761900be3397ce09d510020b5b5268` |
| `tmp/pdfs/final_release_candidate/BurstSFC2026.pdf` | 与权威 PDF 同字节副本 | 同上 |

禁止误用：

- `overleaf_burst_sfc_lNCS/output/BurstSFC2026.pdf`：19 页旧稿，SHA-256 `297d3c4ab620950727a52676bd75ac4e11e4b0a92fda078e2e3b27850d80ea20`；
- `当前论文/BurstSFC2026_现在进度.pdf`：旧检查点，SHA-256 `576e30fb3cdad891840d8006c9235ce1a7877f90e2db87333d41e9d2192a4931`；
- `tmp/pdfs/round0_baseline/BurstSFC2026.pdf`：Round-01 基线，SHA-256 `4fc97ffff2cb2a21f3d62730972ef3fecb13df6d4c86245090efb3e45878f18a`。

当前 log 的发布门禁计数为 fatal `0`、undefined citations `0`、undefined references `0`、overfull `0`、rerun `0`。还存在 28 个 underfull 和一个 `amsmath` 的 `Unable to redefine math accent \vec` 警告，它们未造成版面溢出。15/15 页已渲染检查，证据在 `tmp/final_visual_qa.md` 和 `tmp/visual_final/contact_sheet.png`。

### 新机器隔离编译检查

首次迁移只在临时目录编译，不要覆盖 frozen `$out`。

Windows PowerShell，从项目根执行：

```powershell
Set-Location -LiteralPath '.\overleaf_burst_sfc_lNCS'
$MigrationBuild = '..\tmp\migration_compile_check'
New-Item -ItemType Directory -Force -Path $MigrationBuild | Out-Null

pdflatex -interaction=nonstopmode -halt-on-error -file-line-error "-output-directory=$MigrationBuild" BurstSFC2026.tex
bibtex (Join-Path $MigrationBuild 'BurstSFC2026')
pdflatex -interaction=nonstopmode -halt-on-error -file-line-error "-output-directory=$MigrationBuild" BurstSFC2026.tex
pdflatex -interaction=nonstopmode -halt-on-error -file-line-error "-output-directory=$MigrationBuild" BurstSFC2026.tex

pdfinfo (Join-Path $MigrationBuild 'BurstSFC2026.pdf')
pdffonts (Join-Path $MigrationBuild 'BurstSFC2026.pdf')
Set-Location ..
```

Linux/macOS：

```bash
cd overleaf_burst_sfc_lNCS
MIGRATION_BUILD=../tmp/migration_compile_check
mkdir -p "$MIGRATION_BUILD"

pdflatex -interaction=nonstopmode -halt-on-error -file-line-error -output-directory="$MIGRATION_BUILD" BurstSFC2026.tex
bibtex "$MIGRATION_BUILD/BurstSFC2026"
pdflatex -interaction=nonstopmode -halt-on-error -file-line-error -output-directory="$MIGRATION_BUILD" BurstSFC2026.tex
pdflatex -interaction=nonstopmode -halt-on-error -file-line-error -output-directory="$MIGRATION_BUILD" BurstSFC2026.tex

pdfinfo "$MIGRATION_BUILD/BurstSFC2026.pdf"
pdffonts "$MIGRATION_BUILD/BurstSFC2026.pdf"
cd ..
```

不同 TeX 版本或生成时间会改变 PDF 字节。新机重新编译应得到 15 页且无发布级错误，但不要求 SHA-256 仍等于 `809f...`。一旦把新编译文件作为新候选稿，就必须重新 `freeze/verify`，不能继续沿用旧 PDF 哈希。

## 🧪 修改后的实验和代码版本

### 代码模块与已完成修复

| 模块 | 修改后的职责 |
| --- | --- |
| `prepare.py` | `FlowSpec`、Environment、候选、authorization、token registry、final revalidation、persistent scale |
| `train.py` | 完整动作策略、固定 Cloud split、query 去重、Q 计数、无未来 burst-time admission |
| `ccfb_data.py` | SNDlib/trace 流、causal random-busy、历史阈值和 stage authorization 数据接口 |
| `experiment_config.py` | 冻结配置、seed 和环境覆盖 |
| `experiment_driver.py` | 实验调度、聚合和资源遥测 |
| `canonical_experiments.py` | 6 方法主比较和 6 方法消融 |
| `factorial_confirmation_experiment.py` | 预注册 factorial 与 current-code failure/delay rerun |
| `learning_multirun_experiment.py` | 10 个初始化、三种学习策略和 30 个 paired test seeds |
| `topology_zoo_data.py` | 8 个外部图结构及当前 authorization interface |
| `formal_statistics.py` | 44 项 formal paired tests、crossed bootstrap 和 episode risk |
| `paper_value_sync.py` | 生成 LaTeX 值并核对两张显示表 |
| `release_scope.py` | 精确的 112 个科学结果 allowlist 与依赖图 |
| `validation_integrity.py` | 语义、统计、行数、有限值和 provenance 门禁 |
| `canonical_integrity.py` | source/result/PDF/log 的 fail-closed freeze/verify |

已实现的关键修复：

- 把 edge-only 或固定 edge--Cloud split 统一为完整动作；
- token 使用不透明 handle，并绑定完整 request/action/fraction/authorization/time/scale 信息；
- token 首次提交即消费，伪造、重放、跨 action、跨 request、改 fraction 或超时提交会失败；
- commit 前重新验证 candidate capability/order、authorization 和 participant capacity；
- confirmation 安装的 scale 持久计费且不会在未 commit 时回滚；
- burst 当前动作最多查询一次，避免同 event 重复完整动作；
- admission peak reservation 不读取未来 burst time；
- causal trace 不使用未来 peak/ranking；
- 修复 Topology Zoo 流缺少 `authorized_domains_by_stage` 的接口错误；
- formal statistics 只接受 registered current lineage，排除旧 `raw_per_seed.csv`、`equal_budget_raw.csv` 等历史表；
- learning inference 使用训练初始化和测试 seed 的两维 cluster bootstrap；
- release gate 锁定源码、数据、结果、PDF、log、页数、字体和相对路径。

### 权威实验矩阵

| 家族 | 设计与行数 | raw SHA-256 |
| --- | --- | --- |
| Canonical main | 6 methods × seeds 21--50；raw 180，summary 6，paired-Holm 10 | `a85639f89609f639bcd0626aa7b8dbd8f7a70fa302bdbc1510959e49b463c9af` |
| Canonical ablation | Proposed + 5 ablations × 30；raw 180，summary 6，tests 10 | `f7980059e193a6c178c82950536d22ba6ac20493eaf5b078d3fa275663f7c7fd` |
| Exploratory K×Q | 2 K × 6 Q × seeds 901--930；raw 360，summary 12 | `4935dc512901b0defa7320f4ab45fa5abbc71e223d75318667127e9c60c73ba3` |
| SNDlib trace | measured/causal partitions；raw 320，summary 20，paired 80 | `89c6bfe353b3ab952cedfe9339661f7e062c0eb4c192e8abcdffb3bf65a3da25` |
| Learning multirun | 10 initializations × 3 policies × 30 test seeds；raw 900 | `4f0809b5c4822adfdcfb3cfbc196194929b2b7ba4b4cc53c81c11b7bd54dfb2e` |
| Frozen factorial | 2 K × 6 Q × 4 Cloud × 3 scale × 30 seeds；raw 4,320，summary 144 | `fee20d4a2449305039b89212f9a5094952404a44955b1306dddd8b79c3b55b66` |
| Normalized scale | 3 scales × 6 methods × 30 seeds；raw 540，summary 18 | `730393c7c493b89802ec5b67a95ff0ef714ee9d73741cc2a2d2b9d27c18acca0` |
| Topology Zoo normal | 8 graphs × 9 methods；raw 630，summary 72 | `610f557acdef292fe0c68b4abfa0607a811f3eb3322a46b967dde4f3e416831d` |
| Topology Zoo stress | 8 graphs × 9 methods；raw 324，summary 72 | `2a3f40bf6070453d1334f0980d303e10b82899aec04126b7aa2c6e569547abf1` |
| Scale actuation | 5 delays × 4 failure rates × seeds 161--180；raw 400 | `403b8dbb45fb901064f27de0821eb134e7c63db65f438b4333a6bc2a750a870f` |
| Control latency | 2 traces × seeds 201--205；raw 10 | `3389f0a6673dbdfddc7a8a2e847ac650b4c2e3430f27007c96ad893a95e666a7` |
| Controlled path failure | 6 methods × seeds 851--880；raw 180 | `bbaaf3a9ce98244dfb236b63e9ae037b9a2cf8ce0d3d0ef900d2ee1db1eb3406` |

Factorial 使用 seeds 2101--2130、16 domains、72 requests、100 steps，参数为：

```text
K = {20, 64}
Q = {1, 2, 3, 4, 6, 8}
Cloud fraction = {0, 0.30, 0.50, 0.65}
Scale budget = {0, 3000, 6000}
```

共有 144 cells × 30 seeds = 4,320 个唯一 key。`factorial_errors.csv` 保留两次 Windows atomic-replace `PermissionError` 的恢复记录；相同 key 最终各出现一次，未替换 seed，不是未解决的仿真失败。对应文件：

| 文件 | 行数 | SHA-256 |
| --- | ---: | --- |
| `factorial_summary.csv` | 144 | `5d7d4f45111d46243d9719293aa9ffc34cd0a6a43dc4a6e3c7dd96f56c419f64` |
| `factorial_episode_event_bounds.csv` | 144 | `55f5cb3610cfea40e07fa34e02f70f58c6f384d4251d90529e97ba0cb518382d` |
| `factorial_errors.csv` | 2 | `e23b25e7ffa5d33cb9de3a6478b6ac7d56c46f5a91595add3fba8b2c671c3048` |

预注册文件 `preregistration_confirmation_v1.json` SHA-256 为 `f69c77998bcc08939b83ceb16bf66c81472cb1ca7d796f714bc0d1eeb7dd03fa`。若协议需要修正，应创建 `v2`，不能原地修改 `v1`。

### 当前主要结果

Canonical 30-seed 主比较：

- Proposed SLA-V `.00003`、acceptance `1`、burst unavailability `0`、queries/episode `36.0`、scale cost `675.1`、overload `0`；
- 四个非 oracle comparator 的 service outcomes 与 Proposed 在 Holm 校正后不同；
- Full-info same-action 也是 SLA-V/U `0/0`，与 Proposed 的 service p-values 不支持 superiority 或 equivalence；
- `0/30` Proposed episodes 出现 interruption，对 episode-level event risk 的 one-sided 95% 上界为 `.0950`。

Learning：

- DQN/MQL/RA 的平均 SLA-V 为 `.00597/.03736/.00376`，U 为 `.00667/.04278/.00463`；
- Proposed 为 `.000034/0`；
- crossed bootstrap 支持与 MQL 的差异，但不支持对 DQN 或 RA 的 superiority。

Topology Zoo：

- normal 630 rows：Proposed SLA-V/U `0/0`、acceptance `1.0`、overload `0`；
- four-times stress 324 rows：Proposed SLA-V `.1070233`、acceptance `.9787809`、U `.0960990`、overload `0`；
- 压力结果超过 `.05` 服务阈值，必须解释为能力边界，而非 robust success。

Trace 与 failure：

- causal SNDlib：Proposed 在 Abilene 为 `0/1/0`，GEANT 为 `.00781/1/0`（SLA-V/acceptance/U）；
- scale actuation：零 delay 下 failure rate 从 `0` 增加到 `.20` 时，SLA-V 从 `0` 增加到 `.05324`，U 增加到 `.05833`；
- 5-step startup delay 将 U 提高到 `.40833`，说明 actuation delay 是关键限制；
- controlled two-flow path failure 中 Proposed 与 Reactive 为 SLA-V/U `0/0`，只验证一个特定 transition。

### 统计口径

- 独立实验单位是一个 seeded episode，不是 episode 内请求、突发机会或链路样本。
- 主比较和消融是两个独立的十项 paired Wilcoxon/Holm family。
- learning family 是六项 two-way cluster bootstrap，20,000 resamples，分别重采样 training initialization 和 paired test seed。
- zero-event 报告使用 one-sided exact Clopper--Pearson upper bound。
- descriptive percentile interval 与 null-centered test inversion interval 含义不同；superiority 语言跟随预先声明的检验和 Holm p-value。
- Topology Zoo 的 demand、compute、trust 是 seeded synthetic overlays；SNDlib 只提供图/OD trace，不提供 VNF demand。
- host timing、RSS 和跨 OS memory source 不是算法复杂度界。

## ✅ 新机器首次验收

### 验收顺序

首次解包后必须按以下顺序操作：

1. 重建 `.venv`，但不运行实验；
2. 清除 `SFC_*` 环境覆盖；
3. 从 `sfc_autoresearch/` 运行显式旧 manifest 验证；
4. 运行全部 54 项测试；
5. 运行论文数值同步检查；
6. 运行 semantic audit，并把报告写入临时目录；
7. 在隔离目录编译论文；
8. 只有全部通过后才开始修改或完整重跑。

Windows PowerShell：

```powershell
Set-Location -LiteralPath '.\sfc_autoresearch'
$MigrationPy = '..\.venv\Scripts\python.exe'

& $MigrationPy canonical_integrity.py verify `
  --manifest experiment_results/canonical_gpc/release_manifest.json `
  --report sfc_autoresearch/tmp/migration_integrity_report.json

& $MigrationPy -m unittest -v `
  test_large_scale_regression.py `
  test_statistical_provenance.py `
  test_artifact_integrity.py

& $MigrationPy paper_value_sync.py --check

& $MigrationPy validation_integrity.py `
  --output sfc_autoresearch/tmp/migration_semantic_report.json
```

Linux/macOS：

```bash
cd sfc_autoresearch
MIGRATION_PY=../.venv/bin/python

"$MIGRATION_PY" canonical_integrity.py verify \
  --manifest experiment_results/canonical_gpc/release_manifest.json \
  --report sfc_autoresearch/tmp/migration_integrity_report.json

"$MIGRATION_PY" -m unittest -v \
  test_large_scale_regression.py \
  test_statistical_provenance.py \
  test_artifact_integrity.py

"$MIGRATION_PY" paper_value_sync.py --check
"$MIGRATION_PY" validation_integrity.py \
  --output sfc_autoresearch/tmp/migration_semantic_report.json
```

预期结果：

- release verify：`passed=true`，126/126 sources、112/112 results；
- 单测：20 个 large-scale + 12 个 statistics/provenance + 22 个 artifact，共 54/54；
- `paper_value_sync.py --check`：`main_methods=6`、`ablation_methods=6`、`evaluation_tables_verified=2`；
- semantic audit：通过；
- 论文：15 页、无 Type 3、无 fatal/undefined/overfull/rerun。

测试内部会故意执行失败门禁场景，因此日志中可能暂时出现一个 `{"passed": false, ...}` 测试夹具输出；最终以 `Ran 54 tests` 和 `OK` 为准。

### 当前冻结锚点

| 文件 | bytes | SHA-256 |
| --- | ---: | --- |
| `experiment_results/canonical_gpc/release_manifest.json` | 58,193 | `d5a32359e7fe16daf7a3a7ad7af9b0a727e24954eec5afdf74a3b9e5ef0b4c0d` |
| `experiment_results/canonical_gpc/integrity_report.json` | 96,035 | `01486985a133281c6b3039fdd73767b63ff4f0d84d49fb19da20eef842984346` |
| `review_cycles/current_version_review_summary.json` | 11,516 | `249a7db97eb20555b0c74ffbb65e0c604f44f8217d421f97d6d81997b26e7692` |
| `overleaf_burst_sfc_lNCS/$out/BurstSFC2026.pdf` | 466,849 | `809f54a94f50f843a30b5fe9add12f15ff8f00de8dd75748a3557c6e46652ca1` |
| `overleaf_burst_sfc_lNCS/$out/BurstSFC2026.log` | 26,097 | `ad6808a81559cf54a8551662123dae9201761900be3397ce09d510020b5b5268` |

## 🔁 完整实验重跑顺序

> ⚠️ **先验收、后重跑：** 下面命令会写入结果、模型或论文值。不要在旧 manifest 首次验证之前运行。

所有命令从 `sfc_autoresearch/` 执行，并使用同一个解释器。

### 安全 smoke

```powershell
..\.venv\Scripts\python.exe rebuild_canonical.py --profile smoke --clean
```

`--clean` 只允许删除 `sfc_autoresearch/tmp/rebuild_query_smoke` 与 `rebuild_factorial_smoke`，不会清理 canonical 数据。Smoke 使用 development seed，不使用 confirmation seeds。

### 完整 current-code 重建

Windows 示例：

```powershell
$MigrationPy = '..\.venv\Scripts\python.exe'

& $MigrationPy canonical_experiments.py
& $MigrationPy ccfb_experiments.py --part real --output-dir experiment_results/canonical_gpc/real_trace
& $MigrationPy large_scale_validation.py
& $MigrationPy ccfb_experiments.py --part scale
& $MigrationPy ccfb_experiments.py --part latency
& $MigrationPy learning_multirun_experiment.py
& $MigrationPy strengthening_experiments.py --stage all --retrain
& $MigrationPy query_tradeoff_experiment.py
& $MigrationPy rebuild_canonical.py --profile confirmation
& $MigrationPy switch_failure_experiment.py
& $MigrationPy formal_statistics.py
& $MigrationPy paper_value_sync.py --write
& $MigrationPy paper_value_sync.py --check
& $MigrationPy validation_integrity.py --output sfc_autoresearch/tmp/pre_freeze_semantic.json
```

Linux/macOS 只需把解释器换为 `../.venv/bin/python`。

命令含义：

- `canonical_experiments.py`：主比较与消融；
- `ccfb_experiments.py --part real`：SNDlib measured/causal partitions；
- `large_scale_validation.py`：3 个 normalized scale、6 个方法、540 rows；
- `ccfb_experiments.py --part scale/latency`：actuation 和 host latency；
- `learning_multirun_experiment.py`：10 初始化 × 3 policies × 300 train episodes，再测 30 seeds；
- `strengthening_experiments.py --stage all --retrain`：共享模型、fair、normal/stress Zoo 和报告；
- `query_tradeoff_experiment.py`：已查看 seeds 901--930 的探索性 K×Q；
- `rebuild_canonical.py --profile confirmation`：按冻结协议恢复或完成 4,320 confirmation episodes；
- `switch_failure_experiment.py`：controlled path failure；
- 最后重新计算 formal statistics、LaTeX values 和 semantic audit。

参考机 CSV 中记录的 episode wall time 约为：factorial 1,016 s、Zoo normal 1,941 s、Zoo stress 1,202 s、trace 352 s、K×Q 117 s、scale audit 80 s。它们不含全部训练、I/O 和汇总开销；新机应为完整 confirmation 和 learning 预留数小时，不要把参考计时作为承诺。

### 脚本接口陷阱

- `learning_multirun_experiment.py` 没有 argparse；**不要用 `--help` 探测它**，否则它会按正常路径重新训练。
- `canonical_experiments.py`、`formal_statistics.py` 和 `switch_failure_experiment.py` 也没有通用 CLI help；先读源码入口再运行。
- `rebuild_canonical.py --profile verify` 不是纯只读：它会重算 formal statistics、重写 `generated_values.tex`，且只运行前两套 32 个测试，不运行 22 个 artifact tests。
- Factorial 只有在 4,320 个 key 全部存在且无 unresolved error 后才允许生成正式汇总；不得以空文件、替代 seed 或手工拼接绕过。

## 🔒 发布门禁和重新冻结

### 当前路径歧义

两个同名报告含义完全不同：

| 路径 | 当前状态 | 解释 |
| --- | --- | --- |
| `experiment_results/canonical_gpc/integrity_report.json` | `passed=true`，96,035 bytes | **权威根级发布报告** |
| `sfc_autoresearch/experiment_results/canonical_gpc/integrity_report.json` | `passed=false`，138 bytes | 默认命令误找 `sfc_autoresearch/release_manifest.json` 后产生的非权威报告 |

`canonical_integrity.py` 的 CLI 路径相对项目根，而不是 shell 当前目录。当前默认 manifest 错误指向 `sfc_autoresearch/release_manifest.json`，该文件不存在。因此无参数 `verify` 会失败；在修复代码和 README 前，必须始终显式传 `--manifest` 与 `--report`。

正确验证：

```powershell
..\.venv\Scripts\python.exe canonical_integrity.py verify `
  --manifest experiment_results/canonical_gpc/release_manifest.json `
  --report experiment_results/canonical_gpc/integrity_report.json
```

### 生成新发布版本

只有在以下内容全部稳定后才允许新 freeze：

1. 所有 required 实验和 formal statistics 已重建；
2. `paper_value_sync.py --check` 通过；
3. 论文在 `pdflatex → bibtex → pdflatex → pdflatex` 后稳定；
4. 新 PDF/log 已复制到字面路径 `overleaf_burst_sfc_lNCS/$out/`；
5. 15 页或不超过 GPC 限制；
6. 无 Type 3、fatal、undefined、overfull 和 rerun；
7. 逐页视觉 QA 已更新。

PowerShell 复制固定成品时必须保护 `$out`：

```powershell
$MigrationCandidate = '.\tmp\pdfs\final_release_candidate'
$MigrationRelease = '.\overleaf_burst_sfc_lNCS\$out'
New-Item -ItemType Directory -Force -LiteralPath $MigrationRelease | Out-Null
Copy-Item -LiteralPath (Join-Path $MigrationCandidate 'BurstSFC2026.pdf') -Destination (Join-Path $MigrationRelease 'BurstSFC2026.pdf') -Force
Copy-Item -LiteralPath (Join-Path $MigrationCandidate 'BurstSFC2026.log') -Destination (Join-Path $MigrationRelease 'BurstSFC2026.log') -Force
```

然后从 `sfc_autoresearch/` 运行：

```powershell
..\.venv\Scripts\python.exe canonical_integrity.py freeze `
  --pdf 'overleaf_burst_sfc_lNCS/$out/BurstSFC2026.pdf' `
  --log 'overleaf_burst_sfc_lNCS/$out/BurstSFC2026.log' `
  --manifest experiment_results/canonical_gpc/release_manifest.json `
  --max-pages 16 `
  --replace

..\.venv\Scripts\python.exe canonical_integrity.py verify `
  --manifest experiment_results/canonical_gpc/release_manifest.json `
  --report experiment_results/canonical_gpc/integrity_report.json
```

Bash 必须写 `'overleaf_burst_sfc_lNCS/$out/BurstSFC2026.pdf'`，否则 `$out` 会被当作 shell 变量展开。

## 🔍 审稿状态和未完成阻塞项

### Round-02 分数

| Reviewer | 方向 | 分数 | Major blocker |
| --- | --- | ---: | --- |
| 1 | 理论与形式正确性 | 6.7 | true |
| 2 | 实验、统计与复现 | 7.5 | true |
| 3 | 创新性、相关工作与 GPC | 4.0 | true |
| 4 | 写作、GPC fit 与 PDF | 8.1 | false |
| 5 | Artifact、代码、数据与 PDF | 8.0 | true |

Round-02 均分为 `6.86/10`。完整报告在 `review_cycles/round_02/`。

### 下一台机器必须继续修复

1. **Policy API 未机械执行 limited visibility。** Policy 仍可接触 mutable `Environment`、完整 `FlowSpec/TraceFlowSpec` 和可能含未来信息的字段。需要 immutable policy-facing observation/action facade，并加入对抗测试，不能只靠论文约定。
2. **Standalone token API 仍允许 partial allocation。** `request_token(... fraction < 1)` 的非 unit-sum 路径与论文“完整动作”宇宙不一致。应强制 public API 只接受 complete unit-sum action，或把 partial branch 完全私有化。
3. **Eq. 12 development score 与 external failure audit 顺序不一致。** 当前 score 在外部失败审计覆盖 `switch_failure` 指标之前计算。需在审计后重算，或从正文删除该式和对应目标叙述。
4. **Table 1 的 PPDM 行有事实错误。** 当前 `Bool./bound=--`，但 PPDM 使用 binary response。应拆成 `feedback exposed` 与 `complete-action bound` 两列，并为 `partial`、blank 和 commit 标签提供来源映射。
5. **创新性仍主要是集成。** 下一稿必须把贡献压缩为可独立测试的状态机不变量/接口差异，并最好补一个 source-faithful closest-neighbor。禁止重新引入组件创新或外部系统性能优越的措辞。
6. **Artifact 默认路径和同名报告歧义。** 修正 `canonical_integrity.py` 默认 manifest/report，隔离非权威报告，增加“无参数命令”回归测试，再重新 freeze。
7. **Clean-room 复现仍需在新机完成。** 记录 Python、TeX 和 Poppler 版本，保存首次 verify、54 项测试、smoke、隔离编译和完整重跑日志。
8. **统计呈现仍可加强。** 主表和消融表主要显示点估计；supplement/artifact landing page 应暴露 CI、estimand、检验 family 和单位。
9. **写作小修。** 增加 claim--evidence--unit map，统一 SLA-V/U/Q/Scale 的单位与前导零，降低公式和评估段落密度，并更直接映射 GPC topic。
10. **页数只剩 1 页余量。** Reviewer 3 的“19 页”指旧 `output/`，当前稿已经是 15 页；后续任何扩写都必须重新检查不超过 16 页。

## 🧭 下一轮返修建议顺序

1. 先修 policy facade、partial-token 和 development-score 三个理论/实现 blocker；
2. 修 Table 1、source mapping、baseline labeling 和贡献边界；
3. 统一 integrity 默认路径，删除语义歧义，并加回归测试；
4. 运行 54 项测试、semantic audit 和 value sync；
5. 只在代码语义改变影响结果时重跑相应实验，不要无目的全量消耗 confirmation seeds；
6. 更新论文、编译 15/16 页候选稿、逐页检查并重新 freeze；
7. 启动 5 位全新的独立审稿 agent，分别负责理论、实验统计、创新/GPC、写作/PDF 和 artifact；
8. 同一轮任意一人低于 9 或报告 major issue，则汇总、返修并开始新一轮 5 位全新审稿人；
9. 只有同一轮 5 人均 `score >= 9.0` 且 `major_blocker=false` 时才结束目标。

可在新机器的新 Codex 任务中粘贴：

```text
请先完整阅读 MIGRATION_GUIDE_GPC2026.md 和 review_cycles/current_version_review_summary.json。
不要立即重跑或覆盖实验；先重建 Python/TeX/Poppler 环境，并按迁移手册运行显式 release verify、54 项测试、paper_value_sync 和隔离 PDF 编译。
确认旧冻结版本无字节漂移后，按“未完成阻塞项”继续返修。每轮必须使用 5 位全新的独立审稿 agent，分别覆盖理论、实验统计、创新/GPC、写作/PDF、artifact；只有同一轮五人均不低于 9/10 且无 major blocker 才结束。
```

## 🛠️ 常见故障排查

| 现象 | 最可能原因 | 处理方式 |
| --- | --- | --- |
| `missing frozen release manifest` | 省略了显式 `--manifest` | 使用根级 `experiment_results/canonical_gpc/release_manifest.json` |
| 大量 hash mismatch | Git/编辑器转换换行、漏文件或解压异常 | 重新用归档传输，设 `core.autocrlf=false`，先核对归档 SHA |
| 找到 138-byte `passed=false` 报告 | 读了 `sfc_autoresearch/.../integrity_report.json` | 改读项目根的权威报告 |
| 找不到 PDF | `$out` 被 PowerShell/Bash 展开 | 使用单引号或 `-LiteralPath` |
| PDF 显示 19 页 | 打开了旧 `output/BurstSFC2026.pdf` | 使用字面 `$out/BurstSFC2026.pdf` |
| `pdfinfo`/`pdffonts` 不存在 | Poppler 未安装或 PATH 未配置 | 安装 Poppler 并重新打开 shell |
| 新编 PDF hash 不同但页数相同 | TeX 版本/时间戳变化 | 在隔离目录检查语义；要发布则重新 freeze |
| `--profile verify` 后文件变化 | 该 profile 会重写统计和 LaTeX 值 | 首次验收用显式 `canonical_integrity.py verify` |
| 测试中短暂出现 `passed:false` | artifact test 的预期失败夹具 | 看最终是否 `Ran 54 tests` 和 `OK` |
| Factorial 只有部分 raw | 长任务中断 | 用 confirmation `--resume` 恢复同 key；不得替代 seed |
| Linux memory 字段不同 | RSS 采集后端改变 | 保留明确 telemetry label，重新 freeze 新版本 |
| 作者仍为 Anonymous | 当前主稿保留匿名占位符 | 按 GPC 最终投稿政策决定何时替换 |

## 📌 关键源码哈希

完整 238 文件哈希以 release manifest 为准。下表用于快速识别关键实现版本：

| 文件 | SHA-256 |
| --- | --- |
| `sfc_autoresearch/prepare.py` | `005bf85389144b2758f2e666808b5d089fa62fab226fd60a275c5654c85b25e0` |
| `sfc_autoresearch/train.py` | `b2a1c3c1039e03bf4e13fe64a10065db1a10d866d7a0a49c0ce908725ebd5bd6` |
| `sfc_autoresearch/ccfb_data.py` | `086717dec3e03270a63146088ca26b4986445e28942843d4c4c9ec8a80c90b0d` |
| `sfc_autoresearch/experiment_driver.py` | `74d71f6b6abcc57f6d8cb284dbbd218040f2f933878fb3712e62ad5d0725c59f` |
| `sfc_autoresearch/factorial_confirmation_experiment.py` | `29c8cdcb16532783769bd4568b3d4327875e414b67a3502eb3db17bb065ea6df` |
| `sfc_autoresearch/formal_statistics.py` | `72cb6dbc0f23984836af1e7cc93dc966e6b52c39c641b8c63324e79cc0c3e69b` |
| `sfc_autoresearch/topology_zoo_data.py` | `4d2914834556b9e6423ce21d925a804e311115e701a4844912a5e7df25dad530` |
| `sfc_autoresearch/validation_integrity.py` | `3ec213e969f4c4002db5bb4f669f11609f84e37ca8862c7e3c3466ca636fb98d` |
| `sfc_autoresearch/canonical_integrity.py` | `bcc26d68073843af51a6e2ed434a7048cca08e905d2a8f83e2ce77c52b06c6c4` |
| `sfc_autoresearch/release_scope.py` | `57c580c15526425fa3754a4e406b32014ce0dac6b65edff271df26e5ee70b4ff` |
| `overleaf_burst_sfc_lNCS/BurstSFC2026.tex` | `17b5fcd4e63093da8eb7b05a62f8b30bbe489f635d41a4868a6e3ad592fbbc8e` |
| `overleaf_burst_sfc_lNCS/abstract.tex` | `202879a44e7d90a7fdf8b63670c3a09c74679ac1b971065305e6b8b3cd2619f5` |
| `overleaf_burst_sfc_lNCS/intro.tex` | `68fcfbfbdeb4d0db8318498b31da837f985c6ce676d8c331a025f946b1062fbd` |
| `overleaf_burst_sfc_lNCS/works.tex` | `022761a7ed88a97cb91718e28ff465c4a6277aaa855261dca7dec92cb91d2ae6` |
| `overleaf_burst_sfc_lNCS/problem.tex` | `094ef015cca26ab3b1dfba8577fcd91d3cdc3662831bcb45354b082a878562bc` |
| `overleaf_burst_sfc_lNCS/algorithm.tex` | `d3e00b0b70eb5090bdc42ce02daa67636beddd9b60b2b5325db3aca6d6086695` |
| `overleaf_burst_sfc_lNCS/evaluation.tex` | `627548b144c6be41c3cba08577b836b2d2f53467c9bcee06e7658c98bdeea6e2` |
| `overleaf_burst_sfc_lNCS/conclusion.tex` | `a9a0364788256f955945255e18054e010fef97a40ed86e626891d1cd9515b3e8` |
| `overleaf_burst_sfc_lNCS/refs_burst.bib` | `8e5c7bd583f32160e94d6e88800597289266ca0cd8c0c8d2ea37bc889f250872` |

## ✅ 迁移完成检查表

- [ ] 完整项目已通过归档而非复制 `.venv` 迁移
- [ ] 归档 SHA-256 在旧机和新机一致
- [ ] Python 3.11 环境已从 `requirements.txt` 重建
- [ ] `pdflatex`、`bibtex`、`pdfinfo`、`pdffonts` 可用
- [ ] 所有 `SFC_*` 覆盖变量为空
- [ ] 显式旧 release verify 为 `passed=true`
- [ ] 126 sources 和 112 results 全部匹配
- [ ] 54 项 unittest 全部通过
- [ ] `paper_value_sync.py --check` 通过
- [ ] semantic audit 通过且报告写入临时路径
- [ ] 隔离编译得到 15 页 PDF
- [ ] 无 Type 3、fatal、undefined、overfull、rerun
- [ ] 已确认权威 PDF 位于字面 `$out` 而不是旧 `output/`
- [ ] 已阅读 Round-02 五份报告和 10 个未完成项
- [ ] 未在验收前覆盖 canonical CSV、模型、PDF 或 manifest
- [ ] 新版本若有任何源码/结果/PDF 变化，已重新 freeze/verify

## 🔗 参考资料

[^1]: GPC 2026. “Call for Papers.” https://www.crowdos.cn/GPC2026/callForPapers.html

[^2]: SNDlib. “Survivable Network Design Library.” https://sndlib.put.poznan.pl/

[^3]: TopoHub. “A repository of real-world network topologies.” https://github.com/piotrjurkiewicz/topohub

[^4]: GitHub Docs. “About large files on GitHub.” https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github

---

_最后更新：2026-08-13。当前文档描述的是 Round-02 后、PDF SHA-256 为 `809f54...52ca1` 的冻结候选版本；后续任何新 freeze 都应同步更新本文档、审稿 JSON 和 GitHub 提交。_
