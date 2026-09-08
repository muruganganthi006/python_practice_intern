import json

from models import Book, Member


class Library:

    def __init__(self, filename: str = "library_data.json"):
        self.filename = filename
        self.books: list[Book] = []
        self.members: list[Member] = []

        self.load_data()

    def add_book(
        self,
        book_id: int,
        title: str,
        author: str
    ) -> None:

        for book in self.books:
            if book.book_id == book_id:
                print("Book ID already exists.")
                return

        book = Book(book_id, title, author)

        self.books.append(book)

        self.save_data()

        print("Book added successfully.")

    def add_member(
        self,
        member_id: int,
        name: str
    ) -> None:

        for member in self.members:
            if member.member_id == member_id:
                print("Member ID already exists.")
                return

        member = Member(member_id, name)

        self.members.append(member)

        self.save_data()

        print("Member added successfully.")

    def borrow_book(
        self,
        book_id: int,
        member_id: int
    ) -> None:

        book = None
        member = None

        for current_book in self.books:
            if current_book.book_id == book_id:
                book = current_book
                break

        for current_member in self.members:
            if current_member.member_id == member_id:
                member = current_member
                break

        if book is None:
            print("Book not found.")
            return

        if member is None:
            print("Member not found.")
            return

        if not book.is_available():
            print("Book is already borrowed.")
            return

        book.borrowed_by = member_id

        self.save_data()

        print(f"{member.name} borrowed '{book.title}'.")

    def return_book(self, book_id: int) -> None:

        for book in self.books:

            if book.book_id == book_id:

                if book.is_available():
                    print("Book is already available.")
                    return

                book.borrowed_by = None

                self.save_data()

                print(f"'{book.title}' returned successfully.")
                return

        print("Book not found.")

    def search_books(self, keyword: str) -> list[Book]:

        keyword = keyword.lower()

        results = [
            book
            for book in self.books
            if keyword in book.title.lower()
            or keyword in book.author.lower()
        ]

        return results

    def save_data(self) -> None:

        data = {
            "books": [
                {
                    "book_id": book.book_id,
                    "title": book.title,
                    "author": book.author,
                    "borrowed_by": book.borrowed_by
                }
                for book in self.books
            ],

            "members": [
                {
                    "member_id": member.member_id,
                    "name": member.name
                }
                for member in self.members
            ]
        }

        with open(self.filename, "w") as file:
            json.dump(data, file, indent=4)

    def load_data(self) -> None:

        try:

            with open(self.filename, "r") as file:
                data = json.load(file)

            self.books = [
                Book(
                    item["book_id"],
                    item["title"],
                    item["author"],
                    item["borrowed_by"]
                )
                for item in data.get("books", [])
            ]

            self.members = [
                Member(
                    item["member_id"],
                    item["name"]
                )
                for item in data.get("members", [])
            ]

        except FileNotFoundError:

            self.books = []
            self.members = []