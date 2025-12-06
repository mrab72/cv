from enum import Enum
from datetime import datetime, timedelta
from typing import Optional, List, Callable
from abc import ABC, abstractmethod
import heapq
from dataclasses import dataclass, field


class TaskStatus(Enum):
    PENDING = 1
    RUNNING = 2
    COMPLETED = 3
    FAILED = 4
    CANCELLED = 5


class TaskPriority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


class ScheduleType(Enum):
    ONE_TIME = 1
    RECURRING = 2


@dataclass
class TaskResult:
    task_id: str
    status: TaskStatus
    output: any = None
    error: Optional[str] = None
    execution_time: float = 0.0
    completed_at: Optional[datetime] = None


class Task:
    _task_counter = 0
    
    def __init__(self, name: str, function: Callable, 
                 priority: TaskPriority = TaskPriority.MEDIUM,
                 max_retries: int = 3):
        Task._task_counter += 1
        self.task_id = f"TASK_{Task._task_counter:04d}"
        self.name = name
        self.function = function
        self.priority = priority
        self.max_retries = max_retries
        self.retry_count = 0
        self.status = TaskStatus.PENDING
        self.dependencies: List[str] = []
        self.created_at = datetime.now()
    
    def execute(self) -> TaskResult:
        """Execute the task"""
        self.status = TaskStatus.RUNNING
        start_time = datetime.now()
        
        try:
            output = self.function()
            execution_time = (datetime.now() - start_time).total_seconds()
            self.status = TaskStatus.COMPLETED
            
            return TaskResult(
                task_id=self.task_id,
                status=TaskStatus.COMPLETED,
                output=output,
                execution_time=execution_time,
                completed_at=datetime.now()
            )
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            self.status = TaskStatus.FAILED
            
            return TaskResult(
                task_id=self.task_id,
                status=TaskStatus.FAILED,
                error=str(e),
                execution_time=execution_time,
                completed_at=datetime.now()
            )
    
    def can_execute(self, completed_tasks: set) -> bool:
        """Check if all dependencies are completed"""
        return all(dep_id in completed_tasks for dep_id in self.dependencies)
    
    def add_dependency(self, task_id: str):
        self.dependencies.append(task_id)


@dataclass(order=True)
class ScheduledTask:
    """Wrapper for tasks in priority queue"""
    next_run: datetime = field(compare=True)
    priority: int = field(compare=True)
    task: Task = field(compare=False)
    schedule_type: ScheduleType = field(compare=False, default=ScheduleType.ONE_TIME)
    interval: Optional[timedelta] = field(compare=False, default=None)


class RetryStrategy(ABC):
    @abstractmethod
    def should_retry(self, task: Task) -> bool:
        pass
    
    @abstractmethod
    def get_retry_delay(self, retry_count: int) -> timedelta:
        pass


class ExponentialBackoffRetry(RetryStrategy):
    def __init__(self, base_delay: int = 1, max_delay: int = 60):
        self.base_delay = base_delay
        self.max_delay = max_delay
    
    def should_retry(self, task: Task) -> bool:
        return task.retry_count < task.max_retries
    
    def get_retry_delay(self, retry_count: int) -> timedelta:
        delay = min(self.base_delay * (2 ** retry_count), self.max_delay)
        return timedelta(seconds=delay)


