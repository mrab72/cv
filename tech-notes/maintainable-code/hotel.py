from enum import Enum
from datetime import datetime, timedelta
from typing import List, Optional
from dataclasses import dataclass


class RoomType(Enum):
    SINGLE = 1
    DOUBLE = 2
    SUITE = 3


class BookingStatus(Enum):
    PENDING = 1
    CONFIRMED = 2
    CHECKED_IN = 3
    CHECKED_OUT = 4
    CANCELLED = 5


class RoomStatus(Enum):
    AVAILABLE = 1
    OCCUPIED = 2
    MAINTENANCE = 3


@dataclass
class Guest:
    guest_id: str
    name: str
    email: str
    phone: str


class Room:
    def __init__(self, room_number: str, room_type: RoomType, base_price: float):
        self.room_number = room_number
        self.room_type = room_type
        self.base_price = base_price
        self.status = RoomStatus.AVAILABLE
    
    def is_available(self) -> bool:
        return self.status == RoomStatus.AVAILABLE


class PricingStrategy:
    """Strategy for calculating room prices"""
    def __init__(self):
        self.seasonal_multipliers = {
            'peak': 1.5,      # Summer, holidays
            'normal': 1.0,
            'off_peak': 0.8   # Winter (non-holiday)
        }
        self.weekend_multiplier = 1.2
    
    def calculate_price(self, room: Room, check_in: datetime, 
                       check_out: datetime) -> float:
        nights = (check_out - check_in).days
        base_total = room.base_price * nights
        
        # Apply seasonal pricing (simplified - just check month)
        month = check_in.month
        if month in [6, 7, 8, 12]:  # Summer and December
            multiplier = self.seasonal_multipliers['peak']
        elif month in [1, 2]:  # Winter
            multiplier = self.seasonal_multipliers['off_peak']
        else:
            multiplier = self.seasonal_multipliers['normal']
        
        # Apply weekend pricing (if any weekend days)
        weekend_days = sum(1 for i in range(nights) 
                          if (check_in + timedelta(days=i)).weekday() >= 5)
        weekday_days = nights - weekend_days
        
        total = (weekday_days * room.base_price * multiplier + 
                weekend_days * room.base_price * multiplier * self.weekend_multiplier)
        
        return round(total, 2)


class Booking:
    _booking_counter = 0
    
    def __init__(self, guest: Guest, room: Room, check_in: datetime, 
                 check_out: datetime, price: float):
        Booking._booking_counter += 1
        self.booking_id = f"BK{Booking._booking_counter:05d}"
        self.guest = guest
        self.room = room
        self.check_in = check_in
        self.check_out = check_out
        self.price = price
        self.status = BookingStatus.PENDING
        self.created_at = datetime.now()
    
    def confirm(self):
        self.status = BookingStatus.CONFIRMED
    
    def check_in_guest(self):
        if self.status == BookingStatus.CONFIRMED:
            self.status = BookingStatus.CHECKED_IN
            self.room.status = RoomStatus.OCCUPIED
            return True
        return False
    
    def check_out_guest(self):
        if self.status == BookingStatus.CHECKED_IN:
            self.status = BookingStatus.CHECKED_OUT
            self.room.status = RoomStatus.AVAILABLE
            return True
        return False
    
    def cancel(self) -> float:
        """Cancel booking and calculate refund"""
        if self.status in [BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT]:
            return 0.0  # No refund
        
        days_until_checkin = (self.check_in - datetime.now()).days
        
        if days_until_checkin > 7:
            refund = self.price  # Full refund
        elif days_until_checkin > 2:
            refund = self.price * 0.5  # 50% refund
        else:
            refund = 0.0  # No refund
        
        self.status = BookingStatus.CANCELLED
        return refund


