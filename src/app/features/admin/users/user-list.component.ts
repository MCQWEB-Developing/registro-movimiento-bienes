import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserFormComponent } from './user-form.component';

interface UserProfile {
  id: string;
  role: string;
  display_name?: string;
  email?: string; // We might not get email easily if joining with auth.users is hard from client
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserFormComponent],
  template: `
    <div class="page-header">
      <h2>Gestión de Usuarios</h2>
      <button class="btn-primary" (click)="showCreateModal.set(true)">
        <span>+</span> Nuevo Usuario
      </button>
    </div>

    <div class="search-bar">
      <input type="text" placeholder="Buscar usuarios..." class="search-input">
    </div>

    <div class="table-container card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email (ID)</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (user of users(); track user.id) {
            <tr>
              <td class="font-medium text-gray-900">{{ user.display_name || 'Sin Nombre' }}</td>
              <!-- Emulating email display if we can't get it, otherwise just ID for now or maybe fetch it via function if possible -->
              <td class="text-sm text-gray-500">{{ user.email || user.id.substring(0, 8) + '...' }}</td>
              <td>
                <span class="badge" [ngClass]="user.role">
                  {{ user.role | titlecase }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button class="btn-icon" title="Editar" (click)="editUser(user)">✏️</button>
                  <button class="btn-icon text-red" title="Eliminar" (click)="deleteUser(user)">🗑️</button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4" class="text-center py-4 text-gray-500">
                No se encontraron usuarios.
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (showCreateModal()) {
        <app-user-form 
            [user]="editingUser()"
            (close)="closeModal()"
            (userCreated)="onUserCreated()"
        ></app-user-form>
    }
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h2 {
      font-size: 1.5rem;
      color: #1f2937;
      margin: 0;
    }

    .btn-primary {
      background-color: #4f46e5;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background-color 0.2s;
    }

    .btn-primary:hover {
      background-color: #4338ca;
    }

    .search-bar {
      margin-bottom: 1rem;
    }

    .search-input {
      width: 100%;
      max-width: 300px;
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
    }

    .card {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th, .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #f3f4f6;
    }

    .data-table th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #4b5563;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge.admin { background-color: #fee2e2; color: #991b1b; }
    .badge.director { background-color: #d1fae5; color: #065f46; }
    .badge.docente { background-color: #dbeafe; color: #1e40af; }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;
      border-radius: 0.25rem;
    }

    .btn-icon:hover {
      background-color: #f3f4f6;
    }
  `]
})
export class UserListComponent implements OnInit {
  private authService = inject(AuthService);
  users = signal<UserProfile[]>([]);
  showCreateModal = signal(false);
  editingUser = signal<UserProfile | null>(null);

  ngOnInit() {
    this.fetchUsers();
  }

  async fetchUsers() {
    const supabase = this.authService.getSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (data) {
      this.users.set(data as UserProfile[]);
    } else if (error) {
      console.error('Error fetching users:', error);
    }
  }

  onUserCreated() {
    this.fetchUsers(); // Refresh list
  }

  editUser(user: UserProfile) {
    this.editingUser.set(user);
    this.showCreateModal.set(true);
  }

  deleteUser(user: UserProfile) {
    if (confirm('¿Estás seguro de eliminar este usuario? Su acceso será revocado.')) {
      this.authService.deleteUser(user.id).then(() => {
        this.fetchUsers();
      }).catch(err => {
        console.error('Error deleting user', err);
        alert('Error al eliminar usuario: ' + err.message);
      });
    }
  }

  closeModal() {
    this.showCreateModal.set(false);
    this.editingUser.set(null);
  }
}
