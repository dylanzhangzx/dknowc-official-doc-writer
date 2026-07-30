#!/usr/bin/env node
// 国内 MaaS headless 注册助手（供 skills.sh skill 调用；纯 node，内置 fetch，无三方依赖）。
//   node register.mjs scan-reuse
//   node register.mjs reuse-key --from <候选目录名或 slug>
//   node register.mjs [--base URL] send     --phone <p>
//   node register.mjs [--base URL] register --phone <p> --vcode <c> [--type 6] [--organ ..] [--name ..] [--channel ..] [--password ..] [--new-key] [--config ../config.ini]
// 无需 cookie / 加密 / 登录态。默认打生产，--base 可切测试环境。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_BASE = "https://platform.dknowc.cn/auth/home/userAuto";
const DEFAULT_OPEN_BASE = "https://open.dknowc.cn";
const DEFAULT_CHANNEL = "8C8D411C-6A46-4E99-887D-87D9A1329930";
const DEFAULT_TYPE = "6";
const DEFAULT_GRANT_TOKEN = "OzqfOqHhYHzIPxRQmQyG8dMzRtKgiuLc";
const MAAS_PLATFORM_URL = "https://platform.dknowc.cn/";
const FALLBACK_REGISTER_URL = MAAS_PLATFORM_URL;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, "..");
const DEFAULT_CONFIG_PATH = path.join(SKILL_ROOT, "config.ini");

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) { out[key] = true; }
      else { out[key] = next; i++; }
    } else { out._.push(a); }
  }
  return out;
}

async function post(url, payload) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 30000);
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctl.signal,
    });
    const text = await r.text();
    try { return JSON.parse(text); }
    catch { return { status: false, msg: "非JSON响应(前200字符): " + text.slice(0, 200) }; }
  } catch (e) {
    return { status: false, msg: "请求异常: " + (e && e.message ? e.message : String(e)) };
  } finally { clearTimeout(timer); }
}

async function postWithBearer(url, apiKey, payload) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 30000);
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: ctl.signal,
    });
    const text = await r.text();
    try { return JSON.parse(text); }
    catch { return { code: r.status, errmsg: "非JSON响应(前200字符): " + text.slice(0, 200) }; }
  } catch (e) {
    return { code: 0, errmsg: "请求异常: " + (e && e.message ? e.message : String(e)) };
  } finally { clearTimeout(timer); }
}

function genPassword() {
  // 8-32 位，含大写/小写/数字/特殊至少 3 类
  const pools = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789", "!@#$%^&*"];
  const pick = (s) => s[Math.floor(Math.random() * s.length)];
  let chars = pools.map(pick);                       // 每类至少一个
  const all = pools.join("");
  for (let i = 0; i < 8; i++) chars.push(pick(all)); // 补到 12 位
  for (let i = chars.length - 1; i > 0; i--) {       // 洗牌
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function resolveConfigPath(value) {
  const raw = value && value !== true ? String(value) : DEFAULT_CONFIG_PATH;
  const resolved = path.resolve(SKILL_ROOT, raw);
  if (resolved !== DEFAULT_CONFIG_PATH) {
    throw new Error(`只允许写入本 Skill 根目录下的 config.ini: ${DEFAULT_CONFIG_PATH}`);
  }
  return resolved;
}

function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

function readApiKeyIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return "";
    const text = fs.readFileSync(filePath, "utf8");
    const match = text.match(/^\s*api_key\s*=\s*(sk-[A-Za-z0-9_-]+)\s*$/m);
    return match ? match[1] : "";
  } catch {
    return "";
  }
}

function resolveSkillsRoot() {
  return path.dirname(SKILL_ROOT);
}

function findReusableConfigs(skillsRoot) {
  let entries = [];
  try {
    entries = fs.readdirSync(skillsRoot, { withFileTypes: true });
  } catch {
    return [];
  }

  const currentRoot = path.resolve(SKILL_ROOT);
  const candidates = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !/^dknowc/i.test(entry.name)) continue;
    const dir = path.resolve(skillsRoot, entry.name);
    if (dir === currentRoot) continue;
    const configPath = path.join(dir, "config.ini");
    const apiKey = readApiKeyIfExists(configPath);
    if (!apiKey) continue;
    const meta = readJsonIfExists(path.join(dir, "_meta.json"));
    candidates.push({
      id: entry.name,
      slug: typeof meta.slug === "string" && meta.slug ? meta.slug : entry.name,
      name: typeof meta.name === "string" && meta.name ? meta.name : null,
      displayName: typeof meta.displayName === "string" && meta.displayName ? meta.displayName : null,
      version: typeof meta.version === "string" && meta.version ? meta.version : null,
      hasApiKey: true,
    });
  }
  return candidates;
}

function findReusableConfigByRef(skillsRoot, ref) {
  const candidates = findReusableConfigs(skillsRoot);
  const selected = candidates.find((item) => item.id === ref || item.slug === ref);
  if (!selected) return { selected: null, apiKey: "" };
  const apiKey = readApiKeyIfExists(path.join(skillsRoot, selected.id, "config.ini"));
  return { selected, apiKey };
}

function saveApiKey(apiKey, configPath) {
  if (!apiKey || !apiKey.startsWith("sk-")) {
    throw new Error("接口未返回有效 API Key");
  }
  const content = [
    "# 深知可信搜索 API 配置",
    "# 本文件由 scripts/register.mjs 在用户提供手机号和验证码后自动生成。",
    "# 不要上传、打包或公开分享本文件。",
    "",
    "[dkag]",
    `api_key=${apiKey}`,
    "",
  ].join("\n");
  fs.writeFileSync(configPath, content, { encoding: "utf8", mode: 0o600 });
}

