while True:
    print("\n--- SAFE DIVISION ---")
    print("1. Divide")
    print("2. Exit")

    choice = input("Enter your choice: ")

    if choice == "2":
        print("Program closed.")
        break

    elif choice == "1":
        try:
            a = float(input("Enter first number: "))
            b = float(input("Enter second number: "))

            result = a / b

            print("Result:", result)

        except ValueError:
            print("Please enter numbers only.")

        except ZeroDivisionError:
            print("Cannot divide by zero.")

    else:
        print("Invalid choice.")