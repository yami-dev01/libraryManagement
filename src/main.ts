
interface Book {
    id: number;
    title: string;
    author: string;
    year: number | null;
    status: "Want to Read" | "Read";
}

const STORAGE_KEY = "myPersonalBooks";
const bookForm = document.getElementById("bookForm") as HTMLFormElement;
const titleInput = document.getElementById("title") as HTMLInputElement;
const authorInput = document.getElementById("author") as HTMLInputElement;
const yearInput = document.getElementById("year") as HTMLInputElement;
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const bookList = document.getElementById("bookList") as HTMLDivElement;
const formMessage = document.getElementById("formMessage") as HTMLParagraphElement;
const searchMessage = document.getElementById("searchMessage") as HTMLDivElement;

// Load books from localStorage
function loadBooks(): Book[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        const books = JSON.parse(data);
        return Array.isArray(books) ? books : [];
    } catch(e) {
        return [];
    }
}

let books: Book[] = loadBooks();

// Save books
function saveBooks(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}


// check whether this book already exsist
function isDuplicate(title : string , books : Book[]){
  const duplicate = books.reduce((acc , book) => {
      acc = acc || book.title.toLowerCase() === title.toLowerCase();
      return acc;
  }, false)
  return duplicate
}

// Add new book
bookForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const year = yearInput.value ? Number(yearInput.value) : null;
    

    if (!title || !author) {
        formMessage.textContent = "Please enter book title and author.";
        return;
    }

    if (year !== null && (!Number.isInteger(year) || year <= 0)) {
        formMessage.textContent = "Please enter a valid publication year.";
        return;
    }

    // Prevent duplicate books
    const duplicate = isDuplicate(title , books);
    
    if (duplicate) {
        formMessage.textContent = "This book is already in your library.";
        return;
    }

    const newBook: Book = {
        id: Date.now(),
        title,
        author,
        year,
        status: "Want to Read"
    };

    books.push(newBook);
    saveBooks();
    bookForm.reset();

    formMessage.textContent = "Book added successfully!";
    displayBooks();
});


function createBookDetails(book: Book): HTMLElement[] {
    const title = document.createElement("h3");
    title.textContent = book.title;

    const author = document.createElement("p");
    author.textContent = "Author: " + book.author;

    const year = document.createElement("p");
    year.textContent = "Publication Year: " + (book.year ?? "Unknown");

    return [title, author, year];
}


function createBookCard(book: Book): HTMLDivElement {
    const card = document.createElement("div");
    card.className = "book-card";

    const details = createBookDetails(book);
    const removeButton = createRemoveButton(book);

    card.append(
        ...details,
        removeButton
    );

    return card;
}


function createRemoveButton(book: Book): HTMLButtonElement {
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", () => {
        books = books.filter(item => item.id !== book.id);

        saveBooks();
        displayBooks(searchInput.value.trim());
    });
    return removeButton;
}

// Display searched books
function displayBooks(searchText : string = ""): void {

    bookList.innerHTML = "";

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchText.toLowerCase())
    );

    if (filteredBooks.length === 0) {
        bookList.textContent = searchText ? "No books found." : "Your library is empty. Add your first book!";
        return;
    }

    filteredBooks.forEach(book => {
        const card = createBookCard(book);
        bookList.appendChild(card);
    });
}

// Search only books added by the user
searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.trim();
    displayBooks(searchText);
    searchMessage.textContent = searchText ? "Searching your personal library" : "";
});

// Initial display
displayBooks();
