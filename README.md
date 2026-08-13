# dsh-search-mcp

用**搜索类 MCP 服务器**完全替代 DeepSeek Harness（dsh）内置搜索的独立插件。

- 模型侧 `web_search` 工具**保留原名、原展示**，但执行全部走你配置的搜索 MCP 服务器（Tavily / Brave / Exa / Perplexity / DuckDuckGo / 任意自定义 MCP）。
- 插件启用期间**内置 DeepSeek 搜索 provider 不可用**（`web-search-deepseek` 行被禁用，`web.searchProvider` 切到 `search-mcp`）；卸载插件即完全还原。
- 所有服务器配置（类型、端点/命令、API key 或 key 环境变量、工具名）都可以在 **Web 设置 → Plugins → search-mcp** 卡片里增删改，保存后即时生效，无需重启。

## 为什么需要它

dsh 内置 `web_search` 依赖 DeepSeek 官方搜索接口（`DEEPSEEK_API_KEY` 必须可解析），且每次搜索都消耗一次模型调用。换成 MCP 搜索服务器后：结果来自专业搜索 API（Tavily/Brave/Exa…），snapshot 质量更高、成本更可控，且多个搜索服务可在设置页里自由切换。

## 安装

```powershell
# 0. 先让插件自包含：安装它自己的依赖（MCP SDK、dsh 服务包等）
cd <本仓库路径>
npm install

# 1. 把插件装进 web profile（pnpm 需在 PATH 上；用 link: 使插件源码的
#    后续改动即时生效，无需重装）
dsh plugin --profile web add link:<本仓库路径>

# 2. 删除旧的直连 Tavily MCP 行（避免 `mcp__tavily__*` 工具重复出现）：
#    编辑 C:\Users\<你>\.dsh\profiles\web\cordis.patch.yml，
#    删掉 mcp-tavily 那段 insert（本仓库已在本机完成此迁移，保留注释备份）

# 3. 配置搜索服务器的 API key（密钥不入仓库）：
#    编辑 C:\Users\<你>\.dsh\.credentials.yaml 添加，例如：
#       TAVILY_API_KEY: <你的 key>
#    或在 Web 设置 → Plugins → search-mcp 里直接填 apiKey 字段。

# 4. 重启 dsh web 生效（Web bundle 未启用 HMR，必须重启进程）
dsh web
```

安装即自动生效三件事（由本包的 `cordis.patch.yml` bundle 层完成）：

```yaml
- insert:
    - id: search-mcp            # 本插件行（内置 Tavily 服务器条目，key 已迁移）
- id: web
  config:
    searchProvider: search-mcp  # web_search 工具改走本插件的 provider
- id: web-search-deepseek
  disabled: true               # 内置 DeepSeek 搜索不可用
```

> 说明：bundle 层在 `dsh-base` / `dsh-web-app` 之后、你的 `cordis.patch.yml` 之前应用；删除插件后该层整体消失，内置搜索原样恢复。

## 配置搜索服务器（设置页）

打开 Web 界面 → **设置 → Plugins → search-mcp**，维护 `servers` 列表：

| 字段 | 说明 |
|---|---|
| `id` | 服务器唯一标识，`defaultServer` 用它引用 |
| `kind` | `tavily` / `brave` / `exa` / `perplexity` / `duckduckgo` / `custom`，自动补全默认端点、鉴权方式和工具名 |
| `transport` | `http`（streamable-http，默认）或 `stdio`（本机命令，如 duckduckgo） |
| `url` | http 端点，如 `https://mcp.tavily.com/mcp/` |
| `command` / `args` | stdio 启动命令，如 `npx` + `["-y", "duckduckgo-mcp-server"]` |
| `apiKey` | 密钥（secret 字段，界面按密码框显示、落盘脱敏） |
| `apiKeyEnv` | 或填环境变量/凭证名（如 `TAVILY_API_KEY`），运行时经 dsh 凭证服务解析 |
| `authStyle` / `authParam` | key 的注入方式：http 用 `query`（如 `tavilyApiKey`）或 `header`（如 `x-api-key`）；stdio 时 `authParam` 即注入的环境变量名（如 `BRAVE_API_KEY`） |
| `toolName` | 该 MCP 的搜索工具名，如 `tavily_search` / `brave_web_search` / `web_search_exa` / `pplx_search` / `ddg_web_search` |
| `maxResults` | 单服务器结果数上限（可选，默认取全局 `maxResults`） |

