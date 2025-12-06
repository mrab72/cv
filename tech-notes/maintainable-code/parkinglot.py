from enum import Enum
from datetime import datetime
from typing import Optional, List
from abc import ABC, abstractmethod


class VehicleType(Enum):
    MOTORCYCLE = 1
    CAR = 2
    TRUCK = 3


class SpotSize(Enum):
    SMALL = 1
    MEDIUM = 2
    LARGE = 3


class Vehicle:
    def __init__(self, license_plate: str, vehicle_type: VehicleType):
        self.license_plate = license_plate
        self.vehicle_type = vehicle_type


class ParkingSpot:
    def __init__(self, spot_id: str, size: SpotSize):
        self.spot_id = spot_id
        self.size = size
        self.vehicle: Optional[Vehicle] = None
        
    def is_available(self) -> bool:
        return self.vehicle is None
    
    def can_fit(self, vehicle: Vehicle) -> bool:
        if not self.is_available():
            return False
        
        # Mapping of vehicle types to required spot sizes
        required_size = {
            VehicleType.MOTORCYCLE: SpotSize.SMALL,
            VehicleType.CAR: SpotSize.MEDIUM,
            VehicleType.TRUCK: SpotSize.LARGE
        }
        
        return self.size.value >= required_size[vehicle.vehicle_type].value
    
    def park_vehicle(self, vehicle: Vehicle) -> bool:
        if self.can_fit(vehicle):
            self.vehicle = vehicle
            return True
        return False
    
    def remove_vehicle(self) -> Optional[Vehicle]:
        vehicle = self.vehicle
        self.vehicle = None
        return vehicle


class ParkingTicket:
    def __init__(self, ticket_id: str, vehicle: Vehicle, spot: ParkingSpot):
        self.ticket_id = ticket_id
        self.vehicle = vehicle
        self.spot = spot
        self.entry_time = datetime.now()
        self.exit_time: Optional[datetime] = None
    
    def mark_exit(self):
        self.exit_time = datetime.now()


class PricingStrategy(ABC):
    @abstractmethod
    def calculate_fee(self, ticket: ParkingTicket) -> float:
        pass


class HourlyPricing(PricingStrategy):
    def __init__(self):
        self.rates = {
            VehicleType.MOTORCYCLE: 2.0,
            VehicleType.CAR: 5.0,
            VehicleType.TRUCK: 10.0
        }
    
    def calculate_fee(self, ticket: ParkingTicket) -> float:
        if not ticket.exit_time:
            ticket.mark_exit()
        
        duration = (ticket.exit_time - ticket.entry_time).total_seconds() / 3600
        hours = max(1, int(duration) + (1 if duration % 1 > 0 else 0))  # Round up
        
        return hours * self.rates[ticket.vehicle.vehicle_type]


class ParkingLot:
    def __init__(self, name: str, pricing_strategy: PricingStrategy):
        self.name = name
        self.spots: List[ParkingSpot] = []
        self.tickets: dict[str, ParkingTicket] = {}
        self.pricing_strategy = pricing_strategy
        self._ticket_counter = 0
    
    def add_spot(self, spot: ParkingSpot):
        self.spots.append(spot)
    
    def get_available_spot(self, vehicle: Vehicle) -> Optional[ParkingSpot]:
        for spot in self.spots:
            if spot.can_fit(vehicle):
                return spot
        return None
    
    def park_vehicle(self, vehicle: Vehicle) -> Optional[ParkingTicket]:
        spot = self.get_available_spot(vehicle)
        if not spot:
            print(f"No available spot for vehicle {vehicle.license_plate}")
            return None
        
        if spot.park_vehicle(vehicle):
            self._ticket_counter += 1
            ticket = ParkingTicket(f"T{self._ticket_counter:04d}", vehicle, spot)
            self.tickets[ticket.ticket_id] = ticket
            print(f"Vehicle {vehicle.license_plate} parked at spot {spot.spot_id}")
            return ticket
        
        return None
    
    def unpark_vehicle(self, ticket_id: str) -> Optional[float]:
        ticket = self.tickets.get(ticket_id)
        if not ticket:
            print(f"Invalid ticket {ticket_id}")
            return None
        
        vehicle = ticket.spot.remove_vehicle()
        if vehicle:
            fee = self.pricing_strategy.calculate_fee(ticket)
            print(f"Vehicle {vehicle.license_plate} exited. Fee: ${fee:.2f}")
            del self.tickets[ticket_id]
            return fee
        
        return None
    
    def get_available_spots_count(self) -> dict:
        counts = {size: 0 for size in SpotSize}
        for spot in self.spots:
            if spot.is_available():
                counts[spot.size] += 1
        return counts


# Demo usage
if __name__ == "__main__":
    # Create parking lot
    parking_lot = ParkingLot("Downtown Parking", HourlyPricing())
    
    # Add spots
    parking_lot.add_spot(ParkingSpot("A1", SpotSize.SMALL))
    parking_lot.add_spot(ParkingSpot("A2", SpotSize.SMALL))
    parking_lot.add_spot(ParkingSpot("B1", SpotSize.MEDIUM))
    parking_lot.add_spot(ParkingSpot("B2", SpotSize.MEDIUM))
    parking_lot.add_spot(ParkingSpot("C1", SpotSize.LARGE))
    
    # Park vehicles
    bike = Vehicle("BIKE123", VehicleType.MOTORCYCLE)
    car = Vehicle("CAR456", VehicleType.CAR)
    truck = Vehicle("TRUCK789", VehicleType.TRUCK)
    
    ticket1 = parking_lot.park_vehicle(bike)
    ticket2 = parking_lot.park_vehicle(car)
    ticket3 = parking_lot.park_vehicle(truck)
    
    print("\nAvailable spots:", parking_lot.get_available_spots_count())
    
    # Unpark
    if ticket1:
        parking_lot.unpark_vehicle(ticket1.ticket_id)
    
    print("\nAvailable spots:", parking_lot.get_available_spots_count())