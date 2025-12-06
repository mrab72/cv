from enum import Enum
from typing import List, Optional
from abc import ABC, abstractmethod


class Direction(Enum):
    UP = 1
    DOWN = 2
    IDLE = 3


class ElevatorState(Enum):
    IDLE = 1
    MOVING = 2
    STOPPED = 3


class Request:
    def __init__(self, floor: int, direction: Optional[Direction] = None):
        self.floor = floor
        self.direction = direction  # None for internal requests


class Elevator:
    def __init__(self, elevator_id: int, min_floor: int, max_floor: int, capacity: int = 8):
        self.elevator_id = elevator_id
        self.current_floor = 0
        self.direction = Direction.IDLE
        self.state = ElevatorState.IDLE
        self.min_floor = min_floor
        self.max_floor = max_floor
        self.capacity = capacity
        self.current_load = 0
        self.destination_floors: set[int] = set()
    
    def can_take_request(self, request: Request) -> bool:
        """Check if elevator can efficiently handle this request"""
        if self.state == ElevatorState.IDLE:
            return True
        
        # If moving in same direction and request is on the way
        if self.direction == Direction.UP:
            return (request.direction == Direction.UP and 
                    request.floor > self.current_floor)
        elif self.direction == Direction.DOWN:
            return (request.direction == Direction.DOWN and 
                    request.floor < self.current_floor)
        
        return False
    
    def add_destination(self, floor: int):
        if self.min_floor <= floor <= self.max_floor:
            self.destination_floors.add(floor)
    
    def move(self):
        """Simulate one step of elevator movement"""
        if not self.destination_floors:
            self.state = ElevatorState.IDLE
            self.direction = Direction.IDLE
            return
        
        self.state = ElevatorState.MOVING
        
        # Determine direction
        if self.direction == Direction.IDLE:
            next_floor = min(self.destination_floors, 
                           key=lambda f: abs(f - self.current_floor))
            self.direction = (Direction.UP if next_floor > self.current_floor 
                            else Direction.DOWN)
        
        # Move one floor
        if self.direction == Direction.UP:
            self.current_floor += 1
        else:
            self.current_floor -= 1
        
        # Check if we need to stop
        if self.current_floor in self.destination_floors:
            self.stop_at_floor()
    
    def stop_at_floor(self):
        self.state = ElevatorState.STOPPED
        self.destination_floors.discard(self.current_floor)
        print(f"Elevator {self.elevator_id} stopped at floor {self.current_floor}")
        
        # Determine next direction
        floors_above = [f for f in self.destination_floors if f > self.current_floor]
        floors_below = [f for f in self.destination_floors if f < self.current_floor]
        
        if self.direction == Direction.UP and floors_above:
            self.direction = Direction.UP
        elif self.direction == Direction.DOWN and floors_below:
            self.direction = Direction.DOWN
        elif floors_above:
            self.direction = Direction.UP
        elif floors_below:
            self.direction = Direction.DOWN
        else:
            self.direction = Direction.IDLE
    
    def get_distance_to(self, floor: int) -> int:
        return abs(self.current_floor - floor)


class SchedulingStrategy(ABC):
    @abstractmethod
    def select_elevator(self, elevators: List[Elevator], request: Request) -> Optional[Elevator]:
        pass


class NearestCarStrategy(SchedulingStrategy):
    """Dispatch nearest available elevator"""
    def select_elevator(self, elevators: List[Elevator], request: Request) -> Optional[Elevator]:
        available = [e for e in elevators if e.can_take_request(request)]
        
        if not available:
            # If no elevator can take it efficiently, pick the nearest idle one
            idle = [e for e in elevators if e.state == ElevatorState.IDLE]
            if idle:
                return min(idle, key=lambda e: e.get_distance_to(request.floor))
            return None
        
        return min(available, key=lambda e: e.get_distance_to(request.floor))