async function createNewApiKey(openBase, existingApiKey, name, remark) {
  const result = await postWithBearer(
    openBase.replace(/\/$/, "") + "/open-api/maas/api-key/create",
    existingApiKey,
    { name, remark },
  );
  const apiKey = result && result.data ? result.data.appKey : "";
  return { result, apiKey };
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  const base = a.base || DEFAULT_BASE;
  const cmd = a._[0];

  if (cmd === "scan-reuse") {
    const skillsRoot = resolveSkillsRoot();
    const candidates = findReusableConfigs(skillsRoot);
    console.log(JSON.stringify({
      status: true,
      skillsRoot: path.basename(skillsRoot),
      candidates,
    }));
    process.exit(0);
  }

  if (cmd === "reuse-key") {
    const ref = a.from && a.from !== true ? String(a.from) : "";
    if (!ref) {
      console.error("缺少 --from");
      process.exit(2);
    }
    const skillsRoot = resolveSkillsRoot();
    const { selected, apiKey } = findReusableConfigByRef(skillsRoot, ref);
    if (!selected || !apiKey) {
      console.log(JSON.stringify({ status: false, msg: "未找到可复用的深知系列 Skill API Key" }));
      process.exit(1);
    }
    try {
      const configPath = resolveConfigPath(a.config);
      saveApiKey(apiKey, configPath);
      console.log(JSON.stringify({
        status: true,
        msg: "已复用已有深知系列 Skill API Key",
        source: {
          id: selected.id,
          slug: selected.slug,
          name: selected.name,
          displayName: selected.displayName,
          version: selected.version,
        },
        configSaved: true,
        configPath: path.relative(SKILL_ROOT, configPath),
      }));
      process.exit(0);
    } catch (e) {
      console.log(JSON.stringify({
        status: false,
        msg: "复用配置写入失败",
        saveError: e && e.message ? e.message : String(e),
      }));
      process.exit(1);
    }
  }

  if (cmd === "send") {
    if (!a.phone) { console.error("缺少 --phone"); process.exit(2); }
    const r = await post(base + "/sendMessage", { phone: a.phone, type: "register" });
    console.log(JSON.stringify(r));
    if (r.status) console.error("验证码已发送，请向用户索取收到的 6 位验证码后再执行 register。");
    process.exit(r.status ? 0 : 1);
  }

  if (cmd === "register") {
    if (!a.phone || !a.vcode) { console.error("缺少 --phone 或 --vcode"); process.exit(2); }
    const payload = {
      phone: a.phone,
      vcode: a.vcode,
      password: a.password && a.password !== true ? a.password : genPassword(),
      type: a.type && a.type !== true ? a.type : DEFAULT_TYPE,
      organ: a.organ && a.organ !== true ? a.organ : "个人",
      name: a.name && a.name !== true ? a.name : "用户",
      apiKeyName: a["apikey-name"] && a["apikey-name"] !== true ? a["apikey-name"] : "agent-key",
    };
    payload.channel = a.channel && a.channel !== true ? a.channel : DEFAULT_CHANNEL;
    payload.grantToken = a["grant-token"] && a["grant-token"] !== true ? a["grant-token"] : DEFAULT_GRANT_TOKEN;
    const r = await post(base + "/register", payload);
    const data = r.data || {};
    const ok = Boolean(r.status) && Boolean(data.apiKey);
    let apiKeyToSave = ok ? data.apiKey : "";
    let newKeyCreated = false;
    let newKeyError = null;
    if (ok && a["new-key"]) {
      const keyName = a["new-key-name"] && a["new-key-name"] !== true ? a["new-key-name"] : payload.apiKeyName;
      const keyRemark = a["new-key-remark"] && a["new-key-remark"] !== true
        ? a["new-key-remark"]
        : "由 skills.sh 深知公文写作按用户要求重新生成";
      const { result, apiKey } = await createNewApiKey(
        a["open-base"] && a["open-base"] !== true ? a["open-base"] : DEFAULT_OPEN_BASE,
        data.apiKey,
        keyName,
        keyRemark,
      );
      if (apiKey) {
        apiKeyToSave = apiKey;
        newKeyCreated = true;
      } else {
        newKeyError = result.errmsg || result.msg || "新 API Key 创建失败";
        apiKeyToSave = "";
      }
    }
    let saved = false;
    let configPath = null;
    let saveError = null;
    if (ok && apiKeyToSave) {
      try {
        configPath = resolveConfigPath(a.config);
        saveApiKey(apiKeyToSave, configPath);
        saved = true;
      } catch (e) {
        saveError = e && e.message ? e.message : String(e);
      }
    }
    console.log(JSON.stringify({
      status: ok && saved && !newKeyError,
      msg: r.msg,
      url: data.url || null,
      existed: Boolean(data.existed),
      keyCreatedByRegister: Boolean(data.keyCreated),
      newKeyRequested: Boolean(a["new-key"]),
      newKeyCreated,
      configSaved: saved,
      configPath: saved ? path.relative(SKILL_ROOT, configPath) : null,
      newKeyError,
      saveError,
      fallbackRegisterUrl: FALLBACK_REGISTER_URL,
    }));
    process.exit(ok && saved && !newKeyError ? 0 : 1);
  }

  console.error("用法: node register.mjs <scan-reuse|reuse-key|send|register> ...");
  process.exit(2);
}

main();
