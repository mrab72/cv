from enum import Enum
from abc import ABC, abstractmethod
from typing import Optional, List


class MachineState(Enum):
    IDLE = 1
    SELECTING = 2
    PAYMENT_PENDING = 3
    DISPENSING = 4
    OUT_OF_SERVICE = 5


class Product:
    def __init__(self, code: str, name: str, price: float):
        self.code = code
        self.name = name
        self.price = price


class Inventory:
    def __init__(self, product: Product, quantity: int):
        self.product = product
        self.quantity = quantity
    
    def is_available(self) -> bool:
        return self.quantity > 0
    
    def deduct(self) -> bool:
        if self.is_available():
            self.quantity -= 1
            return True
        return False
    
    def restock(self, amount: int):
        self.quantity += amount


class Payment(ABC):
    @abstractmethod
    def process_payment(self, amount: float) -> bool:
        pass


class CashPayment(Payment):
    def __init__(self):
        self.inserted_amount = 0.0
        self.denominations = {  # Available bills/coins
            0.25: 20,
            0.50: 20,
            1.0: 20,
            5.0: 10,
            10.0: 10,
            20.0: 5
        }
    
    def insert_money(self, amount: float):
        self.inserted_amount += amount
        if amount in self.denominations:
            self.denominations[amount] += 1
    
    def process_payment(self, amount: float) -> bool:
        return self.inserted_amount >= amount
    
    def calculate_change(self, amount: float) -> dict:
        """Calculate change using available denominations"""
        change_needed = round(self.inserted_amount - amount, 2)
        change_given = {}
        
        for denomination in sorted(self.denominations.keys(), reverse=True):
            if change_needed <= 0:
                break
            
            available_count = self.denominations[denomination]
            needed_count = int(change_needed / denomination)
            coins_to_give = min(needed_count, available_count)
            
            if coins_to_give > 0:
                change_given[denomination] = coins_to_give
                change_needed = round(change_needed - (coins_to_give * denomination), 2)
                self.denominations[denomination] -= coins_to_give
        
        if change_needed > 0.01:  # Can't give exact change
            # Refund everything
            for denom, count in change_given.items():
                self.denominations[denom] += count
            return None
        
        return change_given
    
    def refund(self) -> float:
        amount = self.inserted_amount
        self.inserted_amount = 0.0
        return amount
    
    def reset(self):
        self.inserted_amount = 0.0


class CardPayment(Payment):
    def process_payment(self, amount: float) -> bool:
        # Simulate card payment - in real system would connect to payment gateway
        print(f"Processing card payment of ${amount:.2f}")
        return True  # Assume successful


