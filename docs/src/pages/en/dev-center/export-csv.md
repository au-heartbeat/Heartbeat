---
title: Export CSV
description: Export CSV
layout: ../../layouts/MainLayout.astro
---

# Export pipeline data

## Data structure

| 字段名称                                               | 来源                             | 描述                                                                                                                                        | Note                                                                                                                                                                        |
| :----------------------------------------------------- | :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pipeline Name                                          | pipeline name                    | metrics page 选择的 pipeline name                                                                                                           |                                                                                                                                                                             |
| Pipeline Step                                          | pipeline step name               | metrics page 选择的 step name                                                                                                               |                                                                                                                                                                             |
| Build Number                                           | buildInfo.number                 | 根据 organization 和 pipeline 获取的 buildInfo 的 number                                                                                    |                                                                                                                                                                             |
| Committer                                              | commitInfo.commit.committer.name | 根据 organization 和 pipeline 可以得到 buildInfo 的 commit 以及该 pipeline 的 repository，根据 repository 和 commitId 可以获取到 commitInfo | 仅在 config page 选择 leadTimeForChanges 时，计算该字段                                                                                                                     |
| Code Committed Time                                    | commitInfo.commit.committer.date | 同上                                                                                                                                        | 仅在 config page 选择 leadTimeForChanges 时，计算该字段                                                                                                                     |
| First Code Committed Time In PR                        | leadTimeInfo.firstCommitTimeInPr | 根据选择的 pipeline name 和 step 得到 repository，然后根据 name、step 和 repository 计算得到 leadTimeInfo                                   | 仅在 config page 选择 leadTimeForChanges 时，计算该字段                                                                                                                     |
| PR Created Time                                        | leadTimeInfo.prCreatedTime       | 同上                                                                                                                                        | 仅在 config page 选择 leadTimeForChanges 时，计算该字段                                                                                                                     |
| PR Merged Time                                         | leadTimeInfo.prMergedTime        | 同上                                                                                                                                        | 仅在 config page 选择 leadTimeForChanges 时，计算该字段                                                                                                                     |
| Deployment Completed Time                              | leadTimeInfo.jobFinishTime       | 同上                                                                                                                                        | 仅在 config page 没有选择 leadTimeForChanges 时，可以根据 buildInfo 的 commit、pipelineCreateTime 和 deployInfo 的 finishedTime 生成一个没有 mergeDelayTime 的 leadTimeInfo |
| Total Lead Time (HH:mm:ss)                             | leadTimeInfo.totalTime           | 同上                                                                                                                                        | 同上                                                                                                                                                                        |
| Time from PR Created to PR Merged (HH:mm:ss)           | leadTimeInfo.prDelayTime         | 同上                                                                                                                                        | 仅在 config page 选择 leadTimeForChanges 时，计算该字段                                                                                                                     |
| Time from PR Merged to Deployment Completed (HH:mm:ss) | leadTimeInfo.pipelineDelayTime   | 同上                                                                                                                                        | 同上                                                                                                                                                                        |
| Status                                                 | deployInfo.state                 | 根据 organization 和 pipeline 获取到 buildInfo 的 deployInfos，根据 step 和 state 查询到第一个符合条件的 deployInfo                         | 同上                                                                                                                                                                        |

## Impact w/o metrics set up

- On the configuration page, selecting `Lead times for changes`, `Deployment frequency`, `Change failure rate`, or `Mean
time to recovery` will display the `export pipeline data` button.
- Only selecting `Lead times for changes`, can get value of `Committer`,`Code Committed Time` and
  completed `leadTimeInfo`.
- On the metrics page, selecting different pipeline and step will show different data.
