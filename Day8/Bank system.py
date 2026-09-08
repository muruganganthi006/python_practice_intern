class Account:

    def __init__(self, account_number, owner, balance=0):
        self.account_number = account_number
        self.owner = owner
        self._balance = balance
        self.transaction_history = []

    def deposit(self, amount):
        if amount <= 0:
            print("Deposit amount must be greater than 0.")
            return

        self._balance += amount
        self.transaction_history.append(f"Deposited: ₹{amount:.2f}")
        print(f"₹{amount:.2f} deposited successfully.")

    def withdraw(self, amount):
        if amount <= 0:
            print("Withdrawal amount must be greater than 0.")
            return

        if amount > self._balance:
            print("Insufficient balance.")
            return

        self._balance -= amount
        self.transaction_history.append(f"Withdrawn: ₹{amount:.2f}")
        print(f"₹{amount:.2f} withdrawn successfully.")

    def get_balance(self):
        return self._balance

    def __str__(self):
        return (
            f"Account: {self.account_number} | "
            f"Owner: {self.owner} | "
            f"Balance: ₹{self._balance:.2f}"
        )


class SavingsAccount(Account):

    def add_interest(self, rate):
        interest = self._balance * rate / 100
        self._balance += interest

        self.transaction_history.append(
            f"Interest added: ₹{interest:.2f}"
        )

        print(f"Interest of ₹{interest:.2f} added.")

account1 = Account("ACC001", "Murugan", 5000)
account2 = SavingsAccount("SAV001", "Kumar", 10000)

print("\n--- ACCOUNT 1 TRANSACTIONS ---")

account1.deposit(2000)
account1.withdraw(1500)
account1.withdraw(10000)


print("\n--- ACCOUNT 2 TRANSACTIONS ---")

account2.deposit(5000)
account2.withdraw(2000)
account2.add_interest(5)

print("\n--- ACCOUNT 1 STATEMENT ---")
print(account1)

print("\nTransaction History:")

for transaction in account1.transaction_history:
    print(transaction)


print("\n--- ACCOUNT 2 STATEMENT ---")
print(account2)

print("\nTransaction History:")

for transaction in account2.transaction_history:
    print(transaction)