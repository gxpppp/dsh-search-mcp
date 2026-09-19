# dsh-search-mcp

用搜索类 MCP 服务器完整替代 DeepSeek Harness（DSH）内置网页搜索的独立插件。

> 当前兼容基线：DeepSeek Harness `0.1.1-rc.2`，Node.js 20 或更高版本。

## 功能

- 模型侧继续使用原生 `web_search`，插件只替换底层 search provider。
- 支持 Tavily、Brave、Exa、Perplexity、DuckDuckGo 和自定义 HTTP/stdio MCP。
- 已知 provider 只需选择服务商并填写 CDKey/API key，不需要填写 URL、命令、鉴权参数或工具名。
- 自定义 MCP 保留 URL、stdio 命令、鉴权方式和工具名等高级配置。
- 密钥通过 DSH credentials domain 写入；设置读取接口只返回是否已配置，不返回密钥值。
- DSH RC2 支持一次 `web_search` 提交多个查询，默认上限为 4。
- 卸载插件后 bundle 覆盖层随之移除，DSH 内置搜索组合恢复。

## 安装

```powershell
git clone https://github.com/gxpppp/dsh-search-mcp.git
cd dsh-search-mcp
npm install
dsh plugin --profile web add link:<dsh-search-mcp 的绝对路径>
dsh web
```

`link:` 会让源码更新直接作用于 profile。修改或升级浏览器 bundle 后需要重启 DSH Web 并刷新页面。

如果 profile 中已有独立搜索 MCP 行，建议先移除重复入口，避免同时暴露 `mcp__...` 工具和本插件提供的 `web_search`。

## 配置

打开：

**设置 → 插件 → 插件配置 → 搜索 MCP**

### 已知 provider

1. 点击 Tavily、Brave、Exa、Perplexity 或 DuckDuckGo 快捷按钮。
2. 展开服务器行。
3. 对需要凭据的 provider 填写 CDKey/API key，然后保存。
4. DuckDuckGo 无需 key。

已知 provider 的 endpoint、transport、鉴权方式、工具名和结果参数由 Host catalog 固定管理，设置页不会自动填入或显示链接。保存 CDKey 后，客户端先调用 `credentials.set`，再将生成的 credential reference 写入服务器设置；密钥本身不会写回普通 settings 字段。

也可以预先在 `$DSH_HOME/.credentials.yaml` 中保存凭据，再在设置页填写引用名：

```yaml
TAVILY_API_KEY: <your-key>
EXA_API_KEY: <your-key>
PERPLEXITY_API_KEY: <your-key>
BRAVE_API_KEY: <your-key>
```

RC2 的 `credentials/reference-updated` 事件会刷新设置卡片中的“已配置/未配置”状态，但不会传输密钥值。卡片按 RC2 每批最多 64 个引用的限制分批读取状态。保存多个字段失败时会逆序恢复已写入的 settings，并清理本次新建的 credential reference；由于 RC2 不允许读回已有密钥，覆盖一个此前已配置的引用后无法跨 credentials/settings 做值级回滚。

### 自定义 MCP

添加 `custom` 服务器后，可配置：

| 字段 | 说明 |
|---|---|
| `id` | 服务器唯一标识，供 `defaultServer` 引用 |
| `transport` | `http`（Streamable HTTP）或 `stdio` |
| `url` | 仅 HTTP 自定义 MCP 使用 |
| `command` / `args` | 仅 stdio 自定义 MCP 使用 |
| `apiKey` | 写入方向的 CDKey/API key 输入 |
| `apiKeyEnv` | 环境变量或 DSH credential reference |
| `authStyle` | HTTP 的 `query` 或 `header` |
| `authParam` | query/header 参数名；stdio 下作为环境变量名 |
| `toolName` | MCP 搜索工具名称 |
| `maxResults` | 单服务器结果数覆盖 |

### 全局选项

| 字段 | 说明 |
|---|---|
| `defaultServer` | 默认服务器 id；留空时使用第一行 |
| `maxResults` | 全局结果数上限，默认 8，可选 1–50 |
| `searchTimeoutMs` | 每次 MCP 搜索超时，默认 30000 ms；界面以秒显示 |

## Provider 预设

| kind | Host 管理的连接 | 凭据 | 搜索工具 | 结果数参数 |
|---|---|---|---|---|
| `tavily` | hosted Streamable HTTP | CDKey/API key | `tavily_search` | `max_results` |
| `brave` | `@brave/brave-search-mcp-server@2.1.3` stdio | `BRAVE_API_KEY` | `brave_web_search` | `count` |
| `exa` | hosted Streamable HTTP | `x-api-key` | `web_search_exa` | `numResults` |
| `perplexity` | hosted Streamable HTTP | Bearer token | `perplexity_search` | `max_results` |
| `duckduckgo` | `duckduckgo-mcp-server@0.1.2` stdio | 无 | `duckduckgo_web_search` | `count` |
| `custom` | 用户配置 | 用户配置 | 用户配置 | 无预设 |

旧配置中的 known-provider URL、transport、auth 和 tool 字段仍可被 schema 读取，但运行时会忽略它们；下一次保存服务器列表时会清理这些冗余字段。只有 `custom` 使用用户提供的连接信息。

插件在调用 known provider 前会把结果数限制到上游 MCP schema 接受的范围：Tavily 为 5–20，Brave、Perplexity 和 DuckDuckGo 为 1–20；Exa 当前保留插件的 1–50 范围。该限制只影响传给上游的参数，最终返回数量仍会受到插件全局/单服务器限制和实际 agent preset 的 `tool-web.searchMaxResults` 共同约束。

