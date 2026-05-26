# Time Tracker — Architecture Rules & Domain Specification

Этот документ фиксирует ключевые архитектурные правила системы тайм-трекинга.  
Любые изменения модели должны проверяться на соответствие этим правилам.

# 1. Core Domain Model

## 1.1 Activity

`Activity` — это долгоживущая сущность, описывающая тип работы.

Примеры:

- Work
- Reading
- Coding
- Unnamed Activity

**Важно:**

- Activity ≠ выполнение
- Activity может иметь много сессий (ActivitySession, ActivitySession, ...)

## 1.2 ActivitySession

`ActivitySession` — это один непрерывный эпизод работы над активностью.

Сессия:

- начинается при `start`
- заканчивается при `finish` или авто-завершении
- любая сессия состоит из непрерывных сегментов (ActivitySessionSegment), т.е между
  сегментами не может быть путых дыр (если один сигмент завершается, дальше либо
  открывается новый, либо это был финальный сегмент и дальше сессия завершается т.е
  переходит в статус `finish`)
- любая сессия состоит из двух видов сегментов `active`/`pause`

## 1.3 ActivitySessionSegment

`ActivitySessionSegment` — минимальная единица времени (источник истины).

Типы:

- `active`
- `pause`

# 2. Source of Truth

## 2.1 Иерархия истины

Segment → Session → Activity

- Segment — единственный источник истины
- Session — агрегат по сегментам
- Activity — агрегат по сессиям

## 2.2 Денормализованные поля

Допустимые кэш-поля:

- `Activity.activeDurationMs`
- `Activity.pauseDurationMs`
- `ActivitySession.activeDurationMs`
- `ActivitySession.pauseDurationMs`

Они:

- ускоряют чтение
- могут быть пересчитаны из сегментов

## 2.3 Activity не хранит status

В `Activity` нет поля `status`.

Статус вычисляется на основании поля `currentActivitySessionId: string | null`
Статус вычисляется:

- Если `currentActivitySessionId = null → idle`
- Если `session.active → active`
- Если `session.paused → paused`

# 3. Invariants

## 3.1 Единственная активная сессия

У пользователя: максимум 1 незавершенная session

## 3.2 Связь Activity ↔ Session

Если: `activity.currentActivitySessionId !== null`, то session существует и session не равна finished

## 3.3 Status ↔ endedAt

- status | endedAt
- active | null
- paused | null
- finished | NOT null

## 3.4 Открытые сегменты

У незавершенной session: ровно 1 segment с endedAt = null

## 3.5 Соответствие статусу

- session.status | open segment type
- active → active
- paused → pause
- finished → none

## 3.6 Последовательность сегментов

Сегменты внутри session:

- не пересекаются
- идут подряд
- чередуются: `active → pause → active → ...`

## 3.7 Первый сегмент

Новая session всегда начинается с: `active segment`

# 4. State Transitions

## 4.1 Start (новая activity)

Создает:

- session (active)
- первый active segment

## 4.2 Pause

- Закрывает active segment
- обновляет activeDuration
- session → paused
- открывает pause segment

## 4.3 Resume

- закрывает pause segment
- обновляет pauseDuration
- session → active
- открывает active segment

## 4.4 Finish

- закрывает текущий segment
- session → finished
- session.endedAt = now
- activity.currentActivitySessionId = null

## 4.5 Switch Activity

Если есть незавершенная session: она автоматически завершается (finish)

Затем: создается новая session для новой activity

# 5. Quick Timer

## 5.1 Быстрый старт

Quick Start:

- создает новую Activity
- создает новую ActivitySession
- создает новую ActivitySessionSegment

## 5.2 Новая Activity каждый раз

Каждый Quick Start:

- новая Activity
- не используем старую unnamed

## 5.3 Naming

Название по умолчанию: `Unnamed Activity`

UI может показывать:

- Unnamed Activity (2)
- Unnamed Activity (3)

Но это только UI, не доменная логика.

# 6. Time & Analytics

## 6.1 Сессии не делятся по дням

Нельзя: завершать session в полночь

## 6.2 Аналитика строится по segment

НЕ по session.

## 6.3 Пересечение полуночи

Segment: `23:50 → 00:20`

Аналитика:

- день 1 → 10 мин
- день 2 → 20 мин

## 6.4 Таймзона

- хранение: UTC
- аналитика: локальная TZ пользователя

## 6.5 История — read-only

Исторические данные:

- нельзя запускать
- нельзя паузить
- только просмотр

# 7. Abandoned Sessions (Auto-Finish Strategy)

## 7.1 Проблема

Пользователь может:

- запустить activity
- забыть про нее
- вернуться через часы или дни

Без обработки этого кейса система получит:

- некорректные длительности (десятки часов)
- сломанную аналитику
- плохой UX

## 7.2 Решение: Auto-Finish по inactivity

Система вводит понятие:

> **abandoned session** — сессия, потерявшая подтверждение активности пользователя

