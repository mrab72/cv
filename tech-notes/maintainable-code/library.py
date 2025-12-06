from enum import Enum
from datetime import datetime, timedelta
from typing import Optional, List
from dataclasses import dataclass


class BookStatus(Enum):
    AVAILABLE = 1
    BORROWED = 2
    RESERVED = 3
    LOST = 4


class MembershipType(Enum):
    BASIC = 1
    PREMIUM = 2


@dataclass
class Book:
    isbn: str
    title: str
    author: str
    category: str


class BookItem:
    """Individual copy of a book"""
    def __init__(self, barcode: str, book: Book):
        self.barcode = barcode
        self.book = book
        self.status = BookStatus.AVAILABLE
        self.borrowed_by: Optional['Member'] = None
        self.due_date: Optional[datetime] = None
    
    def checkout(self, member: 'Member', days: int = 14) -> bool:
        if self.status != BookStatus.AVAILABLE:
            return False
        
        self.status = BookStatus.BORROWED
        self.borrowed_by = member
        self.due_date = datetime.now() + timedelta(days=days)
        return True
    
    def return_book(self) -> float:
        """Returns late fee if any"""
        if self.status != BookStatus.BORROWED:
            return 0.0
        
        late_fee = 0.0
        if self.due_date and datetime.now() > self.due_date:
            days_late = (datetime.now() - self.due_date).days
            late_fee = days_late * 1.0  # $1 per day
        
        self.status = BookStatus.AVAILABLE
        self.borrowed_by = None
        self.due_date = None
        return late_fee
    
    def is_overdue(self) -> bool:
        return (self.status == BookStatus.BORROWED and 
                self.due_date and 
                datetime.now() > self.due_date)


class Member:
    def __init__(self, member_id: str, name: str, membership_type: MembershipType):
        self.member_id = member_id
        self.name = name
        self.membership_type = membership_type
        self.borrowed_books: List[BookItem] = []
        self.total_late_fees = 0.0
    
    def get_max_books(self) -> int:
        return 10 if self.membership_type == MembershipType.PREMIUM else 5
    
    def can_borrow(self) -> bool:
        return len(self.borrowed_books) < self.get_max_books()
    
    def has_overdue_books(self) -> bool:
        return any(book.is_overdue() for book in self.borrowed_books)


class Reservation:
    def __init__(self, member: Member, book: Book):
        self.member = member
        self.book = book
        self.reservation_date = datetime.now()
        self.expiry_date = datetime.now() + timedelta(days=3)
    
    def is_expired(self) -> bool:
        return datetime.now() > self.expiry_date


class Library:
    def __init__(self, name: str):
        self.name = name
        self.books: dict[str, Book] = {}  # ISBN -> Book
        self.book_items: dict[str, BookItem] = {}  # Barcode -> BookItem
        self.members: dict[str, Member] = {}
        self.reservations: List[Reservation] = []
    
    def add_book(self, book: Book):
        self.books[book.isbn] = book
    
    def add_book_item(self, book_item: BookItem):
        self.book_items[book_item.barcode] = book_item
    
    def add_member(self, member: Member):
        self.members[member.member_id] = member
    
    def search_by_title(self, title: str) -> List[Book]:
        return [book for book in self.books.values() 
                if title.lower() in book.title.lower()]
    
    def search_by_author(self, author: str) -> List[Book]:
        return [book for book in self.books.values() 
                if author.lower() in book.author.lower()]
    
    def get_available_items(self, isbn: str) -> List[BookItem]:
        return [item for item in self.book_items.values() 
                if item.book.isbn == isbn and item.status == BookStatus.AVAILABLE]
    
    def checkout_book(self, member_id: str, barcode: str) -> bool:
        member = self.members.get(member_id)
        book_item = self.book_items.get(barcode)
        
        if not member or not book_item:
            print("Invalid member or book")
            return False
        
        if not member.can_borrow():
            print(f"Member {member.name} has reached borrowing limit")
            return False
        
        if member.has_overdue_books():
            print(f"Member {member.name} has overdue books")
            return False
        
        if book_item.checkout(member):
            member.borrowed_books.append(book_item)
            print(f"{member.name} borrowed '{book_item.book.title}' - Due: {book_item.due_date.strftime('%Y-%m-%d')}")
            return True
        
        print(f"Book '{book_item.book.title}' is not available")
        return False
    
    def return_book(self, member_id: str, barcode: str) -> bool:
        member = self.members.get(member_id)
        book_item = self.book_items.get(barcode)
        
        if not member or not book_item:
            return False
        
        if book_item not in member.borrowed_books:
            print("This book was not borrowed by this member")
            return False
        
        late_fee = book_item.return_book()
        member.borrowed_books.remove(book_item)
        member.total_late_fees += late_fee
        
        if late_fee > 0:
            print(f"{member.name} returned '{book_item.book.title}' - Late fee: ${late_fee:.2f}")
        else:
            print(f"{member.name} returned '{book_item.book.title}'")
        
        return True
    
    def reserve_book(self, member_id: str, isbn: str) -> bool:
        member = self.members.get(member_id)
        book = self.books.get(isbn)
        
        if not member or not book:
            return False
        
        # Check if already reserved by this member
        if any(r.member == member and r.book == book for r in self.reservations):
            print("Book already reserved by this member")
            return False
        
        reservation = Reservation(member, book)
        self.reservations.append(reservation)
        print(f"{member.name} reserved '{book.title}'")
        return True
    
    def clean_expired_reservations(self):
        """Remove expired reservations"""
        self.reservations = [r for r in self.reservations if not r.is_expired()]


# Demo usage
if __name__ == "__main__":
    library = Library("City Central Library")
    
    # Add books
    book1 = Book("978-0134685991", "Effective Java", "Joshua Bloch", "Programming")
    book2 = Book("978-0596009205", "Head First Design Patterns", "Eric Freeman", "Programming")
    
    library.add_book(book1)
    library.add_book(book2)
    
    # Add book items (copies)
    library.add_book_item(BookItem("ITEM001", book1))
    library.add_book_item(BookItem("ITEM002", book1))  # Second copy
    library.add_book_item(BookItem("ITEM003", book2))
    
    # Add members
    member1 = Member("M001", "Alice", MembershipType.BASIC)
    member2 = Member("M002", "Bob", MembershipType.PREMIUM)
    
    library.add_member(member1)
    library.add_member(member2)
    
    # Checkout books
    print("=== Checkout Operations ===")
    library.checkout_book("M001", "ITEM001")
    library.checkout_book("M002", "ITEM003")
    
    # Search
    print("\n=== Search Results ===")
    results = library.search_by_title("Java")
    for book in results:
        print(f"Found: {book.title} by {book.author}")
    
    # Return books
    print("\n=== Return Operations ===")
    library.return_book("M001", "ITEM001")
    
    # Reserve
    print("\n=== Reservation ===")
    library.reserve_book("M001", "978-0596009205")