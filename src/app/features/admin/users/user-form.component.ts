import { Component, inject, signal, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <h3>{{ user() ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
        
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" formControlName="displayName">
          </div>

          <div class="form-group">
            <label>Correo Electrónico</label>
            <input type="email" formControlName="email">
          </div>

          @if (!user()) {
            <div class="form-group">
                <label>Contraseña Temporal</label>
                <input type="password" formControlName="password">
            </div>
          }

          <div class="form-group">
            <label>Rol</label>
            <select formControlName="role">
              <option value="director">Director</option>
              <option value="docente">Docente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div class="actions">
            <button type="button" (click)="close.emit()" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="isLoading()">
              {{ isLoading() ? 'Guardando...' : (user() ? 'Actualizar' : 'Crear Usuario') }}
            </button>
          </div>
          
          @if (errorMessage()) {
            <div class="error">{{ errorMessage() }}</div>
          }
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 0.5rem;
      width: 100%;
      max-width: 400px;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        font-size: 0.875rem;
    }
    input, select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        box-sizing: border-box;
    }
    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 1.5rem;
    }
    .btn-primary {
        background-color: #4f46e5;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        border: none;
        cursor: pointer;
    }
    .btn-secondary {
        background-color: white;
        color: #374151;
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        cursor: pointer;
    }
    .error {
        color: red;
        font-size: 0.875rem;
        margin-top: 1rem;
    }
  `]
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  user = input<any>(null); // Signal input
  close = output<void>();
  userCreated = output<void>();

  userForm: FormGroup = this.fb.group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['docente', [Validators.required]]
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const u = this.user();
      if (u) {
        // Edit Mode
        this.userForm.patchValue({
          displayName: u.display_name || '',
          email: u.email || '', // We might not have email in profile list unless we join or store it
          role: u.role
        });
        // Disable email as we can't change it easily here (and it might be empty)
        this.userForm.get('email')?.disable();
        // Password is not required for edit (unless we implemented password change, which we aren't doing for simple role edit)
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const { displayName, email, password, role } = this.userForm.value;
      const u = this.user();

      if (u) {
        // Update
        this.authService.updateUserProfile(u.id, role, displayName)
          .then(() => {
            this.isLoading.set(false);
            this.userCreated.emit(); // Re-use payload for refresh
            this.close.emit();
          })
          .catch(err => {
            this.isLoading.set(false);
            this.errorMessage.set(err.message);
          });
      } else {
        // Create
        this.authService.createUser(email, password, role, displayName)
          .then(() => {
            this.isLoading.set(false);
            this.userCreated.emit();
            this.close.emit();
          })
          .catch(err => {
            this.isLoading.set(false);
            this.errorMessage.set(err.message);
          });
      }

    } else {
      this.userForm.markAllAsTouched();
    }
  }
}
