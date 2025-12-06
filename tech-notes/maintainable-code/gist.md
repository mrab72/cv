---
title: "Object-Oriented Design Interview Guide"
description: "Framework and examples for maintainable code design interviews"
---

# Object-Oriented Design Interview Guide

## 1. Clarify Requirements (2-3 minutes)

Ask questions to understand the scope:

    What are the core features needed? (e.g., for parking: check availability, park car, retrieve car, calculate fees?)
    What are the inputs and outputs?
    Any constraints? (parking lot size, vehicle types, time limits)
    What does "scalable" mean here? (thousands of spots? millions of transactions?)

2. Define Your Data Model (3-4 minutes)

Think about the entities and their relationships:

    What objects do you need? (ParkingLot, ParkingSpot, Vehicle, Ticket)
    What attributes does each have?
    What are the relationships between them?

3. Identify Core Operations

List the main functions your system needs:

    What actions will users take?
    What queries will the system need to handle?
    What state changes occur?

4. Start with Simple, Working Code

Write a basic version first:

    Focus on correctness before optimization
    Use clear variable names
    One responsibility per function
    Don't over-engineer initially

5. Design for Extension (SOLID Principles)

As you code, think:

    Single Responsibility: Each class/function does one thing
    Open/Closed: Can you add new vehicle types without modifying existing code?
    Interfaces: Define contracts for flexibility
    Dependency Injection: Pass dependencies rather than hardcoding

6. Consider Scalability & Maintainability

    Where might bottlenecks occur?
    What if requirements change? (new vehicle types, pricing strategies)
    How would you handle concurrency?
    What would you cache or index?

7. Communicate Throughout

    Explain your thought process aloud
    Mention trade-offs you're making
    Ask if you should prioritize certain aspects

The key is showing you can start simple, write clean code, and think ahead about how your design handles change and growth.

provide some example question and the points that I have to consider think about them

Here are some classic system design coding questions with key considerations for each:
1. Design a Parking Lot System

Key Considerations:

    Vehicle types: Motorcycle, car, truck - different spot sizes
    Extensibility: What if we add electric vehicle charging spots? Handicap spots?
    Spot allocation strategy: Closest to entrance? Random? Size-based?
    Pricing: Hourly? Different rates by vehicle type? Peak hours?
    Concurrency: Two cars trying to take the same spot simultaneously
    Data structures: How to quickly find available spots? HashMap? Priority queue?

Design patterns to consider: Strategy pattern (pricing), Factory pattern (vehicle creation), Observer pattern (spot availability notifications)
2. Design a Library Management System

Key Considerations:

    Entities: Book, Member, Librarian, BookItem (multiple copies), Reservation
    Business rules: Max books per member? Late fees? Reservation expiry?
    Search: By title, author, ISBN, category - how to make this efficient?
    State management: Book states (available, borrowed, reserved, lost)
    Extensibility: Digital books vs physical? Different membership tiers?
    Edge cases: What if a reserved book isn't picked up? Renewals while someone is waiting?

Design patterns to consider: State pattern (book status), Singleton (library catalog), Observer (reservation notifications)
3. Design a Vending Machine

Key Considerations:

    States: Idle, selecting product, payment processing, dispensing, out of service
    Payment: Cash, card, multiple denominations - change calculation
    Inventory: Track quantities, handle out-of-stock
    Transactions: Atomic operations - what if power fails mid-transaction?
    Refunds: User cancels, product stuck
    Extensibility: Adding new payment methods? Dynamic pricing?

Design patterns to consider: State pattern (machine states), Command pattern (user actions), Factory pattern (payment methods)
4. Design an Elevator System

Key Considerations:

    Algorithms: Which elevator to dispatch? SCAN, LOOK, or custom?
    Multiple elevators: Load balancing, avoiding all elevators going to same floor
    Direction optimization: Don't change direction if people waiting in current direction
    Priority: Emergency button, accessibility needs
    Concurrency: Multiple requests happening simultaneously
    Edge cases: Max capacity, door sensors, maintenance mode

Design patterns to consider: Strategy pattern (scheduling algorithms), Singleton (elevator controller), Observer (floor button notifications)
5. Design a Hotel Booking System

Key Considerations:

    Room types: Single, double, suite - different pricing
    Availability: Date range searches - efficient data structure?
    Booking states: Reserved, confirmed, checked-in, checked-out, cancelled
    Overbooking: Airlines do this - should hotels?
    Pricing: Seasonal rates, discounts, packages
    Concurrency: Two users booking the last room simultaneously
    Extensibility: Adding amenities, loyalty programs, group bookings?

Design patterns to consider: Strategy pattern (pricing), Factory pattern (room types), Builder pattern (booking with optional services)
6. Design a Rate Limiter

Key Considerations:

    Algorithm: Token bucket, leaky bucket, fixed window, sliding window?
    Granularity: Per user? Per IP? Per API endpoint?
    Distributed system: How to share state across servers?
    Storage: In-memory? Redis? What happens on restart?
    Configuration: Different limits for different tiers (free vs premium users)
    Performance: Must be very fast - can't slow down every request

Design patterns to consider: Singleton (rate limiter instance), Strategy pattern (different algorithms), Decorator pattern (adding rate limiting to existing APIs)
7. Design a Task Scheduler (like Cron)

Key Considerations:

    Task types: One-time, recurring (daily, weekly, custom intervals)
    Priority: Some tasks more important than others
    Dependencies: Task B can't start until Task A completes
    Failure handling: Retry logic, max attempts, exponential backoff
    Concurrency: How many tasks run simultaneously? Thread pool?
    Persistence: Tasks survive system restart?
    Data structures: Priority queue for next execution time?

Design patterns to consider: Command pattern (tasks), Observer pattern (task completion notifications), Strategy pattern (scheduling strategies)
General Thinking Framework for Any Question:

    Start simple: "Let me first design for a single-threaded, in-memory version"
    Enumerate edge cases: "What happens if...?"
    Identify extension points: "Where might requirements change?"
    Choose appropriate data structures: "Why HashMap over List here?"
    Explain trade-offs: "I'm choosing X over Y because..."
    Think about scale: "If we had 1M users instead of 100..."

The interviewer wants to see your thought process, not just the final code. Show you can balance simplicity with foresight!