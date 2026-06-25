# 深知写作助手

[![Version](https://img.shields.io/badge/version-3.0.19-blue)](./CHANGE_log.md)
[![Skill](https://img.shields.io/badge/Agent%20Skill-dknowc--official--doc--writer-purple)](./SKILL.md)
[![License](https://img.shields.io/badge/license-see%20repository-lightgrey)](./README.md)

面向中文正式写作场景的 Agent Skill：让 Agent 在撰写公文、政务材料、企事业单位正式文书时，先确认搜索方案，再调用深知可信搜索整理政策、数据和案例素材，最后生成可交付的 Word 文档。

它不是一个固定模板生成器，而是一套可复用的写作工作流：适合通知、请示、报告、函、会议纪要、总结、方案、汇报材料、发言稿、产业研究材料等。

## 它解决什么问题

很多正式材料不是“把话写顺”就够了，还需要：

- 搜索前先确认地域、主题、材料类型，避免 Agent 自己乱搜。
- 区分政策依据、数据支撑、参考案例和表述参考，避免素材混在一起。
- 限制来源和口径，避免把外省政策当成本地政策依据。
- 长篇正式材料直接生成 Word，而不是在聊天里贴一大段正文。
- 搜索异常时暂停确认下一步，不擅自改用 Web Search 或跳过素材。
- 普通 Word 默认生成，红头文件仅在用户明确要求时生成。

## 能力范围

- 深知可信搜索：通过 `scripts/dkag_search.py` 调用深知搜索接口获取政策、数据和案例素材。
- 搜索方案确认：涉及搜索时先向用户展示搜索地域、搜索内容和材料类型，确认后再执行。
- 正式文书生成：支持通知、请示、报告、函、复函、批复、会议纪要、通报、通告、公告、意见、方案、总结、管理办法、汇报材料、发言稿等。
- Word 交付：通过 `scripts/format_document.py` 生成普通格式 `.docx`。
- 红头文件：通过 `scripts/template_generator.py` 代码化生成红头和表尾，不依赖 Word 模板文件。
- 质量审查：按 `reference/review_checklist.md` 检查格式、逻辑、素材来源和公文风险。

## 适合谁

- 使用 OpenClaw 或其他支持 Agent Skill 的用户。
- 经常写中文正式材料、政务材料、产业研究总结或企事业单位文书的人。
- 希望把“搜索素材 -> 梳理依据 -> 生成 Word -> 检查风险”沉淀成稳定流程的团队。
- 想参考一个组合型 Agent Skill 设计方式的开发者。

## 快速开始

安装依赖：

```bash
pip3 install python-docx requests
```

配置深知搜索 API Key：

1. 访问 https://platform.dknowc.cn/
2. 注册并登录深知平台
3. 获取深知可信搜索 API Key
4. 将 `config.ini.example` 复制为 `config.ini`
5. 填入你的 API Key：

```ini
[dkag]
api_key=your_api_key_here
```

搜索接口固定为：

```text
https://open.dknowc.cn/dependable/search/
```

不要把包含真实 API Key 的 `config.ini` 提交到公开仓库。

## 使用示例

简单写作任务：

```text
帮我写一份关于召开数据治理专题会议的通知，发文机关是广东省政务服务和数据管理局，主送各处室、省政务服务数据事务中心，会议时间是 2026 年 5 月 25 日上午 9:30。
```

需要搜索支撑的长篇材料：

```text
请使用深知写作助手，帮我生成一份《2025年广东省人工智能产业发展情况总结报告》，需要结合广东省和国家层面的政策、数据和案例素材，最后生成 Word。
```

红头文件：

```text
请生成普通 Word 后，再生成一份红头文件。发文机关：广东省政务服务和数据管理局；文号：粤政数〔2026〕1号。
```

## 常用测试

语法检查：

```bash
python3 -m py_compile scripts/dkag_search.py scripts/merge_search_results.py scripts/format_document.py scripts/template_generator.py
```

普通 Word 生成：

```bash
python3 scripts/format_document.py official-docs/input/dknowc-test.md --output dknowc-test.docx
```

红头 Word 生成：

```bash
python3 scripts/template_generator.py 通知 --input dknowc-test.docx --org "广东省政务服务和数据管理局" --doc-number "粤政数〔2026〕1号" --output dknowc-test-red.docx
```

搜索结果保存：

```bash
python3 scripts/dkag_search.py "留学人才来粤服务政策" --area 广东省 --clean --output result_gd.json
```

多次搜索合并：

```bash
python3 scripts/merge_search_results.py result_gd.json result_bj.json --output merged.json
```

## 设计说明

这个 Skill 组合使用几类 Agent Skill 设计模式：

- Tool Wrapper：封装深知搜索、普通 Word 排版、红头文件生成。
- Generator：根据文种标准、用户材料和素材指引生成正式文书。
- Reviewer：按审查清单检查格式、逻辑、素材来源和风险。
- Inversion：复杂任务或信息不足时，先向用户追问或确认搜索方案。
- Pipeline：对政策依据型、长篇复杂材料、红头交付等场景执行带检查点的流程。

更多规则见：

- [SKILL.md](./SKILL.md)
- [搜索策略](./reference/search_policy.md)
- [任务路由](./reference/task_router.md)
- [输出规范](./reference/output_guide.md)
- [审查清单](./reference/review_checklist.md)

## Public 版说明

- 本版本不内置 API Key。
- 用户自行从 https://platform.dknowc.cn/ 获取 API Key。
- 深知搜索、素材分类、Word 生成、异常处理等功能逻辑与自用版一致。
- 如搜索失败或提示 API Key 未配置，请先检查 `config.ini` 是否存在且 `api_key` 是否有效。

## 版本

当前 GitHub Public 版基于 `3.0.19`。
