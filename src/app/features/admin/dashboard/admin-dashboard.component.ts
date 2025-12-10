import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-icon bg-blue-100 text-blue-600">
          <span>👥</span>
        </div>
        <div class="stat-info">
          <h3>Total Usuarios</h3>
          <p class="stat-value">12</p>
          <p class="stat-change text-green-600">↑ 2 nuevos</p>
        </div>
      </div>

      <div class="card stat-card">
        <div class="stat-icon bg-green-100 text-green-600">
          <span>📦</span>
        </div>
        <div class="stat-info">
          <h3>Movimientos</h3>
          <p class="stat-value">1,234</p>
          <p class="stat-change text-green-600">↑ 15%</p>
        </div>
      </div>

      <div class="card stat-card">
        <div class="stat-icon bg-yellow-100 text-yellow-600">
          <span>📝</span>
        </div>
        <div class="stat-info">
          <h3>Solicitudes Pendientes</h3>
          <p class="stat-value">5</p>
          <p class="stat-change text-red-600">Revisión requerida</p>
        </div>
      </div>
    </div>

    <div class="recent-activity-section">
      <h3>Actividad Reciente</h3>
      <div class="card">
        <div class="empty-state">
          <p>No hay actividad reciente para mostrar</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e5e7eb;
    }

    .stat-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background-color: #eef2ff;
    }

    .stat-info h3 {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
      font-weight: 500;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin: 0.25rem 0;
    }

    .stat-change {
      font-size: 0.75rem;
      margin: 0;
    }

    .text-green-600 { color: #059669; }
    .text-red-600 { color: #dc2626; }
    
    .recent-activity-section h3 {
      font-size: 1.1rem;
      color: #374151;
      margin-bottom: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #9ca3af;
    }
  `]
})
export class AdminDashboardComponent { }
