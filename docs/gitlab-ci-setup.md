# Настройка GitLab CI/CD с Claude Code

## 1. Переменные (Settings → CI/CD → Variables)

| Переменная | Тип | Описание |
|---|---|---|
| `ANTHROPIC_API_KEY` | masked, protected | Ключ Anthropic API |
| `GITLAB_TOKEN` | masked, protected | PAT с scope `api` — нужен для пушей и MCP |

Создать токен: **GitLab → User Settings → Access Tokens** → scope `api`.

---

## 2. Раннер на VPS

Если нет shared runners или нужен свой — устанавливаем на VPS.

```bash
# Установка gitlab-runner
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | bash
apt install gitlab-runner

# Установка Docker (нужен для image: node:24-alpine3.21)
curl -fsSL https://get.docker.com | sh
usermod -aG docker gitlab-runner
```

**Регистрация раннера:**

```bash
gitlab-runner register
```

Ответы на вопросы:
```
GitLab URL:        https://gitlab.com  (или ваш self-hosted)
Registration token: <из Settings → CI/CD → Runners>
Description:        vps-docker-runner
Tags:               (оставить пустым — принимает все джобы)
Executor:           docker
Default image:      node:24-alpine3.21
```

Запуск:
```bash
systemctl enable --now gitlab-runner
```

---

## 3. Webhook для @claude-комментариев (опционально)

Чтобы Claude реагировал на `@claude` в комментариях — нужен webhook.

**Шаг 1** — Получить Pipeline Trigger Token:

```
Settings → CI/CD → Pipeline triggers → Add trigger
```

**Шаг 2** — Настроить Webhook:

```
Settings → Webhooks → Add new webhook

URL:    https://<ваш-сервер>/webhook
Events: ✅ Comments
        ✅ Merge request events
        ✅ Issues events
Secret: <любой токен>
```

**Шаг 3** — Сервер webhook (минимальный пример на Node.js):

```js
// webhook-server.js
import http from "node:http";

const TRIGGER_TOKEN = process.env.TRIGGER_TOKEN;
const GITLAB_URL    = process.env.GITLAB_URL ?? "https://gitlab.com";

http.createServer(async (req, res) => {
  const body = await new Promise(r => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => r(JSON.parse(Buffer.concat(chunks).toString())));
  });

  const note = body.object_attributes?.note ?? "";
  if (!note.includes("@claude")) { res.end(); return; }

  const projectId = body.project?.id;
  const contextUrl = body.object_attributes?.url;
  const input = note.replace("@claude", "").trim();

  // Запускаем Pipeline с контекстом
  await fetch(`${GITLAB_URL}/api/v4/projects/${projectId}/trigger/pipeline`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      token: TRIGGER_TOKEN,
      ref: body.merge_request?.source_branch ?? "main",
      "variables[AI_FLOW_INPUT]":   input,
      "variables[AI_FLOW_CONTEXT]": contextUrl,
      "variables[AI_FLOW_EVENT]":   body.object_kind,
    }),
  });

  res.end("ok");
}).listen(3001);
```

---

## 4. Использование

### Ручной запуск
```
CI/CD → Pipelines → Run pipeline
Переменная: AI_FLOW_INPUT = "Add input validation to the login form"
```

### Через комментарий (с webhook)
```
@claude fix the TypeError in UserDashboard component
@claude implement the feature described in this issue
@claude review this MR and suggest improvements
```

### Через API
```bash
curl -X POST "https://gitlab.com/api/v4/projects/PROJECT_ID/trigger/pipeline" \
  -F "token=TRIGGER_TOKEN" \
  -F "ref=main" \
  -F "variables[AI_FLOW_INPUT]=Refactor the authentication module"
```
