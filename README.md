# 深知公文写作（skills.sh Public 版）

这是深知公文写作的 skills.sh 分发版本。功能逻辑与主干完整版保持一致，但不内置深知搜索 API Key；首次调用本 Skill 时，无论当前任务是否需要搜索，都先由 Agent 通过 MaaS 注册接口完成手机号注册、验证码确认、API Key 获取和本地配置写入，用户只需提供手机号和收到的验证码。

## 能力范围

- 深知可信搜索：通过 `scripts/dkag_search.py` 调用搜索接口获取政策、数据和案例素材。
- 公文范文大纲：通过 `scripts/outline_reference.py` 在搜索前获取范文参考大纲和搜索建议。
- 公文写作流程：由 `SKILL.md` 进行任务路由，按任务复杂度选择直接生成、追问、搜索、审查或严格流水线。
- 搜索策略：`reference/search_policy.md` 保留深知搜索逻辑、素材四分类和来源限制。
- 任务路由：`reference/task_router.md` 定义简单任务、常规任务、复杂任务和高风险任务的处理方式。
- 质量审查：`reference/review_checklist.md` 定义公文内容、素材来源、文种专项和 Word 输出检查项。
- Word 排版：通过 `scripts/format_document.py` 生成普通格式 `.docx`，支持标准 Markdown 表格和宽表横向页面。
- 素材来源说明：执行过搜索时，通过 `scripts/source_note_html.py` 生成独立 HTML 溯源页。
- 红头文件：通过 `scripts/template_generator.py` 代码化生成红头和表尾，不依赖 `templates/` 中的 Word 模板。
- PDF：当前主干版本不支持自动生成 PDF；用户明确要求 PDF 时，交付 `.docx` 并建议用户使用本机 Word/WPS 另存或导出为 PDF。

## 依赖

```bash
pip3 install python-docx requests
```

`Python`、`python-docx`、`requests` 和有效 API Key 是运行本 Skill 的必备前置条件。初始化检查如显示 `ready=false`，应先完成缺失项处理，并重新检查通过后再继续执行搜索、写作、Word、红头或素材来源 HTML 生成。

标准公文字体不随 Skill 分发，字体也不作为初始化阻断项。Word 文档会写入公文常用字体名称；如打开端缺少对应字体，Word/WPS 可能自动替换，需以本机打开后的显示为准。

当前版本不内置 PDF 生成或转换依赖。正式公文主交付物为 `.docx`；如用户需要 PDF，应使用 Word/WPS 打开 `.docx` 后另存或导出。

还需要 Node.js 18+ 用于调用 MaaS 注册接口：

```bash
node --version
```

## 首次启动初始化

skills.sh 版的初始化与具体任务无关：只要调用本 Skill，Agent 就应先运行 `python3 scripts/initialize.py`。只有返回 `ready=true`、`config_ini=true`、`api_key_configured=true`，且未返回 `config_api_key=false` 或 `search_ready=false` 后，才继续处理原任务。简单通知、改写润色、只生成 Word 等场景也遵循该规则。

如果初始化结果显示 `api_key_configured=false`、`config_ini=false`，或 `blocking_issues` 包含 `api_key_missing`，必须先引导用户完成 Key 复用或 MaaS 注册配置，不得先生成正文或 Word。

MaaS 管理平台地址：

```text
https://platform.dknowc.cn/
```

新用户注册后会有 300 次体验额度；体验额度用完后，可到 MaaS 管理平台充值。完成实名认证后，平台也可能提供 100 元赠金，具体以 MaaS 平台页面展示为准。

## 注册并配置深知搜索 API Key

skills.sh 版默认使用：

- 接入点 `type=6`，即深知可信搜索。
- 渠道码 `8C8D411C-6A46-4E99-887D-87D9A1329930`。
- 本地 `config.ini` 保存统一 Key，由公文范文大纲接口和深知可信搜索接口共用；公开包不携带该文件。

如果当前深知公文写作没有配置 Key，Agent 会先询问用户是否允许复用当前运行环境已安装 Skills 目录下其他 `dknowc*` Skill 的本地 Key。用户同意后可执行：

