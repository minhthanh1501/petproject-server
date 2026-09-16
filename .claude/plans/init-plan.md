# Study Booth Cafe API — Implementation Plan

## Context

`D:\Business\server` is the backend for a **Study Booth Cafe** chain (quán cà phê tự học dạng ô/hộp). The business is defined by [study_booth_cafe_business_plan.md](.claude/docs/study_booth_cafe_business_plan.md), which **supersedes** [document.md](.claude/docs/document.md) wherever the two differ. The ERD baseline is still [schemaDB.html](.claude/docs/schemaDB.html).

The revised business plan reverses the primary flow:

> **Walk-in + POS + real-time availability is the core business flow. Online booking is an optional secondary feature.** (§3, §19, §43)

Customers pay for **time in a booth**, not for coffee. They arrive unannounced, ask *"còn chỗ không?"*, pick a plan, **pay at the counter**, get a booth number + QR, and study. The system's job is to answer availability at a glance, take money in 30–60 seconds, run the session clock, sell extensions, and turn the booth over.

Today the repo is a **skeleton with no working application**:

- 16 TypeORM entities exist under [src/modules/](src/modules/) and match the ERD — but they are **completely unwired**. Not a single `TypeOrmModule.forFeature()`, `@InjectRepository`, service, controller or repository exists.
- [app.module.ts:5](src/app.module.ts#L5) still imports `./users/users.module.js` from before the move to `src/modules/` — **the project does not compile**.
- `autoLoadEntities: true` is set, but with zero `forFeature()` calls it loads nothing, so `synchronize` would create **no tables**.
- The only non-entity code is a Nest-CLI stub: [users.service.ts](src/modules/users/users.service.ts) returns literal placeholder strings; `CreateUserDto` is empty.
- [src/constants/](src/constants/) and [src/helpers/](src/helpers/) exist but are **empty**.
- No auth, no migrations, no validation dependencies installed.

The outcome is a runnable POS + booth-management API covering the operational loop — availability → POS sale → session → extend → check-out → cleaning → available — plus F&B to the booth, branch-scoped RBAC, and the occupancy KPIs the owner actually runs the business on.

---

## What changed from the previous revision of this plan

| Area | Previous plan | This revision | Source |
| :--- | :--- | :--- | :--- |
| Primary flow | Booking → check-in → tab → settle at check-out | **Walk in → check availability → choose plan → pay at POS → session starts** | §3, §41 |
| Aggregate root | `bookings` | **`booth_sessions`** — a booth is "in use by a session", not "booked 14:00–18:00" | §7 |
| Naming | `study_sessions` / `StudySession` | **`booth_sessions` / `BoothSession`** — see below | §2.3, §7, §37.1 |
| Payment timing | Postpaid: draft PENDING invoice at check-in, PAID at check-out | **Prepaid**: the plan is paid *before* the clock starts; F&B is a tab settled at check-out | §6, §41 |
| Payment records | One `payment_method` + `paid_at` column on the invoice | Append-only **`payments` ledger** — prepay, tab settlement, split tender, refunds | forced by prepay |
| Running over time | Overtime billed at check-out | **Extension, prepaid**, is the designed path; overtime survives only as the overstay exception | §10 |
| Booth lifecycle | OCCUPIED → AVAILABLE | OCCUPIED → **CLEANING** → AVAILABLE | §8, §41 |
| Customer identity | Every session has a `users` row | **`booth_sessions.user_id` nullable** — anonymous walk-in is the default; phone captured only when something needs it | §6, §11 |
| Customer surface | JWT-authenticated customer accounts | **QR → mobile web. No app, no account.** Per-session capability token | §11 |
| Zoning | `areas.type {STUDY_BOOTH, GROUP_DISCUSSION, BAR_RECEPTION, UTILITY}` | Zoning **by noise level**: SILENT / NORMAL_STUDY / GROUP_DISCUSSION (+ BAR_RECEPTION, UTILITY) | §15 |
| Booth types | SINGLE, GROUP, VIP | **SINGLE, DOUBLE, GROUP** — VIP appears nowhere in the plan and is dropped | §5, §14, §24 |
| Products | HOURLY / COMBO_4H / COMBO_DAY / MEMBER_30H / OVERNIGHT | **HOURLY / 2H / 4H / 8H / MEMBER_30H + EXTENSION plans**; overnight is schema-supported but **not seeded**, pending validation | §17, §18, §35 |
| Loyalty | Earn + redeem inside the check-out calculator | **Accrual only; redemption deferred** — "không cần loyalty system quá phức tạp" | §40 |
| Headline KPI | Daily revenue | **Paid booth-hours ÷ available booth-hours**, plus RevPABH and RevPOBH | §21, §38 |
| MVP boundary | All modules + full report suite | **POS + Booth Status + Study Session + QR + Payment**; everything else is explicitly post-MVP | §40 |

> **On the rename.** `study_sessions` baked a customer-segment assumption into the schema. §2.3 puts freelancers at 15–20%, and §37.1's entire low-season strategy is pivoting to freelancers, remote workers, workshops and English clubs — none of whom are studying. The thing being sold, metered and reported on is a **booth for a period of time** (§21: the inventory is booth-hours), so the entity is named after that. `BoothSession` also pairs with `booths` and `booth_requests`, and avoids the ambiguity that bare `sessions` would carry in a codebase with JWT auth. §7 supplies the vocabulary itself: *"Seat / Booth / Session Management"*. The business plan's own phrase "Study Session" is still quoted verbatim where it is quoted.
>
> The FK column stays **`session_id`** and the permission codes stay **`session.*`** — unambiguous inside this schema, and shorter at every call site.

Unchanged and still load-bearing: the ESM/TypeORM constraints, the three-layer architecture, the constants discipline, integer-VND money, `timestamptz`, and the migration/CLI strategy. Those sections are reproduced below.

### Ground rules

1. **No hardcoded text in code.** Every message, route, permission code and business number lives in a constants file and is imported.
2. **Strict 3 layers: Controller → Service → Repository.** Controllers never touch TypeORM; services never inject `Repository<T>` directly.
3. **DTOs and Enums defined once and reused.**
4. **The counter is the hot path.** Any design that adds a round-trip, a required field or a login to the POS sale is wrong. Target: **30–60 seconds** from *"tôi muốn học 4 tiếng"* to a customer holding a booth card (§6).

### Confirmed decisions

| Decision | Choice |
| :--- | :--- |
| Scope | Full vertical slice — every shipped module gets controller + service + repository + DTOs |
| Auth | Full JWT auth + branch-scoped RBAC wired to `role_permissions` — **for staff**. Customers are anonymous by default and reach their own session through a per-session capability token, not an account |
| Schema | TypeORM migrations, `synchronize` off |
| Conventions | Swagger, pagination/filtering/sorting, env validation on boot |
| Excluded | Global response-envelope interceptor, global exception filter |
| Payment | **Prepaid at POS**; one invoice per session; append-only `payments` ledger; split tender supported |
| Booth turnover | Check-out puts the booth in **CLEANING**, not AVAILABLE |
| Messages | Stable error **codes** + VI/EN text maps in constants |
| Money | **Integer VND** (whole đồng) — no decimals, no cents, no float or string math |
| Migration CLI | **Build first**, run the CLI against `dist/` — no TS loader |

---

## Verified technical constraints

Checked against the installed packages, not assumed. Unaffected by the business change.

| Fact | Consequence |
| :--- | :--- |
| Pure ESM (`"type": "module"`, `moduleResolution: nodenext`) | **Every relative import must end in `.js`.** `tsc` hard-errors otherwise, so the compiler enforces it. |
| No tsconfig `paths` | Keep relative imports. Under `nodenext` `tsc` does **not** rewrite aliases at emit — they compile and crash at runtime without `tsc-alias`. |
| TypeORM **1.1.1** (not 0.3.x) | `Connection`, `AbstractRepository` and all global helpers are **removed**. `findOne()` requires an options object. `update()`/`delete()` require criteria. `exists`/`existsBy` available. |
| `@nestjs/typeorm` `forFeature()` never instantiates custom `Repository` subclasses | **Custom repositories are plain `@Injectable()` classes** receiving `Repository<T>` via `@InjectRepository`. Never pass a repository class to `forFeature()`. |
| `EntityManager.withRepository()` requires the argument to **be** a `Repository` instance | Our repositories *hold* a `Repository`, they don't extend one — so `withRepository(this)` does **not** work. Transactions use the `scoped(manager)` funnel below. |
| Node 24 type-stripping cannot parse decorators; `ts-node` absent; esbuild/`tsx` lack `emitDecoratorMetadata` | Migration CLI runs against compiled `dist/`. |
| Vitest 4 → Vite 8 → **oxc/rolldown** (not esbuild) | `emitDecoratorMetadata` **is** honoured — verified by running the transform. **No `unplugin-swc` needed.** |
| `@nestjs/config` 12 dropped Joi `validationSchema` | Env validation uses a `validate()` function with class-validator. |
| `class-validator`/`class-transformer` are CJS with no `exports` map | ✅ **Verified by execution.** Named imports work via Node's CJS named-export detection — no default-import destructure needed. `bcryptjs` does need a default import. |
| **Circular entity imports are fatal under ESM.** `emitDecoratorMetadata` emits `__metadata("design:type", Invoice)`, which *evaluates* the class at definition time — and two entities that reference each other are a TDZ cycle: `ReferenceError: Cannot access 'Invoice' before initialization`. | ✅ **Hit and fixed.** Every relation property is typed `Relation<T>` (TypeORM's `export type Relation<T> = T`), which makes TS emit `Object` for `design:type` and breaks the cycle. The `() => Entity` lambda is lazy and was never the problem. Applied to all 58 relation properties, not just the cyclic ones — a uniform rule survives the next entity someone adds. |
| **A nullable column needs an explicit `type`.** `foo: string \| null` is a union, so `design:type` emits `Object` and TypeORM throws `DataTypeNotSupportedError: Data type "Object"`. | ✅ **Hit and fixed.** Every nullable column carries `type: 'varchar' \| 'int' \| ...` explicitly. Same root cause bites class-validator env DTOs: a property written `PORT = 3000` with no annotation emits `Object`, so `enableImplicitConversion` silently fails to coerce and a valid `.env` is rejected. Always annotate. |

---

## Architecture

```
src/
├── main.ts / app.module.ts
├── constants/                      # GLOBAL, cross-cutting only
│   ├── app · env · route · swagger · pagination · validation · regex
│   ├── auth · rbac · database · business · billing · cron
│   └── messages/                   # error-codes.ts + vi/*.messages.ts + en/*.messages.ts
├── common/
│   ├── decorators/                 # @Public, @RequirePermissions, @BranchScope,
│   │                               # @CurrentUser, @CurrentSession, @ApiPaginatedResponse
│   ├── dto/                        # PaginationQueryDto, PaginatedResponseDto, param DTOs
│   ├── enums/                      # ALL domain enums, extracted from entities
│   ├── entities/                   # TimestampedEntity, SoftDeletableEntity
│   ├── interfaces/ · pipes/ · validation/ · utils/
│   ├── repositories/base.repository.ts     # ← the crux of rule #2
│   └── database/                   # @Global DatabaseModule + TransactionRunner
├── helpers/                        # money.helper.ts, time.helper.ts, business-day.helper.ts
├── config/                         # registerAs namespaces + env.validation.ts
├── database/                       # DI-free: usable by Nest AND the TypeORM CLI
│   ├── entities.ts · data-source-options.ts · data-source.ts
│   ├── migrations/index.ts         # ALL_MIGRATIONS (explicit, no globs)
│   └── seeds/
└── modules/<name>/                 # identical shape for every module
    ├── <name>.{module,controller,service}.ts
    ├── repositories/<name>.repository.ts
    ├── entities/ · dto/
    └── constants/<name>.constants.ts   # technical: aliases, relations, sortable columns
```

### Where constants live

> A constant lives at the **lowest level that owns it**; promote it to `src/constants/` when a second module imports it — **except all user-facing text and all permission/route codes, which are always global.**

User-facing text needs one extraction root so swapping in `nestjs-i18n` later is mechanical. Query aliases and module-local thresholds belong next to the code that owns them — one 2000-line global file across 16 modules is a merge-conflict magnet and invites import cycles. **Modules import the specific file, never the barrel** (barrel imports are a classic NestJS circular-dependency source).

| Constantize | Leave inline |
| :--- | :--- |
| Messages, error codes, route paths & param names, env/config keys, Swagger tags & summaries, permission and role codes, metadata keys, header names, regexes, **every magic number** (page sizes, bcrypt rounds, TTLs, reminder offsets, overtime grace, cleaning minutes, access-code length) | DTO/entity **property names** (the wire contract), HTTP verbs, QueryBuilder SQL predicate fragments, QueryBuilder parameter names, OpenAPI schema vocabulary |

Two deliberate carve-outs: **SQL fragments in a repository are code, not copy** — hoisting `'.status = :status'` into constants destroys readability and the fragment is meaningless outside its one query; constantize the *alias* and *relation path*, which do repeat. And `:branchId`-style parameter names stay inline as locally-scoped identifiers.

### Messages: codes + VI/EN maps

```ts
// src/constants/messages/error-codes.ts
export const ERROR_CODE = {
  BOOTH_NOT_AVAILABLE: 'BOOTH_NOT_AVAILABLE',
  NO_BOOTH_OF_TYPE_AVAILABLE: 'NO_BOOTH_OF_TYPE_AVAILABLE',
  PAYMENT_DOES_NOT_COVER_PLAN: 'PAYMENT_DOES_NOT_COVER_PLAN',
} as const;
export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

// src/constants/messages/vi/booth.messages.ts
export const BOOTH_MESSAGES_VI: Partial<Record<ErrorCode, string>> = {
  [ERROR_CODE.BOOTH_NOT_AVAILABLE]: 'Ô học hiện không sẵn sàng.',
};
```

Services throw `new ConflictException({ code, message: resolve(code, locale) })`. Nest's default exception serialization puts that object straight in the body — which is exactly why no `AllExceptionsFilter` is needed. Locale from `Accept-Language`, defaulting to VI. The counter UI is Vietnamese; VI text is not an afterthought.

**Notifications store `message_code` + a `params` jsonb column, never a rendered string** — that is how the no-hardcoded-text rule survives into the notification table.

### Enums: extract to `src/common/enums/`

The domain enums sit inside 6 entity files and **nothing outside those files imports them** — extracting now is zero-breakage, and must happen before any other code exists. DTOs, Swagger schemas, guards and services all need them, and importing an *entity* just to get a status enum drags TypeORM's relation graph into a DTO file. Move the enum, update the entity import, and **do not re-export from the entity** — two import paths for one symbol produces two runtime enum objects.

> The Postgres enum **type name** derives from `table + column` (`booths_status_enum`), not the TS file location, so moving has **zero schema impact**.

Enums added or changed by this revision:

| Enum | Values | Note |
| :--- | :--- | :--- |
| `BoothStatus` | AVAILABLE, OCCUPIED, **CLEANING**, MAINTENANCE, *TEMPORARILY_AWAY*, *RESERVED* | §8. MVP uses the first four; the last two ship in phase 2 |
| `BoothType` | SINGLE, **DOUBLE**, GROUP | §5, §24. `VIP` removed |
| `ZoneType` | SILENT, NORMAL_STUDY, GROUP_DISCUSSION, BAR_RECEPTION, UTILITY | §15 — zoning is by **noise level** |
| `PlanType` | HOURLY, COMBO, DAY_PASS, **EXTENSION**, MEMBERSHIP, OVERNIGHT | §10, §17, §18 |
| `SessionSource` | WALK_IN, BOOKING, MEMBER_SELF | §19 customer types 1/3/2 |
| `SessionEndReason` | NORMAL, EXTENDED_OUT, AUTO_CLOSE, FORCED, NO_RETURN, CANCELLED | audit for every close |
| `PaymentMethod` | CASH, BANK_TRANSFER, CARD, E_WALLET, MEMBERSHIP, COMPLIMENTARY | VN reality: cash + QR chuyển khoản dominate |
| `PaymentDirection` | IN, REFUND | the ledger never stores negative amounts |
| `PaymentStatus` | PENDING, **PARTIALLY_PAID**, PAID, CANCELLED, REFUNDED | a tab can be half-settled |
| `InvoiceType` | SESSION, MEMBERSHIP, RETAIL | §20 secondary revenue |
| `MenuItemType` | DRINK, SNACK, FOOD, **PRINTING**, **STATIONERY**, **LOCKER**, SERVICE | §13, §17 add-ons |
| `OrderItemStatus` | PENDING, PREPARING, SERVED, CANCELLED | the bar work queue |
| `BoothRequestType` | ASSISTANCE, CLEANING, EQUIPMENT, ORDER, **EXTENSION** | the QR page's `[Extend Session]` button |
| `WarningLevel` / `WarningAction` | YELLOW, RED / WARNED, MOVED_ZONE, ASKED_TO_LEAVE | §37.2 |
| `CustomerSegment` | HIGH_SCHOOL, UNIVERSITY, FREELANCER, OTHER | §2 the 35/45/20 mix |
| `UserStatus`, `SortOrder`, `BranchScopeSource` | — | infrastructure |

---

## The repository layer (rule #2)

### Contract

- **Controllers** never import `typeorm` or a repository. HTTP concerns + map entity → response DTO.
- **Services** inject their own module's repository class(es) plus `TransactionRunner`. They own business rules, ownership checks and transaction boundaries.
- **Repositories** own every query, return entities/primitives/`PaginatedResult<T>` (never DTOs), and throw no HTTP exceptions — with one carve-out: `BaseRepository` throws `BadRequestException` on an unwhitelisted `sortBy`, because it is the only layer that knows the column whitelist, and that whitelist doubles as the SQL-injection guard.

### Transactions

`DataSource.transaction()` behind a `TransactionRunner`, with **every repository and every composable service method taking an optional trailing `manager?: EntityManager`**. Rejected: a `QueryRunner` unit-of-work (leaks lifecycle into services; one missed `release()` exhausts the pool) and AsyncLocalStorage propagation (you cannot tell from a signature whether a call is transactional).

The single mechanism that makes it work is one protected funnel in `BaseRepository`:

```ts
protected scoped(manager?: EntityManager): Repository<TEntity> {
  return manager ? manager.getRepository(this.repository.target) : this.repository;
}
```

Base methods, each with the optional trailing `manager`: `findPaginated`, `findAll`, `findOne`, `findById`, `exists`, `count`, `create`, `createMany`, `updateById`, `save`, `deleteById`. `findPaginated` clamps `limit` to `PAGINATION.MAX_LIMIT`, validates `sortBy`, and distributes `search` across `searchableColumns` as an OR while preserving the caller's base WHERE as an AND on every branch.

> **No `softDelete` in the base.** Only some entities get `@DeleteDateColumn`; on the others `repository.softDelete()` throws `MissingDeleteDateColumnError` at runtime. Put it on a `SoftDeletableRepository` subclass instead.

Isolation is `READ COMMITTED` everywhere — the partial unique indexes, the guarded `UPDATE … WHERE status = …` writes and (for bookings) the GiST exclusion constraint supply the serialization that would otherwise need `REPEATABLE READ` plus retry loops.

### Concrete repository shape

```ts
@Injectable()
export class BoothRepository extends BaseRepository<Booth> {
  protected readonly sortableColumns = BOOTH_SORTABLE;
  protected readonly searchableColumns = BOOTH_SEARCHABLE;
  protected readonly defaultSortColumn = BOOTH_QUERY.DEFAULT_SORT;

  constructor(@InjectRepository(Booth) repository: Repository<Booth>) {
    super(repository);
  }

  /** Atomic occupy: flips AVAILABLE → OCCUPIED, false if it lost the race. */
  async markOccupied(boothId: number, manager?: EntityManager): Promise<boolean> {
    const result = await this.scoped(manager).update(
      { id: boothId, status: BoothStatus.AVAILABLE } as FindOptionsWhere<Booth>,
      { status: BoothStatus.OCCUPIED, statusChangedAt: new Date() },
    );
    return (result.affected ?? 0) > 0;
  }

  /**
   * Auto-assign for the POS: the lowest-ordered free booth of a type,
   * locked so two cashiers can never be handed the same booth.
   */
  async claimNextAvailable(
    branchId: number, type: BoothType, manager: EntityManager,
  ): Promise<Booth | null> {
    return manager.getRepository(Booth)
      .createQueryBuilder(BOOTH_QUERY.ALIAS)
      .where(`${BOOTH_QUERY.ALIAS}.branch_id = :branchId`, { branchId })
      .andWhere(`${BOOTH_QUERY.ALIAS}.type = :type`, { type })
      .andWhere(`${BOOTH_QUERY.ALIAS}.status = :status`, { status: BoothStatus.AVAILABLE })
      .andWhere(`${BOOTH_QUERY.ALIAS}.is_active = true`)
      .orderBy(`${BOOTH_QUERY.ALIAS}.display_order`, 'ASC')
      .limit(1)
      .setLock('pessimistic_write')
      .setOnLocked('skip_locked')
      .getOne();
  }
}
```

`FOR UPDATE SKIP LOCKED` is the right primitive for auto-assignment: two cashiers ringing up simultaneously get different booths instead of one blocking on the other.

### Module registration

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Booth]), AreasModule],
  controllers: [BoothsController],
  providers: [BoothsService, BoothRepository],
  exports: [BoothsService],          // Service only — NEVER export the repository
})
export class BoothsModule {}
```

`forFeature` provides **DI tokens**; the `entities` array provides **connection metadata**. Both are required — that is the real fix for the unwired-entities blocker.

### Cross-module access — the firm rule

> **A service may inject another module's *Service*. A service may never inject another module's *Repository*. A module exports only its Service.**

A repository is a data abstraction with no invariants. `BoothsService.getAssignableOrFail()` is where "booth exists, is active, is AVAILABLE, is in a branch you can see, matches the requested type" lives; the moment `PosService` reaches past it, that rule gets re-implemented and drifts in every consumer.

The transaction objection is answered by the `manager` parameter — **composable service methods take the same optional trailing `manager` and forward it**, so cross-service calls stay inside the caller's transaction.

Dependency direction must stay a DAG:

```
areas → branches
booths → areas
pricing-plans → branches
menu-items → categories
booth-sessions → {booths, pricing-plans, users, memberships}
invoices → {booth-sessions, users}
payments → invoices
order-items → {invoices, menu-items, booth-sessions}
booth-requests → {booth-sessions, booths}
bookings → {booths, pricing-plans, users}
pos → {booth-sessions, invoices, payments, booths, pricing-plans, users, memberships, bookings}
reports → everything
```

A genuine cycle is a design smell to fix, not a `forwardRef` to add.

### The `pos` module — new in this revision

The counter sale spans booth-sessions, invoices, payments, booths, pricing-plans and (optionally) users and memberships. Putting `POST /pos/sessions` on `BoothSessionsModule` would force that module to own payment; spreading it across modules would split one transaction across two controllers.

**`PosModule` is an orchestration layer**: no entity of its own, one service that opens the transaction and calls the domain services in order, one controller that is the counter's entire API surface. It sits at the top of the DAG — everything depends on nothing from it. This is the direct architectural consequence of "walk-in + POS is the core flow".

---

## Shared DTOs & validation

`PaginationQueryDto` (`page`, `limit`, `sortBy`, `sortOrder`, `search`) with defaults from constants; per-module query DTOs extend it. `PaginatedResponseDto<T>` plus an `ApiPaginatedResponse(Model)` decorator using `ApiExtraModels` + `getSchemaPath` to express the generic to Swagger.

**ID params**: `IntIdParamDto` and `BigIntIdParamDto` — bigint PKs stay `string` end-to-end (`Number` loses precision past 2^53, and pg returns strings anyway). Composite routes compose via `IntersectionType(BranchIdParamDto, IntIdParamDto)`.

**Global `ValidationPipe`**: `whitelist`, `forbidNonWhitelisted`, `transform`, `stopAtFirstError`, a constants-driven `exceptionFactory`, and **`transformOptions: { enableImplicitConversion: false }`** — implicit conversion silently coerces `"abc"` → `NaN` and makes `@IsString()` pass on numeric query params. Explicit `@Type()` is three characters and honest. With no global exception filter, `exceptionFactory` is the single place the 400 body shape is decided.

**`PartialType`**: once `@nestjs/swagger` is installed, import `PartialType`/`PickType`/`OmitType` **exclusively from `@nestjs/swagger`** — its versions re-apply `@ApiProperty` metadata as well as class-validator metadata. Mixing means the DTO validates correctly but renders as an empty object in Swagger, a silent failure. To make mixing impossible, **remove `@nestjs/mapped-types`** (it stays available transitively) and fix [update-user.dto.ts](src/modules/users/dto/update-user.dto.ts), which imports from it today.

**Enable the `@nestjs/swagger` CLI plugin** in `nest-cli.json`. It infers `type`, `required`, `nullable` and enum refs from TS types, eliminating hundreds of zero-information `@ApiProperty({ type: String })` lines. Write `@ApiProperty` only where there is real text, and that text comes from constants. Single biggest boilerplate saving in the plan.

---

## Auth & RBAC

Two completely separate identity surfaces, and conflating them is the mistake to avoid:

| Surface | Who | Mechanism |
| :--- | :--- | :--- |
| **Staff** | cashier, barista, branch manager, owner | JWT access + refresh, branch-scoped RBAC |
| **Customer** | a walk-in, usually anonymous | **per-session capability token in a QR code.** No account, no password, no app (§11) |

### Staff auth

**User schema**: `password_hash varchar(255)` with **`select: false`**, `status`, `last_login_at`, timestamps.

**Keeping the hash out of responses: `select: false` + explicit response DTOs. No `ClassSerializerInterceptor`.** `select: false` is the strongest guarantee available — TypeORM never puts the column in a `SELECT` unless explicitly `addSelect`ed, so the hash is **not in memory**. A forgotten `@Exclude()`, a raw `getMany()` or a stray log cannot leak what was never loaded. The one place that needs it gets an obviously-named `UserRepository.findByEmailWithSecret()`.

**No Passport.** Implement `JwtAuthGuard` on `@nestjs/jwt` directly (~30 lines). Passport's only contribution here is bearer extraction plus calling verify — both one-liners with `JwtService.verifyAsync`, which already enforces `exp`. `passport`/`passport-jwt` are untyped CJS in an otherwise pure-ESM tree. No `LocalStrategy`: `POST /auth/login` with a `LoginDto` is clearer than a strategy indirection built for HTML form logins.

**Refresh tokens: a `refresh_tokens` table, with rotation.** Stateless tokens **cannot be revoked**, so "log out this device" and "fire a staff member" are unenforceable for the token's lifetime — unacceptable when staff hold cash-handling permissions. A single column on `users` allows exactly one session, breaking the manager-on-phone-plus-POS-terminal case. Store **sha256 of the token**, rotate on every refresh (`revoked_at` + `replaced_by_id`), and on reuse of a rotated token revoke the whole chain. Prune expired rows in the rotation transaction — no cron.

**Permission resolution: the JWT carries roles + branch scopes; the guard expands roles → permissions from an in-process cache** (TTL 60s, explicit invalidation on any `role_permissions` write). The role→permission map is ~60 rows, identical for everyone and near-static, so caching is free. Putting the user→role map in the JWT means **zero auth DB queries on the hot path** — which matters when the POS is the hot path — with staleness bounded by the 15-minute access-token TTL. Access and refresh use **different secrets** and the payload carries a `type` checked on verify, so a refresh token can never be replayed as an access token.

**Branch scoping:**
> **If the branch is explicit in the request, the guard authorizes it and 403s on mismatch. If the branch is implicit (a collection), the guard computes `allowedBranchIds` and the *repository* filters on it.** Never rely on the guard to filter lists; never rely on the service to authorize an explicit branch.

`SUPER_ADMIN` has `branchId: null`, so `allowedBranchIds` is `null` and the repository skips the `branch_id IN (...)` clause.

**Roles**: `super_admin` (chain-wide), `branch_manager`, `cashier`, `barista`, `customer` (for the rare registered customer). Permission codes are `<module>.<action>` with an `.any` suffix for cross-owner access. Because `permissions` already has a `module` column, `code.split('.')[0] === module` makes the seeder and any group-by-module admin UI fall out for free. `ROLE_PERMISSION_MATRIX` in `rbac.constants.ts` is the single source of truth for both guard and seeder.

> Note the split of `staff` into **`cashier`** and **`barista`**: with F&B ordering to the booth, the bar has its own queue and should not hold cash-drawer or discount permissions. This falls straight out of §41's operational workflow.

**Seeding: idempotent script, not a migration.** Migrations must stay frozen to remain reproducible, but the permission catalog grows with **every new endpoint** — as migrations that means a new migration per feature and guaranteed drift. `pnpm db:seed` runs as a Nest standalone application context, reusing the real repositories and `PasswordService` rather than side-stepping rule #2 with raw SQL. It upserts permissions/roles by code, reconciles `role_permissions` to match the matrix, deletes retired codes, and creates the bootstrap admin. Safe on every deploy, right after `migration:run`.

### Customer access: the session capability token

§11 is explicit — no app, no download, no account, no password. After payment the customer gets a QR that opens a mobile web page showing their session.

Two distinct identifiers on `booth_sessions`, and they must not be merged:

| Field | Shape | Purpose |
| :--- | :--- | :--- |
| `access_code` | 4–6 chars, human-readable, unique **per branch among active sessions** | printed on the booth card; staff type it to find the session at the counter |
| `public_token` | 32-char URL-safe random, globally unique | embedded in the QR URL; the bearer capability for the mobile page |

A short human code is guessable; a long token is not. Merging them would mean either an unusable 32-char card or a brute-forceable URL.

`SessionTokenGuard` sits on a dedicated `PublicSessionController` under `/s/:token`, marked `@Public()` for the JWT guard. It resolves the token → session, rejects anything not `CHECKED_IN`, and exposes a **capability-limited** surface:

- `GET  /s/:token` — booth, plan, start/end, minutes remaining, ordered items, amount due
- `POST /s/:token/requests` — ASSISTANCE / CLEANING / EQUIPMENT / **EXTENSION** request
- `GET  /s/:token/menu` — the branch menu for self-ordering

It **cannot** pay, cancel, transfer, read another session, or read anything about the customer beyond this session. Rate-limited per token. **Extension from the QR page creates a request, not a charge** — money is taken at the counter, because MVP has no payment gateway (§40). When online payment arrives, this endpoint becomes the natural hook.

**Ownership is not RBAC.** "A registered customer sees only their own sessions" is a service-layer rule driven by `AuthContext`: with `session.read.any` they see the branch's sessions; with only `session.read` the service passes `actor.userId` into the repository filter. Keep this distinct or the permission catalog will metastasize.

---

## Config, database & bootstrap

**Config**: `registerAs` namespaces (`app`, `database`, `jwt`, `swagger`, `business`) with typed `ConfigType` consumers, so **no `configService.get('SOME_STRING')` appears outside `src/config/`**. Env validation uses a `validate()` function with class-validator, with two settings deliberately different from the DTO pipe: `enableImplicitConversion: true` (env values are all strings) and `whitelist: false` (env holds hundreds of unrelated OS variables). Add cross-field checks that access and refresh secrets differ and that `DB_SYNCHRONIZE !== 'true'` when `NODE_ENV=production`. New key: `PUBLIC_BASE_URL`, used to build the QR link — it must be validated as a URL at boot, because a wrong value prints thousands of dead QR codes before anyone notices.

`.env.example` must be **corrected** — it uses `DB_NAME`/`DB_USER` while `.env` and the app use `DB_DATABASE`/`DB_USERNAME`. `node --env-file=.env` replaces `dotenv` entirely, which matters because `dotenv` is only a transitive dep of `@nestjs/config` and is **not importable** under pnpm's strict layout.

**Data source**: one pure options builder (no Nest, no `process.env`) consumed by both `TypeOrmModule.forRootAsync` and the CLI entrypoint.
- **Explicit `ALL_ENTITIES`, `autoLoadEntities: false`** — `autoLoadEntities` works only for Nest and leaves the CLI needing its own list, which is how entity lists drift. `forFeature` stays in every module for DI.
- **Explicit `ALL_MIGRATIONS` class array, no globs** — `['dist/**/*.js']` is a Windows path-separator trap and a cwd trap. An index file is ESM-safe, Windows-safe and reviewable in a diff.

**Migration CLI — build first.** Each alternative fails on a specific mechanism: `typeorm-ts-node-commonjs` cannot work under `"type": "module"`; `typeorm-ts-node-esm` needs the absent `ts-node`; `tsx` and anything esbuild-based lacks `emitDecoratorMetadata` and would **silently generate wrong column types**; Node's native type-stripping throws on decorators.

```jsonc
"typeorm:ds": "node --env-file=.env ./node_modules/typeorm/cli.js -d dist/database/data-source.js",
"migration:generate": "pnpm build && pnpm typeorm:ds migration:generate",
"migration:run":      "pnpm build && pnpm typeorm:ds migration:run",
"migration:revert":   "pnpm build && pnpm typeorm:ds migration:revert",
"migration:show":     "pnpm build && pnpm typeorm:ds migration:show",
"db:seed":            "pnpm build && node --env-file=.env dist/database/seeds/run-seed.js"
```

The path argument is positional and appended by `pnpm run`, so this behaves identically in PowerShell, cmd and bash.

**Bootstrap**: `main.ts` gains global prefix, URI versioning, CORS from config, the global `ValidationPipe`, shutdown hooks and conditional Swagger — every string from constants. **Remove `@nestjs/observe`**: `ObserveModule.forRoot` is commented out while its `ObserveInstrument` is still passed to `NestFactory.create`, so it instruments nothing while costing a dependency and a confusing export.

**Dependencies:**
```bash
pnpm add class-validator class-transformer @nestjs/swagger @nestjs/jwt bcryptjs @nestjs/schedule nanoid
pnpm remove @nestjs/observe @nestjs/mapped-types
```
**`bcryptjs` over `bcrypt`**: `bcrypt` is a node-gyp native module — on Windows + Node 24 you are one missing prebuild away from needing Visual Studio Build Tools, and CI/Docker images need the toolchain too. `bcryptjs` is pure JS, dual ESM/CJS, ships its own types, ~40ms per login. `argon2` is native too, same objection. **`nanoid`** generates the `public_token` and `access_code` from a custom alphabet (no look-alike characters — a staff member reading `0`/`O` off a booth card at 22:00 is a real failure mode).

Also `git add` the `src/modules/**` move — git currently shows the old paths as unstaged deletions.

---

## Schema changes

The existing schema cannot express the business. These are the load-bearing gaps, in priority order.

### Money & time, applied across every table

- **All money columns → `bigint` whole đồng**, renamed with a `_vnd` suffix (`pricing_plans.price` → `price_vnd`, `menu_items.price`, `order_items.unit_price`, `invoices.total_amount`). Entity: `@Column({ type: 'bigint', transformer: vndTransformer })` typed `number` — `bigint` returns as `string` from `pg`, and the transformer is what keeps money strings out of the service layer. `Number.MAX_SAFE_INTEGER` is ~9 billion × the largest plausible invoice, so `number` is exact. **Never `parseFloat`, never `toFixed` for arithmetic.** `SUM(bigint)` returns `numeric` in Postgres, so report repos must map it explicitly.
- **All timestamps → `timestamptz`.** `timestamp` without zone for a UTC+7 business is a correctness bug: revenue at 07:00 local lands on the previous day when the server clocks UTC. The migration must use `USING col AT TIME ZONE 'Asia/Ho_Chi_Minh'` — **without the `USING`, Postgres reinterprets existing values as UTC and shifts everything 7 hours.** App runs `TZ=UTC`; conversion happens at the DTO edge (`@IsISO8601` with a required offset).
- **`business_date date` is stored on `booth_sessions`, `invoices` and `payments`**, computed once at write time from the branch timezone and `BUSINESS_DAY_START_HOUR = 04:00`. Every daily report then groups by an indexed equality predicate with **zero timezone math at query time**. This is new in this revision and it is what makes the dashboard in §29 a cheap query instead of an `AT TIME ZONE` join per report.

### Per-entity columns

| Entity | Add / change | Why |
| :--- | :--- | :--- |
| **branches** | `code` unique, `opens_at`, `closes_at` (time), `is_overnight`, `timezone` default `Asia/Ho_Chi_Minh`, `cleaning_minutes`, `phone`, `address` | Operating-hours validation, the closing sweeper, per-branch business day, receipt prefix, booth-hour capacity |
| **areas** | `zone_type` enum, `display_order` | §15 — zoning by **noise level**. `is_sessionable` is *derived* from `zone_type` (SILENT / NORMAL_STUDY / GROUP_DISCUSSION), never stored |
| **booths** | `branch_id` (denormalised), `type` → SINGLE/DOUBLE/GROUP, `capacity`, `is_active`, `display_order`, `status` += CLEANING (+TEMPORARILY_AWAY, RESERVED in phase 2), **`status_changed_at`** | The availability board (§5) reads `(branch_id, type, status)` on every page load — a double join to `areas` on the hottest path is not acceptable. `status_changed_at` drives the cleaning sweeper and "how long has A17 been dirty" |
| **pricing_plans** | `code` unique, `plan_type`, `duration_minutes`, `included_drinks`, `included_snacks`, `total_minutes`, `validity_days`, `overtime_rate_vnd`, `available_from_time`/`_to_time`, `booth_type` (nullable = any), `branch_id` (nullable = chain-wide), `is_active`, `display_order` | **Largest gap.** With only `(name, price, unit)` none of the products in §17/§18 can be expressed. `available_from_time`/`_to_time` is also what enables the off-peak / peak pricing §30 suggests |
| **booth_sessions** | see below | **Second-largest gap** — this is now the aggregate root |
| **invoices** | see below | Daily revenue reporting is literally impossible today (no timestamps at all) |
| **order_items** | `session_id` (denormalised), `created_at`, `served_at`, `status` enum, `menu_item_name_snapshot`, `is_complimentary`, `list_price_vnd`, `unit_price_vnd`, `booth_request_id`, `note` | The bar needs a work queue. Items get renamed — receipts must not mutate. With `unit_price = 0` on freebies you'd lose the give-away value entirely. `note` ("ít đường, ít đá") is non-negotiable in a VN cafe |
| **menu_items** | `branch_id` (nullable), `item_type` enum, `is_self_service`, `is_inclusion_eligible`, `unit` (cup/page/day), `cost_price_vnd` | The hourly rate **includes** self-serve water/tea/instant coffee (§17) — those must be listed but rejected as billable orders. Printing is per page, locker per day (§13, §17) |
| **booth_requests** | `branch_id`, `session_id` → **nullable**, `booth_id`, `assigned_to_user_id`, `resolved_at`, `note` | Staff must log a CLEANING request on an empty booth after check-out. `resolved_at − requested_at` is the whole service-quality KPI |
| **users** | `email` → **nullable** (partial unique on `lower(email)`); `phone` partial unique; `password_hash` (`select:false`); `status`; `customer_segment`; `first_visit_at`; `last_visit_at`; `visit_count`; `total_paid_vnd` | A cash-paying student has no email — today the column forbids registering them. Phone is the real VN identifier and the counter lookup key. `first_visit_at` is how the "first session −30%" voucher (§35) is verified without a voucher engine. `visit_count` is the repeat-rate numerator (§38) |

#### `booth_sessions` in full

```
id                          bigint pk
branch_id                   int          -- denormalised; every report and RBAC filter needs it
booth_id                    int
user_id                     bigint NULL  -- ← anonymous walk-in is the DEFAULT (§6, §11)
customer_phone              varchar NULL -- light-touch identity, captured only if offered
customer_name               varchar NULL
guest_count                 int default 1
pricing_plan_id             int
booking_id                  bigint NULL  -- secondary flow only
membership_id               bigint NULL
source                      enum {WALK_IN, BOOKING, MEMBER_SELF}
status                      enum {CHECKED_IN, CHECKED_OUT, CANCELLED}
check_in_time               timestamptz
expected_end_time           timestamptz  -- check_in + planned + extended; INDEXED for the reminders
check_out_time              timestamptz NULL
planned_minutes             int
extended_minutes            int default 0
actual_minutes              int NULL     -- ceil, written at check-out
overtime_minutes            int default 0
plan_price_snapshot_vnd     bigint
overtime_rate_snapshot_vnd  bigint
included_drinks_total/_used int default 0
included_snacks_total/_used int default 0
access_code                 varchar(6)   -- printed on the booth card
public_token                varchar(32)  -- the QR capability token
reminder_30_sent_at         timestamptz NULL
reminder_10_sent_at         timestamptz NULL
end_reason                  enum NULL
away_since / away_until     timestamptz NULL   -- phase 2 (§9)
business_date               date
created_by_user_id          bigint NULL  -- the cashier
created_at / updated_at
```

**Price snapshots** mean an owner editing tonight's price cannot move a session that is already running. **Two reminder columns**, not one, because §10 specifies both a 30-minute and a 10-minute nudge, and each needs its own idempotency flag. **No `EXPIRED` status**: overstay is the derived predicate `status = 'checked_in' AND now() > expected_end_time`, with no writer and no staleness.

#### `invoices` in full

```
id, branch_id, user_id NULL, session_id NULL (partial-unique)
invoice_number        varchar unique NULL  -- assigned at FIRST payment, gapless per branch/day
type                  enum {SESSION, MEMBERSHIP, RETAIL}
status                enum {PENDING, PARTIALLY_PAID, PAID, CANCELLED, REFUNDED}
session_amount_vnd    bigint   -- plan price × units, prepaid
extension_amount_vnd  bigint   -- Σ session_extensions, prepaid
overtime_amount_vnd   bigint   -- the overstay exception only
items_amount_vnd      bigint   -- F&B and add-ons
subtotal_amount_vnd   bigint
discount_amount_vnd   bigint + discount_reason + discounted_by_user_id
total_amount_vnd      bigint
paid_amount_vnd       bigint   -- maintained by guarded UPDATE alongside every payment row
first_paid_at, settled_at, cashier_user_id, business_date, created_at, updated_at
```

`balance_due = total_amount_vnd − paid_amount_vnd` is **derived, never stored** — a stored copy is a third number to keep in sync. A manual discount with no audit trail is cash leakage, hence `discount_reason` + `discounted_by_user_id`.

### New tables

| Table | Purpose |
| :--- | :--- |
| **`payments`** | The change that makes prepay work. `invoice_id`, `branch_id`, `direction {IN, REFUND}`, `method`, `amount_vnd` (always positive — direction carries the sign), `received_by_user_id`, `received_at`, `business_date`, `reference` (transfer/terminal ref), `membership_usage_id` NULL, `note`. **Append-only: no UPDATE, no DELETE.** A correction is a REFUND row. This is what supports paying the plan at 14:00 and the coffee at 18:00, split tender (cash + chuyển khoản), and a drawer that reconciles |
| **`session_extensions`** | `session_id`, `pricing_plan_id`, `added_minutes`, `price_snapshot_vnd`, `amount_vnd`, `previous_expected_end_time`, `new_expected_end_time`, `created_by_user_id`, `created_at`. §10's extension is a *sale*, and extension revenue is a metric the owner will want on day one |
| **`invoice_counters`** | `(branch_id, business_date, last_seq)` — gapless receipt numbering via `INSERT … ON CONFLICT DO UPDATE … RETURNING` |
| **`branch_capacity_snapshots`** | `(branch_id, business_date, active_booth_count, open_minutes, available_booth_minutes)`, written by a nightly cron. **Occupancy's denominator must be historically immutable** (§21, §38): computing it from *today's* booth count silently rewrites last month's occupancy the day a booth is added |
| **`memberships`** | The 30-hour card (§18.3): `total_minutes`, `remaining_minutes`, `valid_from`/`valid_to`, `price_paid_vnd`, `status`. **Not `reward_points`** — points are *earned*, never expire, and have no cash value; a membership is a *purchased* balance with an expiry, a price paid and a refund liability. Conflating them makes revenue recognition impossible |
| **`membership_usages`** | **Append-only** ledger: `membership_id`, `session_id`, `minutes_delta` (negative = debit, positive = refund of unused), `recognised_value_vnd`, `created_at`. Corrections are new rows, never UPDATEs |
| **`customer_warnings`** | §37.2's yellow/red card: `session_id` (**not just `user_id`** — most offenders are anonymous), `user_id` NULL, `level`, `action_taken {WARNED, MOVED_ZONE, ASKED_TO_LEAVE}`, `reason`, `issued_by`, `expires_at`, revocation audit |
| **`notifications`** | `audience`, `message_code`, `params` jsonb, `read_at`, `session_id` NULL |

### The product catalog, expressed

Seeded from §17 and §18. The business plan gives ranges; these are the explicit menu prices in §17, and the owner edits them in the admin UI on day one.

| code | plan_type | price_vnd | duration_min | drinks / snacks | note |
| :--- | :--- | --: | --: | :--- | :--- |
| `HOURLY_STD` | HOURLY | 20 000 | 60 | 0 / 0 | §18.1 range 15–25k, seeded mid |
| `STUDY_2H` | COMBO | 35 000 | 120 | 0 / 0 | §17 |
| `STUDY_4H` | COMBO | 55 000 | 240 | 1 / 0 | §17, §18.2 range 55–65k |
| `STUDY_8H` | DAY_PASS | 99 000 | 480 | 1 / 1 | §17, §18.2 range 99–120k |
| `EXT_1H` | EXTENSION | 20 000 | 60 | 0 / 0 | §10 `[Extend 1 Hour]` |
| `EXT_2H` | EXTENSION | 30 000 | 120 | 0 / 0 | §10 — explicitly "+30,000 VND", i.e. cheaper than 2× hourly |
| `MEMBER_30H` | MEMBERSHIP | 350 000 | — | — | §18.3 — 1800 minutes, 30 days |

All plans seed with `booth_type = NULL` (any). **Group-room pricing is not in the business plan** — §24 sizes the tables but never prices them. A parallel `GROUP_*` set with `booth_type = GROUP` is the intended shape; prices need the owner.

Menu seed: self-service **Water / Tea / Instant coffee** at price 0 with `is_self_service = true` (listed, never billable — they are inside the hourly rate, §17); paid **Latte 25k, Matcha 30k, Sandwich 30k, Snack**; add-ons **Printing 1 000/page, Locker 10 000/day** (§17).

Cross-field validation on `pricing_plans`: HOURLY ⇒ `duration_minutes = 60`; COMBO/DAY_PASS/EXTENSION/OVERNIGHT ⇒ `duration_minutes` required, `total_minutes`/`validity_days` forbidden; MEMBERSHIP ⇒ `total_minutes` + `validity_days` required, duration/inclusions forbidden; OVERNIGHT ⇒ time window required; EXTENSION ⇒ inclusions forbidden.

### Base entities — two, not one

| Base | Columns | Applied to |
| :--- | :--- | :--- |
| `TimestampedEntity` | `created_at`, `updated_at` | booth_sessions, invoices, order_items, booth_requests, bookings, customer_warnings, memberships, session_extensions |
| `SoftDeletableEntity extends Timestamped` | + `deleted_at` | users, branches, areas, booths, categories, menu_items, pricing_plans, roles, permissions |
| neither | — | user_roles, role_permissions, **payments**, membership_usages, notifications, invoice_counters, branch_capacity_snapshots |

**Never soft-delete financial rows.** A voided invoice is `CANCELLED`; a wrong payment is a `REFUND` row. A `deleted_at` on `invoices` or `payments` guarantees someone eventually "deletes" revenue and a report silently changes. Catalog rows must be soft-deletable because transactional rows FK them with `RESTRICT`.

### Indexes & constraints — the highest-value lines in this plan

These make double-occupancy structurally impossible regardless of any service bug or race:

```sql
CREATE UNIQUE INDEX uq_active_session_per_booth
  ON booth_sessions (booth_id) WHERE status = 'checked_in';

CREATE UNIQUE INDEX uq_active_session_per_user
  ON booth_sessions (user_id) WHERE status = 'checked_in' AND user_id IS NOT NULL;

CREATE UNIQUE INDEX uq_active_access_code
  ON booth_sessions (branch_id, access_code) WHERE status = 'checked_in';

CREATE UNIQUE INDEX uq_session_public_token ON booth_sessions (public_token);

CREATE UNIQUE INDEX uq_session_booking
  ON booth_sessions (booking_id) WHERE booking_id IS NOT NULL;
```

> **On the nullable `user_id` and `booking_id`**: Postgres UNIQUE treats NULLs as distinct, so unlimited anonymous and walk-in sessions coexist — correctness is unaffected. The `IS NOT NULL` clauses are for *intent and size* (anonymous sessions will be the majority of rows). **Do not write `NULLS NOT DISTINCT`** — the default `NULLS DISTINCT` is the behaviour we depend on. In the entity, drop `unique: true` from the column and declare a class-level `@Index()` with the `where` clause so TypeORM doesn't regenerate the plain constraint.

Booking overlap protection ships with the bookings phase, not MVP:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (booth_id WITH =, tstzrange(start_time, end_time, '[)') WITH &&)
  WHERE (status IN ('pending','confirmed'));
```

Hot-path indexes, each tied to a screen:

| Index | Screen it serves |
| :--- | :--- |
| `booths (branch_id, type, status) WHERE is_active` | the door availability board (§5) — polled constantly |
| `booth_sessions (branch_id, status) WHERE status = 'checked_in'` | the staff session board |
| `booth_sessions (expected_end_time) WHERE status = 'checked_in'` | the 30- and 10-minute reminder crons |
| `booth_sessions (branch_id, business_date)` | every daily report |
| `booths (status, status_changed_at) WHERE status = 'cleaning'` | the cleaning sweeper |
| `payments (branch_id, business_date)` · `payments (invoice_id)` | drawer reconciliation, invoice detail |
| `invoices (branch_id, business_date, type)` | the revenue split (§29) |
| `order_items (invoice_id)` · `order_items (branch_id, status) WHERE status IN ('pending','preparing')` | receipt, bar queue |
| `booth_requests (branch_id, status, requested_at)` | the staff request queue |
| partial uniques on `users (lower(email))` and `users (phone)` | counter lookup by phone |

Sanity checks: non-negative money on every `_vnd` column, `paid_amount_vnd <= total_amount_vnd` unless REFUNDED, `quantity > 0`, `check_out_time >= check_in_time`, `expected_end_time > check_in_time`, `remaining_minutes BETWEEN 0 AND total_minutes`, `guest_count <= booth.capacity` (enforced in service; booth capacity isn't visible to a table CHECK).

---

## Business flows

### (a) Availability — the most-used endpoint in the system

§5 says the first question is not "what coffee do you have" but **"còn chỗ không?"**. There is a screen at the door showing it.

`GET /branches/:id/availability` — **public, no auth**, one grouped query, 5-second cache:

```jsonc
{
  "branchId": 1,
  "byType": [
    { "type": "SINGLE", "total": 20, "available": 12, "occupied": 6, "cleaning": 1, "maintenance": 1 },
    { "type": "DOUBLE", "total": 6,  "available": 3,  "occupied": 3, "cleaning": 0, "maintenance": 0 },
    { "type": "GROUP",  "total": 2,  "available": 1,  "occupied": 1, "cleaning": 0, "maintenance": 0 }
  ],
  "occupancyPercent": 63
}
```

Note `cleaning` is surfaced separately and **excluded from `available`** — a booth being wiped down is not sellable, and hiding that from the board is how you oversell the room. Instantaneous occupancy here is `occupied / active` and is a *different number* from the booth-hour occupancy KPI in §21; both are needed, and the API names them differently (`occupancyPercent` vs `boothHourOccupancy`) so nobody conflates them in a report.

### (b) The POS sale — check-in, one call, 30–60 seconds

This is the core flow of the whole system (§6, §41). **One endpoint, one transaction**: `POST /pos/sessions`.

```ts
{
  branchId, pricingPlanCode, units: 1,
  boothId?            // explicit pick, OR:
  boothType?,         // auto-assign the next free booth of this type
  guestCount?,
  customer?: { phone?, name? },   // OPTIONAL — omit entirely for a true anonymous walk-in
  membershipId?,
  bookingId?,                     // secondary flow: converting a reservation
  payments: [{ method: 'CASH', amountVnd: 55000 }]
}
```

Inside one transaction:

1. **Claim a booth** — explicit `boothId` locked `FOR UPDATE` and asserted AVAILABLE, or `claimNextAvailable(branchId, type)` with `FOR UPDATE SKIP LOCKED`.
2. **Validate the plan** — active, available *now* (its time window), `booth_type` matches, `guest_count ≤ booth.capacity`.
3. **Resolve the customer, optionally** — find-or-create by phone. Never required. No phone ⇒ `user_id = NULL` and the session is anonymous.
4. **Compute the clock** — `planned_minutes = duration × units`, `expected_end_time`, checked against branch closing time.
5. **Insert the session** — `access_code`, `public_token`, price snapshots, `business_date`.
6. **Insert the invoice** — type SESSION, `session_amount_vnd`, `total_amount_vnd`; take `invoice_number` from `invoice_counters`.
7. **Insert the payment row(s)** — or, for a member, debit the card (`membership_usages` row) and record a `MEMBERSHIP` payment.
8. **Assert `Σ payments = total`** — prepay must fully cover the plan, or `PAYMENT_DOES_NOT_COVER_PLAN`. This is the single rule that makes the model prepaid.
9. **Flip the booth** AVAILABLE → OCCUPIED with a guarded UPDATE; 0 rows affected ⇒ lost the race ⇒ roll back with `BOOTH_ALREADY_OCCUPIED`.

Response is everything the counter needs to print and hand over: booth code, access code, QR URL `{PUBLIC_BASE_URL}/s/{public_token}`, start and end time, receipt payload.

Unique-index violations map to friendly errors: `uq_active_session_per_booth` → `BOOTH_ALREADY_OCCUPIED`, `uq_active_session_per_user` → `USER_ALREADY_HAS_ACTIVE_SESSION`. **The pre-checks are the friendly message; the indexes are the guarantee.**

> **Why not split this into "create session" + "take payment"?** Because a session that exists unpaid is exactly the state this business model says cannot exist, and because two calls at the counter is two chances to walk away mid-flow with a booth locked to nobody.

### (c) The QR mini-app — customer self-service, no account

After payment the customer scans the QR (§11). `GET /s/:token` renders:

```text
STUDY BOOTH  A17
Session: 4 Hours       14:00 ───────── 18:00
2h 35m remaining
[ Extend Session ]  [ Request Help ]  [ My Bill ]
```

`[Extend Session]` and `[Request Help]` both `POST /s/:token/requests` — they create a `booth_requests` row (type EXTENSION or ASSISTANCE) that appears in the staff queue. **No money moves on this surface in MVP**; staff complete the extension at the POS. `[My Bill]` shows the running tab (plan + extensions + F&B − paid).

### (d) Extension — the designed way to handle running over

§10 is explicit that the system should never feel like staff chasing customers out. Two nudges, then a prepaid extension.

`POST /pos/sessions/:id/extend` with `{ extensionPlanCode, payments[] }`. In one transaction: lock the session, assert CHECKED_IN, check the new end time against branch closing time (and, if a booking exists on that booth later, against it), insert `session_extensions`, add `added_minutes` to `extended_minutes` and push `expected_end_time`, add to the invoice's `extension_amount_vnd` and total, insert the payment, assert full coverage.

> **Then clear `reminder_30_sent_at` and `reminder_10_sent_at`.** Easy to miss and it breaks the feature silently: without the reset, a session extended to 20:00 never gets its 19:50 nudge because the flag from 17:50 is still set.

### (e) F&B and add-ons to the booth

Ordering is on the session's existing invoice — no get-or-create, no race, and the running total is queryable at any moment. The invoice exists because step 6 of the POS sale created it.

Validation rejects unavailable items, cross-branch items, and **self-service items** — water, tea and instant coffee are already inside the hourly rate (§17) and must never become a billable line. Complimentary allocation against `included_drinks_used` / `included_snacks_used` is cheapest-first, with the session row locked.

> ⚠ A qty-2 line with one free unit must **split into two rows** (qty 1 @ 0 + qty 1 @ price) — `unit_price` is per-row, not per-unit, and `list_price_vnd` preserves what the freebie was worth.

Each order creates a `booth_requests` row of type ORDER linking its lines. The bar works `GET /orders/queue` → `PATCH /orders/:id/status`; when the last line hits SERVED/CANCELLED the request auto-resolves **in the same transaction**. F&B may be paid on the spot (a payment row) or left on the tab for check-out.

### (f) Check-out → CLEANING → AVAILABLE

`POST /pos/sessions/:id/check-out`, one transaction:

1. Lock the session; assert CHECKED_IN.
2. `actual_minutes = ceil(now − check_in_time)`.
3. **Overtime, the exception path only.** If the customer neither extended nor left:
   ```ts
   const raw = Math.max(0, actualMinutes - plannedMinutes - extendedMinutes);
   const overtimeMinutes = raw > BILLING.OVERTIME_GRACE_MINUTES ? raw : 0;
   const blocks = Math.ceil(overtimeMinutes / BILLING.OVERTIME_ROUNDING_MINUTES);
   const overtimeAmountVnd = Math.round(
     (blocks * BILLING.OVERTIME_ROUNDING_MINUTES * overtimeRateVnd) / 60,
   );
   ```
   Grace is a **threshold, not a deductible**: exceed it and you pay from the planned end.
4. Sum billable items; apply any manual discount (audited); recompute `subtotal` and `total`.
5. `balanceDue = total − paid`. Usually **0** — the plan and extensions were prepaid. If not, collect it as payment rows now.
6. Refund unused membership minutes (floor) via a `membership_usages` row, if applicable.
7. Session → CHECKED_OUT with `end_reason`, `check_out_time`, `actual_minutes`.
8. **Booth OCCUPIED → CLEANING**, `status_changed_at = now()` (§41's `CLEAN BOOTH` step).
9. Complete the booking if there is one (NULL for walk-ins).
10. Credit reward points (accrual only) and bump `users.visit_count` / `last_visit_at` / `total_paid_vnd` if the customer is identified.

Then `PATCH /booths/:id/mark-clean` returns it to AVAILABLE, or the cleaning sweeper auto-releases after `branch.cleaning_minutes`. The booth is **not** sellable in between, and the availability board says so.

`incrementRewardPoints` must be atomic, never read-modify-write:
```sql
UPDATE users SET reward_points = reward_points + $2 WHERE id = $1 AND reward_points + $2 >= 0;
-- 0 rows affected ⇒ LOYALTY_INSUFFICIENT_POINTS
```

**Every integer rounding decision**, each one line in the calculator with an inline comment naming the direction:

| Calculation | Rule | Why |
| :--- | :--- | :--- |
| `actual_minutes` | **ceil** | Partial minutes count |
| Overtime block count | **ceil** | Partial blocks charged in full; prevents "2 minutes over = free" |
| Overtime money | **round** | Exact at standard rates; round only guards odd ones |
| Percentage discount | **floor** | Rounds in the customer's favour and guarantees `total ≥ 0` without a second clamp |
| Membership debit | **ceil** | The card pays for time actually held |
| Membership refund of unused | **floor** | Never refund more than was unused |

The calculator is **pure** — no DB, no clock, inputs in, money out — so it is directly table-testable. Loyalty redemption is deliberately absent (§40); when it arrives it is one more discount line, not a restructure.

### (g) Crons

All use `FOR UPDATE SKIP LOCKED` and write their idempotency flag in the same transaction — multi-instance-safe with no lock table.

| Cron | Interval | Does |
| :--- | :--- | :--- |
| 30-minute reminder | 1 min | notify customer + staff, set `reminder_30_sent_at` (§10) |
| 10-minute reminder | 1 min | notify with the extend/checkout prompt, set `reminder_10_sent_at` (§10) |
| Cleaning sweeper | 2 min | CLEANING → AVAILABLE after `branch.cleaning_minutes` |
| Closing auto-close | 10 min | force check-out sessions past branch `closes_at`, `end_reason = AUTO_CLOSE` |
| Capacity snapshot | nightly | write `branch_capacity_snapshots` for the closed business day |
| Membership expiry | nightly | ACTIVE → EXPIRED past `valid_to` |
| No-show sweeper | 5 min | *bookings phase only* — CONFIRMED → NO_SHOW past grace |
| Away timeout | 5 min | *phase 2* — TEMPORARILY_AWAY → AVAILABLE past `away_until` (§9) |

Staff surface is `GET /booth-sessions/expiring` polled every 30s; no WebSocket in v1. Future IoT (§27, explicitly a later phase) drops into three already-explicit hook points: check-in ⇒ UNLOCK, reminder ⇒ BLINK, check-out ⇒ LOCK + POWER_OFF.

### (h) Booking — the secondary flow

§19: booking exists for *"ngày mai tôi muốn chắc chắn có booth lúc 19:00"* and nothing more. It is **not** in the MVP.

Create booking → optional deposit → the `bookings_no_overlap` exclusion constraint is the guarantee (catch Postgres `23P01` → `BOOTH_ALREADY_BOOKED_FOR_PERIOD`). At arrival the customer is checked in through **the same `POST /pos/sessions` endpoint** with `bookingId` set — there is no separate booking check-in path, which is what keeps the counter flow single. Booth status is untouched by a booking: a future reservation is not a present physical state. The `RESERVED` booth status exists in the enum for a near-term hold (a booth held for a booking starting in 15 minutes) and is not used before then.

Free cancel ≥ 60 min before start; later cancels allowed but flagged `lateCancellation`; never after `start_time`, never once a session exists. The no-show cron flips CONFIRMED → NO_SHOW at `start + grace`; the booth was never OCCUPIED so there is nothing to release. **No-show ≠ customer cancellation** — collapsing them destroys the KPI.

### (i) Temporarily away — phase 2 (§9)

`POST /booth-sessions/:id/away` sets booth → TEMPORARILY_AWAY and `away_until = now + TEMPORARY_AWAY_MAX_MINUTES` (30–60, §36). Return restores OCCUPIED. Timeout releases the booth and closes the session with `end_reason = NO_RETURN`. Explicitly out of MVP — the business plan says so.

### (j) Warnings — phase 2 (§37.2)

`WARNED → WARNED → MOVED_ZONE → ASKED_TO_LEAVE`. Attached to the **session** (most offenders are anonymous), and to the user when one is identified. Two active yellows plus a third offence escalates to red; warnings auto-expire after 90 days. A red card *permits* a force-checkout, never triggers one implicitly.

---

## State machines

**BoothSession**: → CHECKED_IN (POS sale) · CHECKED_IN → CHECKED_OUT (normal / auto-close / forced / no-return) · CHECKED_IN → CANCELLED (mis-created, zero order items, within 10 minutes — refund the prepayment in full).
*Illegal*: `CHECKED_OUT→CHECKED_IN`, `CANCELLED→*`, `CHECKED_OUT→CANCELLED` (refund instead), extending or ordering when not CHECKED_IN.

**Booth**: AVAILABLE → OCCUPIED (POS sale) · OCCUPIED → **CLEANING** (check-out) · CLEANING → AVAILABLE (staff or sweeper) · AVAILABLE ↔ MAINTENANCE (staff) · CLEANING → MAINTENANCE (something broke) · *phase 2*: OCCUPIED ↔ TEMPORARILY_AWAY, AVAILABLE ↔ RESERVED.
*Illegal*: `OCCUPIED→MAINTENANCE` directly (`BOOTH_HAS_ACTIVE_SESSION`), `MAINTENANCE→OCCUPIED`, `CLEANING→OCCUPIED`, any manual `*→OCCUPIED`. `AVAILABLE→AVAILABLE` is accepted idempotently.

**Invoice**: → PENDING (created in the POS transaction) · PENDING → PARTIALLY_PAID → PAID as payment rows land · PENDING/PARTIALLY_PAID → CANCELLED · PAID → REFUNDED.
*Illegal*: `PAID→PENDING`, `PAID→CANCELLED`, `CANCELLED→*`, `REFUNDED→*`, discounting anything already PAID. Status is **derived from `paid_amount_vnd` vs `total_amount_vnd`** and recomputed in the same transaction as every payment row — never set by hand.

**Payment**: no state machine. Rows are immutable; a correction is a new REFUND row.

**BoothRequest**: → PENDING · PENDING → IN_PROGRESS (claim) · PENDING/IN_PROGRESS → RESOLVED · → CANCELLED.
*Illegal*: `RESOLVED→*`, `CANCELLED→*`, `IN_PROGRESS→PENDING`, resolving an ORDER with unserved lines.

**Membership**: → ACTIVE · ACTIVE → EXHAUSTED (balance 0) / EXPIRED (cron) / CANCELLED (refund).
*Illegal*: debiting a non-ACTIVE card, `EXPIRED→ACTIVE`, refunding an exhausted or expired card.

**Booking** *(secondary)*: → PENDING (deposit) or CONFIRMED · PENDING → CONFIRMED · PENDING/CONFIRMED → CANCELLED · CONFIRMED → NO_SHOW (cron) · CONFIRMED → COMPLETED (check-out).
*Illegal*: `CANCELLED→*`, `COMPLETED→*`, `NO_SHOW→CONFIRMED`, cancelling once a session exists.

Every illegal transition gets a named error constant.

---

## Module & endpoint catalog

MVP modules are marked ●, post-MVP ○.

| Module | Endpoints | Permissions |
| :--- | :--- | :--- |
| ● **pos** *(new)* | `GET /pos/availability` · `POST /pos/sessions` (sell + check in) · `POST /pos/sessions/:id/extend` · `POST /pos/sessions/:id/check-out` · `POST /pos/retail` (walk-up sale) · `GET /pos/lookup?phone=` · `GET /pos/session-by-code/:code` | `pos.sell`, `pos.extend`, `pos.checkout`, `pos.refund`, `pos.discount`, `pos.discount.unlimited` |
| ● **booth-sessions** | `GET /booth-sessions` `/active` `/expiring` `/:id` · `POST /:id/cancel` `/:id/force-check-out` `/:id/transfer` · **public**: `GET /s/:token` `/s/:token/menu` · `POST /s/:token/requests` | `session.read/.any`, `.cancel`, `.checkout.force`, `.transfer`; the `/s/:token` surface is token-scoped, not RBAC |
| ● **booths** | `POST/GET /booths` · `GET /booths/board` · `GET/PATCH/DELETE /booths/:id` · `PATCH /:id/status` `/:id/mark-clean` | `booth.create/read/update/delete/change_status`, `booth.clean` |
| ● **branches** | `POST/GET /branches` · `GET/PATCH/DELETE /:id` · **`GET /:id/availability` (public)** | `branch.*`; availability public |
| ● **areas** | `POST/GET /branches/:branchId/areas` · `GET/PATCH/DELETE /areas/:id` | `area.*` |
| ● **pricing-plans** | `POST/GET /pricing-plans` · `GET /available` (public) · `GET/PATCH/DELETE /:id` · `PATCH /:id/activate\|deactivate` | `pricing_plan.*` |
| ● **menu-items** / **categories** | `POST/GET /menu-items` · `GET/PATCH/DELETE /:id` · `PATCH /:id/availability` · `POST/GET /categories` · `GET/PATCH/DELETE /:id` | `menu_item.*`, `category.*`; reads public |
| ● **invoices** | `GET /invoices` `/:id` `/:id/receipt` · `POST /:id/discount` `/:id/cancel` | `invoice.read/.any`, `.discount`, `.cancel` |
| ● **payments** *(new)* | `POST /invoices/:id/payments` · `GET /invoices/:id/payments` · `POST /payments/:id/refund` · `GET /payments/daily-summary` (drawer reconciliation) | `payment.create`, `.read/.any`, `.refund` |
| ● **order-items** | `POST /booth-sessions/:sessionId/orders` · `GET /orders/queue` · `PATCH /orders/:id/status` · `DELETE /orders/:id` · `POST/GET /invoices/:invoiceId/items` | `order.create/.any`, `.read/.any`, `.update_status`, `.cancel` |
| ● **booth-requests** | `POST /booth-requests` · `GET /booth-requests` `/:id` · `PATCH /:id/claim\|resolve\|cancel` | `booth_request.create`, `.read/.any`, `.handle`, `.cancel/.any` |
| ● **users** | `GET /users` · `GET /lookup?phone=` · `POST /walk-in` · `GET/PATCH /users/me` · `GET/PATCH /:id` · `PATCH /:id/status` | `user.read/.any`, `.create.any`, `.change_status` |
| ● **auth** | `POST /auth/login\|refresh\|logout` · `GET /auth/me` · `POST /auth/register` | public except `/me` |
| ● **reports** (core) | `/reports/dashboard` · `/revenue/daily` · `/occupancy` · `/occupancy-by-hour` | `report.*` |
| ● **roles / permissions / user-roles** | `POST/GET /roles` · `GET/PATCH/DELETE /:id` · `PUT /:id/permissions` · `GET /permissions` `/permissions/modules` · `POST/GET /users/:id/roles` · `DELETE /users/:userId/roles/:roleId` | `role.*`, `permission.read`, `user_role.*` |
| ○ **memberships** | `POST/GET /memberships` · `GET /me` `/:id` `/:id/usages` · `POST /:id/cancel` · `POST /memberships/:id/self-check-in` | `membership.create`, `.read/.any`, `.cancel` |
| ○ **bookings** | `POST /bookings` `/bookings/staff` · `GET /bookings` `/me` `/:id` `/:id/quote` · `PATCH /:id` · `POST /:id/confirm\|cancel\|no-show` | `booking.create/.any`, `.read/.any`, `.confirm`, `.cancel/.any`, `.mark_no_show` |
| ○ **notifications** | `GET /notifications/me` `/staff` · `PATCH /:id/read` `/read-all` | authenticated; `notification.read.any` |
| ○ **customer-warnings** | `POST/GET /customer-warnings` · `GET /users/:id/warnings` · `PATCH /:id/revoke` | `warning.create`, `.read.any`, `.revoke` |
| ○ **reports** (full) | `/revenue/by-payment-method` `/revenue/by-category` `/booth-utilization` `/peak-hours` `/menu-performance` `/customers` `/pricing-plan-mix` `/seasonality` `/service-quality` `/extensions` | `report.*` |

`role-permissions` has no controller of its own — it folds into `PUT /roles/:id/permissions` as a transactional full replace. **`session-extensions` has no controller either** — it is written only by `POST /pos/sessions/:id/extend` and read as part of the receipt.

---

## Metrics — what the owner actually watches

§29, §30 and §38 replace "today's revenue" with operational metrics. **Reports** is a module with no entity: one repository of hand-written aggregates with hard branch-scoping.

### The dashboard (§29)

```text
TODAY        Revenue 8.2M · Customers 127 · Active Sessions 32 · Occupancy 68%
BOOTHS       Available 8 · Occupied 32 · Cleaning 2 · Maintenance 1
REVENUE      Study Plans 6.5M · F&B 1.3M · Other 0.4M
```

One query per block, all keyed on `business_date` — which is why that column exists.

### Core KPIs (§38)

| KPI | Formula | Source |
| :--- | :--- | :--- |
| **Occupancy** | paid booth-hours ÷ available booth-hours | `Σ booth_sessions.actual_minutes` ÷ `branch_capacity_snapshots.available_booth_minutes` |
| **RevPABH** | study revenue ÷ **available** booth-hours | the number that says whether the room is sized right |
| **RevPOBH** | study revenue ÷ **paid** booth-hours | the number that says whether the price is right |
| Avg session duration | `Σ actual_minutes ÷ count(sessions)` | §39 q3 — the direct input to pricing and capacity |
| Avg revenue per customer | total revenue ÷ distinct customers | anonymous sessions count as one customer each |
| Repeat rate | returning ÷ total **identified** customers | denominator is phone-identified only — see Risks |
| Membership conversion | members ÷ active customers | §39 q8 |
| Occupancy by hour | concurrent sessions per hour bucket | §30's histogram |

> **Occupancy by hour counts *concurrent* sessions**, not check-ins: `tstzrange(check_in_time, coalesce(check_out_time, expected_end_time)) && hour_range`. Check-in counts tell you when people arrive; concurrency tells you whether to add staff, which is the decision §30 is actually about.

> **Revenue has two sources on purpose.** Cash/drawer reconciliation reads `payments` by `received_at` — that is what must match the till. Revenue *by category* (Study Plans / F&B / Other) reads the invoice amount columns by `business_date`. The two agree except for a tab settled across a business-day boundary, and that difference is intentional, documented, and surfaced in the daily report rather than hidden.

Occupancy is driven off a `generate_series` over days so zero-revenue days show as 0% instead of vanishing. No rollup table for v1 (~300 sessions/day/branch is nothing).

Membership revenue is recognised **at purchase**, not as minutes are consumed — cash-basis, which is how a business this size is actually run. `membership_usages.recognised_value_vnd` is populated anyway, so switching to deferred-revenue recognition later is a report change, not a migration.

---

## Implementation sequence

§40 draws the MVP line: **POS + Booth Status + Study Session + QR + Payment**. Phases 0–11 are that line. Nothing below it should delay opening the shop.

### MVP

| # | Phase | Contents | Done when |
| :-- | :--- | :--- | :--- |
| 0 | **Foundation** | Install/remove deps; enable the Swagger CLI plugin; `git add` the `src/modules/**` move; smoke-test a `class-validator` import under ESM; fix [app.module.ts:5](src/app.module.ts#L5); `synchronize: false` | app boots |
| 1 | **Constants & enums** | `src/constants/**` (app, env, route, swagger, pagination, validation, regex, auth, rbac, database, business, billing, cron, messages); extract and extend the enums into `src/common/enums/**` | compiles |
| 2 | **Common layer** | `BaseRepository`, `TransactionRunner`, `@Global() DatabaseModule`, pagination + param DTOs, validation factory, base entities, money/time/**business-day** helpers, `src/config/**` + env validation + corrected `.env.example` | unit-testable |
| 3 | **Schema & migrations** | Bring all 25 entities to the target schema, then generate **one `InitialSchema`** — see below | up/down round-trip on a scratch DB |
| 4 | **GATE** | `pnpm build && pnpm migration:show`, then generate and **hand-inspect** `InitialSchema` before running | CLI proven |

> **The M1→M8 incremental migration sequence this plan previously described is dead weight, and phase 3 above replaces it with a single `InitialSchema`.** That sequence was written as if migrating a populated database. There is no database: `autoLoadEntities` was set but zero `forFeature()` calls existed, so `synchronize` never created a table. On a greenfield schema there is nothing to alter, so `ALTER TABLE ... USING col AT TIME ZONE` has no rows to convert and the ordering between the eight steps carries no information. One migration generated from the final entities is smaller, reviewable in a single diff, and reversible in one step.
>
> Two things still cannot come from `migration:generate` and must be **hand-written into that migration**, because TypeORM has no decorator for either:
> - `CREATE EXTENSION btree_gist` + the `bookings_no_overlap` GiST exclusion constraint (bookings phase).
> - The functional partial uniques `users (lower(email))` and `users (phone)` — `@Index` cannot express `lower(...)`.
>
> Everything else — including all five partial unique indexes on `booth_sessions` — is already in the entity metadata and generates on its own (verified).
| 5 | **Auth & RBAC** | Decorators, `AuthModule` (password/token/permission-registry services, `RefreshToken`), both `APP_GUARD`s, `SessionTokenGuard`, seeds | one guarded route + one token-scoped route work |
| 6 | **Reference data** | branches → areas (zones) → booths → categories → menu-items → pricing-plans. **Booths is the reference implementation** of the 3-layer slice | an owner sets up a branch end-to-end |
| 7 | **Availability board** | `GET /branches/:id/availability` + `GET /booths/board` (flow a) | the door screen works and is fast |
| 8 | **POS sale** | `PosModule`; `POST /pos/sessions` with prepay, auto-assign, invoice, `payments`, QR (flow b). **Billing calculator unit-tested first** | a cashier sells a 4-hour session in under 60 seconds |
| 9 | **Session lifecycle** | QR mini-app (flow c) → extend (d) → check-out → CLEANING → AVAILABLE (f) → staff session board → the two reminders + cleaning sweeper + closing auto-close (g) | full §41 loop; reminders fire exactly once each |
| 10 | **F&B to the booth** | order-items (e) → bar queue → booth-requests → complimentary inclusions → tab settlement at check-out | bar works a queue; cash drawer reconciles |
| 11 | **Core reports** | dashboard (§29) → daily revenue → occupancy + capacity snapshot cron → occupancy by hour (§30) | KPIs match the business plan's definitions |

### Post-MVP

| # | Phase | Contents |
| :-- | :--- | :--- |
| 12 | **Memberships** | purchase → minute ledger → member self-check-in (§19 type 2) → expiry cron |
| 13 | **Booking** *(secondary)* | bookings + exclusion constraint + quote + deposit + no-show cron + `RESERVED` holds (flow h) |
| 14 | **Oversight** | notifications → customer-warnings + escalation (j) → temporarily-away (i) → force-checkout/transfer |
| 15 | **Full reports** | revenue by payment method and category → booth utilization → menu performance → customers/repeat/segment mix → seasonality → service quality → extension revenue |
| 16 | **Growth features** | loyalty redemption · time-based/peak pricing (§30) · locker & printing metering · first-visit voucher automation |

**Deferred indefinitely** (§40 says so explicitly): mobile app, AI, IoT auto power-cut and electronic locks, advanced booking, a full loyalty ledger, promotions/voucher engine, VAT / hóa đơn điện tử, per-branch menu pricing, SSE/WebSocket push.

---

## Verification

**Per-step**: `pnpm build` after every step — under `nodenext`, `tsc` catches missing `.js` import extensions, the most common error mode in this codebase. Then `pnpm lint`.

**Database (the phase-4 gate):**
```bash
docker compose down -v && docker compose up -d      # guarantee an empty DB
pnpm build && pnpm migration:show                   # proves the CLI can load the data source
pnpm migration:generate src/database/migrations/InitialSchema
# hand-inspect the generated SQL before running — see Risks
pnpm migration:run && pnpm db:seed
```

**End-to-end smoke test of the counter flow** — the one path to verify manually before anything else, because it is the business:

1. `POST /api/v1/auth/login` as the seeded admin → access token.
2. Create branch → area (SILENT) → booths (SINGLE ×3, DOUBLE, GROUP) → pricing plans → menu items.
3. `GET /branches/1/availability` → assert the per-type counts and that `cleaning` is excluded from `available`.
4. `POST /pos/sessions` with `boothType: SINGLE`, `STUDY_4H`, cash 55 000, **no customer object at all** → assert a session exists with `user_id IS NULL`, the invoice is PAID, the payment row exists, and the booth is OCCUPIED.
5. Assert a **second** POS sale on the same booth fails (proves `uq_active_session_per_booth`), and that auto-assign hands out a *different* booth under concurrency.
6. `GET /s/{public_token}` unauthenticated → assert the session view returns; assert it 404s for a checked-out session and for a wrong token.
7. Order two menu items, one covered by the combo inclusion → assert the free unit splits into its own row at `unit_price_vnd = 0` with `list_price_vnd` preserved; assert ordering a **self-service** item is rejected.
8. `POST /pos/sessions/:id/extend` with `EXT_2H` + 30 000 → assert `expected_end_time` moved, `extension_amount_vnd` grew, a payment row landed, and **both reminder flags reset to NULL**.
9. `POST /pos/sessions/:id/check-out` → assert `balance_due` covers only the F&B, the total is exact in whole đồng, the session is CHECKED_OUT, and **the booth is CLEANING, not AVAILABLE**.
10. `PATCH /booths/:id/mark-clean` → AVAILABLE; assert the availability board reflects each transition.

**Automated tests** (Vitest — decorator metadata already works, no extra plugin):

- Table-driven unit tests for the billing calculator: exact-time checkout, within grace, one minute past grace, rounding boundaries, extension then checkout, discount exceeding subtotal, zero-item invoice.
- Payment ledger invariants: `paid_amount_vnd` always equals `Σ payments(IN) − Σ payments(REFUND)`; status derivation from paid vs total; prepay coverage assertion rejects an underpaid POS sale.
- Concurrency: two simultaneous POS sales targeting the same explicit booth (one must fail); N simultaneous auto-assigns must return N distinct booths and never over-allocate.
- `SessionTokenGuard`: valid token, checked-out session, unknown token, and that the token surface cannot reach another session's data.
- `PermissionsGuard` branch scoping: global role, matching branch, mismatched branch, missing branch param.
- Cron idempotency with fake timers: each reminder fires exactly once per session, and again after an extension resets the flags.
- E2E for the auth flow and the full counter loop. Fix the existing [app.e2e-spec.ts](test/app.e2e-spec.ts), which currently fails on the stale import.

---

## Risks

1. **TypeORM CLI under ESM** — verified by reading TypeORM's `importOrRequireFile` (it walks to the nearest `package.json`, sees `"type": "module"`, and uses dynamic `import()`), but **not executed**. Phase 4 is the gate; `@swc-node/register` is the fallback (it supports decorators *and* `emitDecoratorMetadata`, unlike tsx).
2. **TypeORM 1.1.1 is very new** and ships no changelog or migration guide. The `.d.ts` surface is compatible with 0.3.x, but the **schema generator's** output for PG enums, partial indexes and composite PKs is unverified — **hand-inspect the generated `InitialSchema`**, especially the `user_roles` / `role_permissions` composite PKs, the enum types, and every `WHERE`-clause index.
3. **The `timestamptz` migration must carry `USING col AT TIME ZONE 'Asia/Ho_Chi_Minh'`.** Without it Postgres reinterprets values as UTC and shifts everything 7 hours. Harmless on an empty DB, catastrophic if run later against real data.
4. **Anonymity breaks some KPIs, by design.** Repeat rate, ARPC and membership conversion can only be computed over *identified* customers. The denominator must be labelled as such in every report, or the owner will read a repeat rate of 8% and conclude the business has no loyal customers when in fact 80% of sessions were anonymous. Mitigation is operational, not technical: the POS prompts for a phone number, it stays optional, and the dashboard shows the identification rate next to every customer metric.
5. **`paid_amount_vnd` is denormalised** from the `payments` ledger. It is maintained inside the same transaction as every payment row, but a reconciliation query (`SELECT invoices WHERE paid_amount_vnd <> (SELECT …)`) belongs in the test suite and in a nightly check.
6. **Prepay assumes no payment gateway.** Every payment row is recorded by a staff member who saw cash or a transfer confirmation. There is no automatic settlement and no webhook. `reference` exists so a bank transfer can be matched by hand. Online payment for the QR `[Extend Session]` button is the first thing that changes when a gateway arrives.
7. **`class-validator` 0.15 / `class-transformer` 0.5 are CJS with no `exports` map.** Named imports should work via Node's CJS named-export detection; if `SyntaxError: Named export 'IsString' not found` appears, the fix is a default-import destructure. Smoke-test one DTO immediately (phase 0).
8. **`user_roles` composite PK is `(user_id, role_id)`** with `branch_id` outside it, so one person cannot be `cashier` at two branches — a real constraint for a chain with floating staff. If that matters, `branch_id` must join the PK: cheap now, expensive later.
9. **`useDefineForClassFields`** defaults to `true` at `target: ES2023`. Benign for these entities, but if entity fields turn up mysteriously `undefined`, or a `PartialType` subclass clobbers an inherited value, set it to `false`.

### Assumptions worth confirming before or during build

Inferred from the business plan, not stated in it. Each is cheap to change now:

- **Prepay is total, not partial.** The POS sale rejects a payment that doesn't cover the plan in full. A deposit-style partial prepay would be a one-line relaxation.
- **Overtime is the exception, not a product.** Grace is a *threshold*, not a deductible; billed in 15-minute blocks rounded up at the plan's `overtime_rate_vnd`. Most customers should extend instead, which is cheaper for them and better for the shop.
- **No refund for leaving early** — the plan is prepaid. §18 implies this but never says it.
- **Cleaning is 5 minutes and auto-releases.** The business plan mandates a CLEAN BOOTH step (§41) but gives no duration. Per-branch `cleaning_minutes`, default 5, auto-release by cron so a forgotten booth doesn't sit unsellable.
- **Group-room pricing is unspecified** (§24 sizes the tables, §17–18 never price them). Modelled as plans with `booth_type = GROUP`; the owner must set prices before opening.
- **Double booths are a booth type, not two seats.** One session, `capacity = 2`, one payer. Per-seat billing for a double would be a different model.
- **Night/overnight (22:00–06:00) is not seeded.** §35 flags it as needing validation on demand, security, PCCC, staffing and local regulation. The schema supports it via `plan_type = OVERNIGHT` + a time window; add the product when the answer is yes.
- **The 30% first-visit voucher** (§35) is verified by staff against `users.first_visit_at IS NULL`, not by a voucher code; exam-season discounts are manual counter discounts with a reason. A code-based voucher needs the deferred promotions module.
- **Booth access** is a printed card / QR validated by staff — no electronic lock in v1 (§27 defers IoT explicitly).
- **Staff accounts are `users` rows** with a scoped `user_roles` entry — the same table as customers.
- **VAT / hóa đơn điện tử is not modelled.**
