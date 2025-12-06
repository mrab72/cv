---
title: "Observability: OpenTelemetry vs Prometheus/Grafana"
description: "Complete comparison of OpenTelemetry and Prometheus/Grafana observability stacks"
---

# OpenTelemetry vs Prometheus/Grafana Stack: Complete Comparison

## TL;DR - The Key Difference

| Aspect | Prometheus/Grafana | OpenTelemetry |
|--------|-------------------|---------------|
| **What it is** | Complete observability **stack/product** | **Standard/framework** for data collection |
| **Scope** | Storage + Visualization | Instrumentation + Collection + Transport |
| **Data signals** | Primarily **metrics** (some logs via Loki) | **Traces + Metrics + Logs** (unified) |
| **Architecture** | Pull-based (Prometheus scrapes) | Push-based (apps send to collector) |
| **Distributed tracing** | Limited (needs Jaeger/Tempo) | Built-in, first-class |
| **Vendor neutrality** | Specific tools | Send to ANY backend |

---

## Architecture Comparison

### Prometheus/Grafana Stack Architecture

```
┌─────────────────────────────────────────────────┐
│                 Your Services                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Service A│  │ Service B│  │ Service C│      │
│  │  :9090   │  │  :9091   │  │  :9092   │      │
│  └────↑─────┘  └────↑─────┘  └────↑─────┘      │
│       │             │             │              │
│  (exposes metrics endpoints)                     │
└───────┼─────────────┼─────────────┼──────────────┘
        │             │             │
        │  PULL (scrape every 15s)  │
        ↓             ↓             ↓
   ┌────────────────────────────────────┐
   │      Prometheus (Storage)          │
   │  - Scrapes /metrics endpoints      │
   │  - Stores time-series data         │
   │  - PromQL for queries              │
   └──────────────┬─────────────────────┘
                  │
                  ↓ (queries)
          ┌──────────────┐
          │   Grafana    │
          │ (Visualization)│
          └──────────────┘
```

**Key characteristics:**
- **Pull model**: Prometheus scrapes your services
- **Metrics-only**: Time-series data (counters, gauges, histograms)
- **No distributed tracing**: Can't track requests across services
- **Storage included**: Prometheus is both collector AND database
- **Static configuration**: Must configure which endpoints to scrape

### OpenTelemetry Architecture

```
┌─────────────────────────────────────────────────┐
│                 Your Services                    │
│  ┌────────────────────────────────────────┐     │
│  │ Service A + OTel SDK                   │     │
│  │  - Auto-captures HTTP, DB, etc.        │     │
│  │  - Generates trace spans               │     │
│  │  - Collects metrics                    │     │
│  │  - Captures structured logs            │     │
│  └────────────────┬───────────────────────┘     │
└───────────────────┼─────────────────────────────┘
                    │
                    │ PUSH (via OTLP)
                    ↓
        ┌──────────────────────────┐
        │  OTel Collector          │
        │  - Receives data         │
        │  - Processes/filters     │
        │  - Routes to backends    │
        └──────┬───────────────────┘
               │
               ├──→ Elastic (traces, metrics, logs)
               ├──→ Prometheus (metrics only)
               ├──→ Jaeger (traces only)
               └──→ Loki (logs only)
```

**Key characteristics:**
- **Push model**: Services send data to collector
- **All three signals**: Traces + Metrics + Logs (unified)
- **Distributed tracing**: Built-in with trace_id correlation
- **No storage**: OTel doesn't store, only collects and forwards
- **Dynamic discovery**: Services register themselves

---

## Detailed Architecture Breakdown

### Prometheus/Grafana Components

| Component | Purpose | What It Does |
|-----------|---------|--------------|
| **Prometheus** | Metrics storage & collection | - Scrapes `/metrics` endpoints<br>- Stores time-series data<br>- Provides PromQL query language<br>- Built-in alerting |
| **Grafana** | Visualization | - Dashboards<br>- Queries Prometheus<br>- Can query multiple data sources |
| **Optional: Loki** | Log aggregation | - Stores logs<br>- Like Prometheus but for logs |
| **Optional: Tempo** | Distributed tracing | - Stores traces<br>- Separate from Prometheus |

