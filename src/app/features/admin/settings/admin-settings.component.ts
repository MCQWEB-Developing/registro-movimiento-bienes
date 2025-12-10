import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-settings',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page-header">
      <h2>Configuración del Sistema</h2>
    </div>

    <div class="settings-container">
        <!-- Placeholder for future settings -->
        <div class="card">
            <h3>Información de la Institución</h3>
            <div class="form-group">
                <label>Nombre de la Institución</label>
                <input type="text" value="CETPRO" disabled class="input-disabled">
                <small>Contacte al desarrollador para cambiar esto.</small>
            </div>
        </div>

        <div class="card">
            <h3>Parametros del Sistema</h3>
            <p>Configuración de fechas, límites y otros parámetros globales.</p>
            <div class="alert-info">
                Próximamente: Gestión de Unidades de Medida y Categorías.
            </div>
        </div>
    </div>
  `,
    styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-header h2 { font-size: 1.5rem; color: #1f2937; margin: 0; }
    
    .settings-container { display: flex; flex-direction: column; gap: 1.5rem; }
    
    .card { background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card h3 { margin-top: 0; font-size: 1.1rem; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem; }
    
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #4b5563; }
    
    input { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
    .input-disabled { background-color: #f3f4f6; cursor: not-allowed; }
    
    .alert-info { background-color: #eff6ff; color: #1e40af; padding: 1rem; border-radius: 0.375rem; border: 1px solid #dbeafe; }
  `]
})
export class AdminSettingsComponent { }
