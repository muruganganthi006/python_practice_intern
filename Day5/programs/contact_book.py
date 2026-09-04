contacts = {}

while True:
    print("\n========== CONTACT BOOK ==========")
    print("A - Add Contact")
    print("V - View All Contacts")
    print("S - Search Contact")
    print("U - Update Contact")
    print("D - Delete Contact")
    print("E - Exit")

    choice = input("Enter your choice: ").lower()

    if choice == "a":
        name = input("Enter name: ")
        phone = input("Enter phone: ")
        email = input("Enter email: ")

        contacts[name] = {
            "phone": phone,
            "email": email
        }

        print("Contact added successfully.")

    elif choice == "v":
        if len(contacts) == 0:
            print("No contacts found.")
        else:
            for name, details in contacts.items():
                print(f"\nName: {name}")
                print(f"Phone: {details['phone']}")
                print(f"Email: {details['email']}")

    elif choice == "s":
        name = input("Enter name to search: ")

        if name in contacts:
            print(f"Name: {name}")
            print(f"Phone: {contacts[name]['phone']}")
            print(f"Email: {contacts[name]['email']}")
        else:
            print("Contact not found.")

    elif choice == "u":
        name = input("Enter name to update: ")

        if name in contacts:
            phone = input("Enter new phone: ")
            email = input("Enter new email: ")

            contacts[name]["phone"] = phone
            contacts[name]["email"] = email

            print("Contact updated successfully.")
        else:
            print("Contact not found.")

    elif choice == "d":
        name = input("Enter name to delete: ")

        if name in contacts:
            del contacts[name]
            print("Contact deleted successfully.")
        else:
            print("Contact not found.")

    elif choice == "e":
        print("Exiting Contact Book.")
        break

    else:
        print("Invalid choice. Please try again.")