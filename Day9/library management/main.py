from library import Library


def display_menu() -> None:

    print("\n===== LIBRARY MANAGEMENT SYSTEM =====")
    print("1. Add Book")
    print("2. Add Member")
    print("3. Borrow Book")
    print("4. Return Book")
    print("5. Search Books")
    print("6. View All Books")
    print("7. View All Members")
    print("8. Exit")


def main() -> None:

    library = Library()

    while True:

        display_menu()

        choice = input("Enter your choice: ").strip()

        if choice == "1":

            try:
                book_id = int(input("Enter book ID: "))
                title = input("Enter book title: ").strip()
                author = input("Enter author: ").strip()

                library.add_book(book_id, title, author)

            except ValueError:
                print("Book ID must be a number.")

        elif choice == "2":

            try:
                member_id = int(input("Enter member ID: "))
                name = input("Enter member name: ").strip()

                library.add_member(member_id, name)

            except ValueError:
                print("Member ID must be a number.")

        elif choice == "3":

            try:
                book_id = int(input("Enter book ID: "))
                member_id = int(input("Enter member ID: "))

                library.borrow_book(book_id, member_id)

            except ValueError:
                print("IDs must be numbers.")

        elif choice == "4":

            try:
                book_id = int(input("Enter book ID: "))

                library.return_book(book_id)

            except ValueError:
                print("Book ID must be a number.")

        elif choice == "5":

            keyword = input("Enter title or author to search: ").strip()

            results = library.search_books(keyword)

            if not results:
                print("No books found.")

            else:
                print("\n--- SEARCH RESULTS ---")

                for book in results:
                    print(book)

        elif choice == "6":

            print("\n--- ALL BOOKS ---")

            if not library.books:
                print("No books available.")

            else:
                for book in library.books:
                    print(book)

        elif choice == "7":

            print("\n--- ALL MEMBERS ---")

            if not library.members:
                print("No members registered.")

            else:
                for member in library.members:
                    print(member)

        elif choice == "8":

            print("Thank you for using the Library Management System.")
            break

        else:

            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()