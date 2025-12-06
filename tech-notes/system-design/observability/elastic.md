---
title: "Observability: Elastic + OpenTelemetry"
description: "Elastic's OpenTelemetry strategy and integration guide"
---

# Elastic + OpenTelemetry: Interview Preparation Guide

## Core Concept: Elastic's OpenTelemetry Strategy

**Key Message**: Elastic is "all-in" on OpenTelemetry as the **data collection standard**, while competing on **analysis and insights**.

```
Industry Standard          Elastic's Differentiation
     (OTel)                        ↓
        ↓
   Data Collection  →  Storage + Search + Analysis + AI/ML
   (Commoditized)       (Where Elastic Wins)
```

---

## How Elastic Supports OpenTelemetry

### 1. Native OTLP Support (Since Elastic 7.14)

**What it means:**
- Elasticsearch can **directly ingest** OpenTelemetry Protocol (OTLP) data
- **NO schema translation** required
- Preserves OpenTelemetry semantic conventions natively

**Architecture:**
```
Your Application + OTel SDK
         ↓
      OTLP over gRPC/HTTP
         ↓
Elastic APM Server / Managed OTLP Endpoint
         ↓
    Elasticsearch
         ↓
      Kibana
```

**Why this matters:**
- No data loss from translation
- Full compatibility with OTel ecosystem
- Customers can switch to Elastic without changing instrumentation

---

## Three Ways to Use OpenTelemetry with Elastic

### Option 1: Direct to Managed OTLP Endpoint (Newest - Oct 2025!)

```
Application (OTel SDK)
         ↓
   OTLP (push)
         ↓
Managed OTLP Endpoint (Elastic Cloud)
         ↓
    Elasticsearch
```

**Key Features:**
- **Fully managed** by Elastic
- **Auto-scales** automatically
- **No collector deployment** needed
- Available on Elastic Cloud Serverless

**Use case:** Simplest setup, let Elastic handle infrastructure

**Interview talking point:**
> "The managed OTLP endpoint launched in October 2025 is a game-changer. Instead of deploying and managing multiple OTel Collectors, teams can push directly to Elastic Cloud. This removes operational overhead—similar to how we used managed Kafka in IAP instead of self-hosting."

---

### Option 2: Using EDOT (Elastic Distributions of OpenTelemetry)

```
Application (EDOT SDK)
         ↓
    EDOT Collector
         ↓
APM Server or Elasticsearch
         ↓
      Kibana
```

**What is EDOT?**
- **Production-ready** versions of OTel components
- **Enterprise support** from Elastic
- **Bug fixes** beyond OTel release cycles
- Still 100% open source

**Components:**
- **EDOT Java** - Java SDK with Elastic optimizations
- **EDOT Python** - Python SDK with Elastic optimizations  
- **EDOT Collector** - OTel Collector with Elastic defaults
- **EDOT Operator** - Kubernetes operator for auto-instrumentation

**Use case:** Need enterprise support and faster bug fixes

**Interview talking point:**
> "EDOT addresses the 73% of companies who want to adopt OTel but cite lack of vendor support as a barrier. Elastic provides production-tested distributions with expert backing—similar to how Red Hat provides enterprise Linux vs vanilla Linux."

---

### Option 3: Hybrid with Elastic APM Agents

```
Service A (Elastic APM Agent)  →  APM Server
Service B (OTel SDK)           →  APM Server  →  Elasticsearch
Service C (Elastic APM Agent)  →  APM Server
```

**Why hybrid?**
- **Gradual migration** from Elastic APM to OTel
- **Mix and match** based on service needs
- **Distributed traces work** across both agent types

**Use case:** Migrating existing Elastic APM deployments to OTel

**Interview talking point:**
> "The hybrid approach is brilliant for enterprises with existing Elastic APM deployments. They can migrate service-by-service to OTel without breaking distributed tracing across the system—this is the kind of customer-first thinking I want to be part of."

---

