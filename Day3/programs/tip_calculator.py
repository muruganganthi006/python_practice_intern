name = input("Enter your name: ")
age = int(input("Enter your age: "))
bill = float(input("Enter bill amount: "))
tip_percentage = float(input("Enter tip percentage: "))

tip_amount = bill * tip_percentage / 100

total = bill + tip_amount

print("\n========== RECEIPT ==========")
print(f"Name       : {name}")
print(f"Age        : {age}")
print(f"Bill       : ₹{bill:.2f}")
print(f"Tip        : {tip_percentage:.1f}%")
print(f"Tip Amount : ₹{tip_amount:.2f}")
print(f"Total      : ₹{total:.2f}")
print("=============================")