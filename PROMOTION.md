# 推广文案草稿

这个文件用于发布 GitHub 开源项目时复用。正式发布前，把链接替换为仓库地址：

```text
https://github.com/dylanzhangzx/dknowc-official-doc-writer
```

## 一句话介绍

深知写作助手是一个面向中文公文、政务材料和企事业单位正式文书的 Agent Skill，支持搜索方案确认、深知可信搜索、素材整理、质量审查和 Word 文档交付。

## 短版介绍

我把自己一直在用的中文正式写作 Agent Skill 开源了。

它不是简单模板，而是一套写作工作流：当任务需要政策、数据或案例支撑时，会先给出搜索方案并等待确认，再调用深知可信搜索整理素材，最后生成可交付的 Word 文档。适合通知、请示、报告、会议纪要、总结、方案、汇报材料、产业研究材料等场景。

项目地址：

```text
https://github.com/dylanzhangzx/dknowc-official-doc-writer
```

## 长版介绍

最近把自己电脑里长期使用的“深知写作助手”整理成了开源版。

这个项目主要解决中文正式材料写作里的几个问题：

- 不让 Agent 直接乱写，复杂任务会先确认搜索方案和材料范围。
- 检索素材时区分政策依据、数据支撑、参考案例和表述参考。
- 默认使用深知可信搜索，不擅自改用 Web Search 或网页抓取。
- 长篇材料默认生成 Word，不在聊天窗口直接贴一整篇正文。
- 搜索或生成出错时，先问用户下一步，而不是自行跳过。
- 普通 Word 默认生成，红头文件只在明确要求时生成。

它适合写通知、请示、报告、函、会议纪要、工作总结、实施方案、产业研究材料、汇报材料等，也适合想参考 Agent Skill 设计方式的开发者。

项目地址：

```text
https://github.com/dylanzhangzx/dknowc-official-doc-writer
```

欢迎试用、提 issue，也欢迎一起讨论中文写作类 Agent Skill 应该怎么设计。

## GitHub Release 文案

标题：

```text
v3.0.1 - GitHub public release
```

正文：

```text
This is the first public GitHub release of 深知写作助手, an Agent Skill for Chinese official document writing and structured Word generation.

Highlights:
- Public version without built-in API key.
- Search plan confirmation before DKnowC retrieval.
- DKnowC-powered policy, data, and case material retrieval.
- Structured material classification and review checklist.
- Word document generation for long-form formal writing.
- Code-based red-head document generation when explicitly requested.
- Safer failure handling: pause and ask before retrying, skipping, or switching sources.

Users need to obtain their own DKnowC API key from https://platform.dknowc.cn/ and configure config.ini locally.
```

## V2EX / 即刻 / 朋友圈

```text
开源了一个自己长期使用的中文正式写作 Agent Skill：深知写作助手。

它主要面向公文、政务材料和企事业单位文书写作。和普通“让大模型直接写”不一样，它会在需要政策、数据、案例支撑时先确认搜索方案，再调用深知可信搜索整理素材，最后生成 Word 文档。

适合通知、报告、总结、方案、汇报材料、产业研究材料等场景。也可以作为一个组合型 Agent Skill 的设计参考。

GitHub:
https://github.com/dylanzhangzx/dknowc-official-doc-writer
```

## 知乎 / 掘金

标题备选：

```text
我把自己的中文公文写作 Agent Skill 开源了
一个面向正式材料写作的 Agent Skill 应该怎么设计
从搜索方案确认到 Word 交付：深知写作助手的开源实践
```

正文开头：

```text
最近把自己一直在用的“深知写作助手”整理成了开源版。

这个项目的出发点不是让大模型更会“润色”，而是把正式材料写作中更容易出问题的环节流程化：什么时候需要搜索，搜哪些地域和材料，政策依据和案例素材怎么区分，素材不足时要不要继续写，长篇材料如何直接交付 Word。
```

## 小红书

标题备选：

```text
我开源了一个中文公文写作 Agent Skill
Agent Skill 不只是提示词：一个正式写作工作流
中文正式材料写作，为什么不能让 AI 直接开写？
```

正文：

```text
最近把自己用的“深知写作助手”整理成了开源版。

它不是一个固定模板，而是一套 Agent Skill 工作流：

1. 复杂材料先确认搜索方案
2. 使用深知可信搜索找政策、数据和案例
3. 按素材类型整理
4. 长篇材料直接生成 Word
5. 搜索异常时先问用户怎么处理

适合通知、报告、总结、方案、汇报材料、产业研究材料等中文正式写作场景。

GitHub 搜：dknowc-official-doc-writer
```

## 推荐 GitHub Topics

```text
agent-skills
openclaw
ai-writing
document-generation
chinese-writing
official-documents
policy-research
word-generation
dknowc
```
