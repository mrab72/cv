# Send and Sync in Rust

A comprehensive guide to understanding Rust's `Send` and `Sync` traits for safe concurrency.

## The Simple Explanation

**Send**: "Can this type be safely **sent** to another thread?"
- If a type is `Send`, you can transfer ownership of it from one thread to another.

**Sync**: "Can this type be safely **shared** between threads?"
- If a type is `Sync`, multiple threads can have references to it simultaneously.

**Key relationship**: A type `T` is `Sync` if and only if `&T` (a reference to T) is `Send`.

## Visual Example 1: Send - Transferring Ownership

```
Thread A                    Thread B
--------                    --------
let data = vec![1,2,3]
    |
    | spawn(move || { ... })
    |
    +------ data ----------> now owns vec![1,2,3]
    
Thread A can no longer 
access 'data'
```

**Code example:**

```rust
use std::thread;

fn main() {
    let numbers = vec![1, 2, 3, 4, 5]; // Vec<i32> is Send
    
    let handle = thread::spawn(move || {
        // Ownership of 'numbers' moved here
        println!("Sum: {}", numbers.iter().sum::<i32>());
    });
    
    // numbers is no longer accessible here!
    // println!("{:?}", numbers); // ❌ Compile error
    
    handle.join().unwrap();
}
```

## Visual Example 2: Sync - Sharing References

```
        Arc<Mutex<Vec<i32>>>
              /    |    \
             /     |     \
        Thread A  Thread B  Thread C
         (read)   (write)   (read)
         
All threads can hold references
safely because Mutex ensures
only one accesses at a time
```

**Code example:**

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    // Arc<Mutex<T>> is both Send and Sync
    let data = Arc::new(Mutex::new(vec![1, 2, 3]));
    
    let mut handles = vec![];
    
    for i in 0..3 {
        let data_clone = Arc::clone(&data); // Clone the Arc, not the data
        
        let handle = thread::spawn(move || {
            let mut vec = data_clone.lock().unwrap();
            vec.push(i);
            println!("Thread {} added {}", i, i);
        });
        
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
    
    println!("Final data: {:?}", *data.lock().unwrap());
}
```

## What Types Are Send and Sync?

### Quick Reference Table

| Type | Send | Sync | Notes |
|------|------|------|-------|
| **Primitives** |
| `i32`, `u64`, `f64`, etc. | ✅ | ✅ | All primitive numeric types |
| `bool`, `char` | ✅ | ✅ | Simple value types |
| `()` (unit type) | ✅ | ✅ | Empty tuple |
| **Owned Types** |
| `String` | ✅ | ✅ | Owned string data |
| `Vec<T>` | ✅ (if T: Send) | ✅ (if T: Sync) | Owned vector |
| `Box<T>` | ✅ (if T: Send) | ✅ (if T: Sync) | Heap-allocated pointer |
| `HashMap<K, V>` | ✅ (if K,V: Send) | ✅ (if K,V: Sync) | Standard hash map |
| **References** |
| `&T` | ✅ (if T: Sync) | ✅ (if T: Sync) | Immutable reference |
| `&mut T` | ✅ (if T: Send) | ✅ (if T: Sync) | Mutable reference |
| **Smart Pointers (Single-threaded)** |
| `Rc<T>` | ❌ | ❌ | Not thread-safe! Use `Arc` instead |
| `Cell<T>` | ✅ (if T: Send) | ❌ | Interior mutability, not thread-safe |
| `RefCell<T>` | ✅ (if T: Send) | ❌ | Runtime borrow checking, not thread-safe |
| **Smart Pointers (Multi-threaded)** |
| `Arc<T>` | ✅ (if T: Send + Sync) | ✅ (if T: Send + Sync) | Atomic reference counting |
| `Mutex<T>` | ✅ (if T: Send) | ✅ (if T: Send) | Mutual exclusion lock |
| `RwLock<T>` | ✅ (if T: Send) | ✅ (if T: Send + Sync) | Read-write lock |
| `AtomicBool`, `AtomicI32`, etc. | ✅ | ✅ | Lock-free atomic types |
| **Channels** |
| `mpsc::Sender<T>` | ✅ (if T: Send) | ❌ | Multi-producer channel sender |
| `mpsc::Receiver<T>` | ✅ (if T: Send) | ❌ | Channel receiver |
| `mpsc::SyncSender<T>` | ✅ (if T: Send) | ❌ | Synchronous channel sender |
| **Raw Pointers** |
| `*const T` | ❌ | ❌ | Raw immutable pointer - unsafe |
| `*mut T` | ❌ | ❌ | Raw mutable pointer - unsafe |
| **Function Types** |
| `fn()` | ✅ | ✅ | Function pointer |
| `Fn()`, `FnMut()`, `FnOnce()` | Depends | Depends | Closures depend on captured vars |
| **Special Types** |
| `PhantomData<T>` | ✅ (if T: Send) | ✅ (if T: Sync) | Zero-sized type marker |
| `ManuallyDrop<T>` | ✅ (if T: Send) | ✅ (if T: Sync) | Prevents automatic drop |

### Categorized Summary

#### ✅ Send and Sync (safe to transfer AND share):
- Primitive types: `i32`, `f64`, `bool`, `char`
- `String`, `Vec<T>` (if T is Send)
- `Arc<T>` (if T is Sync)
- `Mutex<T>`, `RwLock<T>` (if T is Send)

#### ⚠️ Send but NOT Sync:
- `Cell<T>`, `RefCell<T>` - interior mutability without thread-safety
- `mpsc::Sender<T>` - can be sent to another thread but not shared

#### ❌ Neither Send nor Sync:
- `Rc<T>` - reference counted pointer, not thread-safe
- Raw pointers: `*const T`, `*mut T`

## Visual Example 3: Why Rc<T> is NOT Send

```
Thread A                    Thread B
--------                    --------
let rc = Rc::new(5)
count = 1
    |
    | If we could send Rc...
    |
    +------ rc ------------> Rc::clone()
                              count = ??
                              
