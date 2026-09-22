import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMessage = signal('');
  isLoading = signal(false);
  currentLang: 'ar' | 'en' = 'ar';

  constructor() {
    // Already logged in? Go straight to the landing page (admin mode).
    if (this.auth.isLoggedIn()) this.router.navigate(['/']);
  }

  toggleLang(): void {
    this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']); // صفحة Home
      },
      error: (err) => {
        this.isLoading.set(false);
        const ar = this.currentLang === 'ar';
        this.errorMessage.set(
          err.status === 401 || err.status === 400
            ? (ar ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Incorrect email or password')
            : (ar ? 'حصل خطأ في الاتصال بالسيرفر' : 'Could not reach the server')
        );
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}