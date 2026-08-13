/*
 * dsh-search-mcp — browser half.
 *
 * Registers one card into the Settings → Plugins → 插件配置 (configurable) tab,
 * bound to the `search-mcp` settings namespace registered by the host half.
 * The card edits the same fields the host Config schema owns:
 *   defaultServer, maxResults, searchTimeoutMs, servers (JSON array whose
 *   entries carry id/kind/url|command/args/apiKey|apiKeyEnv/toolName/...).
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
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");

		//#region styles
		const css = [
			".smcp_card{display:flex;flex-direction:column;gap:12px}",
			".smcp_head{display:flex;flex-direction:column;gap:4px;text-align:left;width:100%}",
			".smcp_name{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:1.5}",
			".smcp_desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.5}",
			".smcp_field{display:flex;flex-direction:column;gap:6px;padding:12px 0}",
			".smcp_field + .smcp_field{border-top:1px solid var(--dsw-alias-border-l2)}",
			".smcp_label{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:1.5}",
			".smcp_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}",
			".smcp_input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}",
			".smcp_input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}",
			".smcp_textarea{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:8px 12px;font-size:12px;line-height:1.5;min-height:160px;resize:vertical;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}",
			".smcp_textarea:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}",
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
			".smcp_btnGhost:disabled{opacity:.5;cursor:default}"
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

		//#region locale
		const en = {
			title: "Search MCP",
			description: "Search MCP servers behind the web_search tool; the built-in DeepSeek search stays disabled while this plugin is enabled.",
			defaultServer: "Default server",
			defaultServerHint: "Which servers[] entry serves searches (empty = first entry).",
			maxResults: "Max results",
			maxResultsHint: "Upper bound on sources returned per search.",
			searchTimeoutMs: "Search timeout (ms)",
			searchTimeoutMsHint: "Abort a search that takes longer than this.",
			servers: "Servers (JSON)",
			serversHint: "Array of server entries: id, kind (tavily|brave|exa|perplexity|duckduckgo|custom), transport (http|stdio), url or command+args, apiKey or apiKeyEnv, authStyle, authParam, toolName, maxResults. Keys are stored here in the settings file; prefer apiKeyEnv + ~/.dsh/.credentials.yaml.",
			overridden: "Overridden",
			reset: "Reset to default",
			readOnly: "This deployment stores settings read-only.",
			save: "Save",
			saving: "Saving…",
			discard: "Discard",
			unsaved: "Unsaved",
			saveFailed: "The deployment did not accept these values; they were left for you to correct.",
			invalidJson: "Enter a JSON array, or leave blank to use the default."
		};
		const zh = {
			title: "搜索 MCP",
			description: "web_search 工具背后的搜索 MCP 服务器；插件启用期间内置 DeepSeek 搜索保持禁用。",
			defaultServer: "默认服务器",
			defaultServerHint: "使用 servers[] 中的哪一项（留空 = 第一项）。",
			maxResults: "结果数上限",
			maxResultsHint: "每次搜索最多返回的条数。",
			searchTimeoutMs: "搜索超时（毫秒）",
			searchTimeoutMsHint: "超过该时长即中止搜索。",
			servers: "服务器列表（JSON）",
			serversHint: "服务器条目数组：id、kind（tavily|brave|exa|perplexity|duckduckgo|custom）、transport（http|stdio）、url 或 command+args、apiKey 或 apiKeyEnv、authStyle、authParam、toolName、maxResults。密钥建议用 apiKeyEnv 引用 ~/.dsh/.credentials.yaml。",
			overridden: "已覆盖",
			reset: "恢复默认",
			readOnly: "本部署的设置为只读。",
			save: "保存",
			saving: "保存中…",
			discard: "放弃修改",
			unsaved: "未保存",
			saveFailed: "本部署没有接受这些值，已保留供你修改。",
			invalidJson: "请输入 JSON 数组，或留空使用默认值。"
		};
		//#endregion

		/** Namespace of this plugin's settings section (spelled, not imported). */
		const NS = "search-mcp";

		//#region field specs
		function textField(field) {
			return {
				field,
				format: (value) => (typeof value === "string" ? value : ""),
				parse: (text) => {
					const trimmed = text.trim();
					return trimmed === "" ? { kind: "clear" } : { kind: "set", value: trimmed };
				}
			};
		}
		function numberField(field) {
			return {
				field,
				format: (value) => (typeof value === "number" ? String(value) : ""),
				parse: (text) => {
					const trimmed = text.trim();
					if (trimmed === "") return { kind: "clear" };
					const parsed = Number(trimmed);
					return Number.isFinite(parsed) ? { kind: "set", value: parsed } : undefined;
				}
			};
		}
		function jsonField(field) {
			return {
				field,
				format: (value) => (value === undefined ? "" : JSON.stringify(value, null, 2)),
				parse: (text) => {
					const trimmed = text.trim();
					if (trimmed === "") return { kind: "clear" };
					try {
						return { kind: "set", value: JSON.parse(trimmed) };
					} catch {
						return undefined;
					}
				}
			};
		}
		//#endregion

		//#region card form (staged edits over the namespace scope)
		var CardForm = class {
			constructor(scope, specs) {
				this.scope = scope;
				this.specs = new Map(specs.map((spec) => [spec.field, spec]));
				this.staged = new Map();
				this.listeners = new Set();
				this.saving = false;
				this.failed = false;
				scope.subscribe(() => this.publish());
			}
			bind(project) {
				const store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(project());
				this.listeners.add(() => store.set(project()));
				return store;
			}
			shell() {
				const snapshot = this.scope.getSnapshot();
				const plan = this.plan();
				return {
					available: snapshot.status === "ready",
					writable: snapshot.writable,
					dirty: plan.length > 0,
					invalid: plan.some((item) => item.run === undefined),
					saving: this.saving,
					failed: this.failed
				};
			}
			field(field) {
				const spec = this.spec(field);
				const staged = this.staged.get(field);
				if (staged === undefined) {
					return {
						text: spec.format(this.sectionValue(field)),
						overridden: this.stored(field),
						invalid: false
					};
				}
				const write = staged.clear ? { kind: "clear" } : spec.parse(staged.text);
				return {
					text: staged.text,
					overridden: write?.kind === "set",
					invalid: write === undefined
				};
			}
			actions() {
				return {
					edit: (field, text) => {
						this.staged.set(field, { text, clear: false });
						this.failed = false;
						this.publish();
					},
					resetField: (field) => {
						this.staged.set(field, {
							text: this.spec(field).format(this.baseValue(field)),
							clear: true
						});
						this.publish();
					},
					save: () => {
						this.save();
					},
					discard: () => {
						if (this.staged.size === 0 && !this.failed) return;
						this.staged.clear();
						this.failed = false;
						this.publish();
					}
				};
			}
			async save() {
				const plan = this.plan();
				const writes = plan.flatMap((item) => (item.run === undefined ? [] : [item.run]));
				if (plan.length === 0 || this.saving || writes.length !== plan.length) return;
				this.saving = true;
				this.failed = false;
				this.publish();
				let landed = true;
				for (const write of writes) landed = (await write()) && landed;
				if (landed) this.staged.clear();
				this.saving = false;
				this.failed = !landed;
				this.publish();
			}
			plan() {
				const plan = [];
				for (const [field, staged] of this.staged) {
					if (staged.clear) {
						if (this.stored(field)) {
							plan.push({ field, run: () => this.clear(field) });
						}
						continue;
					}
					const spec = this.spec(field);
					if (staged.text === spec.format(this.sectionValue(field))) continue;
					const write = spec.parse(staged.text);
					if (write === undefined) plan.push({ field, run: undefined });
					else if (write.kind === "clear") plan.push({ field, run: () => this.clear(field) });
					else plan.push({ field, run: () => this.store(field, write.value) });
				}
				return plan;
			}
			async clear(field) {
				await this.scope.unset(field);
				return !this.stored(field);
			}
			async store(field, value) {
				await this.scope.set(field, value);
				return this.userLayer()?.[field] === value;
			}
			spec(field) {
				const spec = this.specs.get(field);
				if (spec === undefined) throw new Error(`search-mcp card has no field ${field}`);
				return spec;
			}
			sectionValue(field) {
				return this.scope.getSnapshot().value?.[field];
			}
			baseValue(field) {
				return this.scope.getSnapshot().base?.[field];
			}
			userLayer() {
				return this.scope.getSnapshot().user;
			}
			stored(field) {
				const user = this.userLayer();
				return user !== undefined && Object.hasOwn(user, field);
			}
			publish() {
				for (const listener of this.listeners) listener();
			}
		};
		//#endregion

		//#region controller
		var SearchMcpCardController = class {
			constructor(scope) {
				this.form = new CardForm(scope, [
					textField("defaultServer"),
					numberField("maxResults"),
					numberField("searchTimeoutMs"),
					jsonField("servers")
				]);
				this.store = this.form.bind(() => this.projection());
			}
			projection() {
				return {
					...this.form.shell(),
					defaultServer: this.form.field("defaultServer"),
					maxResults: this.form.field("maxResults"),
					searchTimeoutMs: this.form.field("searchTimeoutMs"),
					servers: this.form.field("servers")
				};
			}
			inject() {
				return {
					hooks: { searchMcpCard: this.store },
					...this.form.actions()
				};
			}
		};
		//#endregion

		//#region components
		function SearchMcpCard(props) {
			const { t } = props;
			const state = props.useSearchMcpCard((snapshot) => snapshot);
			if (!state.available) return null;
			const disabled = !state.writable;
			return (0, react_jsx_runtime.jsxs)("li", {
				className: "smcp_card",
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: "smcp_head",
						children: [
							(0, react_jsx_runtime.jsx)("span", { className: "smcp_name", children: t("title") }),
							(0, react_jsx_runtime.jsx)("span", { className: "smcp_desc", children: t("description") }),
							state.dirty ? (0, react_jsx_runtime.jsx)("span", { className: "smcp_badgeMuted", children: t("unsaved") }) : null
						]
					}),
					!state.writable ? (0, react_jsx_runtime.jsx)("p", { className: "smcp_hint", children: t("readOnly") }) : null,
					(0, react_jsx_runtime.jsx)(TextField, {
						id: "smcp-default-server",
						label: t("defaultServer"),
						hint: t("defaultServerHint"),
						disabled,
						...state.defaultServer,
						onEdit: (text) => props.edit("defaultServer", text),
						onReset: () => props.resetField("defaultServer")
					}),
					(0, react_jsx_runtime.jsx)(TextField, {
						id: "smcp-max-results",
						label: t("maxResults"),
						hint: t("maxResultsHint"),
						numeric: true,
						disabled,
						...state.maxResults,
						onEdit: (text) => props.edit("maxResults", text),
						onReset: () => props.resetField("maxResults")
					}),
					(0, react_jsx_runtime.jsx)(TextField, {
						id: "smcp-timeout",
						label: t("searchTimeoutMs"),
						hint: t("searchTimeoutMsHint"),
						numeric: true,
						disabled,
						...state.searchTimeoutMs,
						onEdit: (text) => props.edit("searchTimeoutMs", text),
						onReset: () => props.resetField("searchTimeoutMs")
					}),
					(0, react_jsx_runtime.jsx)(JsonField, {
						id: "smcp-servers",
						label: t("servers"),
						hint: t("serversHint"),
						disabled,
						...state.servers,
						onEdit: (text) => props.edit("servers", text),
						onReset: () => props.resetField("servers")
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
			});
		}
		function TextField(props) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "smcp_field",
				children: [
					(0, react_jsx_runtime.jsxs)("label", {
						className: "smcp_label",
						htmlFor: props.id,
						children: [
							props.label,
							props.overridden ? (0, react_jsx_runtime.jsx)("span", { className: "smcp_badge", children: props.overriddenLabel }) : null,
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "smcp_reset",
								disabled: !props.overridden || props.disabled,
								onClick: props.onReset,
								children: props.resetLabel
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("input", {
						id: props.id,
						className: "smcp_input" + (props.invalid ? " smcp_invalid" : ""),
						type: "text",
						inputMode: props.numeric ? "numeric" : undefined,
						value: props.text,
						disabled: props.disabled,
						onChange: (event) => props.onEdit(event.target.value)
					}),
					props.invalid ? (0, react_jsx_runtime.jsx)("p", { className: "smcp_error", children: props.invalidLabel }) : null,
					(0, react_jsx_runtime.jsx)("p", { className: "smcp_hint", children: props.hint })
				]
			});
		}
		function JsonField(props) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "smcp_field",
				children: [
					(0, react_jsx_runtime.jsxs)("label", {
						className: "smcp_label",
						htmlFor: props.id,
						children: [
							props.label,
							props.overridden ? (0, react_jsx_runtime.jsx)("span", { className: "smcp_badge", children: props.overriddenLabel }) : null,
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "smcp_reset",
								disabled: !props.overridden || props.disabled,
								onClick: props.onReset,
								children: props.resetLabel
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("textarea", {
						id: props.id,
						className: "smcp_textarea" + (props.invalid ? " smcp_invalid" : ""),
						value: props.text,
						disabled: props.disabled,
						spellCheck: false,
						onChange: (event) => props.onEdit(event.target.value)
					}),
					props.invalid ? (0, react_jsx_runtime.jsx)("p", { className: "smcp_error", children: props.invalidLabel }) : null,
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