## DSH 0.1.1-rc.2 适配

- DSH host 依赖精确锁定为 `0.1.1-rc.2`，不使用可能落到旧版本线的子包 `latest`。
- 设置卡片继续使用 keyed slot：`settings.plugin.item` + `key: "search-mcp"`。
- 新密钥通过 `credentials.set` 单向写入，凭据状态通过 `credentials.describe` 读取。
- 监听 RC2 的 `credentials/reference-updated`，外部凭据变更后刷新状态 badge。
- RC6/RC7 遗留的字面 `apiKey` 仍可由 Host 使用；涉及服务器数组的编辑会阻止不可见旧密钥被意外删除，并要求先迁移。
- 普通全局字段修改不会重写 `servers` 数组。
- `tool-web.searchMaxQueries` 配置为 4，与 RC2 默认多查询能力一致。

## URL 安全策略

所有自定义 HTTP MCP 请求在联网前执行安全校验：

- 只允许 `http:` 和 `https:`，拒绝 userinfo 与非规范 IPv4 表示。
- 拒绝 localhost、环回、RFC1918 私网、链路本地、CGNAT、benchmark、文档/测试、多播、保留和广播地址。
- IPv4-mapped IPv6 先映射为 IPv4 再判断；IPv4-compatible IPv6、IPv6 ULA、link-local、NAT64/转换、Teredo、6to4、文档和保留范围同样拒绝。
- 域名会解析全部 A/AAAA 结果；任意一个结果不公开可路由时整体拒绝，DNS 等待也受同一个搜索 AbortSignal/超时约束。
- 每次搜索使用独占 Undici Agent 和预解析地址的 pinned lookup，同时保留原始 Host 与 TLS SNI，防止 DNS rebinding。
- GET、POST、DELETE 和 SSE 重连都通过同一 fetch wrapper，HTTP 重定向设置为 `error`。
- 先关闭 MCP client，再关闭本次 Agent，不共享连接池。
- 错误信息不会输出包含 CDKey 的完整 URL。

如果代理或 TUN 把公共域名解析到 `198.18.0.0/15` fake-IP，本插件会按 benchmark/test 网段安全拒绝。应让 DSH 进程获得真实公网 DNS 结果，而不是放宽策略。

## 组合覆盖

插件通过 `cordis.patch.yml`：

- 注册 `search-mcp` provider。
- 设置 `web.searchProvider: search-mcp`。
- 禁用 `web-search-deepseek`。
- 保持 `fetch` 关闭。
- 请求 `tool-web.searchMaxResults: 50` 和 `searchMaxQueries: 4`。

RC2 的 standard、code、cordis agent preset 各自包含 `tool-web` 行，并且都省略了 `searchMaxResults` 和 `searchMaxQueries`，因此实际采用 `dsh-tool-web` 默认值 8 和 4。agent-scoped 工具会遮蔽根层同名工具，所以根层 patch 中的 50 条请求不会提高这些 shipped preset 的实际上限。验证结果上限时必须检查 session 使用的 preset，不能只依据根层 `--dump-config`。

## 验证

```powershell
npm test
npm run check
npm pack --dry-run
```

自动测试覆盖 RC2 依赖锁定、known/custom catalog 边界、CDKey-only 设置结构、凭据事件、旧 secret 保护、结果归一化，以及 URL/DNS/pinning 安全策略。

2026-08-30 的隔离 RC2 Web 冒烟检查确认：插件卡片可加载；默认 Tavily 行不显示链接或高级连接字段；DuckDuckGo 摘要显示“无需密钥”，展开后只有 ID、provider 和结果数；测试草稿已放弃且没有写入 settings。无密钥 DuckDuckGo stdio server 能启动并收到正确的 `duckduckgo_web_search`/`count` 调用，但当次公开搜索被 DuckDuckGo 上游异常流量检测拒绝，因此未取得可用于结果归一化验收的真实来源。

组合检查：

```powershell
dsh --profile web --dump-config |
  Select-String -Pattern "searchProvider|search-mcp|web-search-deepseek|searchMaxResults|searchMaxQueries"
```

预期至少包括：

- `web.searchProvider: search-mcp`
- `web-search-deepseek.disabled: true`
- `tool-web.disabled: false`
- `fetch: false`

实际 agent preset 的结果数和多查询上限应在隔离 profile/session 中单独验证。

## 故障排查

- `no search MCP servers configured`：在设置页添加 provider。
- `has no API key`：填写 CDKey/API key，或填写已有 credential reference。
- “凭证未配置”：引用名存在于 settings，但 credentials provider 当前找不到对应值。
- `defaultServer "x" is not configured`：默认 id 没有匹配任何服务器行。
- `URL policy` 拒绝：endpoint 非 HTTP(S)，或 DNS 结果包含本地、私有、保留/测试地址。
- stdio 启动失败：确认 Node/npm 可用，且运行环境允许 `npx` 获取或执行对应 MCP 包。
- 设置页没有 Search MCP 卡片：确认 client bundle 已安装，重启 DSH Web 后强制刷新页面。
- 返回结果仍被截断：检查实际 agent preset 中的 `tool-web.searchMaxResults`，以及全局/单服务器 `maxResults`。

## 卸载

```powershell
dsh plugin --profile web remove dsh-search-mcp
```

随后重启 DSH Web。不要只禁用 `search-mcp` 行，因为 bundle 还覆盖了 `web`、`web-search-deepseek` 和 `tool-web`；完整卸载 bundle 才会恢复内置组合。

## License

MIT