❌ RACE CONDITION!
Both threads modifying the
reference count simultaneously
without synchronization
```

**This won't compile:**

```rust
use std::rc::Rc;
use std::thread;

fn main() {
    let rc = Rc::new(5);
    
    // ❌ Compile error: Rc<i32> cannot be sent between threads safely
    // thread::spawn(move || {
    //     println!("{}", *rc);
    // });
}
```

**Solution: Use Arc instead:**

```rust
use std::sync::Arc;
use std::thread;

fn main() {
    let arc = Arc::new(5); // Atomic reference counting
    
    let arc_clone = Arc::clone(&arc);
    
    let handle = thread::spawn(move || {
        println!("Value: {}", *arc_clone);
    });
    
    println!("Value: {}", *arc);
    handle.join().unwrap();
}
```

## Visual Example 4: RefCell is NOT Sync

```
Thread A                    Thread B
--------                    --------
let cell = RefCell::new(vec![1,2,3])
    |                           |
    | borrow_mut()              | borrow_mut()
    |                           |
    ❌ Runtime panic!
    
RefCell's borrow checking
happens at runtime, not
protected by locks
```

## Quick Decision Tree

```
Can I transfer this to another thread?
│
├─ Yes → Type is Send
│
└─ No → Type is NOT Send (e.g., Rc, raw pointers)


Can multiple threads hold references to this safely?
│
├─ Yes → Type is Sync
│
└─ No → Type is NOT Sync (e.g., Cell, RefCell)
```

## How Mutex Ensures Sync

### The Key Insight

`Mutex<T>` is `Sync` (even if `T` alone is NOT `Sync`) because the mutex **guarantees only one thread can access the data at a time**.

### Without Mutex - NOT SAFE ❌

```
        &mut Vec<i32>
          /        \
         /          \
    Thread A      Thread B
    vec.push(1)   vec.push(2)
         \          /
          ❌ DATA RACE!
```

### With Mutex - SAFE ✅

```
       Mutex<Vec<i32>>
            |
      [🔒 LOCK]
            |
          /   \
         /     \
    Thread A  Thread B
    trying... waiting...
        |         |
    lock()        |
    vec.push(1)   |
    unlock()      |
        |      lock()
        |    vec.push(2)
        |    unlock()
```

The mutex acts like a **bouncer at a club** - only one thread gets in at a time!

### Code Example: How Mutex Enables Sync

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    // Vec<i32> alone is NOT Sync (can't safely share &Vec between threads)
    // But Mutex<Vec<i32>> IS Sync!
    
    let data = Arc::new(Mutex::new(vec![]));
    let mut handles = vec![];
    
    for i in 0..5 {
        let data = Arc::clone(&data);
        
        let handle = thread::spawn(move || {
            // This lock() call does the magic:
            // 1. Waits if another thread has the lock
            // 2. Gives us exclusive access when available
            // 3. Automatically unlocks when guard is dropped
            let mut vec = data.lock().unwrap();
            vec.push(i);
            println!("Thread {} pushed {}", i, i);
        }); // Lock automatically released here!
        
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
    
    println!("Final: {:?}", *data.lock().unwrap());
}
```

