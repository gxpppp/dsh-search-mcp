# dsh-search-mcp

用搜索类 MCP 服务器完整替代 DeepSeek Harness（DSH）内置网页搜索的独立插件。

> 当前兼容基线：DeepSeek Harness `0.1.0-rc.7`，Node.js 20 或更高版本。

## 功能

- 模型侧继续使用原生 `web_search` 工具，名称和结果展示保持不变。
- 搜索请求全部交给已配置的 MCP 服务器，不再调用内置 DeepSeek 搜索 provider。
- 支持 Tavily、Brave、Exa、Perplexity、DuckDuckGo 和自定义 HTTP/stdio MCP。
- 可在 **设置 → 插件 → 插件配置 → 搜索 MCP** 中维护服务器、切换默认 provider、填写凭据和调整结果数。
- 设置保存后对下一次搜索立即生效；安装、升级或卸载浏览器 bundle 后需要重启 DSH Web 并刷新页面。
- 卸载插件后 bundle 覆盖层随之移除，DSH 内置搜索组合恢复。

## 工作方式

插件注册稳定 provider id `search-mcp`，并通过 `cordis.patch.yml` 完成四项组合覆盖：

```yaml
- insert:
    - id: search-mcp

- id: web
  config:
    searchProvider: search-mcp

- id: web-search-deepseek
  disabled: true

- id: tool-web
  disabled: false
  config:
    fetch: false
    searchTimeoutMs: 60000
    searchMaxResults: 50
```

`tool-web.searchMaxResults` 提高到 50，是为了避免模型侧工具先把 provider 返回结果截断。实际返回数量仍由 Search MCP 的全局或单服务器 `maxResults` 控制。`web_fetch` 保持关闭，不在本插件范围内。

## 安装

### 1. 获取插件并安装依赖

```powershell
git clone https://github.com/gxpppp/dsh-search-mcp.git
cd dsh-search-mcp
npm install
```

### 2. 链接到 Web profile

```powershell
dsh plugin --profile web add link:<dsh-search-mcp 的绝对路径>
```

`link:` 会让后续源码更新直接作用于 profile，无需重复安装插件。

如果 profile 中已经单独配置了 Tavily MCP，例如存在 `mcp-tavily` 行，建议先从 `$DSH_HOME/profiles/web/cordis.patch.yml` 删除该行，避免同时出现 `mcp__tavily__*` 工具和 `web_search` provider 两套入口。

### 3. 配置凭据

推荐在 `$DSH_HOME/.credentials.yaml` 中保存凭据：

```yaml
TAVILY_API_KEY: <your-key>
```

默认 bundle 已使用 `apiKeyEnv: TAVILY_API_KEY` 引用它。也可以在设置卡片的 API 密钥框中输入新值；RC7 客户端会将其写入 DSH credentials domain，并自动把服务器配置改为稳定的 `apiKeyEnv` 引用。密钥不会通过 settings 读取接口返回。

### 4. 启动或重启 Web

```powershell
dsh web
```

然后刷新浏览器，打开：

**设置 → 插件 → 插件配置 → 搜索 MCP**

## 设置页

卡片默认收起，展开后可配置以下全局选项：

| 字段 | 说明 |
|---|---|
| `defaultServer` | 默认服务器 id；留空时使用第一行 |
| `maxResults` | 全局结果数上限，默认 8，可选 1–50 |
| `searchTimeoutMs` | MCP 搜索超时，默认 30000 ms；界面以秒显示 |

每个 `servers` 条目支持：

| 字段 | 说明 |
|---|---|
| `id` | 服务器唯一标识，供 `defaultServer` 引用 |
| `kind` | `tavily`、`brave`、`exa`、`perplexity`、`duckduckgo` 或 `custom` |
| `transport` | `http`（Streamable HTTP）或 `stdio` |
| `url` | HTTP MCP endpoint |
| `command` / `args` | stdio MCP 启动命令和参数 |
| `apiKey` | 写入方向的密钥输入；保存后迁移到 credentials domain |
| `apiKeyEnv` | 环境变量或 DSH credential reference |
| `authStyle` | HTTP key 注入方式：`query` 或 `header` |
| `authParam` | query/header 参数名；stdio 下作为环境变量名 |
| `toolName` | MCP 搜索工具名称 |
| `maxResults` | 单服务器结果数覆盖；留空时继承全局值 |

常用 provider 可以通过快捷按钮直接添加，默认 endpoint、鉴权位置和工具名会自动补全。

## Provider 预设