**What's missing:**
- ❌ No automatic distributed tracing
- ❌ No correlation between logs/metrics/traces
- ❌ Manual instrumentation for custom metrics
- ❌ No vendor flexibility

### OpenTelemetry Components

| Component | Purpose | What It Does |
|-----------|---------|--------------|
| **OTel SDKs** | Instrumentation | - Auto-instrument frameworks<br>- Capture traces, metrics, logs<br>- Add context (trace_id, span_id) |
| **OTel Collector** | Data pipeline | - Receives telemetry<br>- Transforms/samples<br>- Routes to ANY backend |
| **OTLP** | Protocol | - Wire format for telemetry<br>- Works over gRPC or HTTP |

**What's missing:**
- ❌ No storage (needs backend like Elastic)
- ❌ No visualization (needs UI like Kibana)
- ❌ No built-in querying

---

## Real-World Scenario: IAP System Debugging

### Current: Prometheus/Grafana (What You Have)

**Scenario**: A user reports that their choreography execution is slow (took 10 seconds instead of 1 second).

**Your debugging process:**

1. **Check Grafana dashboard** → See metrics:
   - Kafka consumer lag is high ✓
   - Execution service CPU is normal ✓
   - MongoDB queries per second is normal ✓

2. **Problem**: You know there's lag, but you can't see:
   - Which specific choreography is slow?
   - Which microservice in the chain caused the delay?
   - Was it the Router? Task Invoker? Knative?
   - What was the exact sequence of calls?

3. **Manual investigation needed**:
   - Check logs in MongoDB (by timestamp)
   - Correlate events manually by execution_id
   - Grep through logs to find the slow request
   - Guess which service was the bottleneck

4. **Time to resolution**: 30-60 minutes of manual correlation

### With OpenTelemetry + Elastic (What You Could Have)

**Same scenario**: User reports slow execution.

**Debugging with OTel:**

1. **Search in Kibana APM** for the slow request:
   - Find trace by execution_id or time range
   - See complete distributed trace:

```
Request Timeline (10 seconds total):
├─ API Gateway (50ms)
├─ Event Router (100ms)  
├─ Task Invoker (200ms)
└─ Knative Task Execution (9.65 seconds) ← BOTTLENECK!
     ├─ Database query (50ms)
     ├─ External API call (9.5 seconds) ← ROOT CAUSE!
     └─ Response processing (100ms)
```

2. **Automatic correlation**:
   - All logs, metrics, traces share the same `trace_id`
   - Click on the slow span → see related logs automatically
   - See exact error message from the Knative task
   - View CPU/memory metrics at that exact moment

3. **Root cause**: External API timeout (9.5s)
4. **Time to resolution**: 2-5 minutes with visual trace

### Side-by-Side Comparison

| Investigation Step | Prometheus/Grafana | OpenTelemetry + Elastic |
|-------------------|-------------------|------------------------|
| **Find slow request** | Manual log search | Search by trace_id |
| **Identify bottleneck** | Guess from metrics | Visual trace timeline |
| **See call sequence** | Not possible | Automatic span hierarchy |
| **Correlate logs** | Manual (grep by timestamp) | Automatic (by trace_id) |
| **Root cause** | Trial and error | Click through spans |

---

## The Data You Get

### Prometheus Metrics (What You Have Now)

```promql
# Metric: http_requests_total
http_requests_total{method="POST", endpoint="/api/execute", status="200"} 1247

# Metric: kafka_consumer_lag  
kafka_consumer_lag{topic="events", partition="0"} 1523

# Metric: execution_duration_seconds
execution_duration_seconds_bucket{le="1.0"} 850
execution_duration_seconds_bucket{le="5.0"} 1200
```

**What you know:**
- ✅ Total requests
- ✅ Average latency
- ✅ Error rate
- ❌ Can't track individual requests
- ❌ Can't see service-to-service calls
- ❌ No context about WHY something is slow

### OpenTelemetry Traces (What You'd Get)