class TaskScheduler:
    def __init__(self, retry_strategy: RetryStrategy):
        self.tasks: dict[str, Task] = {}
        self.scheduled_tasks: List[ScheduledTask] = []  # Min heap
        self.completed_tasks: set[str] = set()
        self.task_results: dict[str, TaskResult] = {}
        self.retry_strategy = retry_strategy
        self.is_running = False
    
    def add_task(self, task: Task) -> str:
        """Add a task to the scheduler"""
        self.tasks[task.task_id] = task
        return task.task_id
    
    def schedule_task(self, task: Task, run_at: datetime):
        """Schedule a one-time task"""
        scheduled = ScheduledTask(
            next_run=run_at,
            priority=-task.priority.value,  # Negative for max heap behavior
            task=task,
            schedule_type=ScheduleType.ONE_TIME
        )
        heapq.heappush(self.scheduled_tasks, scheduled)
        self.tasks[task.task_id] = task
        print(f"Scheduled task '{task.name}' at {run_at.strftime('%H:%M:%S')}")
    
    def schedule_recurring_task(self, task: Task, start_at: datetime, 
                               interval: timedelta):
        """Schedule a recurring task"""
        scheduled = ScheduledTask(
            next_run=start_at,
            priority=-task.priority.value,
            task=task,
            schedule_type=ScheduleType.RECURRING,
            interval=interval
        )
        heapq.heappush(self.scheduled_tasks, scheduled)
        self.tasks[task.task_id] = task
        print(f"Scheduled recurring task '{task.name}' starting at {start_at.strftime('%H:%M:%S')}, "
              f"interval: {interval}")
    
    def _execute_task(self, scheduled_task: ScheduledTask) -> TaskResult:
        """Execute a single task"""
        task = scheduled_task.task
        
        # Check dependencies
        if not task.can_execute(self.completed_tasks):
            print(f"  Task '{task.name}' waiting for dependencies")
            # Reschedule for later
            scheduled_task.next_run = datetime.now() + timedelta(seconds=5)
            heapq.heappush(self.scheduled_tasks, scheduled_task)
            return None
        
        print(f"  Executing task '{task.name}' (Priority: {task.priority.name})")
        result = task.execute()
        
        if result.status == TaskStatus.COMPLETED:
            print(f"    ✓ Completed in {result.execution_time:.3f}s")
            self.completed_tasks.add(task.task_id)
            self.task_results[task.task_id] = result
            
            # Reschedule if recurring
            if scheduled_task.schedule_type == ScheduleType.RECURRING:
                task.status = TaskStatus.PENDING  # Reset for next run
                scheduled_task.next_run = datetime.now() + scheduled_task.interval
                heapq.heappush(self.scheduled_tasks, scheduled_task)
                print(f"    ↻ Rescheduled for {scheduled_task.next_run.strftime('%H:%M:%S')}")
        
        elif result.status == TaskStatus.FAILED:
            print(f"    ✗ Failed: {result.error}")
            
            # Retry logic
            if self.retry_strategy.should_retry(task):
                task.retry_count += 1
                task.status = TaskStatus.PENDING
                retry_delay = self.retry_strategy.get_retry_delay(task.retry_count)
                scheduled_task.next_run = datetime.now() + retry_delay
                heapq.heappush(self.scheduled_tasks, scheduled_task)
                print(f"    ⟳ Retry {task.retry_count}/{task.max_retries} scheduled "
                      f"in {retry_delay.total_seconds()}s")
            else:
                print(f"    ✗ Max retries exceeded")
                self.task_results[task.task_id] = result
        
        return result
    
    def run(self, duration_seconds: Optional[int] = None):
        """Run the scheduler"""
        self.is_running = True
        start_time = datetime.now()
        print(f"\n=== Scheduler Started at {start_time.strftime('%H:%M:%S')} ===\n")
        
        step = 0
        while self.is_running and self.scheduled_tasks:
            if duration_seconds:
                elapsed = (datetime.now() - start_time).total_seconds()
                if elapsed >= duration_seconds:
                    break
            
            # Get next task
            if not self.scheduled_tasks:
                break
            
            scheduled_task = heapq.heappop(self.scheduled_tasks)
            
            # Wait until it's time to run
            now = datetime.now()
            if scheduled_task.next_run > now:
                # Put it back and wait
                heapq.heappush(self.scheduled_tasks, scheduled_task)
                # In real implementation, would sleep; here we simulate time passing
                print(f"\nStep {step}: Waiting... (Next task at {scheduled_task.next_run.strftime('%H:%M:%S')})")
                # Simulate advancing time
                if duration_seconds:
                    continue
                break
            
            step += 1
            print(f"\nStep {step}: {now.strftime('%H:%M:%S')}")
            self._execute_task(scheduled_task)
        
        print(f"\n=== Scheduler Stopped ===")
        self._print_summary()
    
    def cancel_task(self, task_id: str):
        """Cancel a scheduled task"""
        task = self.tasks.get(task_id)
        if task and task.status == TaskStatus.PENDING:
            task.status = TaskStatus.CANCELLED
            print(f"Task '{task.name}' cancelled")
    
    def _print_summary(self):
        print("\n=== Task Summary ===")
        print(f"Total tasks: {len(self.tasks)}")
        print(f"Completed: {len(self.completed_tasks)}")
        print(f"Failed: {sum(1 for r in self.task_results.values() if r.status == TaskStatus.FAILED)}")
        
        if self.task_results:
            print("\nTask Results:")
            for task_id, result in self.task_results.items():
                task = self.tasks[task_id]
                status_icon = "✓" if result.status == TaskStatus.COMPLETED else "✗"
                print(f"  {status_icon} {task.name}: {result.status.name} "
                      f"({result.execution_time:.3f}s)")


# Demo usage
if __name__ == "__main__":
    # Create scheduler with exponential backoff retry
    scheduler = TaskScheduler(ExponentialBackoffRetry(base_delay=2, max_delay=30))
    
    # Define some sample task functions
    def send_email():
        print("      → Sending email...")
        return "Email sent successfully"
    
    def process_data():
        print("      → Processing data...")
        return {"records_processed": 100}
    
    def backup_database():
        print("      → Backing up database...")
        return "Backup completed"
    
    def cleanup_logs():
        print("      → Cleaning up logs...")
        return "Logs cleaned"
    
    def failing_task():
        print("      → Attempting operation...")
        raise Exception("Network timeout")
    
    # Create tasks with different priorities
    task1 = Task("Send Welcome Email", send_email, TaskPriority.HIGH)
    task2 = Task("Process Daily Data", process_data, TaskPriority.CRITICAL)
    task3 = Task("Database Backup", backup_database, TaskPriority.MEDIUM)
    task4 = Task("Log Cleanup", cleanup_logs, TaskPriority.LOW)
    task5 = Task("Sync External API", failing_task, TaskPriority.HIGH, max_retries=2)
    
    # Add dependency: email should be sent after data is processed
    task1.add_dependency(task2.task_id)
    
    # Schedule tasks
    now = datetime.now()
    scheduler.schedule_task(task2, now)  # Run immediately
    scheduler.schedule_task(task1, now + timedelta(seconds=1))
    scheduler.schedule_task(task5, now + timedelta(seconds=2))
    scheduler.schedule_task(task3, now + timedelta(seconds=5))
    
    # Schedule recurring task
    scheduler.schedule_recurring_task(
        task4, 
        now + timedelta(seconds=3), 
        timedelta(seconds=10)
    )
    
    # Run scheduler for 30 seconds
    scheduler.run(duration_seconds=30)