## Elastic's OpenTelemetry Architecture (Detailed)

### Full Production Setup

```
┌──────────────────────────────────────────────────────┐
│              Application Layer (K8s)                  │
│                                                        │
│  Pod: Python Service                                  │
│  ├─ Application Code                                  │
│  └─ EDOT Python SDK (auto-instrumentation)           │
│       ↓                                                │
│  Pod: Go Service                                      │
│  ├─ Application Code                                  │
│  └─ EDOT Go SDK (manual + auto)                      │
│       ↓                                                │
│  Pod: Java Service                                    │
│  ├─ Application Code                                  │
│  └─ EDOT Java Agent (auto-instrumentation)           │
└───────┬──────────────────────────────────────────────┘
        │
        │ OTLP (gRPC, port 4317)
        ↓
┌──────────────────────────────────────────────────────┐
│         EDOT Collector (DaemonSet in K8s)            │
│                                                        │
│  Receivers:                                           │
│  ├─ OTLP (gRPC/HTTP)                                 │
│  ├─ Prometheus (for K8s metrics)                     │
│  └─ Host metrics                                      │
│                                                        │
│  Processors:                                          │
│  ├─ Batch (buffer 5000 spans)                        │
│  ├─ Memory Limiter (prevent OOM)                     │
│  ├─ Resource Detection (add K8s metadata)            │
│  └─ Tail Sampling (sample 10% after seeing full)     │
│                                                        │
│  Exporters:                                           │
│  └─ OTLP to Elastic Cloud                            │
└───────┬──────────────────────────────────────────────┘
        │
        │ OTLP over TLS
        ↓
┌──────────────────────────────────────────────────────┐
│              Elastic Cloud                            │
│                                                        │
│  ┌────────────────────────────────────────────┐     │
│  │  Managed OTLP Endpoint (Auto-scaling)      │     │
│  │  - Load balancing                           │     │
│  │  - Authentication                           │     │
│  │  - Rate limiting                            │     │
│  └──────────────┬─────────────────────────────┘     │
│                 ↓                                      │
│  ┌────────────────────────────────────────────┐     │
│  │  Elasticsearch Cluster                      │     │
│  │                                              │     │
│  │  Indices:                                    │     │
│  │  ├─ traces-apm*                             │     │
│  │  ├─ metrics-apm*                            │     │
│  │  └─ logs-apm*                               │     │
│  │                                              │     │
│  │  All correlated by:                         │     │
│  │  - trace.id                                 │     │
│  │  - service.name                             │     │
│  │  - span.id                                  │     │
│  └──────────────┬─────────────────────────────┘     │
│                 ↓                                      │
│  ┌────────────────────────────────────────────┐     │
│  │  Kibana APM UI                              │     │
│  │                                              │     │
│  │  Views:                                      │     │
│  │  ├─ Service Map (dependency graph)          │     │
│  │  ├─ Traces (waterfall view)                 │     │
│  │  ├─ Service Metrics (latency, throughput)   │     │
│  │  ├─ Errors (error tracking)                 │     │
│  │  └─ Logs (correlated logs)                  │     │
│  └────────────────────────────────────────────┘     │
│                                                        │
│  ┌────────────────────────────────────────────┐     │
│  │  ML & AI Features                           │     │
│  │  ├─ Anomaly detection on latency            │     │
│  │  ├─ Latency correlations                    │     │
│  │  ├─ Error rate anomalies                    │     │
│  │  └─ Elastic AI Assistant                    │     │
│  └────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────┘
```

---

## Key Elastic + OTel Features

### 1. No Schema Conversion

**Problem with other vendors:**
- Datadog: OTel → Datadog format (data loss)
- New Relic: OTel → New Relic format (different semantics)

**Elastic approach:**
- Stores OTel data **as-is** in Elasticsearch
- Preserves all OTel semantic conventions
- No vendor-specific translation

