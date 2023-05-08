---
title: Report Calculation Method
description: Report calculation method
layout: ../../layouts/MainLayout.astro
---

> Note: All metrics are calculated in the selected time range.

## Velocity

| Metrics                 | Calculate method                         | Note |
| :---------------------- | :--------------------------------------- | :--- |
| Velocity for Storypoint | Sum of the storypoints of all done cards |      |
| Velocity for cards      | Sum of all done cards                    |      |

## Deployment Frequency

### Config

- StartDate、EndDate
- BuildKite token
- Organization (id)
- Pipeline name
- Step

### Calculate logic

- Get all deployment information according to token、date、organization and pipeline name.
- Filter out all passed deployment information for each step.
- The number of passed deployments divided by the number of days.

### Definition

| Metrics              | Description                                                   | Note |
| :------------------- | :------------------------------------------------------------ | :--- |
| PipeLine name / step | Average number of passed deployments per day for each step    |      |
| Average              | The average of the deployment frequency of all selected steps |      |
