import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    constructor() {
        // Auto-redirect if already logged in and role is loaded
        effect(() => {
            const user = this.authService.currentUser();
            const role = this.authService.userRole();
            if (user && role) {
                this.router.navigate(['/' + role]);
            }
        });
    }

    loginForm: FormGroup = this.fb.group({
        username: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });

    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading.set(true);
            this.errorMessage.set(null);

            const credentials = this.loginForm.value;

            this.authService.login(credentials).subscribe({
                next: (data) => {
                    this.isLoading.set(false);
                    if (data.role) {
                        this.router.navigate(['/' + data.role]);
                    } else {
                        // Login success but no role found?
                        this.errorMessage.set('Usuario autenticado pero sin rol asignado.');
                    }
                },
                error: (err) => {
                    this.isLoading.set(false);
                    // Show the specific error message from the service if available
                    this.errorMessage.set(err.message || 'Credenciales inválidas o error en el servidor');
                    console.error('Login error', err);
                }
            });
        } else {
            this.loginForm.markAllAsTouched();
        }
    }
}