class VendingMachine:
    def __init__(self, machine_id: str):
        self.machine_id = machine_id
        self.state = MachineState.IDLE
        self.inventory: dict[str, Inventory] = {}
        self.selected_product: Optional[Product] = None
        self.cash_payment = CashPayment()
    
    def add_product(self, product: Product, quantity: int):
        self.inventory[product.code] = Inventory(product, quantity)
    
    def display_products(self):
        print("\n=== Available Products ===")
        for code, inv in self.inventory.items():
            status = "Available" if inv.is_available() else "Out of Stock"
            print(f"{code}: {inv.product.name} - ${inv.product.price:.2f} ({inv.quantity} left) [{status}]")
    
    def select_product(self, code: str) -> bool:
        if self.state != MachineState.IDLE:
            print("Machine is busy")
            return False
        
        inv = self.inventory.get(code)
        if not inv:
            print("Invalid product code")
            return False
        
        if not inv.is_available():
            print(f"{inv.product.name} is out of stock")
            return False
        
        self.selected_product = inv.product
        self.state = MachineState.SELECTING
        print(f"Selected: {self.selected_product.name} - ${self.selected_product.price:.2f}")
        print("Please insert payment")
        return True
    
    def insert_cash(self, amount: float) -> bool:
        if self.state not in [MachineState.SELECTING, MachineState.PAYMENT_PENDING]:
            print("Please select a product first")
            return False
        
        self.cash_payment.insert_money(amount)
        self.state = MachineState.PAYMENT_PENDING
        
        print(f"Inserted: ${amount:.2f} | Total: ${self.cash_payment.inserted_amount:.2f}")
        
        if self.cash_payment.process_payment(self.selected_product.price):
            return self._dispense_product()
        else:
            remaining = self.selected_product.price - self.cash_payment.inserted_amount
            print(f"Need ${remaining:.2f} more")
        
        return False
    
    def pay_with_card(self) -> bool:
        if self.state != MachineState.SELECTING:
            print("Please select a product first")
            return False
        
        card_payment = CardPayment()
        if card_payment.process_payment(self.selected_product.price):
            self.state = MachineState.PAYMENT_PENDING
            return self._dispense_product()
        
        return False
    
    def _dispense_product(self) -> bool:
        self.state = MachineState.DISPENSING
        
        inv = self.inventory[self.selected_product.code]
        if not inv.deduct():
            print("Dispensing failed - out of stock")
            self._refund_and_reset()
            return False
        
        # Calculate and return change (for cash payments)
        if self.cash_payment.inserted_amount > 0:
            change = self.cash_payment.calculate_change(self.selected_product.price)
            if change is None:
                print("Unable to give exact change - refunding")
                inv.quantity += 1  # Restock
                self._refund_and_reset()
                return False
            
            if change:
                print("Change:")
                for denom, count in change.items():
                    print(f"  ${denom:.2f} x {count}")
        
        print(f"Dispensing {self.selected_product.name}... Enjoy!")
        
        self.cash_payment.reset()
        self.selected_product = None
        self.state = MachineState.IDLE
        return True
    
    def cancel_transaction(self):
        if self.state in [MachineState.SELECTING, MachineState.PAYMENT_PENDING]:
            self._refund_and_reset()
            print("Transaction cancelled")
    
    def _refund_and_reset(self):
        refund_amount = self.cash_payment.refund()
        if refund_amount > 0:
            print(f"Refunded: ${refund_amount:.2f}")
        
        self.selected_product = None
        self.state = MachineState.IDLE
    
    def restock(self, code: str, quantity: int):
        inv = self.inventory.get(code)
        if inv:
            inv.restock(quantity)
            print(f"Restocked {inv.product.name}: +{quantity} (Total: {inv.quantity})")


# Demo usage
if __name__ == "__main__":
    machine = VendingMachine("VM001")
    
    # Add products
    machine.add_product(Product("A1", "Coca Cola", 1.50), 5)
    machine.add_product(Product("A2", "Pepsi", 1.50), 3)
    machine.add_product(Product("B1", "Chips", 2.00), 10)
    machine.add_product(Product("B2", "Candy", 1.00), 0)  # Out of stock
    
    # Display products
    machine.display_products()
    
    # Transaction 1: Cash payment with change
    print("\n=== Transaction 1: Cash Payment ===")
    machine.select_product("A1")
    machine.insert_cash(2.00)
    
    # Transaction 2: Multiple cash insertions
    print("\n=== Transaction 2: Multiple Insertions ===")
    machine.select_product("B1")
    machine.insert_cash(1.00)
    machine.insert_cash(1.00)
    
    # Transaction 3: Cancel
    print("\n=== Transaction 3: Cancel ===")
    machine.select_product("A2")
    machine.insert_cash(1.00)
    machine.cancel_transaction()
    
    # Transaction 4: Card payment
    print("\n=== Transaction 4: Card Payment ===")
    machine.select_product("A2")
    machine.pay_with_card()
    
    # Try out of stock
    print("\n=== Transaction 5: Out of Stock ===")
    machine.select_product("B2")
    
    # Display final inventory
    machine.display_products()