### The Rules

**Mutex<T> is Sync if T is Send**

```rust
// ✅ Works - Vec<i32> is Send
Mutex<Vec<i32>>  // This is Sync!

// ✅ Works - String is Send  
Mutex<String>    // This is Sync!

// ❌ Won't work - Rc is NOT Send
Mutex<Rc<i32>>   // This is NOT Sync (and not useful)
```

## Mutex vs RwLock

Both make types `Sync`, but with different tradeoffs:

### Mutex - One at a Time

```
Time →
Thread A: [🔒========] (locked, reading/writing)
Thread B:         [waiting...] [🔒====]
Thread C:                  [waiting...] [🔒=]
```

**One thread at a time**, whether reading OR writing.

```rust
let data = Arc::new(Mutex::new(vec![1, 2, 3]));

// Only ONE thread can access at a time
let vec = data.lock().unwrap();
```

### RwLock - Multiple Readers, One Writer

```
Time →
Thread A: [📖========] (reading)
Thread B: [📖========] (reading) ← Can read simultaneously!
Thread C:         [waiting...] [🔒====] (writing - must wait)
```

**Multiple readers** OR **one writer**.

```rust
use std::sync::RwLock;

let data = Arc::new(RwLock::new(vec![1, 2, 3]));

// Multiple threads can read simultaneously
let vec1 = data.read().unwrap();
let vec2 = data.read().unwrap();  // ✅ OK!

// But only one can write
let mut vec = data.write().unwrap(); // Others must wait
```

## Common Misconception

**❌ Wrong thinking:** "Mutex makes my type Send"

**✅ Correct thinking:** "Mutex makes my type Sync (shareable) by controlling access"

```rust
// Mutex doesn't change Send-ness:
let mutex = Mutex::new(vec![1, 2, 3]);
// Vec<i32> was already Send
// Mutex<Vec<i32>> is ALSO Send

// What Mutex DOES do:
// It makes Mutex<Vec<i32>> Sync
// So you can share &Mutex<Vec<i32>> between threads safely
```

## The Complete Picture

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    //            ^^^                  
    //            Arc: Makes it shareable (cloneable references)
    //                     ^^^^^
    //                     Mutex: Makes it safe to share
    
    let mut handles = vec![];
    
    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
    
    println!("Result: {}", *counter.lock().unwrap()); // Always 10!
}
```

## Common Confusion: Send/Sync vs Ownership

### Question: Why is Vec Send/Sync when we can't access it after moving?

This confuses many Rust learners! Let me clarify:

**Send/Sync are about CAPABILITY, not about ownership rules.**

- `Vec<i32>` being `Send` means: "**IF** you have ownership, you **CAN** move it to another thread"
- It does NOT mean: "You can use it in multiple places at once"

### Breaking Down the Example

```rust
let numbers = vec![1, 2, 3, 4, 5]; // Vec<i32> is Send

let handle = thread::spawn(move || {
    // Ownership MOVED here
    println!("Sum: {}", numbers.iter().sum::<i32>());
});

// numbers no longer exists here!
```

**What's happening:**

1. `Vec<i32>` is `Send` ✅ → "You CAN transfer ownership to another thread"
2. The `move` keyword transfers ownership to the new thread
3. Main thread **no longer owns** `numbers` → can't access it

**This is working as intended!** The fact that you can't access it in the main thread is **Rust's ownership system**, not a Send/Sync issue.

### Send vs Sync Visualization

#### Send Example (Transfer Ownership)

```
Main Thread                 New Thread
-----------                 ----------
owns vec![1,2,3]
     |
     | move (Send allows this)
     |
     X (no longer owns it) ──> now owns vec![1,2,3]
     
Can't access anymore!        Can use it here!
```

**Vec is Send because**: It's safe to move it to another thread. Once moved, only the new thread owns it.

#### Sync Example (Share References)

```
Main Thread                 New Thread
-----------                 ----------
owns Arc<Mutex<Vec>>
     |                           |
     | Arc::clone                |
     |                           |
     +----- both have references --+
            to SAME data
            
Both can access it!          Both can access it!
(through Arc + Mutex)        (but one at a time due to Mutex)
```

**Vec is Sync because**: If you have `&Vec<i32>`, multiple threads can safely read from it simultaneously (as long as nobody is mutating).

### Why Vec<T> is Both Send and Sync

#### Vec<i32> is Send

```rust
// ✅ This works - transferring ownership
let numbers = vec![1, 2, 3];
thread::spawn(move || {
    println!("{:?}", numbers); // Owns it now
});
// Can't use numbers here anymore - THAT'S CORRECT!
```

#### Vec<i32> is Sync

```rust
// ✅ This works - sharing immutable references
use std::sync::Arc;