```json
{
  "trace_id": "abc123def456",
  "spans": [
    {
      "span_id": "span-1",
      "name": "POST /api/execute",
      "service": "api-gateway",
      "duration_ms": 50,
      "attributes": {
        "http.method": "POST",
        "http.status_code": 200,
        "user_id": "user-789",
        "choreography_id": "choreo-456"
      }
    },
    {
      "span_id": "span-2",
      "parent_span_id": "span-1",
      "name": "route_event",
      "service": "event-router",
      "duration_ms": 100,
      "attributes": {
        "event_type": "disk_detached",
        "target_task": "remediate_disk"
      }
    },
    {
      "span_id": "span-3",
      "parent_span_id": "span-2",
      "name": "invoke_knative_task",
      "service": "task-invoker",
      "duration_ms": 9650,
      "attributes": {
        "task_name": "remediate_disk",
        "runtime": "python",
        "error": "upstream_timeout"
      }
    }
  ]
}
```

**What you know:**
- ✅ Complete request journey
- ✅ Exact timing per service
- ✅ Parent-child relationships
- ✅ Rich context (user_id, task_name, etc.)
- ✅ Error attribution to specific service
- ✅ Can drill down into any span

---

## Key Technical Differences

### Distributed Tracing

| Feature | Prometheus/Grafana | OpenTelemetry |
|---------|-------------------|---------------|
| **Track request across services** | ❌ No | ✅ Yes (automatic) |
| **See call hierarchy** | ❌ No | ✅ Yes (span tree) |
| **Measure per-service latency** | Only aggregate | Per-request detail |
| **Identify slow service** | Guess from dashboards | Visual waterfall |

**Example in IAP:**

- **Prometheus**: "Hmm, average latency is 2 seconds... which service is slow? Let me check each dashboard..."
- **OpenTelemetry**: "This specific request took 2 seconds. Event Router was 100ms, Task Invoker was 1.8s (slow!), Knative was 100ms."

### Data Correlation

**Prometheus/Grafana:**
```
Metrics (Prometheus) → [separate] ← Logs (Loki)
    ↓                                    ↓
 No connection!            No connection!
```
- You have to manually correlate by timestamp
- "At 14:23:45, CPU was 80%... let me search logs at that time..."

**OpenTelemetry:**
```
Trace (trace_id: abc123)
  ├─ Spans (timing)
  ├─ Logs (trace_id: abc123) ← Automatically linked!
  └─ Metrics (exemplars with trace_id: abc123) ← Automatically linked!
```
- Click on a slow trace → see all related logs
- Click on a log → see the full trace
- Click on a metric spike → see example traces

### Instrumentation

**Prometheus (Manual):**
```rust
// In your Rust code - manual instrumentation
use prometheus::{Counter, Histogram};

lazy_static! {
    static ref HTTP_COUNTER: Counter = 
        Counter::new("http_requests_total", "Total requests").unwrap();
    
    static ref LATENCY: Histogram = 
        Histogram::new("http_duration_seconds", "Request duration").unwrap();
}

fn handle_request() {
    let timer = LATENCY.start_timer();
    
    // Your code here
    
    HTTP_COUNTER.inc();
    timer.observe_duration();
}
```

**OpenTelemetry (Automatic):**
```rust
// In your Rust code - mostly automatic
use opentelemetry::trace::Tracer;

// That's it! OTel SDK auto-instruments:
// - HTTP requests/responses
// - Database queries
// - gRPC calls
// - And generates distributed traces automatically

// Only add custom spans when needed:
let span = tracer.start("custom_operation");
// Your code
span.end();
```

---

## When to Use What?

### Use Prometheus/Grafana When:

✅ You need simple metrics monitoring  
✅ You're only monitoring infrastructure (CPU, memory, disk)  
✅ You don't need distributed tracing  
✅ You want a simple, self-contained stack  
✅ You're already invested in Prometheus  
✅ Budget is very limited (all open-source)

### Use OpenTelemetry When:

✅ You have microservices architecture  
✅ You need to track requests across services  
✅ You want unified observability (traces + metrics + logs)  
✅ You want vendor flexibility  
✅ You need rich context and correlation  
✅ You're building for the future (industry standard)

### Best Approach (Hybrid):

Many companies do both:
```
OpenTelemetry → OTel Collector
                    ├─→ Elastic (traces + logs + metrics)
                    └─→ Prometheus (metrics only for K8s)
```

