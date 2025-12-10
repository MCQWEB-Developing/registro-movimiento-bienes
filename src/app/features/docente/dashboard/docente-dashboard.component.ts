import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-docente-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="dashboard-container">
      <h1>Panel de Docente</h1>
      <p>Bienvenido, Docente. Realiza tus solicitudes de productos aquí.</p>
    </div>
  `,
    styles: [`
    .dashboard-container {
      padding: 2rem;
    }
    h1 {
      color: #744210;
    }
  `]
})
export class DocenteDashboardComponent { }