**Interview talking point:**
> "Elastic's no-translation approach means customers get exactly what OTel specifies. No surprises, no data loss. This is important for companies standardizing on OTel—they want the standard, not a vendor's interpretation of it."

---

### 2. Automatic Correlation (The Killer Feature)

All three signals linked by `trace.id`:

```
┌─────────────────────────────────────────┐
│  Trace: trace.id = abc123               │
│  ├─ Span 1: API Gateway (50ms)         │
│  ├─ Span 2: Auth Service (100ms)       │
│  └─ Span 3: Database (200ms) ← SLOW!   │
└────────────┬────────────────────────────┘
             │
             ├──→ Click "View Logs"
             │    └─ All logs with trace.id=abc123
             │
             └──→ Click "View Metrics"
                  └─ CPU/Memory at that exact time
```

**Real user workflow:**
1. See slow request in APM
2. Click span → see all logs for that request
3. Click log → see full trace
4. Click metric spike → see example traces

**Interview talking point:**
> "In IAP, when we debugged issues, we'd search logs by execution_id, check Grafana for metrics around that time, and mentally correlate. With Elastic + OTel, correlation is automatic via trace_id. One click from trace to logs to metrics—this is the UX that saves hours of debugging time."

---

### 3. AI/ML on OpenTelemetry Data

Elastic's ML features work **natively** on OTel data:

| Feature | What It Does | OTel Data Used |
|---------|--------------|----------------|
| **Anomaly Detection** | Detects unusual latency patterns | Trace durations |
| **Latency Correlations** | Finds what changed when latency spiked | Traces + infrastructure metrics |
| **Error Clustering** | Groups similar errors | Error spans + logs |
| **Log Spike Analysis** | Detects unusual log volumes | Log metrics |
| **Elastic AI Assistant** | Natural language queries | All signals |

**Interview talking point:**
> "The AI/ML capabilities on OTel data are where Elastic really differentiates. Anyone can store traces, but Elastic's anomaly detection automatically spots when latency degrades before customers complain. That's the kind of proactive observability that enterprise teams need."

---

### 4. Kubernetes Integration with OTel Operator

**What is it?**
- Deploys EDOT Collector as DaemonSet
- **Auto-instruments** pods with OTel SDKs (no code changes!)
- Automatically adds Kubernetes metadata

**How it works:**
```yaml
# Just add an annotation to your deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    metadata:
      annotations:
        instrumentation.opentelemetry.io/inject-python: "true"
    spec:
      containers:
      - name: app
        image: my-python-app:latest
```

**Result:**
- EDOT Python SDK automatically injected
- App automatically sends traces to collector
- No code changes required!

**Interview talking point:**
> "The OTel Operator for K8s is elegant. In IAP, we had to manually configure Prometheus exporters in each service. With EDOT Operator, just annotate the pod and auto-instrumentation happens—this dramatically reduces time-to-observability for new services."

---

## ECS + OpenTelemetry Convergence

**Big news:** Elastic Common Schema (ECS) is merging with OTel Semantic Conventions.

**What this means:**
- **Single standard** instead of competing schemas
- ECS brings **security fields** to OTel
- OTel becomes the successor to ECS

**Why it matters:**
- Elastic is donating ECS to the OpenTelemetry project
- Shows Elastic's commitment to open standards
- Benefits entire observability ecosystem

**Interview talking point:**
> "The ECS-OTel convergence is a huge deal. Elastic is essentially saying 'we believe in open standards more than proprietary advantage.' That's the kind of engineering culture I want to be part of—contributing to the broader ecosystem while competing on execution."

---

## Scaling OpenTelemetry with Elastic

### Challenge: OTel Generates More Data Than Metrics

**Problem:**
- Prometheus: Aggregated metrics (~KB/sec)
- OTel Traces: Per-request data (~MB/sec)

**Elastic's Solutions:**