---

## Complete Stack Comparison

### Full Prometheus/Grafana Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│                                                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │ Service A │    │ Service B │    │ Service C │          │
│  │ (Python) │    │   (Go)   │    │  (Rust)  │          │
│  └─────┬────┘    └─────┬────┘    └─────┬────┘          │
│        │               │               │                 │
│   Expose /metrics endpoints                              │
└────────┼───────────────┼───────────────┼─────────────────┘
         │               │               │
         │ PULL (scrape every 15-60s)   │
         ↓               ↓               ↓
┌─────────────────────────────────────────────────────────┐
│              Prometheus Time-Series Database             │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Time Series Storage (Local Disk)               │   │
│  │  - Counters, Gauges, Histograms                 │   │
│  │  - 15 day default retention                      │   │
│  │  - PromQL query language                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Alertmanager (Optional)                        │   │
│  │  - Alert rules                                   │   │
│  │  - Notification routing                          │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ HTTP API queries
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    Grafana Dashboard                     │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │    │
│  │   Metrics   │  │    Logs     │  │   Alerts    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘

Separate stacks for different signals:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Prometheus  │  │     Loki     │  │ Jaeger/Tempo │
│   (Metrics)  │  │    (Logs)    │  │   (Traces)   │
└──────────────┘  └──────────────┘  └──────────────┘
       ↓                 ↓                  ↓
   No automatic correlation between them!
```

**Characteristics:**
- Each signal in separate system
- Manual correlation required
- Pull-based (Prometheus scrapes targets)
- Local storage (disk-based)
- Simple setup but limited correlation

### Full OpenTelemetry + Elastic Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Service A (Python + OTel SDK)                  │   │
│  │  - Auto-instruments Flask/Django/FastAPI         │   │
│  │  - Captures traces, metrics, logs                │   │
│  │  - Adds trace_id to all signals                  │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         │                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Service B (Go + OTel SDK)                      │   │
│  │  - Auto-instruments net/http, gRPC               │   │
│  │  - Propagates trace context                      │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         │                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Service C (Rust + OTel SDK)                    │   │
│  │  - Manual spans + auto HTTP/DB                   │   │
│  └──────────────────────┬──────────────────────────┘   │
└──────────────────────────┼──────────────────────────────┘
                           │
                           │ PUSH (OTLP over gRPC/HTTP)
                           ↓
┌─────────────────────────────────────────────────────────┐
│              OpenTelemetry Collector                     │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Receivers                                       │   │
│  │  - OTLP (gRPC, HTTP)                            │   │
│  │  - Prometheus (scrape compatibility)             │   │
│  │  - Jaeger, Zipkin (migration support)           │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Processors                                      │   │
│  │  - Batch (reduce network calls)                 │   │
│  │  - Sampling (reduce volume)                      │   │
│  │  - Filtering (drop unwanted data)               │   │
│  │  - Enrichment (add metadata)                     │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Exporters                                       │   │
│  │  - Elasticsearch (all signals)                   │   │
│  │  - Prometheus (metrics only)                     │   │
│  │  - Jaeger (traces only)                         │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Multiple protocols
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   Elastic Observability                  │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Elasticsearch (Unified Storage)                │   │
│  │                                                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │   │
│  │  │ Traces   │  │ Metrics  │  │  Logs    │     │   │
│  │  │ Index    │  │  Index   │  │  Index   │     │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘     │   │
│  │       └─────────────┴─────────────┘             │   │
│  │       All linked by trace_id!                    │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Kibana (Unified UI)                            │   │
│  │                                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐              │   │
│  │  │  APM View   │  │ Observability│              │   │
│  │  │  - Traces   │  │  Dashboard   │              │   │
│  │  │  - Spans    │  │  - Metrics   │              │   │
│  │  │  - Errors   │  │  - Logs      │              │   │
│  │  └─────────────┘  └─────────────┘              │   │
│  │                                                   │   │
│  │  Click trace → see logs → see metrics           │   │
│  │  Click log → see trace → see spans              │   │
│  │  Click metric → see example traces              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Machine Learning & AI                          │   │
│  │  - Anomaly detection                             │   │
│  │  - Latency correlations                          │   │
│  │  - Log spike analysis                            │   │
│  │  - Elastic AI Assistant                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

All signals unified and correlated automatically!
```