全局字段：`defaultServer`（默认走哪个服务器）、`maxResults`（默认 8）、`searchTimeoutMs`（默认 30000）。

设置页保存的内容写入 `$DSH_HOME/settings.yaml` 的 `search-mcp:` 段，**优先于**行配置；provider 每次搜索重新读取快照，改完立即生效。

## 内置服务器速查（kind 预设）

| kind | 默认端点 | key 位置 | 默认工具 | 结果数参数 |
|---|---|---|---|---|
| `tavily` | `https://mcp.tavily.com/mcp/` | query `tavilyApiKey` | `tavily_search` | `max_results` |
| `brave` | `https://mcp.brave.com/mcp/` | query `braveApiKey` | `brave_web_search` | `count` |
| `exa` | `https://mcp.exa.ai/mcp` | header `x-api-key` | `web_search_exa` | `numResults` |
| `perplexity` | `https://mcp.perplexity.ai/mcp/` | query `pplx_api_key` | `pplx_search` | `max_results` |
| `duckduckgo` | `npx -y duckduckgo-mcp-server`（stdio，免 key） | — | `ddg_web_search` | — |
| `custom` | 自己填 | 自己选 | 自己填 | — |

key 申请：Tavily（tavily.com）、Brave（brave.com/search/api，免费 2000 次/月）、Exa（exa.ai）、Perplexity（perplexity.ai）、DuckDuckGo 无需 key。

## 验证

```powershell
# 组合层检查：searchProvider 已切换、deepseek 行已禁用
dsh --profile web --dump-config | Select-String -Pattern "searchProvider|search-mcp|web-search-deepseek"

# 重启后在新会话里让 agent 调用 web_search（如“搜索 MCP 服务器列表”），
# 返回结果应来自 Tavily，且工具目录里不再有 mcp__tavily__*。
```

## 卸载与还原

```powershell
# 方式一（pnpm 在 PATH 上）：
dsh plugin --profile web remove dsh-search-mcp

# 方式二（手动，pnpm 不在 PATH 时）：
#   1. 编辑 C:\Users\<你>\.dsh\profiles\web\package.json：
#      - dependencies 里删掉 "dsh-search-mcp": "link:..."
#      - dsh.profile.bundles 里删掉 "dsh-search-mcp"
#   2. 删除 C:\Users\<你>\.dsh\profiles\web\node_modules\dsh-search-mcp 链接

# 之后：
#   - 清掉 settings.yaml 里的 search-mcp: 段（如果在设置页改过配置）
#   - 把 cordis.patch.yml 里注释备份的 mcp-tavily 段还原（可选）
#   - 重启 dsh web：内置搜索（web-search-deepseek）恢复原样
```

## 故障排查

- `configured web provider "search-mcp" is registered but unavailable` → `servers` 列表为空，去设置页添加。
- `has no API key` → 该 kind 需要 key，填 `apiKey` 或 `apiKeyEnv`（env 需在 `$DSH_HOME/.credentials.yaml` 或启动环境里可解析）。
- `defaultServer "x" is not configured` → 检查 `defaultServer` 与某个 `servers[].id` 是否一致。
- `MCP server ... reported an error` / 连接失败 → 检查 URL、key 是否有效、网络是否可达；stdio 服务器请确认 `npx` 可执行。
- 想临时关闭插件：在 `cordis.patch.yml` 里给 `search-mcp` 行加 `disabled: true`（内置搜索仍处于被替换状态，需同时还原 `web`/`web-search-deepseek` 两行才恢复内置）。

## 实现说明

- provider 注册：`ctx.web.registerSearchProvider()`，id 固定为 `search-mcp`；返回形状与内置 provider 一致（`{ sources, truncated, content? }`），由原生 `web_search` 工具完成格式化。
- MCP 客户端：`@modelcontextprotocol/sdk`，每次搜索新建连接（http 或 stdio），结束时必关闭；调用方取消信号与 `searchTimeoutMs` 超时竞速，中止抛 `WEB_ABORTED`。
- 结果归一化：递归扫描 MCP 返回 JSON，凡带 `url` 的对象即作为 source（title/snippet/发布日期取常见字段名），`answer` 字段作为摘要——不依赖具体厂商格式，天然兼容未来新增的搜索 MCP。
- 密钥解析顺序：字面 `apiKey` → dsh 凭证服务（`apiKeyEnv`）→ 启动环境变量。
- 范围：只替换**搜索**；`web_fetch` 保持 dsh 默认关闭，不受影响。