#### 1. Tail-Based Sampling
```
Collector sees full trace → Makes sampling decision → Sends to Elastic

Example:
- Keep 100% of error traces
- Keep 100% of slow traces (>1s)
- Sample 10% of normal traces
- Result: Reduce volume by 90% while keeping important traces
```

#### 2. Elasticsearch Scalability
- Horizontal scaling (add more nodes)
- Index Lifecycle Management (hot → warm → cold → delete)
- Data tiers (fast SSD for recent, cheap storage for old)

#### 3. Search AI Lake Architecture
- Separate storage and compute
- Object storage (cheap) for long-term retention
- Compute scales independently

**Interview talking point:**
> "Scaling OTel ingestion is similar to scaling Kafka in IAP—you need backpressure handling, batching, and smart sampling. I'm curious how Elastic's managed OTLP endpoint handles burst traffic and whether it uses techniques like adaptive sampling based on storage capacity."

---

## Common OpenTelemetry Challenges & Elastic's Solutions

### Challenge 1: High Cardinality

**Problem:** Too many unique labels/attributes → storage explosion

**Example:**
```
http.url = "/api/user/12345"  ← BAD: user_id creates millions of unique values
http.url = "/api/user/{id}"   ← GOOD: templated path
```

**Elastic's solution:**
- Automatic cardinality detection
- Alerts when cardinality is too high
- Guidance on semantic conventions

---

### Challenge 2: Collector Management

**Problem:** Deploy, configure, scale OTel Collectors

**Elastic's solution:**
- **Managed OTLP Endpoint** → No collector needed
- **EDOT Operator** → Automated collector deployment in K8s
- **Fleet Management** → Centralized collector configuration

---

### Challenge 3: Missing Context

**Problem:** Traces don't have enough information to debug

**Elastic's solution:**
- **Resource Detection Processor** → Automatically adds:
  - K8s pod/namespace/node
  - Cloud provider info (AWS, Azure, GCP)
  - Host information
- **ECS fields** → Rich context from logs

---

### Challenge 4: Migration from Proprietary Agents

**Problem:** Existing Elastic APM, Datadog, New Relic deployments

**Elastic's solution:**
- **Hybrid mode** → Run OTel + Elastic APM simultaneously
- **Gradual migration** → Service by service
- **Distributed traces work** across agent types

---

## Real-World IAP Example with Elastic + OTel

### Current IAP Observability:
```
Prometheus scrapes metrics → Grafana dashboards
Logs → Kafka → MongoDB → Manual search
No distributed tracing
```

### With Elastic + OpenTelemetry:
```
┌────────────────────────────────────────────────┐
│  Event Router (Rust + EDOT Rust SDK)          │
│  - Auto-captures HTTP requests                 │
│  - Creates span: "route_event"                 │
│  - trace_id: abc123                            │
└──────────────┬─────────────────────────────────┘
               │
               ↓ trace_id=abc123 propagated
┌────────────────────────────────────────────────┐
│  Task Invoker (Go + EDOT Go SDK)              │
│  - Auto-captures gRPC calls                    │
│  - Creates span: "invoke_task"                 │
│  - parent_span_id from Router                  │
└──────────────┬─────────────────────────────────┘
               │
               ↓ trace_id=abc123 propagated
┌────────────────────────────────────────────────┐
│  Knative Task (Python + EDOT Python SDK)      │
│  - Auto-captures everything                    │
│  - Creates span: "execute_remediation"         │
│  - Logs automatically include trace_id         │
└────────────────────────────────────────────────┘

All spans → EDOT Collector → Elastic Cloud

In Kibana APM:
- See full request flow across all 3 services
- Click slow span → see exact MongoDB query that was slow
- See Kafka lag metrics at that exact moment
- Root cause in minutes instead of hours
```

**Metrics you'd track:**
- `trace.duration` → Request latency
- `kafka.consumer.lag` → Queue backlog (OTel metric)
- `mongodb.query.duration` → DB performance
- All correlated by `trace_id`

---

## Interview Questions & Answers

