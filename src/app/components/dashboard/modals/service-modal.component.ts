import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhoneInputComponent } from '../../shared/phone-input/phone-input.component';

@Component({
  selector: 'app-service-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneInputComponent],
  templateUrl: './service-modal.component.html'
})
export class ServiceModalComponent {
  @Input() show = false;
  @Input() title = '';
  @Input() currentStep: 'details' | 'pin' = 'details';
  @Input() canProceed = false;

  @Output() onCancel = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<void>();
} 