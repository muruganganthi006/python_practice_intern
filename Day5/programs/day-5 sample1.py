marks = {
    "Murugan": 80,
    "John": 90,
    "Kumar": 70,
    "Aravinth": 60,
}

highest = max(marks.values())
average = sum(marks.values()) / len(marks)

print(f"Highest mark: {highest}")
print(f"Average mark: {average:.2f}")