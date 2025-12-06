from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from collections import deque
from typing import Optional
import time


class RateLimitStrategy(ABC):
    """Abstract base class for rate limiting strategies"""
    
    @abstractmethod
    def allow_request(self, user_id: str) -> bool:
        """Returns True if request should be allowed"""
        pass
    
    @abstractmethod
    def reset(self, user_id: str):
        """Reset the rate limit for a user"""
        pass


class TokenBucketStrategy(RateLimitStrategy):
    """
    Token Bucket: Tokens are added at a fixed rate. 
    Each request consumes one token. If no tokens available, request is denied.
    Good for handling bursts while maintaining average rate.
    """
    
    def __init__(self, capacity: int, refill_rate: float):
        """
        Args:
            capacity: Maximum number of tokens
            refill_rate: Tokens added per second
        """
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.buckets: dict[str, dict] = {}
    
    def _refill_tokens(self, user_id: str):
        bucket = self.buckets[user_id]
        now = time.time()
        time_passed = now - bucket['last_refill']
        
        tokens_to_add = time_passed * self.refill_rate
        bucket['tokens'] = min(self.capacity, bucket['tokens'] + tokens_to_add)
        bucket['last_refill'] = now
    
    def allow_request(self, user_id: str) -> bool:
        if user_id not in self.buckets:
            self.buckets[user_id] = {
                'tokens': self.capacity,
                'last_refill': time.time()
            }
        
        self._refill_tokens(user_id)
        
        if self.buckets[user_id]['tokens'] >= 1:
            self.buckets[user_id]['tokens'] -= 1
            return True
        
        return False
    
    def reset(self, user_id: str):
        if user_id in self.buckets:
            self.buckets[user_id]['tokens'] = self.capacity
            self.buckets[user_id]['last_refill'] = time.time()


class SlidingWindowLogStrategy(RateLimitStrategy):
    """
    Sliding Window Log: Keeps timestamp of each request.
    Allows request if count of requests in last window < limit.
    Most accurate but memory intensive.
    """
    
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.request_logs: dict[str, deque] = {}
    
    def allow_request(self, user_id: str) -> bool:
        now = time.time()
        
        if user_id not in self.request_logs:
            self.request_logs[user_id] = deque()
        
        # Remove old requests outside the window
        window_start = now - self.window_seconds
        log = self.request_logs[user_id]
        
        while log and log[0] < window_start:
            log.popleft()
        
        if len(log) < self.max_requests:
            log.append(now)
            return True
        
        return False
    
    def reset(self, user_id: str):
        if user_id in self.request_logs:
            self.request_logs[user_id].clear()


class FixedWindowStrategy(RateLimitStrategy):
    """
    Fixed Window: Divides time into fixed windows.
    Allows max_requests per window.
    Simple but can allow 2x requests at window boundaries.
    """
    
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.windows: dict[str, dict] = {}
    
    def _get_current_window(self) -> int:
        return int(time.time() / self.window_seconds)
    
    def allow_request(self, user_id: str) -> bool:
        current_window = self._get_current_window()
        
        if user_id not in self.windows:
            self.windows[user_id] = {
                'window': current_window,
                'count': 0
            }
        
        user_data = self.windows[user_id]
        
        # Reset if new window
        if user_data['window'] != current_window:
            user_data['window'] = current_window
            user_data['count'] = 0
        
        if user_data['count'] < self.max_requests:
            user_data['count'] += 1
            return True
        
        return False
    
    def reset(self, user_id: str):
        if user_id in self.windows:
            self.windows[user_id]['count'] = 0


class SlidingWindowCounterStrategy(RateLimitStrategy):
    """
    Sliding Window Counter: Hybrid approach.
    Uses weighted count from current and previous windows.
    More accurate than fixed window, more efficient than log.
    """
    
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.windows: dict[str, dict] = {}
    
    def _get_current_window(self) -> int:
        return int(time.time() / self.window_seconds)
    
    def allow_request(self, user_id: str) -> bool:
        current_window = self._get_current_window()
        now = time.time()
        
        if user_id not in self.windows:
            self.windows[user_id] = {
                'current_window': current_window,
                'current_count': 0,
                'previous_count': 0
            }
        
        user_data = self.windows[user_id]
        
        # Move to new window if needed
        if user_data['current_window'] < current_window:
            user_data['previous_count'] = user_data['current_count']
            user_data['current_count'] = 0
            user_data['current_window'] = current_window
        
        # Calculate weighted count
        window_start = current_window * self.window_seconds
        elapsed_in_current_window = now - window_start
        weight = elapsed_in_current_window / self.window_seconds
        
        estimated_count = (user_data['previous_count'] * (1 - weight) + 
                          user_data['current_count'])
        
        if estimated_count < self.max_requests:
            user_data['current_count'] += 1
            return True
        
        return False
    
    def reset(self, user_id: str):
        if user_id in self.windows:
            self.windows[user_id]['current_count'] = 0
            self.windows[user_id]['previous_count'] = 0