| kind | 默认连接 | 鉴权 | 默认工具 | 结果数参数 |
|---|---|---|---|---|
| `tavily` | `https://mcp.tavily.com/mcp/` | query `tavilyApiKey` | `tavily_search` | `max_results` |
| `brave` | `https://mcp.brave.com/mcp/` | query `braveApiKey` | `brave_web_search` | `count` |
| `exa` | `https://mcp.exa.ai/mcp` | header `x-api-key` | `web_search_exa` | `numResults` |
| `perplexity` | `https://mcp.perplexity.ai/mcp/` | query `pplx_api_key` | `pplx_search` | `max_results` |
| `duckduckgo` | `npx -y duckduckgo-mcp-server` | 无需 key | `ddg_web_search` | 无 |
| `custom` | 用户配置 | 用户配置 | 用户配置 | 无 |

## RC6 → RC7 迁移

当前版本已经完成 RC7 适配：

- 设置卡片使用 RC7 keyed slot：`settings.plugin.item` + namespace `key`。
- DSH host 依赖精确锁定 `0.1.0-rc.7`，避免子包 npm `latest` tag 落到旧版本。
- settings 保存遵循 RC7 revision 和 secret-redaction 约定。
- 只修改全局结果数或超时时，不会重写 `servers` 数组。
- 新密钥通过 credentials API 写入，客户端只能读取“是否已配置”，不能读取密钥值。
- RC6 遗留的字面 `apiKey` 仍可由 Host 使用；设置页会标记为“旧版密钥”，并在可能丢失该值的结构编辑前要求先迁移到凭据引用。
- `settings.plugin.item`、secret 处理、bundle 覆盖和 package exports 已加入回归测试。

## 验证

### 自动检查

```powershell
npm test
npm run check
npm pack --dry-run
```

当前测试覆盖 provider 预设、结果归一化、URL 去重、RC7 keyed slot、凭据迁移锚点、bundle 组合和 package exports。

### 组合配置

```powershell
dsh --profile web --dump-config |
  Select-String -Pattern "searchProvider|search-mcp|web-search-deepseek|searchMaxResults"
```

预期结果：

- `web.searchProvider: search-mcp`
- `web-search-deepseek.disabled: true`
- `tool-web.disabled: false`
- `tool-web.searchMaxResults: 50`

### 已完成的 RC7 冒烟测试

隔离 RC7 Web profile 已验证：

- Search MCP 卡片能在插件设置页正常显示、折叠和展开。
- Tavily 默认服务器、结果数、超时、快捷 provider 和服务器详细字段正常渲染。
- API 密钥不会回显，只展示 credential reference。
- 只展开查看不会产生脏状态，保存和放弃按钮保持禁用。
- 真实 Tavily MCP 查询成功，约 7.8 秒返回 15 条来源，包含 DeepSeek Harness 官方 GitHub 仓库。

## 卸载

```powershell
dsh plugin --profile web remove dsh-search-mcp
```

随后：

1. 如有需要，删除 `$DSH_HOME/settings.yaml` 中的 `search-mcp:` 用户覆盖。
2. 如需恢复独立 Tavily MCP 工具，重新添加原来的 `mcp-tavily` 行。
3. 重启 DSH Web 并刷新页面。

不要只禁用 `search-mcp` 插件行：bundle 同时覆盖了 `web`、`web-search-deepseek` 和 `tool-web`。完整卸载 bundle 才会恢复内置搜索组合。

## 故障排查

- `configured web provider "search-mcp" is registered but unavailable`：`servers` 为空，请在设置页添加服务器。
- `has no API key`：为该 provider 配置 `apiKeyEnv`，或在 API 密钥框中写入新凭据。
- `defaultServer "x" is not configured`：`defaultServer` 没有匹配任何 `servers[].id`。
- `MCP server ... reported an error`：MCP 工具返回错误，检查 endpoint、工具名和 provider 状态。
- 连接失败或超时：检查网络、endpoint、凭据和 `searchTimeoutMs`；stdio provider 还需确认命令可执行。
- 设置页没有 Search MCP 卡片：确认插件 client 模块已加载，重启 DSH Web 后强制刷新页面。
- 搜索结果始终不超过较小数量：检查 `tool-web.searchMaxResults` 是否仍为 50，以及服务器是否设置了单独的 `maxResults`。

## 实现摘要

- Host provider：`ctx.web.registerSearchProvider()`，稳定 id 为 `search-mcp`。
- MCP 客户端：`@modelcontextprotocol/sdk`；每次搜索新建连接并在 `finally` 中关闭。
- 取消与超时：调用方 `AbortSignal` 与 `searchTimeoutMs` 合并，中止时抛出 `WEB_ABORTED`。
- 结果归一化：递归收集带 HTTP(S) `url` 的对象，提取常见 title/snippet/date 字段并按 URL 去重。
- 密钥解析顺序：历史字面 `apiKey` → DSH credential reference（`apiKeyEnv`）→ 启动环境变量。
- 配置生效：provider 在每次搜索开始时读取设置快照，一次搜索不会混用两次保存的配置。

## License

MIT
