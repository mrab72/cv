# Rust Atomic Variables - Complete Guide

## Table of Contents
1. [Introduction](#introduction)
2. [What Are Atomic Variables?](#what-are-atomic-variables)
3. [Available Atomic Types](#available-atomic-types)
4. [Basic Operations](#basic-operations)
5. [Memory Ordering](#memory-ordering)
6. [Practical Examples](#practical-examples)
7. [Performance Considerations](#performance-considerations)
8. [When to Use Atomics](#when-to-use-atomics)

## Introduction

Atomic variables in Rust provide thread-safe operations without requiring locks. They're part of the `std::sync::atomic` module and are essential for writing correct concurrent code.

## What Are Atomic Variables?

Atomic operations are **indivisible** - they complete entirely or not at all. No other thread can observe a partially completed atomic operation. This prevents race conditions when multiple threads access shared data.

**Key Properties:**
- Lock-free (no mutex overhead)
- Guaranteed to be atomic (all-or-nothing)
- Provide memory ordering guarantees
- Implemented using CPU atomic instructions

## Available Atomic Types

Rust provides these atomic types in `std::sync::atomic`:

| Type | Description | Size |
|------|-------------|------|
| `AtomicBool` | Atomic boolean | 1 byte |
| `AtomicI8`, `AtomicU8` | 8-bit integers | 1 byte |
| `AtomicI16`, `AtomicU16` | 16-bit integers | 2 bytes |
| `AtomicI32`, `AtomicU32` | 32-bit integers | 4 bytes |
| `AtomicI64`, `AtomicU64` | 64-bit integers | 8 bytes |
| `AtomicIsize`, `AtomicUsize` | Pointer-sized integers | Platform-dependent |
| `AtomicPtr<T>` | Raw pointer | Pointer size |

## Basic Operations

### Creating and Using Atomics

```rust
use std::sync::atomic::{AtomicU32, AtomicBool, Ordering};

// Create new atomic
let counter = AtomicU32::new(0);
let flag = AtomicBool::new(false);

// Load (read) a value
let value = counter.load(Ordering::SeqCst);

// Store (write) a value
counter.store(42, Ordering::SeqCst);

// Swap: replace value and return old value
let old = counter.swap(100, Ordering::SeqCst);

// Compare and swap
let result = counter.compare_exchange(
    100,                    // expected current value
    200,                    // new value to set
    Ordering::SeqCst,       // success ordering
    Ordering::SeqCst        // failure ordering
);

// Fetch and modify operations
counter.fetch_add(1, Ordering::SeqCst);    // returns old value
counter.fetch_sub(1, Ordering::SeqCst);
counter.fetch_and(0xFF, Ordering::SeqCst); // bitwise AND
counter.fetch_or(0x10, Ordering::SeqCst);  // bitwise OR
counter.fetch_xor(0x0F, Ordering::SeqCst); // bitwise XOR
```

## Memory Ordering

Memory ordering controls how operations can be reordered by the compiler and CPU. This is critical for correct synchronization between threads.

### Ordering Types

#### 1. Relaxed - Minimum Guarantees

```rust
use std::sync::atomic::{AtomicU32, Ordering};

let counter = AtomicU32::new(0);

// Only atomicity guaranteed, no synchronization
counter.fetch_add(1, Ordering::Relaxed);
let value = counter.load(Ordering::Relaxed);
```

**Guarantees:**
- Operation is atomic
- No ordering guarantees with other operations

**Use when:**
- Independent operations (e.g., statistics counters)
- You only need atomicity, not synchronization

#### 2. Acquire - For Loads

```rust
use std::sync::atomic::{AtomicBool, Ordering};

let ready = AtomicBool::new(false);

// Acquire load: all subsequent operations stay after this
if ready.load(Ordering::Acquire) {
    // Safe to access shared data here
}
```

**Guarantees:**
- Prevents later reads/writes from moving before this operation
- Synchronizes with Release stores
- Creates a "happens-before" relationship

**Use when:**
- Reading a flag or lock status
- Pairing with a Release store

#### 3. Release - For Stores

```rust
use std::sync::atomic::{AtomicBool, Ordering};

let ready = AtomicBool::new(false);

// Do some work...
// Release store: all previous operations stay before this
ready.store(true, Ordering::Release);
```

**Guarantees:**
- Prevents earlier reads/writes from moving after this operation
- Synchronizes with Acquire loads
- Makes all prior writes visible to acquiring threads

**Use when:**
- Publishing data to other threads
- Releasing a lock
- Pairing with an Acquire load

#### 4. SeqCst - Sequential Consistency

```rust
use std::sync::atomic::{AtomicU32, Ordering};

let counter = AtomicU32::new(0);

// Strongest ordering: Acquire + Release + total order
counter.store(42, Ordering::SeqCst);
let value = counter.load(Ordering::SeqCst);
```

**Guarantees:**
- All Acquire and Release guarantees
- Establishes a single total order across ALL threads
- Most intuitive but potentially slowest

**Use when:**
- You need strong consistency guarantees
- When unsure (safest default)
- Total ordering matters

### Acquire-Release Pairing Example

```rust
use std::sync::atomic::{AtomicU32, AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;

let data = Arc::new(AtomicU32::new(0));
let ready = Arc::new(AtomicBool::new(false));

let data_clone = Arc::clone(&data);
let ready_clone = Arc::clone(&ready);

// Writer thread
let writer = thread::spawn(move || {
    // Write data
    data_clone.store(42, Ordering::Relaxed);
    
    // Release: makes data write visible
    ready_clone.store(true, Ordering::Release);
});

// Reader thread
let reader = thread::spawn(move || {
    // Acquire: synchronizes with Release
    while !ready.load(Ordering::Acquire) {
        std::hint::spin_loop();
    }
    
    // Guaranteed to see 42
    assert_eq!(data.load(Ordering::Relaxed), 42);
});

writer.join().unwrap();
reader.join().unwrap();
```

## Practical Examples

### Example 1: Thread-Safe Counter

```rust
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::thread;

fn main() {
    let counter = Arc::new(AtomicUsize::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter_clone = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            for _ in 0..1000 {
                counter_clone.fetch_add(1, Ordering::Relaxed);
            }
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Final count: {}", counter.load(Ordering::Relaxed));
    // Output: Final count: 10000
}
```

### Example 2: Spin Lock

```rust
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;

struct SpinLock {
    locked: AtomicBool,
}

impl SpinLock {
    fn new() -> Self {
        SpinLock {
            locked: AtomicBool::new(false),
        }
    }

    fn lock(&self) {
        while self.locked.compare_exchange(
            false,
            true,
            Ordering::Acquire,
            Ordering::Relaxed
        ).is_err() {
            // Spin
            std::hint::spin_loop();
        }
    }

    fn unlock(&self) {
        self.locked.store(false, Ordering::Release);
    }
}

fn main() {
    let lock = Arc::new(SpinLock::new());
    let mut handles = vec![];

    for i in 0..5 {
        let lock_clone = Arc::clone(&lock);
        let handle = thread::spawn(move || {
            lock_clone.lock();
            println!("Thread {} acquired lock", i);
            // Critical section
            thread::sleep(std::time::Duration::from_millis(100));
            lock_clone.unlock();
            println!("Thread {} released lock", i);
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }
}
```

### Example 3: Producer-Consumer with Atomics

```rust
use std::sync::atomic::{AtomicU32, AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

struct Message {
    data: AtomicU32,
    ready: AtomicBool,
}

fn main() {
    let message = Arc::new(Message {
        data: AtomicU32::new(0),
        ready: AtomicBool::new(false),
    });

    let msg_clone = Arc::clone(&message);

    // Producer
    let producer = thread::spawn(move || {
        println!("Producer: Preparing message...");
        thread::sleep(Duration::from_millis(100));
        
        msg_clone.data.store(12345, Ordering::Relaxed);
        msg_clone.ready.store(true, Ordering::Release);
        
        println!("Producer: Message sent!");
    });

    // Consumer
    let consumer = thread::spawn(move || {
        println!("Consumer: Waiting for message...");
        
        while !message.ready.load(Ordering::Acquire) {
            thread::sleep(Duration::from_millis(10));
        }
        
        let value = message.data.load(Ordering::Relaxed);
        println!("Consumer: Received {}", value);
    });

    producer.join().unwrap();
    consumer.join().unwrap();
}
```

### Example 4: Atomic State Machine

```rust
use std::sync::atomic::{AtomicU8, Ordering};
use std::sync::Arc;
use std::thread;

#[repr(u8)]
#[derive(Clone, Copy, PartialEq, Debug)]
enum State {
    Idle = 0,
    Processing = 1,
    Done = 2,
}

struct StateMachine {
    state: AtomicU8,
}

impl StateMachine {
    fn new() -> Self {
        StateMachine {
            state: AtomicU8::new(State::Idle as u8),
        }
    }

    fn transition(&self, from: State, to: State) -> bool {
        self.state.compare_exchange(
            from as u8,
            to as u8,
            Ordering::SeqCst,
            Ordering::SeqCst
        ).is_ok()
    }

    fn get_state(&self) -> State {
        match self.state.load(Ordering::SeqCst) {
            0 => State::Idle,
            1 => State::Processing,
            2 => State::Done,
            _ => panic!("Invalid state"),
        }
    }
}

fn main() {
    let machine = Arc::new(StateMachine::new());
    let machine_clone = Arc::clone(&machine);

    let worker = thread::spawn(move || {
        if machine_clone.transition(State::Idle, State::Processing) {
            println!("Started processing");
            thread::sleep(std::time::Duration::from_millis(100));
            machine_clone.transition(State::Processing, State::Done);
            println!("Finished processing");
        }
    });

    worker.join().unwrap();
    println!("Final state: {:?}", machine.get_state());
}
```

## Performance Considerations

### Ordering Performance (Fastest to Slowest)

1. **Relaxed** - Fastest, minimal overhead
2. **Acquire/Release** - Moderate overhead, one-way barriers
3. **SeqCst** - Slowest, full memory barriers

### Guidelines

- Start with `SeqCst` for correctness
- Profile and optimize to weaker orderings if needed
- Use `Relaxed` for independent counters/statistics
- Use `Acquire/Release` for most synchronization patterns

### Memory Contention

Avoid false sharing by padding atomic variables:

```rust
use std::sync::atomic::AtomicU64;

// Bad: packed together, false sharing
struct BadCounter {
    a: AtomicU64,
    b: AtomicU64,
}

// Good: cache-line aligned
#[repr(align(64))]
struct GoodCounter {
    value: AtomicU64,
}
```

## When to Use Atomics

### ✅ Good Use Cases

- Simple flags, counters, or state
- Lock-free data structures
- Performance-critical code where locks are too expensive
- Reference counting (though `Arc` handles this for you)
- Progress tracking across threads

### ❌ Not Ideal For

- Complex multi-value operations
- Protecting large data structures (use `Mutex` instead)
- When operations need to be grouped atomically
- Floating-point operations (limited support)

### Atomics vs Mutex

```rust
// Use Atomics for simple values
use std::sync::atomic::{AtomicBool, Ordering};
let flag = AtomicBool::new(false);
flag.store(true, Ordering::SeqCst);

// Use Mutex for complex data
use std::sync::Mutex;
let data = Mutex::new(vec![1, 2, 3]);
data.lock().unwrap().push(4);
```

## Quick Reference

### Memory Ordering Cheat Sheet

| Ordering | Use For | Guarantees |
|----------|---------|------------|
| `Relaxed` | Independent operations | Atomicity only |
| `Acquire` | Reading locks/flags | No reordering after |
| `Release` | Writing locks/flags | No reordering before |
| `SeqCst` | Default/unsure | Total ordering |

### Common Patterns

```rust
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};

// Flag pattern
let flag = AtomicBool::new(false);
flag.store(true, Ordering::Release);  // writer
if flag.load(Ordering::Acquire) { }   // reader

// Counter pattern
let counter = AtomicU32::new(0);
counter.fetch_add(1, Ordering::Relaxed);

// Lock pattern
let locked = AtomicBool::new(false);
while locked.compare_exchange(false, true, Ordering::Acquire, Ordering::Relaxed).is_err() {
    std::hint::spin_loop();
}
// critical section
locked.store(false, Ordering::Release);
```

## Further Reading

- [Rust Atomics and Locks book](https://marabos.nl/atomics/) by Mara Bos
- [std::sync::atomic documentation](https://doc.rust-lang.org/std/sync/atomic/)
- [The Rustonomicon - Atomics](https://doc.rust-lang.org/nomicon/atomics.html)

---

**Remember:** When in doubt, use `SeqCst`. Correctness first, optimize later!