```bash
node scripts/register.mjs scan-reuse
node scripts/register.mjs reuse-key --from <候选目录名或 slug>
```

扫描范围仅限当前 Skill 同级目录下一级 `dknowc*` Skill，只读取 `_meta.json` 和 `config.ini`，不会展示完整 Key。

如用户不复用、未找到候选或复用失败，再进入 MaaS 注册。第 1 步，发送短信验证码：

```bash
node scripts/register.mjs send --phone 13812345678
```

返回 `status=true` 后，暂停并请用户提供收到的 6 位验证码。

第 2 步，注册并获取 API Key：

```bash
node scripts/register.mjs register --phone 13812345678 --vcode 123456 --organ 个人 --name 用户
```

注册第二步会自动携带平台下发的固定 `grantToken`。手机号已注册时，默认查回该账号已有可用 API Key；手机号未注册时，按 MaaS 注册流程创建账号并获取 API Key。成功后，脚本会把 API Key 自动写入本 Skill 根目录下的 `config.ini`，不会在标准输出中返回完整 Key。用户不需要手动复制 Key，也不需要手动编辑配置文件。

默认不重新生成 API Key。只有用户明确要求重新生成或新建 Key 时，才追加 `--new-key`：

```bash
node scripts/register.mjs register --phone 13812345678 --vcode 123456 --organ 个人 --name 用户 --new-key
```

`--new-key` 会先查回已有可用 Key，再调用 MaaS API Key 创建接口生成新 Key，并仅把新 Key 写入本地 `config.ini`。如新 Key 创建失败，不会把旧 Key 当作新 Key 写入。

如自动注册链路失败，可降级引导用户访问 MaaS 管理平台：

```text
https://platform.dknowc.cn/
```

搜索接口固定为：

```text
https://open.dknowc.cn/dependable/search/
```

`config.ini` 只存在于用户本地安装后的 Skill 目录中，不得上传、打包或公开分享。发布包检查会阻止该文件进入公开包。

## 版本说明

当前 skills.sh Public 版基于 `3.2.6`。

## 常用测试

语法检查：

```bash
python3 -m py_compile scripts/outline_reference.py scripts/dkag_search.py scripts/merge_search_results.py scripts/format_document.py scripts/template_generator.py scripts/initialize.py scripts/source_note_html.py
node --check scripts/register.mjs
```

范文大纲生成：

```bash
python3 scripts/outline_reference.py "请写一份关于基层治理工作的调研报告，重点包括背景、做法、问题和建议。"
```

普通 Word 生成：

```bash
python3 scripts/format_document.py official-docs/input/dknowc-test.md --output dknowc-test.docx
```

红头 Word 生成：

```bash
python3 scripts/template_generator.py 通知 --input dknowc-test.docx --org "XX单位" --doc-number "XX〔2026〕1号" --output dknowc-test-red.docx
```

搜索结果保存：

```bash
python3 scripts/dkag_search.py "人才服务政策" --area 某省 --purpose "核查当地人才服务政策依据" --clean --output result_gd.json
```

多次搜索合并：

```bash
python3 scripts/merge_search_results.py result_gd.json result_bj.json --output merged.json
```

素材来源说明 HTML：

```bash
python3 scripts/source_note_html.py official-docs/input/source-note.json --output source-note.html
```

## Public 版说明

- 本版本不内置 API Key。
- 用户可通过 Agent 调用 `scripts/register.mjs`，用手机号和验证码注册 MaaS 账号并获取统一 API Key。
- 注册成功后，Agent 自动把 API Key 写入本地 `config.ini`，用户不需要查看或手动配置 Key。
- 公文范文大纲、深知搜索、素材分类、Word 生成、表格排版、HTML 溯源、红头 Word 和异常处理等功能逻辑与主干完整版一致。
- 3.2.6 起优化素材来源说明：展示知识专库链接、素材溯源卡片和“溯源核验完成情况”，不再用“建议核对”“需人工核验”等削弱可信度的表述。
- 如搜索失败或提示 API Key 未配置，请重新执行注册流程或检查本地 `config.ini` 是否存在且有效。