class RateLimiter:
    """Main rate limiter that can use different strategies"""
    
    def __init__(self, strategy: RateLimitStrategy, name: str = "API"):
        self.strategy = strategy
        self.name = name
        self.blocked_count: dict[str, int] = {}
    
    def allow_request(self, user_id: str) -> bool:
        allowed = self.strategy.allow_request(user_id)
        
        if not allowed:
            self.blocked_count[user_id] = self.blocked_count.get(user_id, 0) + 1
        
        return allowed
    
    def get_blocked_count(self, user_id: str) -> int:
        return self.blocked_count.get(user_id, 0)
    
    def reset_user(self, user_id: str):
        self.strategy.reset(user_id)
        self.blocked_count[user_id] = 0


class APIEndpoint:
    """Simulates an API endpoint with rate limiting"""
    
    def __init__(self, name: str, rate_limiter: RateLimiter):
        self.name = name
        self.rate_limiter = rate_limiter
        self.total_requests = 0
        self.successful_requests = 0
    
    def handle_request(self, user_id: str) -> dict:
        self.total_requests += 1
        
        if self.rate_limiter.allow_request(user_id):
            self.successful_requests += 1
            return {
                'status': 200,
                'message': f'Success: {self.name}',
                'user_id': user_id
            }
        else:
            return {
                'status': 429,
                'message': 'Too Many Requests - Rate limit exceeded',
                'user_id': user_id,
                'retry_after': 'Please try again later'
            }
    
    def get_stats(self) -> dict:
        return {
            'total_requests': self.total_requests,
            'successful_requests': self.successful_requests,
            'blocked_requests': self.total_requests - self.successful_requests,
            'success_rate': f"{(self.successful_requests/self.total_requests*100):.1f}%" 
                          if self.total_requests > 0 else "0%"
        }


# Demo usage and comparison
if __name__ == "__main__":
    print("=== Rate Limiter Comparison ===\n")
    
    # Test 1: Token Bucket - allows bursts
    print("1. Token Bucket (10 tokens, 2 tokens/sec)")
    print("   Allows bursts up to capacity, then steady rate")
    limiter1 = RateLimiter(TokenBucketStrategy(capacity=10, refill_rate=2), "Token Bucket")
    endpoint1 = APIEndpoint("/api/data", limiter1)
    
    # Burst of 15 requests
    for i in range(15):
        response = endpoint1.handle_request("user1")
        status = "✓" if response['status'] == 200 else "✗"
        print(f"   Request {i+1}: {status}")
    
    print(f"   Stats: {endpoint1.get_stats()}\n")
    
    # Test 2: Sliding Window Log
    print("2. Sliding Window Log (5 requests per 10 seconds)")
    print("   Precise tracking of each request")
    limiter2 = RateLimiter(SlidingWindowLogStrategy(max_requests=5, window_seconds=10), 
                          "Sliding Window")
    endpoint2 = APIEndpoint("/api/users", limiter2)
    
    for i in range(8):
        response = endpoint2.handle_request("user2")
        status = "✓" if response['status'] == 200 else "✗"
        print(f"   Request {i+1}: {status}")
    
    print(f"   Stats: {endpoint2.get_stats()}\n")
    
    # Test 3: Fixed Window
    print("3. Fixed Window (3 requests per 5 seconds)")
    print("   Simple but edge case at window boundaries")
    limiter3 = RateLimiter(FixedWindowStrategy(max_requests=3, window_seconds=5), 
                          "Fixed Window")
    endpoint3 = APIEndpoint("/api/posts", limiter3)
    
    for i in range(5):
        response = endpoint3.handle_request("user3")
        status = "✓" if response['status'] == 200 else "✗"
        print(f"   Request {i+1}: {status}")
    
    print(f"   Stats: {endpoint3.get_stats()}\n")
    
    # Test 4: Multiple users
    print("4. Multiple Users (Sliding Window Counter)")
    limiter4 = RateLimiter(SlidingWindowCounterStrategy(max_requests=3, window_seconds=10),
                          "Multi-user")
    endpoint4 = APIEndpoint("/api/comments", limiter4)
    
    users = ["alice", "bob", "alice", "charlie", "alice", "bob"]
    for user in users:
        response = endpoint4.handle_request(user)
        status = "✓" if response['status'] == 200 else "✗"
        print(f"   {user}: {status}")
    
    print(f"   Stats: {endpoint4.get_stats()}\n")
    
    print("\n=== Summary ===")
    print("Token Bucket: Best for APIs that need to handle traffic bursts")
    print("Sliding Window Log: Most accurate, but uses more memory")
    print("Fixed Window: Simplest, but can allow 2x requests at boundaries")
    print("Sliding Window Counter: Good balance of accuracy and efficiency")