let numbers = Arc::new(vec![1, 2, 3]);
let numbers_clone = Arc::clone(&numbers);

thread::spawn(move || {
    println!("{:?}", numbers_clone); // Shares reference
});

println!("{:?}", numbers); // Still accessible!
```

### The Confusion Resolved

```rust
// Example 1: Using Send (moving ownership)
let vec = vec![1, 2, 3];
thread::spawn(move || {
    // vec moved here
});
// ❌ Can't use vec here - OWNERSHIP moved, not a Send/Sync issue!

// Example 2: Using Sync (sharing with Arc)
use std::sync::Arc;
let vec = Arc::new(vec![1, 2, 3]);
let vec_clone = Arc::clone(&vec);

thread::spawn(move || {
    // vec_clone moved here, but it's just a reference
    println!("{:?}", vec_clone);
});

// ✅ Can still use vec here! We didn't move the original Arc
println!("{:?}", vec);
```

### Key Distinction

- **Send** = "This type CAN be moved to another thread" (capability)
- **Sync** = "A reference to this type CAN be shared across threads" (capability)
- **Ownership** = Rust's rules about who owns what (enforcement)

`Vec<i32>` being `Send` doesn't mean you can use it in two places - it just means the compiler **allows** you to move it across threads. Once you move it, Rust's ownership rules (separate from Send/Sync) prevent you from using it in the original location.

## Arc and Sync: The Perfect Pair

### The Rule: Arc<T> requires T to be Send + Sync

```rust
Arc<T> is Send + Sync  ⟺  T is Send + Sync
```

**Why?**
- `Arc` lets you **share references** across threads
- To share `&T` across threads safely, `T` must be `Sync`
- To send the `Arc<T>` itself to another thread, `T` must be `Send`

### Visual Understanding

```
         Arc<Vec<i32>>
              |
      ┌───────┴───────┐
      |               |
   Thread A        Thread B
   &Vec<i32>       &Vec<i32>
   
Both threads have references to the SAME Vec
This only works because Vec<i32> is Sync!
```

### Examples: Arc with Different Types

#### ✅ Arc with Sync Types (Works!)

```rust
use std::sync::Arc;
use std::thread;

fn main() {
    // Vec<i32> is Sync - we can share it with Arc
    let data = Arc::new(vec![1, 2, 3, 4, 5]);
    
    let data1 = Arc::clone(&data);
    let data2 = Arc::clone(&data);
    
    let h1 = thread::spawn(move || {
        println!("Thread 1: {:?}", data1);
    });
    
    let h2 = thread::spawn(move || {
        println!("Thread 2: {:?}", data2);
    });
    
    // Original Arc still works!
    println!("Main: {:?}", data);
    
    h1.join().unwrap();
    h2.join().unwrap();
}
```

#### ❌ Arc with Non-Sync Types (Doesn't Compile!)

```rust
use std::sync::Arc;
use std::rc::Rc;
use std::thread;