**Characteristics:**
- Single unified platform for all signals
- Automatic correlation via trace_id
- Push-based (apps send to collector)
- Distributed storage (Elasticsearch cluster)
- Complex but powerful correlation and analysis

---

## Architecture Decision Flow

```
Do you need distributed tracing?
│
├─ No → Can you live with aggregate metrics only?
│       │
│       ├─ Yes → Prometheus/Grafana
│       │        (Simple, cost-effective)
│       │
│       └─ No → Need per-request detail?
│               └─ Yes → Consider OpenTelemetry
│
└─ Yes → Do you have microservices?
         │
         ├─ Yes → OpenTelemetry + Elastic
         │        (Full observability)
         │
         └─ No → How many services?
                 │
                 ├─ 1-3 services → Prometheus + Tempo
                 │                  (Medium complexity)
                 │
                 └─ 4+ services → OpenTelemetry + Elastic
                                   (Scale & correlation)
```

---

## Summary: Complete Comparison Table

| Category | Prometheus/Grafana | OpenTelemetry + Elastic |
|----------|-------------------|------------------------|
| **Purpose** | Metrics monitoring | Full observability |
| **Signals** | Metrics (+ Loki for logs) | Traces + Metrics + Logs |
| **Tracing** | No (need Tempo/Jaeger) | Built-in distributed tracing |
| **Model** | Pull (scrape) | Push (send) |
| **Storage** | Included (Prometheus TSDB) | Separate (Elasticsearch) |
| **Correlation** | Manual | Automatic (trace_id) |
| **Instrumentation** | Mostly manual | Auto + manual |
| **Vendor lock-in** | Prometheus-specific | Send to any backend |
| **Best for** | Infrastructure metrics | Microservices debugging |
| **Cost** | Free (self-hosted) | Requires backend (Elastic Cloud or self-hosted) |
| **Learning curve** | Low | Medium-High |
| **Query language** | PromQL | ES\|QL + KQL |
| **Alerting** | Built-in (Alertmanager) | Via Elastic (Watcher) |
| **Data retention** | 15 days default (local) | Configurable (elastic) |
| **Scalability** | Single node limits | Distributed cluster |

---

## For Your Interview - Key Talking Points

### When discussing your IAP observability:

**Good framing:**
> "We used Prometheus and Grafana for IAP monitoring, which worked well for infrastructure metrics and basic alerting. We could track things like Kafka consumer lag, MongoDB query rates, and Kubernetes pod health.
>
> However, we faced challenges when debugging complex issues across our microservices. For example, if a choreography execution was slow, we'd see the symptom in aggregate metrics, but couldn't easily trace which specific service in the chain (Event Router → Task Invoker → Knative) was the bottleneck. We had to manually correlate logs by timestamp and execution_id.
>
> OpenTelemetry would solve this with built-in distributed tracing. We'd instrument once with OTel SDKs, get automatic trace propagation across services, and see the complete request flow with per-service timing. Plus, with the correlation between traces, logs, and metrics, debugging would be much faster.
>
> I see Elastic's OpenTelemetry strategy as the right direction—embrace OTel as the collection standard, and compete on the analysis layer with features like AI-driven anomaly detection and the powerful search capabilities of Elasticsearch."

### Questions You Should Ask:

1. **"For customers currently using Prometheus, what's Elastic's recommended migration path to OpenTelemetry? Can they run both during transition?"**

2. **"How does Elastic handle the data volume difference? Prometheus metrics are aggregated, but OTel traces are per-request. How do you manage cardinality and storage?"**

3. **"In your experience, what's the biggest 'aha moment' for teams switching from Prometheus to OpenTelemetry with Elastic?"**

4. **"Does the observability team work with the Prometheus remote write protocol, or are you pushing customers toward full OTel adoption?"**

---

**Bottom line**: Prometheus/Grafana is great for **"what happened"** (metrics), but OpenTelemetry + Elastic tells you **"why it happened"** (distributed traces with full context).