'use strict';

const workbenchSamples = {
  "ts": {
    "workspace": {
      "id": "ts",
      "prefix": "TS",
      "name": "TrimSteer"
    },
    "workspaces": [
      {
        "id": "ts",
        "prefix": "TS",
        "name": "TrimSteer"
      },
      {
        "id": "ks",
        "prefix": "KS",
        "name": "KeelSteer"
      }
    ],
    "delivery": {
      "reports": [
        {
          "id": 5,
          "source": "delivery",
          "name": "2026-11-13-活动回顾示例-v1.md",
          "size": 87,
          "mtime": 1794554014576695900,
          "digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
          "available": 1,
          "artifact_kind": "delivery_report",
          "branch_count": 2
        }
      ],
      "branches": [
        {
          "task_id": "TS-DEF00291",
          "artifact_id": 5,
          "branch": "knowledge",
          "accepted_digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
          "observed_digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
          "name": "2026-11-13-活动回顾示例-v1.md",
          "available": 1,
          "digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
          "report_changed": 0
        },
        {
          "task_id": "TS-3B9B1EDB",
          "artifact_id": 5,
          "branch": "html",
          "accepted_digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
          "observed_digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
          "name": "2026-11-13-活动回顾示例-v1.md",
          "available": 1,
          "digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
          "report_changed": 0
        }
      ]
    },
    "delivery_execution": {
      "runs": [],
      "worker_error": "",
      "ready": true,
      "connection": "演示模式 · 使用示例回报"
    },
    "collection_automation": {
      "enabled": false,
      "supported": true,
      "agent": "知识库维护 Agent",
      "profile": "演示资料",
      "schedule": "12:00",
      "continuous_intake": true,
      "protected_count": 0,
      "scheduled_at": "2026-11-13T12:00:00+08:00",
      "summary_dir": "示例归档",
      "local_ready": true,
      "ready": true,
      "connection": "演示模式 · 仅处理样例",
      "observed_at": "",
      "worker_error": "",
      "last_day": "",
      "runs": [],
      "intake": {
        "observed_at": "",
        "monitor_error": "",
        "stabilizing": 0,
        "queued_tasks": 0,
        "waiting_reason": ""
      },
      "removed_count": 0,
      "removed_runs": [],
      "preview": [
        {
          "task_id": "TS-87D6DBB3",
          "title": "手作市集 · 公开活动资料",
          "revision": 1,
          "files": [
            {
              "id": 1,
              "source": "intelligence",
              "name": "TS-2026-11-13-采集报告-DEMO0001.md",
              "digest": "abd8093aa95d794d1cff4805480fd4d96b8d6a889e2a545a214785c0b7dc83b7",
              "available": 1
            }
          ]
        }
      ],
      "skipped": []
    },
    "knowledge_audits": {
      "root": "演示资料",
      "role_dir": "演示资料",
      "runs": [],
      "ready": false,
      "connection": "演示模式 · 仅登记样例回报"
    },
    "trash_tasks": [],
    "release": "3.1.42",
    "flow_rules": {
      "tests": "测试卡在示例列表中流转，可查看资料、记录回报和确认闭环。"
    },
    "batches": [],
    "relations": [
      {
        "from_task": "TS-DEF00291",
        "to_task": "TS-3B9B1EDB",
        "relation": "related",
        "created_at": "2026-11-13T07:13:34+00:00"
      }
    ],
    "discussions": [
      {
        "task_id": "TS-6395A9A9",
        "mode": "communication",
        "category": "product",
        "first_speaker": "wb",
        "max_rounds": 1,
        "participants": [
          "pi",
          "wb"
        ],
        "turn_model": "single_action",
        "action_index": 1,
        "pending_handoff": null,
        "audit_notice": null
      }
    ],
    "references": [],
    "results": [],
    "sync_health": [
      {
        "source": "intelligence",
        "observed_at": "2026-11-13T07:13:34+00:00",
        "content_checked_at": "2026-11-13T07:13:34+00:00",
        "indexed": 1,
        "skipped": 0,
        "error": ""
      },
      {
        "source": "pending_tests",
        "observed_at": "2026-11-13T07:13:34+00:00",
        "content_checked_at": "2026-11-13T07:13:34+00:00",
        "indexed": 2,
        "skipped": 0,
        "error": ""
      },
      {
        "source": "delivery",
        "observed_at": "2026-11-13T07:13:34+00:00",
        "content_checked_at": "2026-11-13T07:13:34+00:00",
        "indexed": 1,
        "skipped": 0,
        "error": ""
      }
    ],
    "archive_health": [],
    "source_candidates": [],
    "pending_operations": [],
    "backup": {
      "count": 0,
      "latest": null,
      "error": "",
      "latest_at": null
    },
    "monitor": {},
    "roles": [
      {
        "id": "chen",
        "name": "陈震",
        "short": "陈",
        "codename": "总调度",
        "responsibility": "项目负责人 · 决策与调度"
      },
      {
        "id": "pi",
        "name": "知识库维护 Agent",
        "short": "知",
        "codename": "知识维护",
        "responsibility": "研究与知识库唯一维护者 · 沉淀、返推"
      },
      {
        "id": "wb",
        "name": "Workbuddy-交付专家",
        "short": "WB",
        "codename": "客户交付",
        "responsibility": "客户诊断交付官 · 账单与报告"
      },
      {
        "id": "collector",
        "name": "情报采集 Agent",
        "short": "采",
        "codename": "情报采集",
        "responsibility": "采集情报 · 提交 Markdown 报告"
      },
      {
        "id": "tester",
        "name": "测试 Agent",
        "short": "测",
        "codename": "实验执行",
        "responsibility": "执行 知识库维护 Agent 测试清单 · 回传报告"
      },
      {
        "id": "codex",
        "name": "Codex-协同工作台维护",
        "short": "CX",
        "codename": "平台工务",
        "responsibility": "产品化与协同平台维护"
      },
      {
        "id": "knowledge_auditor",
        "name": "Codex-知识库审计",
        "short": "审",
        "codename": "审计官",
        "responsibility": "独立只读审计 TS 知识库 · 提交证据与建议"
      }
    ],
    "tasks": [
      {
        "id": "TS-6395A9A9",
        "kind": "discussion",
        "title": "产品沟通 · 手作市集的报名页文案讨论",
        "description": "手作市集的报名页文案讨论",
        "owner": "wb",
        "participants": [
          "pi",
          "wb"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 3,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T10:58:59+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "product",
        "batch_category": "",
        "batch_recipient": "wb",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": true,
        "batch_close_eligible": false
      },
      {
        "id": "TS-1B370F69",
        "kind": "platform",
        "title": "确认第一版活动摘要",
        "description": "手作市集的示例任务。",
        "owner": "chen",
        "participants": [
          "chen"
        ],
        "parent_id": null,
        "status": "done",
        "resume_status": null,
        "revision": 3,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "已确认示例摘要。",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "",
        "batch_recipient": "chen",
        "closure_reopen_group": "platform::chen",
        "closure_reopen_eligible": true,
        "last_closure_event": 14,
        "discussion_type_editable": false,
        "batch_eligible": false,
        "batch_close_eligible": false
      },
      {
        "id": "TS-E0386DD3",
        "kind": "platform",
        "title": "核对活动页的阅读顺序",
        "description": "手作市集的示例任务。",
        "owner": "pi",
        "participants": [
          "pi"
        ],
        "parent_id": null,
        "status": "active",
        "resume_status": null,
        "revision": 2,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "",
        "batch_recipient": "pi",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": false,
        "batch_close_eligible": false
      },
      {
        "id": "TS-78AEAC9B",
        "kind": "platform",
        "title": "整理活动页素材",
        "description": "手作市集的示例任务。",
        "owner": "codex",
        "participants": [
          "codex"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 1,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "",
        "batch_recipient": "codex",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": false,
        "batch_close_eligible": false
      },
      {
        "id": "TS-3B9B1EDB",
        "kind": "delivery",
        "title": "Codex 最终交付 · 2026-11-13-活动回顾示例-v1",
        "description": "手作市集的演示任务。可查看关联的示例资料。",
        "owner": "codex",
        "participants": [
          "codex",
          "wb"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 1,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": {
          "task_id": "TS-3B9B1EDB",
          "artifact_id": 5,
          "branch": "html",
          "accepted_digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
          "observed_digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
          "name": "2026-11-13-活动回顾示例-v1.md",
          "available": 1,
          "digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
          "report_changed": 0
        },
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "",
        "batch_recipient": "codex",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": true,
        "batch_close_eligible": false
      },
      {
        "id": "TS-DEF00291",
        "kind": "delivery",
        "title": "内部反哺 · 2026-11-13-活动回顾示例-v1",
        "description": "手作市集的演示任务。可查看关联的示例资料。",
        "owner": "pi",
        "participants": [
          "pi",
          "wb"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 1,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": {
          "task_id": "TS-DEF00291",
          "artifact_id": 5,
          "branch": "knowledge",
          "accepted_digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
          "observed_digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
          "name": "2026-11-13-活动回顾示例-v1.md",
          "available": 1,
          "digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
          "report_changed": 0
        },
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "",
        "batch_recipient": "pi",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": true,
        "batch_close_eligible": false
      },
      {
        "id": "TS-7D6B5549",
        "kind": "test",
        "title": "报名卡 · 文字复核",
        "description": "手作市集的演示任务。可查看关联的示例资料。",
        "owner": "wb",
        "participants": [
          "pi",
          "wb"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 1,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "test_execution",
        "batch_recipient": "wb",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": true,
        "batch_close_eligible": false
      },
      {
        "id": "TS-A23B6D49",
        "kind": "test",
        "title": "窄屏活动卡 · 显示复核",
        "description": "手作市集的演示任务。可查看关联的示例资料。",
        "owner": "wb",
        "participants": [
          "pi",
          "wb"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 1,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "test_execution",
        "batch_recipient": "wb",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": true,
        "batch_close_eligible": false
      },
      {
        "id": "TS-87D6DBB3",
        "kind": "research",
        "title": "手作市集 · 公开活动资料",
        "description": "手作市集的演示任务。可查看关联的示例资料。",
        "owner": "pi",
        "participants": [
          "collector",
          "pi"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 1,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "collection_processing",
        "batch_recipient": "pi",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": true,
        "batch_close_eligible": true
      }
    ],
    "messages": [],
    "artifacts": [
      {
        "id": 5,
        "source": "delivery",
        "name": "2026-11-13-活动回顾示例-v1.md",
        "size": 87,
        "mtime": 1794554014576695900,
        "digest": "4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
        "available": 1,
        "artifact_kind": "delivery_report",
        "source_kind": "delivery_report"
      },
      {
        "id": 4,
        "source": "pending_tests",
        "name": "TS-给WorkBuddy-演示待测-D02.md",
        "size": 97,
        "mtime": 1794554014564470700,
        "digest": "b8b9ffb857b033ba76ff4e15481675edd85afdd3f98b546eb1eafa0614c8f735",
        "available": 1,
        "artifact_kind": "test_assignment",
        "source_kind": "test_assignment"
      },
      {
        "id": 2,
        "source": "pending_tests",
        "name": "TS-给WorkBuddy-演示待测-D01.md",
        "size": 103,
        "mtime": 1794554014555643600,
        "digest": "8771e4ca58225369e28dfba8c195acb1ad819b87f596754256fc63c23e823337",
        "available": 1,
        "artifact_kind": "test_assignment",
        "source_kind": "test_assignment"
      },
      {
        "id": 1,
        "source": "intelligence",
        "name": "TS-2026-11-13-采集报告-DEMO0001.md",
        "size": 96,
        "mtime": 1794553894544644100,
        "digest": "abd8093aa95d794d1cff4805480fd4d96b8d6a889e2a545a214785c0b7dc83b7",
        "available": 1,
        "artifact_kind": "collection_report",
        "source_kind": "collection_report"
      }
    ],
    "links": [
      {
        "task_id": "TS-87D6DBB3",
        "artifact_id": 1
      },
      {
        "task_id": "TS-A23B6D49",
        "artifact_id": 2
      },
      {
        "task_id": "TS-7D6B5549",
        "artifact_id": 4
      },
      {
        "task_id": "TS-DEF00291",
        "artifact_id": 5
      },
      {
        "task_id": "TS-3B9B1EDB",
        "artifact_id": 5
      }
    ],
    "events": [
      {
        "id": 17,
        "task_id": "TS-6395A9A9",
        "kind": "status",
        "detail": "active → pending",
        "recorded_by": "chen",
        "created_at": "2026-11-13T10:58:59+00:00"
      },
      {
        "id": 16,
        "task_id": "TS-6395A9A9",
        "kind": "status",
        "detail": "pending → active",
        "recorded_by": "chen",
        "created_at": "2026-11-13T10:58:57+00:00"
      },
      {
        "id": 15,
        "task_id": "TS-1B370F69",
        "kind": "summary",
        "detail": "更新闭环结论",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 14,
        "task_id": "TS-1B370F69",
        "kind": "status",
        "detail": "active → done",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 13,
        "task_id": "TS-1B370F69",
        "kind": "status",
        "detail": "pending → active",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 12,
        "task_id": "TS-1B370F69",
        "kind": "created",
        "detail": "创建任务",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 11,
        "task_id": "TS-E0386DD3",
        "kind": "status",
        "detail": "pending → active",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 10,
        "task_id": "TS-E0386DD3",
        "kind": "created",
        "detail": "创建任务",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 9,
        "task_id": "TS-78AEAC9B",
        "kind": "created",
        "detail": "创建任务",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 8,
        "task_id": "TS-6395A9A9",
        "kind": "created",
        "detail": "创建任务",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 7,
        "task_id": "TS-3B9B1EDB",
        "kind": "delivery_route",
        "detail": "DL-TS-5；Codex 最终交付；接受报告摘要 4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 6,
        "task_id": "TS-3B9B1EDB",
        "kind": "created",
        "detail": "由文件自动创建任务",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 5,
        "task_id": "TS-DEF00291",
        "kind": "delivery_route",
        "detail": "DL-TS-5；内部反哺；接受报告摘要 4baa350e0d6bc911be01f5fa3af93a82a979f5c54b8431d24de5ea1606a1e3f0",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 4,
        "task_id": "TS-DEF00291",
        "kind": "created",
        "detail": "由文件自动创建任务",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 3,
        "task_id": "TS-7D6B5549",
        "kind": "created",
        "detail": "由文件自动创建任务",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 2,
        "task_id": "TS-A23B6D49",
        "kind": "created",
        "detail": "由文件自动创建任务",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 1,
        "task_id": "TS-87D6DBB3",
        "kind": "created",
        "detail": "由文件自动创建任务",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      }
    ],
    "source_events": [
      {
        "id": 3,
        "source": "pending_tests",
        "name": "TS-给WorkBuddy-演示待测-D02.md",
        "digest": "b8b9ffb857b033ba76ff4e15481675edd85afdd3f98b546eb1eafa0614c8f735",
        "change_kind": "created",
        "artifact_id": 4,
        "title": "报名卡 · 文字复核",
        "sender_role": "pi",
        "recipient_role": "wb",
        "kind": "test_assignment",
        "intent": "action",
        "state": "linked",
        "task_id": "TS-7D6B5549",
        "created_at": "2026-11-13T07:13:34+00:00",
        "routing_confirmed": 0,
        "available": 1,
        "artifact_source": "pending_tests",
        "task_status": "pending",
        "triage_reason": ""
      },
      {
        "id": 2,
        "source": "pending_tests",
        "name": "TS-给WorkBuddy-演示待测-D01.md",
        "digest": "8771e4ca58225369e28dfba8c195acb1ad819b87f596754256fc63c23e823337",
        "change_kind": "created",
        "artifact_id": 2,
        "title": "窄屏活动卡 · 显示复核",
        "sender_role": "pi",
        "recipient_role": "wb",
        "kind": "test_assignment",
        "intent": "action",
        "state": "linked",
        "task_id": "TS-A23B6D49",
        "created_at": "2026-11-13T07:13:34+00:00",
        "routing_confirmed": 0,
        "available": 1,
        "artifact_source": "pending_tests",
        "task_status": "pending",
        "triage_reason": ""
      },
      {
        "id": 1,
        "source": "intelligence",
        "name": "TS-2026-11-13-采集报告-DEMO0001.md",
        "digest": "abd8093aa95d794d1cff4805480fd4d96b8d6a889e2a545a214785c0b7dc83b7",
        "change_kind": "created",
        "artifact_id": 1,
        "title": "手作市集 · 公开活动资料",
        "sender_role": "collector",
        "recipient_role": "pi",
        "kind": "collection_report",
        "intent": "action",
        "state": "linked",
        "task_id": "TS-87D6DBB3",
        "created_at": "2026-11-13T07:13:34+00:00",
        "routing_confirmed": 0,
        "available": 1,
        "artifact_source": "intelligence",
        "task_status": "pending",
        "triage_reason": ""
      }
    ],
    "sources": [
      {
        "id": "delivery",
        "name": "客户交付报告",
        "path": "演示资料 / 客户交付报告",
        "available": true
      },
      {
        "id": "communication",
        "name": "产品沟通",
        "path": "演示资料 / 产品沟通",
        "available": true
      },
      {
        "id": "content_communication",
        "name": "内容沟通",
        "path": "演示资料 / 内容沟通",
        "available": true
      },
      {
        "id": "audit_communication",
        "name": "审计沟通",
        "path": "演示资料 / 审计沟通",
        "available": true
      },
      {
        "id": "audit_returns",
        "name": "审计回报",
        "path": "演示资料 / 审计回报",
        "available": true
      },
      {
        "id": "pending_tests",
        "name": "待测试",
        "path": "演示资料 / 待测试",
        "available": true
      },
      {
        "id": "completed_tests",
        "name": "已测试",
        "path": "演示资料 / 已测试",
        "available": true
      },
      {
        "id": "test_archive",
        "name": "已归档测试资料",
        "path": "演示资料 / 已归档测试资料",
        "available": true
      },
      {
        "id": "intelligence",
        "name": "待处置情报",
        "path": "演示资料 / 待处置情报",
        "available": true
      },
      {
        "id": "intelligence_archive",
        "name": "已处置情报",
        "path": "演示资料 / 已处置情报",
        "available": true
      }
    ],
    "mode": "manual",
    "collection_prompts": {
      "workspace": "ts",
      "day": "2026-11-13",
      "domain": "手作市集的活动时间、地点和报名页示例。",
      "brief": {
        "text": "",
        "updated_at": "",
        "revision": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "stale": false
      },
      "evidence": [
        {
          "name": "知识导航.md",
          "digest": "666302e703f3587334c1e4a868af43499b0b7e22f3e5d2170a7673f483092485",
          "modified_at": "2026-11-13T15:13:34.590893+08:00",
          "rows": []
        }
      ],
      "warnings": [
        "CURRENT-STATE.md 暂不可读，使用探索方向；不推断库内缺口。",
        "04-测试与验证/实验方法/待测项总表.md 暂不可读，使用探索方向；不推断库内缺口。"
      ],
      "plan": {
        "available": false,
        "text": "",
        "updated_at": "",
        "needs_review": true,
        "status": "演示使用活动资料样例。"
      },
      "daily_review": {
        "status": "not_started",
        "day": "",
        "read_files": 0,
        "total_files": 0
      },
      "returned_count": 0,
      "assignments": [],
      "configured_collectors": [],
      "focus_coverage": [],
      "registered_reports": 1,
      "coverage": "演示资料中的采集记录。"
    },
    "csrf": "demo",
    "delegate_close": {
      "delegate_close_enabled": false,
      "delegate_close_actors": [
        "pm"
      ],
      "delegate_close_require_reason": true,
      "scope": "localhost",
      "credential_configured": false
    },
    "demo_documents": {
      "5": "# 手作市集 · 活动回顾\r\n\r\n示例产物：一页摘要与一份图片清单。\r\n",
      "4": "# 报名卡 · 文字复核\r\n\r\n执行角色：WorkBuddy\r\n\r\n这是虚构的文字复核记录。\r\n",
      "2": "# 窄屏活动卡 · 显示复核\r\n\r\n执行角色：WorkBuddy\r\n\r\n这是虚构的显示复核记录。\r\n",
      "1": "# 手作市集 · 公开活动资料\r\n\r\n示例记录：资料含开放时间和活动地点。\r\n"
    }
  },
  "ks": {
    "workspace": {
      "id": "ks",
      "prefix": "KS",
      "name": "KeelSteer"
    },
    "workspaces": [
      {
        "id": "ts",
        "prefix": "TS",
        "name": "TrimSteer"
      },
      {
        "id": "ks",
        "prefix": "KS",
        "name": "KeelSteer"
      }
    ],
    "delivery": {
      "reports": [
        {
          "id": 5,
          "source": "delivery",
          "name": "2026-11-13-活动回顾示例-v1.md",
          "size": 90,
          "mtime": 1794554014892378800,
          "digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
          "available": 1,
          "artifact_kind": "delivery_report",
          "branch_count": 2
        }
      ],
      "branches": [
        {
          "task_id": "KS-EB6EBE32",
          "artifact_id": 5,
          "branch": "knowledge",
          "accepted_digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
          "observed_digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
          "name": "2026-11-13-活动回顾示例-v1.md",
          "available": 1,
          "digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
          "report_changed": 0
        },
        {
          "task_id": "KS-E09F38F3",
          "artifact_id": 5,
          "branch": "html",
          "accepted_digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
          "observed_digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
          "name": "2026-11-13-活动回顾示例-v1.md",
          "available": 1,
          "digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
          "report_changed": 0
        }
      ]
    },
    "delivery_execution": {
      "runs": [],
      "worker_error": "",
      "ready": true,
      "connection": "演示模式 · 使用示例回报"
    },
    "collection_automation": {
      "enabled": false,
      "supported": true,
      "agent": "知识库维护 Agent",
      "profile": "演示资料",
      "schedule": "12:00",
      "continuous_intake": true,
      "protected_count": 0,
      "scheduled_at": "2026-11-13T12:00:00+08:00",
      "summary_dir": "示例归档",
      "local_ready": true,
      "ready": true,
      "connection": "演示模式 · 仅处理样例",
      "observed_at": "",
      "worker_error": "",
      "last_day": "",
      "runs": [],
      "intake": {
        "observed_at": "",
        "monitor_error": "",
        "stabilizing": 0,
        "queued_tasks": 0,
        "waiting_reason": ""
      },
      "removed_count": 0,
      "removed_runs": [],
      "preview": [
        {
          "task_id": "KS-4C10C2CE",
          "title": "社区读书会 · 公开活动资料",
          "revision": 1,
          "files": [
            {
              "id": 1,
              "source": "intelligence",
              "name": "KS-2026-11-13-采集报告-DEMO0001.md",
              "digest": "57aea0a3d38d0c367bfa3898de47e15fb00a665df145a8117ad80029a2d58896",
              "available": 1
            }
          ]
        }
      ],
      "skipped": []
    },
    "knowledge_audits": {
      "root": "演示资料",
      "role_dir": "演示资料",
      "runs": [],
      "ready": false,
      "connection": "演示模式 · 仅登记样例回报"
    },
    "trash_tasks": [],
    "release": "3.1.42",
    "flow_rules": {
      "tests": "测试卡在示例列表中流转，可查看资料、记录回报和确认闭环。"
    },
    "batches": [],
    "relations": [
      {
        "from_task": "KS-EB6EBE32",
        "to_task": "KS-E09F38F3",
        "relation": "related",
        "created_at": "2026-11-13T07:13:34+00:00"
      }
    ],
    "discussions": [
      {
        "task_id": "KS-C51A6EF5",
        "mode": "communication",
        "category": "product",
        "first_speaker": "wb",
        "max_rounds": 1,
        "participants": [
          "pi",
          "wb"
        ],
        "turn_model": "single_action",
        "action_index": 1,
        "pending_handoff": null,
        "audit_notice": null
      }
    ],
    "references": [],
    "results": [],
    "sync_health": [
      {
        "source": "intelligence",
        "observed_at": "2026-11-13T07:13:34+00:00",
        "content_checked_at": "2026-11-13T07:13:34+00:00",
        "indexed": 1,
        "skipped": 0,
        "error": ""
      },
      {
        "source": "pending_tests",
        "observed_at": "2026-11-13T07:13:34+00:00",
        "content_checked_at": "2026-11-13T07:13:34+00:00",
        "indexed": 2,
        "skipped": 0,
        "error": ""
      },
      {
        "source": "delivery",
        "observed_at": "2026-11-13T07:13:34+00:00",
        "content_checked_at": "2026-11-13T07:13:34+00:00",
        "indexed": 1,
        "skipped": 0,
        "error": ""
      }
    ],
    "archive_health": [],
    "source_candidates": [],
    "pending_operations": [],
    "backup": {
      "count": 0,
      "latest": null,
      "error": "",
      "latest_at": null
    },
    "monitor": {},
    "roles": [
      {
        "id": "chen",
        "name": "陈震",
        "short": "陈",
        "codename": "总调度",
        "responsibility": "项目负责人 · 决策与调度"
      },
      {
        "id": "pi",
        "name": "知识库维护 Agent",
        "short": "知",
        "codename": "知识维护",
        "responsibility": "研究与知识库唯一维护者 · 沉淀、返推"
      },
      {
        "id": "wb",
        "name": "Workbuddy-交付专家",
        "short": "WB",
        "codename": "客户交付",
        "responsibility": "客户诊断交付官 · 账单与报告"
      },
      {
        "id": "collector",
        "name": "情报采集 Agent",
        "short": "采",
        "codename": "情报采集",
        "responsibility": "采集情报 · 提交 Markdown 报告"
      },
      {
        "id": "tester",
        "name": "测试 Agent",
        "short": "测",
        "codename": "实验执行",
        "responsibility": "执行 知识库维护 Agent 测试清单 · 回传报告"
      },
      {
        "id": "codex",
        "name": "Codex-协同工作台维护",
        "short": "CX",
        "codename": "平台工务",
        "responsibility": "产品化与协同平台维护"
      },
      {
        "id": "knowledge_auditor",
        "name": "Codex-知识库审计",
        "short": "审",
        "codename": "审计官",
        "responsibility": "独立只读审计 KS 知识库 · 提交证据与建议"
      }
    ],
    "tasks": [
      {
        "id": "KS-77466C61",
        "kind": "platform",
        "title": "确认第一版活动摘要",
        "description": "社区读书会的示例任务。",
        "owner": "chen",
        "participants": [
          "chen"
        ],
        "parent_id": null,
        "status": "done",
        "resume_status": null,
        "revision": 3,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "已确认示例摘要。",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "",
        "batch_recipient": "chen",
        "closure_reopen_group": "platform::chen",
        "closure_reopen_eligible": true,
        "last_closure_event": 14,
        "discussion_type_editable": false,
        "batch_eligible": false,
        "batch_close_eligible": false
      },
      {
        "id": "KS-7958B9C3",
        "kind": "platform",
        "title": "核对活动页的阅读顺序",
        "description": "社区读书会的示例任务。",
        "owner": "pi",
        "participants": [
          "pi"
        ],
        "parent_id": null,
        "status": "active",
        "resume_status": null,
        "revision": 2,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "",
        "batch_recipient": "pi",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": false,
        "batch_close_eligible": false
      },
      {
        "id": "KS-11A98C2F",
        "kind": "platform",
        "title": "整理活动页素材",
        "description": "社区读书会的示例任务。",
        "owner": "codex",
        "participants": [
          "codex"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 1,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "",
        "batch_recipient": "codex",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": false,
        "batch_close_eligible": false
      },
      {
        "id": "KS-C51A6EF5",
        "kind": "discussion",
        "title": "产品沟通 · 社区读书会的报名页文案讨论",
        "description": "社区读书会的报名页文案讨论",
        "owner": "wb",
        "participants": [
          "pi",
          "wb"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 1,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "product",
        "batch_category": "",
        "batch_recipient": "wb",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": true,
        "batch_close_eligible": false
      },
      {
        "id": "KS-E09F38F3",
        "kind": "delivery",
        "title": "Codex 最终交付 · 2026-11-13-活动回顾示例-v1",
        "description": "社区读书会的演示任务。可查看关联的示例资料。",
        "owner": "codex",
        "participants": [
          "codex",
          "wb"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 1,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": {
          "task_id": "KS-E09F38F3",
          "artifact_id": 5,
          "branch": "html",
          "accepted_digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
          "observed_digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
          "name": "2026-11-13-活动回顾示例-v1.md",
          "available": 1,
          "digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
          "report_changed": 0
        },
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "",
        "batch_recipient": "codex",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": true,
        "batch_close_eligible": false
      },
      {
        "id": "KS-EB6EBE32",
        "kind": "delivery",
        "title": "内部反哺 · 2026-11-13-活动回顾示例-v1",
        "description": "社区读书会的演示任务。可查看关联的示例资料。",
        "owner": "pi",
        "participants": [
          "pi",
          "wb"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 1,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": {
          "task_id": "KS-EB6EBE32",
          "artifact_id": 5,
          "branch": "knowledge",
          "accepted_digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
          "observed_digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
          "name": "2026-11-13-活动回顾示例-v1.md",
          "available": 1,
          "digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
          "report_changed": 0
        },
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "",
        "batch_recipient": "pi",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": true,
        "batch_close_eligible": false
      },
      {
        "id": "KS-11264822",
        "kind": "test",
        "title": "报名卡 · 文字复核",
        "description": "社区读书会的演示任务。可查看关联的示例资料。",
        "owner": "wb",
        "participants": [
          "pi",
          "wb"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 1,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "test_execution",
        "batch_recipient": "wb",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": true,
        "batch_close_eligible": false
      },
      {
        "id": "KS-D3DA677C",
        "kind": "test",
        "title": "窄屏活动卡 · 显示复核",
        "description": "社区读书会的演示任务。可查看关联的示例资料。",
        "owner": "wb",
        "participants": [
          "pi",
          "wb"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 1,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "test_execution",
        "batch_recipient": "wb",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": true,
        "batch_close_eligible": false
      },
      {
        "id": "KS-4C10C2CE",
        "kind": "research",
        "title": "社区读书会 · 公开活动资料",
        "description": "社区读书会的演示任务。可查看关联的示例资料。",
        "owner": "pi",
        "participants": [
          "collector",
          "pi"
        ],
        "parent_id": null,
        "status": "pending",
        "resume_status": null,
        "revision": 1,
        "created_at": "2026-11-13T07:13:34+00:00",
        "updated_at": "2026-11-13T07:13:34+00:00",
        "summary": "",
        "audit_outcome": "",
        "removed_at": "",
        "removal_reason": "",
        "withdrawn_at": "",
        "withdrawal_reason": "",
        "purged_at": "",
        "delivery": null,
        "audit_tracking": null,
        "auto_run": null,
        "discussion_type": "",
        "batch_category": "collection_processing",
        "batch_recipient": "pi",
        "closure_reopen_group": "",
        "closure_reopen_eligible": false,
        "last_closure_event": null,
        "discussion_type_editable": false,
        "batch_eligible": true,
        "batch_close_eligible": true
      }
    ],
    "messages": [],
    "artifacts": [
      {
        "id": 5,
        "source": "delivery",
        "name": "2026-11-13-活动回顾示例-v1.md",
        "size": 90,
        "mtime": 1794554014892378800,
        "digest": "b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
        "available": 1,
        "artifact_kind": "delivery_report",
        "source_kind": "delivery_report"
      },
      {
        "id": 4,
        "source": "pending_tests",
        "name": "KS-给WorkBuddy-演示待测-D02.md",
        "size": 97,
        "mtime": 1794554014880407800,
        "digest": "b8b9ffb857b033ba76ff4e15481675edd85afdd3f98b546eb1eafa0614c8f735",
        "available": 1,
        "artifact_kind": "test_assignment",
        "source_kind": "test_assignment"
      },
      {
        "id": 2,
        "source": "pending_tests",
        "name": "KS-给WorkBuddy-演示待测-D01.md",
        "size": 103,
        "mtime": 1794554014871831200,
        "digest": "8771e4ca58225369e28dfba8c195acb1ad819b87f596754256fc63c23e823337",
        "available": 1,
        "artifact_kind": "test_assignment",
        "source_kind": "test_assignment"
      },
      {
        "id": 1,
        "source": "intelligence",
        "name": "KS-2026-11-13-采集报告-DEMO0001.md",
        "size": 99,
        "mtime": 1794553894859512500,
        "digest": "57aea0a3d38d0c367bfa3898de47e15fb00a665df145a8117ad80029a2d58896",
        "available": 1,
        "artifact_kind": "collection_report",
        "source_kind": "collection_report"
      }
    ],
    "links": [
      {
        "task_id": "KS-4C10C2CE",
        "artifact_id": 1
      },
      {
        "task_id": "KS-D3DA677C",
        "artifact_id": 2
      },
      {
        "task_id": "KS-11264822",
        "artifact_id": 4
      },
      {
        "task_id": "KS-EB6EBE32",
        "artifact_id": 5
      },
      {
        "task_id": "KS-E09F38F3",
        "artifact_id": 5
      }
    ],
    "events": [
      {
        "id": 15,
        "task_id": "KS-77466C61",
        "kind": "summary",
        "detail": "更新闭环结论",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 14,
        "task_id": "KS-77466C61",
        "kind": "status",
        "detail": "active → done",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 13,
        "task_id": "KS-77466C61",
        "kind": "status",
        "detail": "pending → active",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 12,
        "task_id": "KS-77466C61",
        "kind": "created",
        "detail": "创建任务",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 11,
        "task_id": "KS-7958B9C3",
        "kind": "status",
        "detail": "pending → active",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 10,
        "task_id": "KS-7958B9C3",
        "kind": "created",
        "detail": "创建任务",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 9,
        "task_id": "KS-11A98C2F",
        "kind": "created",
        "detail": "创建任务",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 8,
        "task_id": "KS-C51A6EF5",
        "kind": "created",
        "detail": "创建任务",
        "recorded_by": "chen",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 7,
        "task_id": "KS-E09F38F3",
        "kind": "delivery_route",
        "detail": "DL-KS-5；Codex 最终交付；接受报告摘要 b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 6,
        "task_id": "KS-E09F38F3",
        "kind": "created",
        "detail": "由文件自动创建任务",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 5,
        "task_id": "KS-EB6EBE32",
        "kind": "delivery_route",
        "detail": "DL-KS-5；内部反哺；接受报告摘要 b18ff2724c175d3954b1ca2d027e58942e85cf5de71f99083632d0578475028c",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 4,
        "task_id": "KS-EB6EBE32",
        "kind": "created",
        "detail": "由文件自动创建任务",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 3,
        "task_id": "KS-11264822",
        "kind": "created",
        "detail": "由文件自动创建任务",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 2,
        "task_id": "KS-D3DA677C",
        "kind": "created",
        "detail": "由文件自动创建任务",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      },
      {
        "id": 1,
        "task_id": "KS-4C10C2CE",
        "kind": "created",
        "detail": "由文件自动创建任务",
        "recorded_by": "system",
        "created_at": "2026-11-13T07:13:34+00:00"
      }
    ],
    "source_events": [
      {
        "id": 3,
        "source": "pending_tests",
        "name": "KS-给WorkBuddy-演示待测-D02.md",
        "digest": "b8b9ffb857b033ba76ff4e15481675edd85afdd3f98b546eb1eafa0614c8f735",
        "change_kind": "created",
        "artifact_id": 4,
        "title": "报名卡 · 文字复核",
        "sender_role": "pi",
        "recipient_role": "wb",
        "kind": "test_assignment",
        "intent": "action",
        "state": "linked",
        "task_id": "KS-11264822",
        "created_at": "2026-11-13T07:13:34+00:00",
        "routing_confirmed": 0,
        "available": 1,
        "artifact_source": "pending_tests",
        "task_status": "pending",
        "triage_reason": ""
      },
      {
        "id": 2,
        "source": "pending_tests",
        "name": "KS-给WorkBuddy-演示待测-D01.md",
        "digest": "8771e4ca58225369e28dfba8c195acb1ad819b87f596754256fc63c23e823337",
        "change_kind": "created",
        "artifact_id": 2,
        "title": "窄屏活动卡 · 显示复核",
        "sender_role": "pi",
        "recipient_role": "wb",
        "kind": "test_assignment",
        "intent": "action",
        "state": "linked",
        "task_id": "KS-D3DA677C",
        "created_at": "2026-11-13T07:13:34+00:00",
        "routing_confirmed": 0,
        "available": 1,
        "artifact_source": "pending_tests",
        "task_status": "pending",
        "triage_reason": ""
      },
      {
        "id": 1,
        "source": "intelligence",
        "name": "KS-2026-11-13-采集报告-DEMO0001.md",
        "digest": "57aea0a3d38d0c367bfa3898de47e15fb00a665df145a8117ad80029a2d58896",
        "change_kind": "created",
        "artifact_id": 1,
        "title": "社区读书会 · 公开活动资料",
        "sender_role": "collector",
        "recipient_role": "pi",
        "kind": "collection_report",
        "intent": "action",
        "state": "linked",
        "task_id": "KS-4C10C2CE",
        "created_at": "2026-11-13T07:13:34+00:00",
        "routing_confirmed": 0,
        "available": 1,
        "artifact_source": "intelligence",
        "task_status": "pending",
        "triage_reason": ""
      }
    ],
    "sources": [
      {
        "id": "delivery",
        "name": "客户交付报告",
        "path": "演示资料 / 客户交付报告",
        "available": true
      },
      {
        "id": "communication",
        "name": "产品沟通",
        "path": "演示资料 / 产品沟通",
        "available": true
      },
      {
        "id": "content_communication",
        "name": "内容沟通",
        "path": "演示资料 / 内容沟通",
        "available": true
      },
      {
        "id": "audit_communication",
        "name": "审计沟通",
        "path": "演示资料 / 审计沟通",
        "available": true
      },
      {
        "id": "audit_returns",
        "name": "审计回报",
        "path": "演示资料 / 审计回报",
        "available": true
      },
      {
        "id": "pending_tests",
        "name": "待测试",
        "path": "演示资料 / 待测试",
        "available": true
      },
      {
        "id": "completed_tests",
        "name": "已测试",
        "path": "演示资料 / 已测试",
        "available": true
      },
      {
        "id": "test_archive",
        "name": "已归档测试资料",
        "path": "演示资料 / 已归档测试资料",
        "available": true
      },
      {
        "id": "intelligence",
        "name": "待处置情报",
        "path": "演示资料 / 待处置情报",
        "available": true
      },
      {
        "id": "intelligence_archive",
        "name": "已处置情报",
        "path": "演示资料 / 已处置情报",
        "available": true
      }
    ],
    "mode": "manual",
    "collection_prompts": {
      "workspace": "ks",
      "day": "2026-11-13",
      "domain": "社区读书会的活动时间、地点和报名页示例。",
      "brief": {
        "text": "",
        "updated_at": "",
        "revision": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "stale": false
      },
      "evidence": [
        {
          "name": "知识导航.md",
          "digest": "9a22d9f9ab53d25d964ef737026ae08b8bea411ee2a3dcdb7cd8392f543272b5",
          "modified_at": "2026-11-13T15:13:34.905347+08:00",
          "rows": []
        }
      ],
      "warnings": [
        "CURRENT-STATE.md 暂不可读，使用探索方向；不推断库内缺口。",
        "08-质量审计/时效复查表.md 暂不可读，使用探索方向；不推断库内缺口。"
      ],
      "plan": {
        "available": false,
        "text": "",
        "updated_at": "",
        "needs_review": true,
        "status": "演示使用活动资料样例。"
      },
      "daily_review": {
        "status": "not_started",
        "day": "",
        "read_files": 0,
        "total_files": 0
      },
      "returned_count": 0,
      "assignments": [],
      "configured_collectors": [],
      "focus_coverage": [],
      "registered_reports": 1,
      "coverage": "演示资料中的采集记录。"
    },
    "csrf": "demo",
    "delegate_close": {
      "delegate_close_enabled": false,
      "delegate_close_actors": [
        "pm"
      ],
      "delegate_close_require_reason": true,
      "scope": "localhost",
      "credential_configured": false
    },
    "demo_documents": {
      "5": "# 社区读书会 · 活动回顾\r\n\r\n示例产物：一页摘要与一份图片清单。\r\n",
      "4": "# 报名卡 · 文字复核\r\n\r\n执行角色：WorkBuddy\r\n\r\n这是虚构的文字复核记录。\r\n",
      "2": "# 窄屏活动卡 · 显示复核\r\n\r\n执行角色：WorkBuddy\r\n\r\n这是虚构的显示复核记录。\r\n",
      "1": "# 社区读书会 · 公开活动资料\r\n\r\n示例记录：资料含开放时间和活动地点。\r\n"
    }
  },
  "ops": {
    "workspace": {
      "id": "ops",
      "name": "运营协同"
    },
    "projects": [
      {
        "id": "chen",
        "name": "我 · 陈震",
        "kind": "human",
        "root": null,
        "available": true,
        "reply_dir": null
      },
      {
        "id": "xiaohongshu",
        "name": "小红书运营",
        "root": "演示项目",
        "available": true,
        "reply_dir": "示例回件"
      },
      {
        "id": "wechat",
        "name": "公众号运营",
        "root": null,
        "available": false,
        "reply_dir": null
      },
      {
        "id": "website",
        "name": "官网开发",
        "root": "演示项目",
        "available": true,
        "reply_dir": "示例回件"
      }
    ],
    "cards": [
      {
        "id": "OP-F7106C4376894DF0",
        "sender": "chen",
        "receiver": null,
        "body": "演示沟通：周末手作市集的活动卡已准备好，等候确认展位说明。",
        "status": "draft",
        "revision": 1,
        "created_at": "2026-11-13T07:13:34.996078+00:00",
        "closed_at": null,
        "request_id": "eb94b9ef3d2a4a6e90dc04a5b38f8b5b",
        "reply_to": null,
        "source_name": null,
        "source_digest": null,
        "archived_at": null,
        "archive_reason": null
      }
    ],
    "total_cards": 1,
    "events": [
      {
        "id": 1,
        "card_id": "OP-F7106C4376894DF0",
        "action": "saved",
        "sender": "chen",
        "receiver": null,
        "created_at": "2026-11-13T07:13:34.997075+00:00"
      }
    ],
    "warnings": [],
    "csrf": "demo",
    "version": "3.1.42"
  }
};
