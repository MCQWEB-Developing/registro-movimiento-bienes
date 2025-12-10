import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-docente-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="layout-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo-area">
          <h2>Panel Docente</h2>
        </div>
        
        <nav class="nav-links">
            <a routerLink="/docente" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
                <span>🏠</span> Inicio
            </a>
            <a routerLink="/docente/requests" routerLinkActive="active" class="nav-item">
                <span>📋</span> Mis Solicitudes
            </a>
             <!-- Future: Reportes -->
        </nav>

        <div class="sidebar-footer">
            <button class="logout-btn" (click)="logout()">
                <span>🚪</span> Cerrar Sesión
            </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="top-bar">
          <div class="user-info">
             Hola, {{ (authService.currentUser()?.user_metadata)?.['full_name'] || 'Docente' }}
          </div>
        </header>

        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
    styles: [`
    .layout-container {
      display: flex;
      height: 100vh;
      background-color: #f3f4f6;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 250px;
      background-color: #ffffff;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
    }

    .logo-area {
      padding: 1.5rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .logo-area h2 {
      margin: 0;
      color: #7c3aed; /* Different color for Docente */
      font-size: 1.25rem;
    }

    .nav-links {
      flex: 1;
      padding: 1rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      color: #4b5563;
      text-decoration: none;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background-color: #f9fafb;
      color: #111827;
    }

    .nav-item.active {
      background-color: #f5f3ff;
      color: #7c3aed;
      border-left-color: #7c3aed;
    }

    .sidebar-footer {
        padding: 1rem;
        border-top: 1px solid #f3f4f6;
    }

    .logout-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: none;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        cursor: pointer;
        color: #4b5563;
        transition: all 0.2s;
    }

    .logout-btn:hover {
        background-color: #fee2e2;
        color: #ef4444;
        border-color: #fee2e2;
    }

    /* Main Content Styles */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .top-bar {
      background-color: white;
      padding: 1rem 2rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .user-info {
        font-weight: 500;
        color: #374151;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }
  `]
})
export class DocenteLayoutComponent {
    authService = inject(AuthService);
    private router = inject(Router);

    logout() {
        this.authService.logout().then(() => {
            this.router.navigate(['/login']);
        });
    }
}