### Q: "What do you know about Elastic's OpenTelemetry support?"

**Strong Answer:**
> "Elastic has native OTLP support since 7.14, meaning Elasticsearch directly ingests OpenTelemetry data without schema translation. They've recently launched three key innovations:
>
> 1. **Managed OTLP Endpoint** (Oct 2025) - Auto-scaling ingestion without managing collectors
> 2. **EDOT** - Production-ready OTel distributions with enterprise support
> 3. **ECS-OTel convergence** - Donating Elastic Common Schema to OpenTelemetry
>
> What I find compelling is that Elastic isn't trying to own the instrumentation layer—they're embracing OTel as the standard and competing on analysis, search, and AI/ML. That's where the real value is for customers."

---

### Q: "How would you instrument a microservices application with OpenTelemetry and Elastic?"

**Strong Answer:**
> "I'd follow a phased approach:
>
> **Phase 1: Pilot Service**
> - Choose one service (maybe Python/Go for easy auto-instrumentation)
> - Deploy EDOT Collector as a sidecar or DaemonSet
> - Add EDOT SDK with auto-instrumentation enabled
> - Validate traces appear in Kibana APM
>
> **Phase 2: Critical Path Services**
> - Instrument services in the request path (like API gateway → business logic → database)
> - Ensure trace context propagation across services
> - Set up dashboards in Kibana for service latency and error rates
>
> **Phase 3: Full Rollout**
> - Use EDOT Operator in K8s for auto-instrumentation via annotations
> - Implement sampling strategy (100% errors, tail sampling for normal traffic)
> - Configure retention policies (7 days hot, 30 days warm)
>
> **Phase 4: Optimization**
> - Enable ML anomaly detection
> - Set up alerts on latency correlations
> - Fine-tune sampling based on actual volumes
>
> This mirrors how we rolled out Prometheus in IAP—start small, prove value, then scale."

---

### Q: "What challenges do you foresee with OpenTelemetry adoption?"

**Strong Answer:**
> "Three main challenges:
>
> **1. Data Volume Management**
> - OTel traces generate significantly more data than Prometheus metrics
> - Need smart sampling strategies—can't store every trace
> - Solution: Tail-based sampling, keep 100% of errors/slow requests
>
> **2. Cardinality Explosion**
> - Developers might use high-cardinality attributes (user IDs, request IDs)
> - This blows up storage and query performance
> - Solution: Follow OTel semantic conventions, use templated paths
>
> **3. Migration from Existing Tools**
> - Teams already have investments in proprietary agents
> - Can't do big-bang migrations
> - Solution: Elastic's hybrid mode—run both during transition
>
> In IAP, we faced similar challenges with Kafka—managing high-volume event streams and preventing topic proliferation. The principles are the same: smart defaults, clear guidelines, and gradual adoption."

---

### Q: "Why is Elastic betting on OpenTelemetry?"

**Strong Answer:**
> "Three strategic reasons:
>
> **1. Industry Momentum**
> - 73% of orgs using or planning to use OTel (EMA Research)
> - CNCF backing means long-term support
> - Major vendors all supporting it
>
> **2. Reduces Friction**
> - Customers hesitant to adopt Elastic if it means proprietary lock-in
> - OTel removes that barrier—instrument once, choose backend later
> - Elastic competes on quality of analysis, not lock-in
>
> **3. Differentiation Opportunity**
> - Data collection is commoditizing (everyone can do OTLP)
> - Real value is in search, correlation, AI/ML, and insights
> - Elastic's core competency (Elasticsearch) shines here
>
> It's similar to how AWS embraced Kubernetes instead of fighting it with ECS. Meet developers where they are, then win on execution and features."

---

## Key Technologies to Mention

When discussing your background, connect to these Elastic + OTel technologies:

