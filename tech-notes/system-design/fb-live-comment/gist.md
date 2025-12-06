---
title: "FB Live Comments"
description: "Design a system for real-time comments on Facebook Live videos"
---

# FB Live Comments System Design - Complete Gist

## Overview
Design a system where viewers can post and see comments on Facebook Live videos in near real-time, supporting millions of concurrent videos and thousands of comments per second per video.

---

## Functional Requirements

### Core
- Viewers can post comments on live video feeds
- Viewers see new comments in real-time while watching
- Viewers can see comment history from before they joined

### Out of Scope
- Replying to comments
- Reacting to comments

---

## Non-Functional Requirements

### Core
- **Scale**: Millions of concurrent videos, thousands of comments/second per video
- **Consistency**: Eventual consistency (prioritize availability)
- **Latency**: <200ms end-to-end under typical conditions

### Out of Scope
- Security/authorization
- Content moderation (spam, hate speech)

---

## Core Entities

1. **User** - Viewer or broadcaster
2. **Live Video** - The broadcast being watched
3. **Comment** - Message posted by user on a live video

---

## API Design

### Create Comment
```http
POST /comments/:liveVideoId
Header: JWT | SessionToken
Body: {
    "message": "Cool video!"
}
```

**Note**: userId comes from JWT/session token in header, not request body (security best practice)

### Get Comments (with pagination)
```http
GET /comments/:liveVideoId?cursor={last_comment_id}&pageSize=10&sort=desc
```

Uses **cursor-based pagination** (better than offset for real-time data):
- More efficient (no scanning through preceding rows)
- Stable (new comments don't disrupt position)
- Works well with DynamoDB's LastEvaluatedKey
- Scales better with growing comment volume

---

## High-Level Architecture

### Basic Flow (Comment Creation)

```
Commenter Client 
    ↓ (POST request)
Comment Management Service
    ↓ (store)
Comments Database (DynamoDB)
```

**Why DynamoDB?**
- Fast, scalable, highly available
- Simple data model (no complex relationships needed)
- Good fit for high-volume writes

---

## Real-Time Comment Distribution

### Evolution of Solution

#### ❌ Attempt 1: Polling
- Client polls `GET /comments/:liveVideoId?since={last_comment_id}` every few seconds
- **Problems**: 
  - Doesn't scale
  - Many unnecessary requests
  - Can't achieve <200ms latency
  - Heavy database load

#### ✅ Solution: Server-Sent Events (SSE)
- **Push model** - server pushes comments to clients as they arrive
- One-way communication (server → client)
- Efficient for this use case

**SSE vs WebSockets**
| Feature | SSE | WebSockets |
|---------|-----|------------|
| Direction | One-way (server→client) | Two-way |
| Protocol | HTTP | Custom protocol |
| Complexity | Simpler | More complex |
| Reconnection | Automatic | Manual handling |
| Use Case | Perfect for comment streams | Better for chat/gaming |

---

## Scaling Challenge: Horizontal Distribution

### The Problem
```
UserA → Server 1 ←→ Watching Video 1
UserB → Server 2 ←→ Watching Video 1

When comment posted to Server 1:
✅ UserA sees it (directly connected)
❌ UserB doesn't see it (different server)
```

### Solution: Pub/Sub Pattern with Redis

```
User posts comment
    ↓
Comment Management Service
    ↓ (1) Save to DB
    ↓ (2) Publish to channel
Redis Pub/Sub (channel: video_123)
    ↓ (broadcast)
All Comment Servers (subscribed to video_123)
    ↓ (push via SSE)
All Viewers watching Video 1
```

#### Flow Details
1. Comment posted → saved to Comments Database
2. Comment Service publishes to Redis Pub/Sub channel for that video (e.g., `video_123`)
3. All Comment Servers subscribe to relevant video channels
4. Servers receive published comment
5. Each server pushes comment via SSE to connected viewers

#### Why Redis Pub/Sub?
- **Low latency** (~ms range)
- Simple to implement
- Good for real-time use cases

#### Tradeoffs to Consider

| System | Pros | Cons |
|--------|------|------|
| **Redis Pub/Sub** | Low latency, simple | No persistence (fire-and-forget), data loss risk, memory limitations |
| **Kafka** | Message persistence, exactly-once delivery, durable | Higher latency, complex for dynamic subscriptions |

**For this use case**: Redis Pub/Sub is preferred due to low latency requirement. Missing a comment during brief disconnect is acceptable for live comments.

---

## Alternative Scaling Approach: Dispatcher Service

Instead of Pub/Sub, use a dedicated dispatcher:

```
Comment posted → Comment Service → Dispatcher Service
                                         ↓
                    Query viewer connections for video
                                         ↓
                    Route to appropriate servers
                                         ↓
                            Push to viewers via SSE
```

**Comparison**:
- **Pub/Sub**: Simpler, fewer corner cases, decoupled
- **Dispatcher**: More control, but more complex, single point of management

**Recommended**: Pub/Sub approach (simpler, more scalable)

---

## Key Design Decisions Summary

### Technology Choices
1. **Database**: DynamoDB (fast, scalable, simple data model)
2. **Real-time**: Server-Sent Events (one-way push, simpler than WebSockets)
3. **Distribution**: Redis Pub/Sub (low latency, good for ephemeral data)
4. **Pagination**: Cursor-based (stable, efficient for real-time)

### Architecture Patterns
- **Push over Pull** (SSE vs polling)
- **Horizontal scaling** via Pub/Sub
- **Eventual consistency** (availability > consistency)
- **Session-based auth** (JWT/tokens in headers)

### Scalability Features
- Multiple Comment Servers with SSE connections
- Redis Pub/Sub for cross-server communication
- DynamoDB for high-volume writes
- Cursor pagination for efficient history loading

---

## Key Insights

### Real-Time Systems
- **200ms threshold**: Human perception of "instantaneous" interaction
- **Push > Poll**: For real-time requirements, always prefer push models
- **Horizontal scaling**: Essential for millions of users, requires coordination mechanism

### Pagination Best Practices
- **Cursor-based** for real-time/infinite scroll
- **Offset-based** for static datasets with page numbers
- Always consider data stability when choosing approach

### Distributed Systems
- **Pub/Sub pattern**: Core solution for broadcasting to multiple servers
- **Eventual consistency**: Acceptable tradeoff for social features
- **Server capacity**: Modern servers can handle 100k+ concurrent connections

---


## Summary Architecture Diagram

```
┌─────────────────┐
│ Commenter Client│
└────────┬────────┘
         │ POST /comments
         ↓
┌─────────────────────────┐
│ Comment Management      │
│ Service                 │
└──┬──────────────────┬───┘
   │                  │
   │ (1) Save        │ (2) Publish
   ↓                  ↓
┌──────────┐    ┌─────────────┐
│ Comments │    │ Redis       │
│ Database │    │ Pub/Sub     │
│(DynamoDB)│    │(video_123)  │
└──────────┘    └──────┬──────┘
                       │ broadcast
              ┌────────┼────────┐
              ↓        ↓        ↓
         ┌────────┬────────┬────────┐
         │Server 1│Server 2│Server N│
         └───┬────┴───┬────┴───┬────┘
             │ SSE    │ SSE    │ SSE
             ↓        ↓        ↓
         ┌─────┐  ┌─────┐  ┌─────┐
         │User │  │User │  │User │
         │  A  │  │  B  │  │  C  │
         └─────┘  └─────┘  └─────┘
```
