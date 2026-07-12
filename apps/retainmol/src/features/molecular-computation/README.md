# 分子计算 Feature

该 feature 提供后台 Worker 分子计算能力。目前包含距离几何初始构型和 MMFF94 最小化。

```text
molecular-computation/
├── application/      面向调用者的计算用例
├── domain/           Worker 协议类型
├── infrastructure/   Worker 生命周期、请求匹配、超时与重建
└── index.ts           唯一业务入口
```

调用者不得直接使用 `molWorkerClient`，也不得自行发送 Worker 消息。新增计算操作时先扩展协议，再增加独立 application 用例。
