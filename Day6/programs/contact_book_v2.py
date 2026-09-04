contacts = []


def add_contact():
    name = input("Enter name: ")
    phone = input("Enter phone number: ")

    contact = {
        "name": name,
        "phone": phone
    }

    contacts.append(contact)

    print("Contact added successfully!")


def view_contacts():
    if len(contacts) == 0:
        print("No contacts found.")
    else:
        print("\n--- CONTACTS ---")

        for contact in contacts:
            print("Name:", contact["name"])
            print("Phone:", contact["phone"])
            print("----------------")


def search_contact():
    search_name = input("Enter name to search: ")

    found = False

    for contact in contacts:
        if contact["name"].lower() == search_name.lower():
            print("\nContact found!")
            print("Name:", contact["name"])
            print("Phone:", contact["phone"])
            found = True
            break

    if not found:
        print("Contact not found.")


def update_contact():
    search_name = input("Enter name to update: ")

    for contact in contacts:
        if contact["name"].lower() == search_name.lower():

            new_name = input("Enter new name: ")
            new_phone = input("Enter new phone number: ")

            contact["name"] = new_name
            contact["phone"] = new_phone

            print("Contact updated successfully!")
            return

    print("Contact not found.")


def delete_contact():
    search_name = input("Enter name to delete: ")

    for contact in contacts:
        if contact["name"].lower() == search_name.lower():

            contacts.remove(contact)

            print("Contact deleted successfully!")
            return

    print("Contact not found.")


def main():
    while True:
        print("\n===== CONTACT BOOK =====")
        print("1. Add Contact")
        print("2. View Contacts")
        print("3. Search Contact")
        print("4. Update Contact")
        print("5. Delete Contact")
        print("6. Exit")

        choice = input("Enter your choice: ")

        if choice == "1":
            add_contact()

        elif choice == "2":
            view_contacts()

        elif choice == "3":
            search_contact()

        elif choice == "4":
            update_contact()

        elif choice == "5":
            delete_contact()

        elif choice == "6":
            print("Thank you for using Contact Book!")
            break

        else:
            print("Invalid choice. Please try again.")


main()