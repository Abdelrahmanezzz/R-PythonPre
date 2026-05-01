import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowService } from '../../../core/services/borrow.service';
import { BorrowRecord } from '../../../core/models/borrow.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-borrow-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './borrow-history.component.html'
})
export class BorrowHistoryComponent implements OnInit {
  private borrowService = inject(BorrowService);
  private toastr = inject(ToastrService);
  history = signal<BorrowRecord[]>([]);

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.borrowService.getMyHistory().subscribe({
      next: (history) => this.history.set(history),
      error: (err) => console.error('Failed to load history', err)
    });
  }

  returnBook(record: BorrowRecord) {
    this.borrowService.returnBook(record.book_id).subscribe({
      next: () => {
        this.toastr.success('Book returned successfully');
        this.loadHistory();
      },
      error: (err) => {
        this.toastr.error(err.error?.detail || 'Return failed');
      }
    });
  }
}
