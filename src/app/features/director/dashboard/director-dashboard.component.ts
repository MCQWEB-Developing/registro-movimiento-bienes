import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-director-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <h1 class="welcome-title">Panel de Dirección</h1>
      <p class="subtitle">Bienvenido al sistema de gestión del CETPRO.</p>

      <div class="stats-grid">
        <div class="card action-card">
          <h3>📝 Registro de Entradas</h3>
          <p>Gestiona el ingreso de productos y materiales.</p>
          <a routerLink="/director/inventory" class="btn-link">Ir al Registro &rarr;</a>
        </div>

        <div class="card action-card">
          <h3>📤 Registro de Salidas</h3>
          <p>Gestiona la salida y distribución de bienes.</p>
          <a routerLink="/director/inventory-exits" class="btn-link">Ir al Registro &rarr;</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-title {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #6b7280;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e5e7eb;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-top: 0;
      margin-bottom: 0.75rem;
    }

    .card p {
        color: #4b5563;
        margin-bottom: 1.5rem;
    }

    .btn-link {
        display: inline-block;
        color: #2563eb;
        text-decoration: none;
        font-weight: 500;
    }

    .btn-link:hover {
        text-decoration: underline;
    }

    .coming-soon {
        background-color: #f3f4f6;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        color: #6b7280;
    }
  `]
})
export class DirectorDashboardComponent { }