fn main() {
    // Rc is NOT Sync!
    let data = Arc::new(Rc::new(5));
    
    let data_clone = Arc::clone(&data);
    
    // ❌ Compile error: `Rc<i32>` cannot be shared between threads safely
    // thread::spawn(move || {
    //     println!("{}", data_clone);
    // });
}
```

**Error message:**
```
error[E0277]: `Rc<i32>` cannot be shared between threads safely
   --> src/main.rs
    |
    | thread::spawn(move || {
    | ^^^^^^^^^^^^^ `Rc<i32>` cannot be shared between threads safely
    |
    = help: the trait `Sync` is not implemented for `Rc<i32>`
```

### Arc with Non-Sync Types: Use Mutex!

If you have a type that's NOT `Sync`, wrap it in `Mutex` first:

```rust
use std::sync::{Arc, Mutex};
use std::cell::RefCell;
use std::thread;

fn main() {
    // RefCell is NOT Sync, but Mutex<RefCell> IS!
    let data = Arc::new(Mutex::new(RefCell::new(vec![1, 2, 3])));
    
    let data1 = Arc::clone(&data);
    let data2 = Arc::clone(&data);
    
    let h1 = thread::spawn(move || {
        let cell = data1.lock().unwrap();
        cell.borrow_mut().push(10);
        println!("Thread 1 done");
    });
    
    let h2 = thread::spawn(move || {
        let cell = data2.lock().unwrap();
        cell.borrow_mut().push(20);
        println!("Thread 2 done");
    });
    
    h1.join().unwrap();
    h2.join().unwrap();
    
    println!("Final: {:?}", data.lock().unwrap().borrow());
}
```

### Common Arc Patterns

#### Pattern 1: Arc<T> for Immutable Sharing

```rust
use std::sync::Arc;
use std::thread;

// Share read-only data
let config = Arc::new(vec![1, 2, 3, 4, 5]);

// All threads can read
for i in 0..3 {
    let config = Arc::clone(&config);
    thread::spawn(move || {
        println!("Thread {}: sum = {}", i, config.iter().sum::<i32>());
    });
}
```

#### Pattern 2: Arc<Mutex<T>> for Mutable Sharing

```rust
use std::sync::{Arc, Mutex};
use std::thread;

// Share mutable data
let counter = Arc::new(Mutex::new(0));

let mut handles = vec![];
for _ in 0..10 {
    let counter = Arc::clone(&counter);
    let handle = thread::spawn(move || {
        let mut num = counter.lock().unwrap();
        *num += 1;
    });
    handles.push(handle);
}

for handle in handles {
    handle.join().unwrap();
}

println!("Result: {}", *counter.lock().unwrap());
```

#### Pattern 3: Arc<RwLock<T>> for Read-Heavy Workloads

```rust
use std::sync::{Arc, RwLock};
use std::thread;

// Many readers, few writers
let data = Arc::new(RwLock::new(vec![1, 2, 3]));

let mut handles = vec![];

// Reader threads
for i in 0..5 {
    let data = Arc::clone(&data);
    let handle = thread::spawn(move || {
        let vec = data.read().unwrap();
        println!("Reader {}: {:?}", i, *vec);
    });
    handles.push(handle);
}

// Writer thread
let data_clone = Arc::clone(&data);
let handle = thread::spawn(move || {
    let mut vec = data_clone.write().unwrap();
    vec.push(999);
    println!("Writer done");
});
handles.push(handle);

for handle in handles {
    handle.join().unwrap();
}
```

### Why Does Arc Need Sync?

Think about what `Arc` does:

```
Main Thread creates Arc<Vec<i32>>
    |
    | Arc::clone() - creates new reference
    |
Thread A gets Arc         Thread B gets Arc
    |                          |
    v                          v
Both have &Vec<i32> to the SAME vector

If Vec wasn't Sync, having &Vec in multiple threads
would be unsafe! That's why Arc<T> requires T: Sync
```

### Decision Tree: Should I Use Arc?

```
Do I need to share data across threads?
│
├─ No → Just use Box<T> or plain ownership
│
└─ Yes → Do I need to mutate it?
    │
    ├─ No (read-only) → Arc<T>
    │   └─ Is T: Sync? 
    │       ├─ Yes → ✅ Arc<T> works!
    │       └─ No → ❌ Need to make it Sync first (use Mutex)
    │
    └─ Yes (need mutation) → Do I have mostly reads or writes?
        │
        ├─ Mostly writes → Arc<Mutex<T>>
        └─ Mostly reads → Arc<RwLock<T>>
```

### Arc Key Takeaway

**Arc is specifically for Sync types!**

- If `T` is `Sync` → `Arc<T>` lets you share it across threads
- If `T` is NOT `Sync` → Use `Arc<Mutex<T>>` instead
- `Arc` = "Atomic Reference Counting" - safe way to share ownership across threads

## Summary

### Send = "I can move this to another thread"
Transfer ownership across thread boundaries.

### Sync = "Multiple threads can look at this at the same time"
Share references across thread boundaries.

### Mutex Ensures Sync By:
1. 🔒 **Controlling access** - Only one thread can access the inner data at a time
2. ⏱️ **Coordinating threads** - Other threads wait their turn
3. 🛡️ **Preventing data races** - Impossible for two threads to modify simultaneously

### Key Points:
- **Send/Sync are capabilities, not ownership rules** - they tell the compiler what's allowed
- Most types are both Send and Sync by default
- Rust's compiler automatically enforces these rules
- If your code compiles, you won't have data races!
- Without `Mutex`, sharing mutable data = 💥 data race
- With `Mutex`, sharing mutable data = ✅ safe concurrency
- **Arc requires Sync types** - it's designed for sharing references across threads
- When in doubt: use `Arc<Mutex<T>>` for shared mutable state

The beauty of Rust is that these are **compile-time guarantees**! 🦀