# 深知公文写作 GitHub Public 发布说明

仓库地址：

https://github.com/dylanzhangzx/dknowc-official-doc-writer

## 简介

深知公文写作是面向单位办公室、综合岗、文秘、材料岗和企事业单位用户的正式材料写作 Agent Skill，支持公文写作、正式文书起草、汇报材料整理、讲话稿撰写、工作总结、方案报告生成、深知可信搜索、素材来源说明和 Word 交付。

本 GitHub Public 版采用 skills.sh 渠道配置，不内置深知搜索 API Key。首次使用时，由 Agent 引导用户通过手机号验证码完成 MaaS 注册，并自动将 API Key 写入本地 `config.ini`。

## GitHub Release 文案

Title:

v3.2.6 - GitHub public release

Body:

This is the skills.sh GitHub public release of 深知公文写作, an Agent Skill for Chinese official document writing, formal workplace writing, trusted material retrieval, and Word document delivery.

Highlights:

- Uses the skills.sh channel configuration.
- Supports MaaS phone verification registration and local API Key configuration.
- Blocks writing and Word generation until a valid API Key is configured.
- Reuses configured API Keys from other local dknowc-series Skills when the user confirms.
- Calls 深知可信搜索 for policy, data, case, and reference materials.
- Supports outline reference, search plan confirmation, material classification, review checklist, Word generation, red-head document generation, and HTML source notes.
- v3.2.6 optimizes source-note wording to show completed traceability verification instead of weak manual-check phrasing.
- Does not include any real API Key or local `config.ini`.

Users can manage MaaS usage at https://platform.dknowc.cn/.

## 推荐 GitHub Topics

```text
agent-skills
skills-sh
ai-writing
document-generation
chinese-writing
official-documents
policy-research
word-generation
dknowc
```
