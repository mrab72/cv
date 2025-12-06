---
title: "Rate Limiter"
description: "System design for request rate limiting with token bucket algorithm"
---

# Rate Limiter System Design - Quick Reference

**[🎮 Try the Interactive Token Bucket Demo →](/demos/token-bucket)**

## Core Problem
Control request rates to prevent abuse and protect servers. Target: 1M req/sec, 100M users, <10ms latency.

---

## Key Design Decisions

### 1. Placement
- **API Gateway** - centralized, no extra network hops

### 2. Client Identification
- User ID (authenticated)
- IP Address (anonymous)
- API Key (developers)
- Layer multiple rules, enforce most restrictive

### 3. Algorithm Choice: Token Bucket ✓
- **Fixed Window**: Simple hash table, but boundary burst issues
- **Sliding Window Log**: Perfect accuracy, high memory cost
- **Sliding Window Counter**: Approximation using weighted windows
- **Token Bucket**: Best balance - handles bursts + steady rate
  - Track: (tokens, last_refill_time) per client
  - Refill at constant rate, consume on request

### 4. Storage: Redis
- Centralized state across all gateways
- Operations: `HMGET` to fetch, `HSET` to update
- Use Lua scripts for atomic read-calculate-update (avoid race conditions)
- Auto-cleanup with `EXPIRE` command

### 5. Response on Limit Exceeded
- Return **HTTP 429** with headers:
  - `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Fail fast (don't queue)

---

## Scaling Challenges

### Redis Bottleneck (100k ops/sec limit)
- **Shard** by consistent hashing on client ID/IP/API key
- Use Redis Cluster for automatic sharding (16,384 hash slots)
- 10 shards → 1M req/sec capacity

### High Availability
- **Fail-closed**: Reject requests when Redis down (safer for traffic spikes)
- **Fail-open**: Allow requests when Redis down (keeps API available)
- Master-replica replication with automatic failover

### Latency Optimization
- Connection pooling (avoid TCP handshake overhead)
- Geographic distribution (deploy close to users)
- Pipeline operations, use Lua scripts

### Hot Keys (Viral Traffic)
- **Legitimate**: Client-side rate limiting, request batching, premium tiers
- **Abusive**: Auto-blocking after repeated violations, DDoS protection layer

### Dynamic Configuration
- **Pull-based**: Poll config DB every 30s (simple, eventual consistency)
- **Push-based**: ZooKeeper/Redis pub-sub for real-time updates (complex, immediate)

---

## Key Takeaways
- Token Bucket = best algorithm (memory efficient + handles bursts)
- Redis = centralized state with atomic Lua scripts
- Shard Redis by client identifier using consistent hashing
- Fail-closed for social platforms (protect backend during spikes)
- Connection pooling + geo distribution for low latency

## deep dive sample answers:


"High availability starts with preventing failures in the first place. I'll run Redis with replicas and automatic failover - either Redis Cluster or Redis Sentinel both work well for this. The cluster handles promoting replicas when masters fail, so we get automatic recovery. On the gateway side, we need proper timeouts and circuit breakers. If Redis is slow or unavailable, we can't let that hang our gateways. We need to decide on a failure mode: fail-open (allow all traffic) or fail-closed (block all traffic). For most cases, I'd choose fail-closed, especially for social media or viral content scenarios. If we fail-open during a traffic spike, we risk overwhelming our backend services, which could cause a cascading failure that's much worse than temporarily blocking requests. If we want to get fancy we could go with a hybrid circuit breaker approach. Instead of a binary fail-open or fail-closed, we can implement a degraded mode that allows a percentage of traffic based on recent patterns. For example, if we know that Client A typically makes 100 requests per minute, and Redis fails, we can allow roughly that rate to continue through using local counters with short time windows."



"To minimize latency, we need to optimize every part of the path. First, I'll use persistent connection pools from our gateways to Redis - creating new connections for every request would add significant handshake overhead. Colocation is key. We want our gateways and Redis instances in the same data center, ideally the same rack, to keep network latency under a millisecond. Cross-region calls would add 50-100ms which is way too much. For the rate limiting logic itself, I'll implement everything as a single Lua script. This avoids multiple round trips to Redis - instead of separate GET, calculate, SET operations, we do it all atomically in one script execution. For global scale, we'll deploy regional clusters. A user in Asia hits the Asia cluster, Europe users hit the Europe cluster, etc. This means rate limits might not be perfectly consistent across regions - a user could potentially get 100 requests in Asia and another 100 in Europe - but the alternative is adding huge latency for cross-region synchronization. For most use cases, this eventual consistency is acceptable."