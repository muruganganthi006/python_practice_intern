class Book:

    def __init__(
        self,
        book_id: int,
        title: str,
        author: str,
        borrowed_by: int | None = None
    ):
        self.book_id = book_id
        self.title = title
        self.author = author
        self.borrowed_by = borrowed_by

    def is_available(self) -> bool:
        return self.borrowed_by is None

    def __str__(self) -> str:
        status = "Available" if self.is_available() else "Borrowed"

        return (
            f"{self.book_id} | "
            f"{self.title} | "
            f"{self.author} | "
            f"{status}"
        )


class Member:

    def __init__(
        self,
        member_id: int,
        name: str
    ):
        self.member_id = member_id
        self.name = name

    def __str__(self) -> str:
        return f"{self.member_id} | {self.name}"