## 7.3 Heartbeat механизм

Пока session находится в статусе `active`, клиент обязан отправлять периодический heartbeat:

- интервал: ~30–60 секунд
- только когда:
  - приложение в foreground
  - экран активен
  - session.status === active

## 7.4 lastHeartbeatAt

В `ActivitySession` хранится служебное поле:

```ts
lastHeartbeatAt: string; // ISO datetime
```

Данное поле обозначает последний момент, когда мы уверены, что пользователь работал в рамках ЭТОЙ конкретной сессии

Оно обновляется:
• при start
• при resume
• при каждом heartbeat

Это строго относится к:

- конкретной activity
- конкретной session
- конкретному segment
- (опционально) при любых действиях пользователя в приложении

## 7.5 Idle Timeout

Если active session не получает подтверждения активности дольше idleTimeout, она автоматически переводится в finished.

```ts
idleTimeout = 30 минут // (может быть конфигурируемым)
```

## 7.6 Правило авто-завершения

Если: `now - session.lastHeartbeatAt > idleTimeout`, то session считается abandoned и должна быть автоматически завершена.

## 7.7 Момент завершения

Session НЕ должна завершаться текущим временем (now).
Вместо этого: `session.endedAt = lastHeartbeatAt + idleTimeout`
Это критично для корректной аналитики.

Когда обновляется:

## 7.8 Поведение системы

При обнаружении abandoned session:

1. Закрывается открытый active segment
2. Обновляется activeDurationMs
3. session.status = "finished"
4. session.endedAt = lastHeartbeatAt + idleTimeout
5. activity.currentActivitySessionId = null

## 7.9 Когда выполняется auto-finish

Auto-finish должен выполняться:

- при любом запросе пользователя (lazy cleanup)
- или фоновым воркером (опционально)

Минимально допустимый вариант: cleanup при первом запросе после возврата пользователя

## 7.10 Почему используется finish, а не pause

Auto-pause не используется, потому что:

- pause — это осознанное действие пользователя
- abandoned session — это потеря контекста

Поэтому: `abandoned session всегда → finished`

## 7.11 UI поведение

При возврате пользователя:
• система уже должна быть в консистентном состоянии
• session не должна оставаться active

Опционально можно показать уведомление: “Сессия была автоматически завершена из-за неактивности”

## 7.12 Упрощенный fallback (без heartbeat)

Если heartbeat не реализован:

- используется updatedAt session
- применяется то же правило: `endedAt = updatedAt + idleTimeout`

## 7.13 Инвариант

Active session не может существовать дольше idleTimeout без подтверждения активности

## 7.14 Запрещено

- ❌ завершать session временем now после долгого отсутствия
- ❌ оставлять session active бесконечно
- ❌ пытаться “угадать” реальное время работы пользователя

# 8. UI Rules

## 8.1 Разделение зон

UI должен разделять:

1. Текущий таймер
2. Активные карточки
3. Историю

## 8.2 Главный таймер

Показывает:

- текущую session
- текущее время

## 8.3 Карточки

Активные (которые выбраны для сегодняшнего дня): start / pause / resume

История: read-only

## 8.4 Время

Главный счетчик = только active time

# 9. API Rules

## 9.1 Отдельные действия

НЕ использовать updateActivity для:

- start
- pause
- finish

Использовать отдельные endpoints.

## 9.2 Naming

```ts
POST /activities/:id/start
POST /activities/:id/pause
POST /activities/:id/finish
```

## 9.3 Единый ответ

Все lifecycle endpoints возвращают:

```ts
{
  activity: ActivityDTO;
  session: ActivitySessionDTO;
  segment: ActivitySessionSegmentDTO | null;
}
```

## 9.4 Current Session

Должен существовать endpoint:

```ts
GET / activity - sessions / current;
```

# 10. Consistency

## 10.1 Транзакционность

Все операции:

- start
- pause
- resume
- finish
- switch

должны быть атомарны.

## 10.2 Сервер — источник истины

Frontend:

- не решает бизнес-логику
- только отображает состояние

⸻

## 10.3 Предсказуемость

Любое действие должно быть:

- детерминированным
- одинаковым при повторе

# 11 Anti-Patterns (Запрещено)

- ❌ Хранить status в Activity
- ❌ Иметь 2 незавершенные session
- ❌ Иметь session без открытого segment
- ❌ Делить session по дням
- ❌ Использовать одну Unnamed Activity для всех quick start
- ❌ Строить аналитику по session вместо segment
- ❌ Делать историю интерактивной
- ❌ Давать frontend управлять логикой состояний

# 12. Core Principles (TL;DR)

1. ✅ Segment — источник истины
2. ✅ Session — один запуск
3. ✅ Activity — контейнер
4. ✅ Только одна активная session
5. ✅ Start другой activity → finish предыдущей
6. ✅ Quick start → новая activity
7. ✅ День — это аналитика, не домен
8. ✅ UI и Domain разделены
