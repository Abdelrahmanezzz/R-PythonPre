import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookService } from '../../../core/services/book.service';
import { Book } from '../../../core/models/book.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-management.component.html'
})
export class BookManagementComponent implements OnInit {
  private bookService = inject(BookService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  books = signal<Book[]>([]);
  editingId = signal<number | null>(null);

  bookForm = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    isbn: ['', Validators.required],
    total_copies: [1, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.bookService.getBooks().subscribe({
      next: (books) => this.books.set(books),
      error: (err) => console.error('Failed to load books', err)
    });
  }

  onSubmit() {
    if (this.bookForm.valid) {
      const data = this.bookForm.value as any;
      const id = this.editingId();

      if (id) {
        this.bookService.updateBook(id, data).subscribe({
          next: () => {
            this.toastr.success('Book updated successfully');
            this.cancelEdit();
            this.loadBooks();
          },
          error: (err) => this.toastr.error(err.error?.detail || 'Update failed')
        });
      } else {
        this.bookService.createBook(data).subscribe({
          next: () => {
            this.toastr.success('Book added successfully');
            this.bookForm.reset({ total_copies: 1 });
            this.loadBooks();
          },
          error: (err) => this.toastr.error(err.error?.detail || 'Add failed')
        });
      }
    }
  }

  editBook(book: Book) {
    this.editingId.set(book.id);
    this.bookForm.patchValue({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      total_copies: book.total_copies
    });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.bookForm.reset({ total_copies: 1 });
  }

  deleteBook(id: number) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          this.toastr.success('Book deleted successfully');
          this.loadBooks();
        },
        error: (err) => this.toastr.error(err.error?.detail || 'Delete failed')
      });
    }
  }
}