| Your IAP Experience | Elastic + OTel Equivalent |
|---------------------|---------------------------|
| Rust microservices | EDOT Rust SDK |
| Golang microservices | EDOT Go SDK |
| Kafka event streaming | OTel Collector receivers |
| MongoDB for events | Elasticsearch for traces |
| Prometheus metrics | OTel metrics + Elastic |
| Grafana dashboards | Kibana APM UI |
| Custom Kafka lag metrics | Custom OTel metrics |
| Kubernetes deployments | EDOT Operator for K8s |
| Terraform infrastructure | Elastic Cloud APIs |

---

## Questions YOU Should Ask

### Technical Questions:

1. **"What's the typical data volume ratio between OTel traces and traditional Prometheus metrics? How does Elastic help customers manage that increase?"**
   - Shows understanding of scale challenges

2. **"How does the managed OTLP endpoint handle backpressure when ingestion spikes? Is there queuing, or do you rely on the OTel SDK's retry logic?"**
   - Deep technical question about reliability

3. **"For the EDOT distributions, how do you balance staying close to upstream OpenTelemetry vs. adding Elastic-specific optimizations?"**
   - Shows understanding of open source dynamics

4. **"What's the migration story for customers using Elastic APM agents today? Is there tooling to help identify which services to migrate first?"**
   - Practical customer-focused question

5. **"How does Elastic handle the semantic conventions evolution in OTel? When conventions change, how do you ensure backward compatibility?"**
   - Shows forward thinking

### Product/Strategy Questions:

6. **"What percentage of new Elastic observability customers choose OTel vs. Elastic APM agents? What's driving that decision?"**
   - Business insight question

7. **"How does the observability team contribute back to upstream OpenTelemetry? Are there specific areas where Elastic is leading development?"**
   - Open source contribution angle

8. **"With the ECS-OTel convergence, what's the timeline for full integration? How will it affect existing ECS users?"**
   - Strategic roadmap question

9. **"How do you see the competitive landscape evolving as all vendors support OpenTelemetry? What's Elastic's moat?"**
   - Competitive positioning (shows business acumen)

### Team/Culture Questions:

10. **"What's the team's experience level with OpenTelemetry? Is there a mix of OTel experts and Elastic APM veterans?"**
    - Understand team dynamics

11. **"How does the observability team collaborate with the Elasticsearch core team, especially for performance optimizations for trace data?"**
    - Cross-team collaboration

12. **"What's the biggest technical debt or challenge the team is currently tackling related to OpenTelemetry?"**
    - Real work challenges

---

## Final Talking Point: Why You're Excited

**Closing statement for interview:**

> "What excites me about Elastic's OpenTelemetry strategy is that it aligns technical excellence with the right principles. You're embracing open standards, contributing to the broader ecosystem, and competing where it matters—on search, analysis, and AI/ML capabilities.
>
> In building IAP, I saw firsthand how observability challenges scale with system complexity. We had metrics, we had logs, but we lacked the correlation and context that distributed tracing provides. Elastic + OpenTelemetry solves exactly that problem, and does it with an architecture that respects customer choice and avoids vendor lock-in.
>
> I want to work on infrastructure that becomes the foundation for thousands of engineering teams. Elastic Observability powered by OpenTelemetry is exactly that—and I'd love to contribute to making it the best backend for OTel data in the industry."

---

## Study Checklist Before Interview

- [ ] Read Elastic's OpenTelemetry documentation
- [ ] Review the managed OTLP endpoint announcement (Oct 2025)
- [ ] Understand EDOT components (Java, Python, Collector, Operator)
- [ ] Know the three integration paths (Managed OTLP, EDOT, Hybrid)
- [ ] Review ECS-OTel convergence announcement
- [ ] Prepare 2-3 stories about IAP observability challenges
- [ ] Think about how OTel would improve IAP debugging
- [ ] Review OpenTelemetry semantic conventions basics
- [ ] Understand tail-based sampling concept
- [ ] Review Elasticsearch basics (indices, shards, queries)

**Most important:** Connect everything back to your IAP experience with concrete examples!