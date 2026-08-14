/*
 * dsh-search-mcp — browser half.
 *
 * Registers one card into the Settings → Plugins → 插件配置 (configurable) tab,
 * bound to the `search-mcp` settings namespace registered by the host half.
 *
 * The card is a structured form (no raw JSON editing):
 *   - 默认服务器: dropdown of the configured server ids
 *   - 结果数上限 / 搜索超时: numeric inputs
 *   - 服务器列表: add/remove rows; per row: id, kind dropdown (tavily | brave
 *     | exa | perplexity | duckduckgo | custom — picking one fills the row's
 *     provider defaults), transport dropdown (http | stdio), url or
 *     command+args, apiKey (password) or apiKeyEnv, authStyle dropdown
 *     (query | header), authParam, toolName, maxResults.
 *
 * Loaded through window.__ModuleLoader__ like every shipped client bundle.
 */
window.__ModuleLoader__.load({
	id: "dsh-search-mcp",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");

		//#region styles
		const css = [
			".smcp_card{display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}",
			".smcp_card:hover{border-color:var(--dsw-alias-label-dimmed)}",
			".smcp_cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}",
			".smcp_headBtn{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}",
			".smcp_headBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}",
			".smcp_head{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}",
			".smcp_name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}",
			".smcp_desc{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}",
			".smcp_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}",
			".smcp_chevronOpen{transform:rotate(180deg)}",
			".smcp_body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px;display:flex;flex-direction:column;gap:0}",
			".smcp_field{display:flex;flex-direction:column;gap:6px;padding:12px 0}",
			".smcp_field + .smcp_field{border-top:1px solid var(--dsw-alias-border-l2)}",
			".smcp_label{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:1.5}",
			".smcp_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}",
			".smcp_input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}",
			".smcp_input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}",
			".smcp_select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 8px;font-size:13px;line-height:1.5}",
			".smcp_select:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}",
			".smcp_invalid{border-color:var(--dsw-alias-label-error)}",
			".smcp_error{color:var(--dsw-alias-label-error);margin:0;font-size:12px;line-height:1.5}",
			".smcp_badge{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}",
			".smcp_badgeMuted{white-space:nowrap;color:var(--dsw-alias-label-tertiary);border-radius:999px;padding:1px 8px;font-size:11px;line-height:17px}",
			".smcp_reset{font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;padding:0;font-size:12px;line-height:1.5}",
			".smcp_reset:hover:not(:disabled){color:var(--dsw-alias-label-primary)}",
			".smcp_reset:disabled{cursor:default}",
			".smcp_footer{display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--dsw-alias-border-l2)}",
			".smcp_btn{font:inherit;border-radius:8px;padding:0 14px;height:32px;font-size:13px;line-height:1.5;cursor:pointer}",
			".smcp_btnPrimary{border:1px solid var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-on-brand)}",
			".smcp_btnPrimary:disabled{opacity:.5;cursor:default}",
			".smcp_btnGhost{border:1px solid var(--dsw-alias-border-l2);background:0 0;color:var(--dsw-alias-label-secondary)}",
			".smcp_btnGhost:disabled{opacity:.5;cursor:default}",
			".smcp_row{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;background:var(--dsw-alias-bg-layer-2)}",
			".smcp_rowHead{display:flex;align-items:center;gap:8px}",
			".smcp_rowId{flex:1;min-width:0}",
			".smcp_rowGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
			".smcp_rowGrid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}",
			".smcp_cell{display:flex;flex-direction:column;gap:4px}",
			".smcp_cellLabel{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1.5}",
			".smcp_add{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;border:1px dashed var(--dsw-alias-border-l2);background:0 0;color:var(--dsw-alias-label-secondary);border-radius:8px;padding:6px 12px;font-size:12px;line-height:1.5;cursor:pointer}",
			".smcp_add:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l3)}",
			".smcp_del{border:1px solid var(--dsw-alias-border-l2);background:0 0;color:var(--dsw-alias-label-secondary);border-radius:8px;padding:4px 10px;font-size:12px;line-height:1.5;cursor:pointer}",
			".smcp_del:hover{color:var(--dsw-alias-label-error);border-color:var(--dsw-alias-label-error)}"
		].join("");
		const cssTag = "dsh-search-mcp/card.css";
		if (typeof document !== "undefined" && document.querySelector(`style[data-plugin-css="${cssTag}"]`) === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-search-mcp";
			tag.dataset.pluginCss = cssTag;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion

		//#region provider catalog (mirrors lib/catalog.js, browser-side)
		const CATALOG = {
			tavily: { transport: "http", url: "https://mcp.tavily.com/mcp/", authStyle: "query", authParam: "tavilyApiKey", toolName: "tavily_search", needsKey: true },
			brave: { transport: "http", url: "https://mcp.brave.com/mcp/", authStyle: "query", authParam: "braveApiKey", toolName: "brave_web_search", needsKey: true },
			exa: { transport: "http", url: "https://mcp.exa.ai/mcp", authStyle: "header", authParam: "x-api-key", toolName: "web_search_exa", needsKey: true },
			perplexity: { transport: "http", url: "https://mcp.perplexity.ai/mcp/", authStyle: "query", authParam: "pplx_api_key", toolName: "pplx_search", needsKey: true },
			duckduckgo: { transport: "stdio", command: "npx", args: ["-y", "duckduckgo-mcp-server"], authStyle: "query", authParam: "", toolName: "ddg_web_search", needsKey: false },
			custom: { transport: "http", url: "", authStyle: "query", authParam: "", toolName: "", needsKey: false }
		};
		const KIND_OPTIONS = Object.keys(CATALOG);
		const TRANSPORT_OPTIONS = ["http", "stdio"];
		const AUTH_STYLE_OPTIONS = ["", "query", "header"];
		//#endregion

		//#region locale
		const en = {
			title: "Search MCP",
			description: "Search MCP servers behind the web_search tool; the built-in DeepSeek search stays disabled while this plugin is enabled.",
			defaultServer: "Default server",
			defaultServerHint: "Which server row serves searches (empty = first row).",
			maxResults: "Max results",
			maxResultsHint: "Upper bound on sources returned per search.",
			searchTimeoutMs: "Search timeout (ms)",
			searchTimeoutMsHint: "Abort a search that takes longer than this.",
			servers: "Search MCP servers",
			serversHint: "Add one row per provider. Pick a kind to fill its endpoint and key placement; keys stay local (apiKey or apiKeyEnv + ~/.dsh/.credentials.yaml).",
			addServer: "Add server",
			removeServer: "Remove",
			rowId: "ID",
			rowIdHint: "Stable id used by “default server”.",
			rowKind: "Provider",
			rowTransport: "Transport",
			rowUrl: "Endpoint (URL)",
			rowCommand: "Command",
			rowArgs: "Args (comma separated)",
			rowApiKey: "API key",
			rowApiKeyEnv: "Key env/credential ref",
			rowAuthStyle: "Key placement",
			rowAuthParam: "Key param / env name",
			rowToolName: "MCP tool name",
			rowMaxResults: "Max results (per server)",
			missingId: "ID is required.",
			overridden: "Overridden",
			reset: "Reset to default",
			readOnly: "This deployment stores settings read-only.",
			save: "Save",
			saving: "Saving…",
			discard: "Discard",
			unsaved: "Unsaved",
			saveFailed: "The deployment did not accept these values; they were left for you to correct."
		};
		const zh = {
			title: "搜索 MCP",
			description: "web_search 工具背后的搜索 MCP 服务器；插件启用期间内置 DeepSeek 搜索保持禁用。",
			defaultServer: "默认服务器",
			defaultServerHint: "使用哪一行服务器（留空 = 第一行）。",
			maxResults: "结果数上限",
			maxResultsHint: "每次搜索最多返回的条数。",
			searchTimeoutMs: "搜索超时（毫秒）",
			searchTimeoutMsHint: "超过该时长即中止搜索。",
			servers: "搜索 MCP 服务器",
			serversHint: "每个提供商一行。选择提供商（kind）会自动带出它的端点与密钥位置；密钥只存本地（apiKey 或 apiKeyEnv 引用 ~/.dsh/.credentials.yaml）。",
			addServer: "添加服务器",
			removeServer: "删除",
			rowId: "ID",
			rowIdHint: "“默认服务器”下拉框引用的稳定标识。",
			rowKind: "提供商",
			rowTransport: "传输方式",
			rowUrl: "端点（URL）",
			rowCommand: "命令",
			rowArgs: "参数（逗号分隔）",
			rowApiKey: "API 密钥",
			rowApiKeyEnv: "密钥环境变量/凭证引用",
			rowAuthStyle: "密钥位置",
			rowAuthParam: "密钥参数名/环境变量名",
			rowToolName: "MCP 工具名",
			rowMaxResults: "结果数上限（每服务器）",
			missingId: "ID 不能为空。",
			overridden: "已覆盖",
			reset: "恢复默认",
			readOnly: "本部署的设置为只读。",
			save: "保存",
			saving: "保存中…",
			discard: "放弃修改",
			unsaved: "未保存",
			saveFailed: "本部署没有接受这些值，已保留供你修改。"
		};
		//#endregion

		/** Namespace of this plugin's settings section (spelled, not imported). */
		const NS = "search-mcp";

		//#region row helpers
		function emptyRow() {
			return {
				id: "",
				kind: "custom",
				transport: "http",
				url: "",
				command: "",
				args: "",
				apiKey: "",
				apiKeyEnv: "",
				authStyle: "",
				authParam: "",
				toolName: "",
				maxResults: ""
			};
		}
		/** Convert a stored server entry (host shape) to a row draft. */
		function rowFromEntry(entry) {
			const preset = CATALOG[entry.kind] ?? CATALOG.custom;
			return {
				id: entry.id ?? "",
				kind: entry.kind ?? "custom",
				transport: entry.transport || preset.transport || "http",
				url: entry.url ?? "",
				command: entry.command ?? "",
				args: Array.isArray(entry.args) ? entry.args.join(", ") : "",
				apiKey: entry.apiKey ?? "",
				apiKeyEnv: entry.apiKeyEnv ?? "",
				authStyle: entry.authStyle ?? "",
				authParam: entry.authParam ?? "",
				toolName: entry.toolName ?? "",
				maxResults: entry.maxResults === undefined ? "" : String(entry.maxResults)
			};
		}
		/** Convert a row draft to a stored server entry (host shape). */
		function entryFromRow(row) {
			const preset = CATALOG[row.kind] ?? CATALOG.custom;
			const entry = {
				id: row.id.trim(),
				kind: row.kind,
				transport: row.transport || preset.transport || "http"
			};
			if (entry.transport === "stdio") {
				if (row.command.trim() !== "") entry.command = row.command.trim();
				const args = row.args.split(",").map((a) => a.trim()).filter(Boolean);
				if (args.length > 0) entry.args = args;
			} else {
				if (row.url.trim() !== "") entry.url = row.url.trim();
			}
			if (row.apiKey.trim() !== "") entry.apiKey = row.apiKey.trim();
			if (row.apiKeyEnv.trim() !== "") entry.apiKeyEnv = row.apiKeyEnv.trim();
			if (row.authStyle !== "") entry.authStyle = row.authStyle;
			if (row.authParam.trim() !== "") entry.authParam = row.authParam.trim();
			if (row.toolName.trim() !== "") entry.toolName = row.toolName.trim();
			if (row.maxResults.trim() !== "") {
				const n = Number(row.maxResults);
				if (Number.isFinite(n) && n > 0) entry.maxResults = Math.round(n);
			}
			return entry;
		}
		/** When the kind changes, fill provider defaults the user has not customized. */
		function applyKindDefaults(row, kind) {
			const preset = CATALOG[kind] ?? CATALOG.custom;
			const oldPreset = CATALOG[row.kind] ?? CATALOG.custom;
			const next = { ...row, kind };
			if (next.url === "" || oldPreset.url === next.url) next.url = preset.url ?? "";
			if (next.command === "" || (oldPreset.command ?? "") === next.command) next.command = preset.command ?? "";
			if (next.toolName === "" || oldPreset.toolName === next.toolName) next.toolName = preset.toolName ?? "";
			if (next.authParam === "" || oldPreset.authParam === next.authParam) next.authParam = preset.authParam ?? "";
			if (next.authStyle === "" || oldPreset.authStyle === next.authStyle) next.authStyle = preset.authStyle ?? "";
			if (next.transport === "" || (oldPreset.transport ?? "") === next.transport) next.transport = preset.transport ?? "http";
			return next;
		}
		//#endregion

		//#region controller (whole-section staged draft)
		var SearchMcpCardController = class {
			constructor(scope) {
				this.scope = scope;
				this.draft = null;
				this.listeners = new Set();
				this.saving = false;
				this.failed = false;
				this.store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(this.project());
				scope.subscribe(() => {
					if (this.draft === null) this.publish();
				});
			}
			section() {
				return this.scope.getSnapshot();
			}
			value() {
				return this.section().value ?? {};
			}
			userLayer() {
				return this.section().user;
			}
			baseDraft() {
				const value = this.value();
				return {
					defaultServer: typeof value.defaultServer === "string" ? value.defaultServer : "",
					maxResults: typeof value.maxResults === "number" ? String(value.maxResults) : "",
					searchTimeoutMs: typeof value.searchTimeoutMs === "number" ? String(value.searchTimeoutMs) : "",
					servers: Array.isArray(value.servers) ? value.servers.map(rowFromEntry) : []
				};
			}
			ensureDraft() {
				if (this.draft === null) this.draft = this.baseDraft();
				return this.draft;
			}
			project() {
				const snapshot = this.section();
				const draft = this.draft;
				const sectionValue = snapshot.value ?? {};
				const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(this.baseDraft());
				const invalid = draft !== null && draft.servers.some((row) => row.id.trim() === "");
				return {
					available: snapshot.status === "ready",
					writable: snapshot.writable,
					dirty,
					invalid,
					saving: this.saving,
					failed: this.failed,
					overridden: Object.keys(this.userLayer() ?? {}).length > 0,
					value: draft !== null ? draft : this.baseDraft(),
					serverIds: draft !== null
						? draft.servers.map((row) => row.id.trim()).filter(Boolean)
						: (Array.isArray(sectionValue.servers) ? sectionValue.servers.map((s) => s.id).filter(Boolean) : [])
				};
			}
			publish() {
				this.store.set(this.project());
			}
			actions() {
				return {
					editScalar: (field, text) => {
						this.ensureDraft()[field] = text;
						this.failed = false;
						this.publish();
					},
					editRow: (index, field, value) => {
						const draft = this.ensureDraft();
						draft.servers[index] = { ...draft.servers[index], [field]: value };
						this.failed = false;
						this.publish();
					},
					changeKind: (index, kind) => {
						const draft = this.ensureDraft();
						draft.servers[index] = applyKindDefaults(draft.servers[index], kind);
						this.failed = false;
						this.publish();
					},
					addServer: () => {
						const draft = this.ensureDraft();
						draft.servers.push(emptyRow());
						this.failed = false;
						this.publish();
					},
					removeServer: (index) => {
						const draft = this.ensureDraft();
						draft.servers.splice(index, 1);
						this.failed = false;
						this.publish();
					},
					discard: () => {
						if (this.draft === null && !this.failed) return;
						this.draft = null;
						this.failed = false;
						this.publish();
					},
					save: () => {
						this.save();
					}
				};
			}
			async save() {
				if (this.draft === null || this.saving) return;
				const draft = this.draft;
				const invalid = draft.servers.some((row) => row.id.trim() === "");
				if (invalid) return;
				this.saving = true;
				this.failed = false;
				this.publish();
				let landed = true;
				const writes = [
					["defaultServer", draft.defaultServer.trim()],
					["maxResults", draft.maxResults.trim() === "" ? undefined : Number(draft.maxResults)],
					["searchTimeoutMs", draft.searchTimeoutMs.trim() === "" ? undefined : Number(draft.searchTimeoutMs)],
					["servers", draft.servers.map(entryFromRow)]
				];
				for (const [field, value] of writes) {
					try {
						if (value === undefined) await this.scope.unset(field);
						else await this.scope.set(field, value);
						const current = this.section().user;
						const ok = value === undefined ? !(current && Object.hasOwn(current, field)) : current?.[field] === value;
						landed = ok && landed;
					} catch {
						landed = false;
					}
				}
				if (landed) this.draft = null;
				this.saving = false;
				this.failed = !landed;
				this.publish();
			}
			inject() {
				return {
					hooks: { searchMcpCard: this.store },
					...this.actions()
				};
			}
		};
		//#endregion

		//#region components
		function SearchMcpCard(props) {
			const { t } = props;
			const [open, setOpen] = (0, react.useState)(false);
			const state = props.useSearchMcpCard((snapshot) => snapshot);
			if (!state.available) return null;
			const disabled = !state.writable;
			const value = state.value;
			const title = t("title");
			return (0, react_jsx_runtime.jsxs)("li", {
				className: "smcp_card" + (open ? " smcp_cardOpen" : ""),
				children: [
					(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "smcp_headBtn",
						"aria-expanded": open,
						"aria-label": `${open ? "收起" : "展开"}: ${title}`,
						onClick: () => {
							setOpen(!open);
						},
						children: [
							(0, react_jsx_runtime.jsxs)("span", {
								className: "smcp_head",
								children: [
									(0, react_jsx_runtime.jsx)("span", { className: "smcp_name", children: title }),
									(0, react_jsx_runtime.jsx)("span", { className: "smcp_desc", children: t("description") }),
									state.overridden ? (0, react_jsx_runtime.jsx)("span", { className: "smcp_badge", children: t("overridden") }) : null,
									state.dirty ? (0, react_jsx_runtime.jsx)("span", { className: "smcp_badgeMuted", children: t("unsaved") }) : null
								]
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, {
								className: "smcp_chevron" + (open ? " smcp_chevronOpen" : "")
							})
						]
					}),
					open ? (0, react_jsx_runtime.jsxs)("div", {
						className: "smcp_body",
						children: [
							!state.writable ? (0, react_jsx_runtime.jsx)("p", { className: "smcp_hint", children: t("readOnly") }) : null,
							(0, react_jsx_runtime.jsx)(SelectField, {
								id: "smcp-default-server",
								label: t("defaultServer"),
								hint: t("defaultServerHint"),
								disabled,
								options: ["", ...state.serverIds],
								value: value.defaultServer,
								onEdit: (text) => props.editScalar("defaultServer", text)
							}),
							(0, react_jsx_runtime.jsx)(TextField, {
								id: "smcp-max-results",
								label: t("maxResults"),
								hint: t("maxResultsHint"),
								numeric: true,
								disabled,
								value: value.maxResults,
								onEdit: (text) => props.editScalar("maxResults", text)
							}),
							(0, react_jsx_runtime.jsx)(TextField, {
								id: "smcp-timeout",
								label: t("searchTimeoutMs"),
								hint: t("searchTimeoutMsHint"),
								numeric: true,
								disabled,
								value: value.searchTimeoutMs,
								onEdit: (text) => props.editScalar("searchTimeoutMs", text)
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: "smcp_field",
								children: [
									(0, react_jsx_runtime.jsx)("span", { className: "smcp_label", children: t("servers") }),
									(0, react_jsx_runtime.jsx)("p", { className: "smcp_hint", children: t("serversHint") }),
									value.servers.map((row, index) => (0, react_jsx_runtime.jsx)(
										ServerRow,
										{
											t,
											row,
											index,
											disabled,
											onEdit: (field, val) => props.editRow(index, field, val),
											onKind: (kind) => props.changeKind(index, kind),
											onRemove: () => props.removeServer(index)
										},
										`smcp-row-${index}`
									)),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "smcp_add",
										disabled,
										onClick: props.addServer,
										children: `+ ${t("addServer")}`
									})
								]
							}),
							state.failed ? (0, react_jsx_runtime.jsx)("p", { role: "status", className: "smcp_error", children: t("saveFailed") }) : null,
							(0, react_jsx_runtime.jsxs)("div", {
								className: "smcp_footer",
								children: [
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "smcp_btn smcp_btnGhost",
										disabled: !state.dirty || state.saving,
										onClick: props.discard,
										children: t("discard")
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "smcp_btn smcp_btnPrimary",
										disabled: !state.dirty || state.invalid || state.saving,
										onClick: props.save,
										children: t(state.saving ? "saving" : "save")
									})
								]
							})
						]
					}) : null
				]
			});
		}
		function ServerRow(props) {
			const { t, row, index, disabled, onEdit, onKind, onRemove } = props;
			const rowInvalid = row.id.trim() === "";
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "smcp_row",
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: "smcp_rowHead",
						children: [
							(0, react_jsx_runtime.jsx)("input", {
								className: "smcp_input smcp_rowId" + (rowInvalid ? " smcp_invalid" : ""),
								placeholder: t("rowId"),
								value: row.id,
								disabled,
								onChange: (e) => onEdit("id", e.target.value)
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "smcp_del",
								disabled,
								onClick: onRemove,
								children: t("removeServer")
							})
						]
					}),
					rowInvalid ? (0, react_jsx_runtime.jsx)("p", { className: "smcp_error", children: t("missingId") }) : null,
					(0, react_jsx_runtime.jsxs)("div", {
						className: "smcp_rowGrid3",
						children: [
							(0, react_jsx_runtime.jsx)(CellSelect, {
								label: t("rowKind"),
								options: KIND_OPTIONS,
								value: row.kind,
								disabled,
								onEdit: onKind
							}),
							(0, react_jsx_runtime.jsx)(CellSelect, {
								label: t("rowTransport"),
								options: TRANSPORT_OPTIONS,
								value: row.transport,
								disabled,
								onEdit: (v) => onEdit("transport", v)
							}),
							(0, react_jsx_runtime.jsx)(CellSelect, {
								label: t("rowAuthStyle"),
								options: AUTH_STYLE_OPTIONS,
								value: row.authStyle,
								disabled,
								onEdit: (v) => onEdit("authStyle", v)
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "smcp_rowGrid",
						children: [
							(0, react_jsx_runtime.jsx)(CellInput, {
								label: t("rowUrl"),
								value: row.url,
								disabled,
								onEdit: (v) => onEdit("url", v)
							}),
							(0, react_jsx_runtime.jsx)(CellInput, {
								label: t("rowApiKey"),
								type: "password",
								value: row.apiKey,
								disabled,
								onEdit: (v) => onEdit("apiKey", v)
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "smcp_rowGrid",
						children: [
							(0, react_jsx_runtime.jsx)(CellInput, {
								label: t("rowApiKeyEnv"),
								value: row.apiKeyEnv,
								disabled,
								onEdit: (v) => onEdit("apiKeyEnv", v)
							}),
							(0, react_jsx_runtime.jsx)(CellInput, {
								label: t("rowAuthParam"),
								value: row.authParam,
								disabled,
								onEdit: (v) => onEdit("authParam", v)
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "smcp_rowGrid",
						children: [
							(0, react_jsx_runtime.jsx)(CellInput, {
								label: t("rowCommand"),
								value: row.command,
								disabled,
								onEdit: (v) => onEdit("command", v)
							}),
							(0, react_jsx_runtime.jsx)(CellInput, {
								label: t("rowArgs"),
								value: row.args,
								disabled,
								onEdit: (v) => onEdit("args", v)
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "smcp_rowGrid",
						children: [
							(0, react_jsx_runtime.jsx)(CellInput, {
								label: t("rowToolName"),
								value: row.toolName,
								disabled,
								onEdit: (v) => onEdit("toolName", v)
							}),
							(0, react_jsx_runtime.jsx)(CellInput, {
								label: t("rowMaxResults"),
								value: row.maxResults,
								disabled,
								onEdit: (v) => onEdit("maxResults", v)
							})
						]
					})
				]
			});
		}
		function CellInput(props) {
			return (0, react_jsx_runtime.jsxs)("label", {
				className: "smcp_cell",
				children: [
					(0, react_jsx_runtime.jsx)("span", { className: "smcp_cellLabel", children: props.label }),
					(0, react_jsx_runtime.jsx)("input", {
						className: "smcp_input",
						type: props.type ?? "text",
						value: props.value,
						disabled: props.disabled,
						onChange: (e) => props.onEdit(e.target.value)
					})
				]
			});
		}
		function CellSelect(props) {
			return (0, react_jsx_runtime.jsxs)("label", {
				className: "smcp_cell",
				children: [
					(0, react_jsx_runtime.jsx)("span", { className: "smcp_cellLabel", children: props.label }),
					(0, react_jsx_runtime.jsx)("select", {
						className: "smcp_select",
						value: props.value,
						disabled: props.disabled,
						onChange: (e) => props.onEdit(e.target.value),
						children: props.options.map((option) => (0, react_jsx_runtime.jsx)("option", { value: option, children: option === "" ? "—" : option }, option))
					})
				]
			});
		}
		function TextField(props) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "smcp_field",
				children: [
					(0, react_jsx_runtime.jsx)("label", { className: "smcp_label", htmlFor: props.id, children: props.label }),
					(0, react_jsx_runtime.jsx)("input", {
						id: props.id,
						className: "smcp_input",
						type: "text",
						inputMode: props.numeric ? "numeric" : undefined,
						value: props.value,
						disabled: props.disabled,
						onChange: (e) => props.onEdit(e.target.value)
					}),
					(0, react_jsx_runtime.jsx)("p", { className: "smcp_hint", children: props.hint })
				]
			});
		}
		function SelectField(props) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "smcp_field",
				children: [
					(0, react_jsx_runtime.jsx)("label", { className: "smcp_label", htmlFor: props.id, children: props.label }),
					(0, react_jsx_runtime.jsx)("select", {
						id: props.id,
						className: "smcp_select",
						value: props.value,
						disabled: props.disabled,
						onChange: (e) => props.onEdit(e.target.value),
						children: props.options.map((option) => (0, react_jsx_runtime.jsx)("option", { value: option, children: option === "" ? "—" : option }, option))
					}),
					(0, react_jsx_runtime.jsx)("p", { className: "smcp_hint", children: props.hint })
				]
			});
		}
		//#endregion

		//#region apply
		/** Required client services (resolved by the client kernel). */
		const inject = ["slots", "locale", "connection", "settingsScope"];

		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-search-mcp: section dictionaries");
			const controller = new SearchMcpCardController(ctx.settingsScope.bind({ namespace: NS }));
			ctx.slots.inject("settings.plugin.item", function* () {
				yield ctx.slots.register({
					name: "settings.plugin.item",
					id: "search-mcp",
					order: 30,
					locale: NS,
					inject: () => controller.inject()
				}, SearchMcpCard);
			});
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
