import { Component, Input, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../../core/models/book.model';
import { BorrowService } from '../../../core/services/borrow.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './book-card.component.html'
})
export class BookCardComponent {
  @Input({ required: true }) book!: Book;
  
  private borrowService = inject(BorrowService);
  authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  borrowBook() {
    this.borrowService.borrowBook(this.book.id).subscribe({
      next: () => {
        this.toastr.success(`You've successfully borrowed "${this.book.title}"`, 'Success!');
        this.book.available_copies--;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const message = err.error?.detail || 'An unexpected error occurred while borrowing.';
        this.toastr.error(message, 'Borrow Failed');
      }
    });
  }
}