class LoadBalancingStrategy(SchedulingStrategy):
    """Distribute load across elevators"""
    def select_elevator(self, elevators: List[Elevator], request: Request) -> Optional[Elevator]:
        available = [e for e in elevators if e.can_take_request(request)]
        
        if not available:
            idle = [e for e in elevators if e.state == ElevatorState.IDLE]
            if idle:
                return min(idle, key=lambda e: len(e.destination_floors))
            return None
        
        # Pick elevator with fewest destinations
        return min(available, key=lambda e: len(e.destination_floors))


class ElevatorController:
    def __init__(self, num_elevators: int, num_floors: int, 
                 strategy: SchedulingStrategy):
        self.elevators = [
            Elevator(i, 0, num_floors - 1) for i in range(num_elevators)
        ]
        self.num_floors = num_floors
        self.strategy = strategy
        self.pending_requests: List[Request] = []
    
    def request_elevator(self, floor: int, direction: Direction):
        """External button press (up/down on a floor)"""
        request = Request(floor, direction)
        elevator = self.strategy.select_elevator(self.elevators, request)
        
        if elevator:
            elevator.add_destination(floor)
            print(f"Dispatched elevator {elevator.elevator_id} to floor {floor}")
        else:
            self.pending_requests.append(request)
            print(f"No elevator available, request queued for floor {floor}")
    
    def select_floor(self, elevator_id: int, floor: int):
        """Internal button press (inside an elevator)"""
        if 0 <= elevator_id < len(self.elevators):
            self.elevators[elevator_id].add_destination(floor)
            print(f"Elevator {elevator_id}: Floor {floor} selected")
    
    def step(self):
        """Simulate one time step"""
        for elevator in self.elevators:
            elevator.move()
        
        # Try to assign pending requests
        for request in self.pending_requests[:]:
            elevator = self.strategy.select_elevator(self.elevators, request)
            if elevator:
                elevator.add_destination(request.floor)
                self.pending_requests.remove(request)
                print(f"Assigned pending request for floor {request.floor} to elevator {elevator.elevator_id}")
    
    def run_simulation(self, steps: int):
        """Run simulation for given number of steps"""
        for i in range(steps):
            print(f"\n--- Step {i + 1} ---")
            self.step()
            self.display_status()
            
            # Stop if all elevators are idle
            if all(e.state == ElevatorState.IDLE for e in self.elevators):
                print("\nAll elevators idle. Simulation complete.")
                break
    
    def display_status(self):
        print("\nElevator Status:")
        for elevator in self.elevators:
            print(f"  Elevator {elevator.elevator_id}: Floor {elevator.current_floor}, "
                  f"Direction: {elevator.direction.name}, "
                  f"Destinations: {sorted(elevator.destination_floors) if elevator.destination_floors else 'None'}")


# Demo usage
if __name__ == "__main__":
    # Create controller with 3 elevators, 10 floors, nearest car strategy
    controller = ElevatorController(3, 10, NearestCarStrategy())
    
    print("=== Elevator System Simulation ===")
    print("3 elevators, 10 floors (0-9)")
    
    # Simulate various requests
    print("\n=== Making Requests ===")
    controller.request_elevator(5, Direction.UP)  # Someone on floor 5 wants to go up
    controller.request_elevator(8, Direction.DOWN)  # Someone on floor 8 wants to go down
    controller.request_elevator(2, Direction.UP)  # Someone on floor 2 wants to go up
    
    # Someone inside elevator 0 presses floor 7
    controller.select_floor(0, 7)
    
    # Run simulation
    controller.run_simulation(20)
    
    print("\n\n=== Testing Load Balancing Strategy ===")
    controller2 = ElevatorController(2, 8, LoadBalancingStrategy())
    
    controller2.request_elevator(3, Direction.UP)
    controller2.request_elevator(5, Direction.UP)
    controller2.request_elevator(7, Direction.DOWN)
    controller2.select_floor(0, 4)
    controller2.select_floor(1, 6)
    
    controller2.run_simulation(15)