class Hotel:
    def __init__(self, name: str):
        self.name = name
        self.rooms: List[Room] = []
        self.bookings: dict[str, Booking] = {}
        self.guests: dict[str, Guest] = {}
        self.pricing_strategy = PricingStrategy()
    
    def add_room(self, room: Room):
        self.rooms.append(room)
    
    def add_guest(self, guest: Guest):
        self.guests[guest.guest_id] = guest
    
    def search_available_rooms(self, room_type: RoomType, 
                               check_in: datetime, 
                               check_out: datetime) -> List[Room]:
        """Find available rooms for given dates and type"""
        available_rooms = []
        
        for room in self.rooms:
            if room.room_type != room_type:
                continue
            
            # Check if room is booked during requested period
            is_available = True
            for booking in self.bookings.values():
                if (booking.room == room and 
                    booking.status in [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]):
                    # Check for date overlap
                    if not (check_out <= booking.check_in or 
                           check_in >= booking.check_out):
                        is_available = False
                        break
            
            if is_available and room.is_available():
                available_rooms.append(room)
        
        return available_rooms
    
    def create_booking(self, guest_id: str, room_number: str,
                      check_in: datetime, check_out: datetime) -> Optional[Booking]:
        guest = self.guests.get(guest_id)
        room = next((r for r in self.rooms if r.room_number == room_number), None)
        
        if not guest or not room:
            print("Invalid guest or room")
            return None
        
        # Verify room is available
        available_rooms = self.search_available_rooms(room.room_type, check_in, check_out)
        if room not in available_rooms:
            print(f"Room {room_number} is not available for selected dates")
            return None
        
        # Calculate price
        price = self.pricing_strategy.calculate_price(room, check_in, check_out)
        
        # Create booking
        booking = Booking(guest, room, check_in, check_out, price)
        booking.confirm()
        self.bookings[booking.booking_id] = booking
        
        nights = (check_out - check_in).days
        print(f"Booking created: {booking.booking_id}")
        print(f"  Guest: {guest.name}")
        print(f"  Room: {room.room_number} ({room.room_type.name})")
        print(f"  Dates: {check_in.date()} to {check_out.date()} ({nights} nights)")
        print(f"  Total: ${price:.2f}")
        
        return booking
    
    def check_in(self, booking_id: str) -> bool:
        booking = self.bookings.get(booking_id)
        if not booking:
            print("Booking not found")
            return False
        
        if booking.check_in_guest():
            print(f"Guest {booking.guest.name} checked in to room {booking.room.room_number}")
            return True
        
        print("Cannot check in - booking not confirmed")
        return False
    
    def check_out(self, booking_id: str) -> bool:
        booking = self.bookings.get(booking_id)
        if not booking:
            print("Booking not found")
            return False
        
        if booking.check_out_guest():
            print(f"Guest {booking.guest.name} checked out from room {booking.room.room_number}")
            print(f"Total charge: ${booking.price:.2f}")
            return True
        
        print("Cannot check out - guest not checked in")
        return False
    
    def cancel_booking(self, booking_id: str) -> bool:
        booking = self.bookings.get(booking_id)
        if not booking:
            print("Booking not found")
            return False
        
        refund = booking.cancel()
        print(f"Booking {booking_id} cancelled")
        print(f"Refund amount: ${refund:.2f}")
        return True
    
    def get_guest_bookings(self, guest_id: str) -> List[Booking]:
        return [b for b in self.bookings.values() 
                if b.guest.guest_id == guest_id]


# Demo usage
if __name__ == "__main__":
    hotel = Hotel("Grand Plaza Hotel")
    
    # Add rooms
    hotel.add_room(Room("101", RoomType.SINGLE, 100.0))
    hotel.add_room(Room("102", RoomType.SINGLE, 100.0))
    hotel.add_room(Room("201", RoomType.DOUBLE, 150.0))
    hotel.add_room(Room("202", RoomType.DOUBLE, 150.0))
    hotel.add_room(Room("301", RoomType.SUITE, 300.0))
    
    # Add guests
    guest1 = Guest("G001", "Alice Johnson", "alice@email.com", "555-0101")
    guest2 = Guest("G002", "Bob Smith", "bob@email.com", "555-0102")
    hotel.add_guest(guest1)
    hotel.add_guest(guest2)
    
    # Search for available rooms
    print("=== Searching for Available Rooms ===")
    check_in = datetime.now() + timedelta(days=1)
    check_out = datetime.now() + timedelta(days=4)
    
    available = hotel.search_available_rooms(RoomType.DOUBLE, check_in, check_out)
    print(f"\nAvailable DOUBLE rooms: {[r.room_number for r in available]}")
    
    # Create bookings
    print("\n=== Creating Bookings ===")
    booking1 = hotel.create_booking("G001", "201", check_in, check_out)
    
    # Try to book same room (should fail)
    print("\n=== Attempting Double Booking ===")
    booking2 = hotel.create_booking("G002", "201", check_in, check_out)
    
    # Book different room
    booking3 = hotel.create_booking("G002", "202", check_in, check_out)
    
    # Check in
    print("\n=== Check-in ===")
    if booking1:
        hotel.check_in(booking1.booking_id)
    
    # Cancel booking
    print("\n=== Cancellation ===")
    if booking3:
        hotel.cancel_booking(booking3.booking_id)
    
    # View guest bookings
    print("\n=== Guest Booking History ===")
    alice_bookings = hotel.get_guest_bookings("G001")
    for booking in alice_bookings:
        print(f"  {booking.booking_id}: {booking.room.room_number} - {booking.status.name}")