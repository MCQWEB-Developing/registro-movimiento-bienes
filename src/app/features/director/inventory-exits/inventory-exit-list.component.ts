import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, InventoryExit } from '../../../core/services/inventory.service';
import { InventoryExitFormComponent } from './inventory-exit-form.component';

@Component({
    selector: 'app-inventory-exit-list',
    standalone: true,
    imports: [CommonModule, InventoryExitFormComponent],
    template: `
    <div class="page-header">
      <h2 class="section-title">Registro de Salida de Productos/Materiales</h2>
      <button class="btn-primary" (click)="openCreateModal()">+ Nueva Salida</button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>N°</th>
            <th>Código</th>
            <th>Fecha</th>
            <th>Doc. Salida</th>
            <th>Área Solicitante</th>
            <th>Descripción</th>
            <th>Unidad</th>
            <th>Cant.</th>
            <th>Autoriza</th>
            <th>Recibe</th>
            <th>Motivo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (exit of exits(); track exit.id; let i = $index) {
            <tr>
              <td>{{ i + 1 }}</td>
              <td class="font-mono">{{ exit.code }}</td>
              <td>{{ exit.exit_date | date:'dd/MM/yyyy' }}</td>
              <td>{{ exit.document_type }}</td>
              <td>{{ exit.requesting_area }}</td>
              <td>{{ exit.description }}</td>
              <td>{{ exit.unit }}</td>
              <td class="text-center font-bold">{{ exit.quantity }}</td>
              <td>{{ exit.authorizer }}</td>
              <td>{{ exit.receiver }}</td>
              <td>{{ exit.reason }}</td>
              <td>
                <div class="actions">
                  <button class="btn-icon" title="Editar" (click)="editExit(exit)">✏️</button>
                  <button class="btn-icon text-red" title="Eliminar" (click)="deleteExit(exit)">🗑️</button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="12" class="text-center py-4 text-gray-500">
                No hay registros de salidas.
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (showModal()) {
        <app-inventory-exit-form
            [exit]="editingExit()"
            (close)="closeModal()"
            (saved)="onSaved()"
        ></app-inventory-exit-form>
    }
  `,
    styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
    }

    .table-container {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 1200px;
    }

    .data-table th, .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.875rem;
    }

    .data-table th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #374151;
      white-space: nowrap;
    }

    .data-table tr:hover {
      background-color: #f9fafb;
    }

    .btn-primary {
      background-color: #ef4444; /* Red/Orange for exits distinction */
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
      background-color: #dc2626;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: background 0.1s;
    }

    .btn-icon:hover {
      background-color: #f3f4f6;
    }
    
    .text-red {
        color: #ef4444;
    }

    .font-mono {
        font-family: monospace;
    }
    .font-bold {
        font-weight: 700;
    }
    .text-center {
        text-align: center;
    }
  `]
})
export class InventoryExitListComponent implements OnInit {
    private inventoryService = inject(InventoryService);
    exits = signal<InventoryExit[]>([]);

    showModal = signal(false);
    editingExit = signal<InventoryExit | null>(null);

    ngOnInit() {
        this.fetchExits();
    }

    async fetchExits() {
        try {
            const data = await this.inventoryService.getExits();
            this.exits.set(data);
        } catch (error) {
            console.error('Error loading exits:', error);
        }
    }

    openCreateModal() {
        this.editingExit.set(null);
        this.showModal.set(true);
    }

    editExit(exit: InventoryExit) {
        this.editingExit.set(exit);
        this.showModal.set(true);
    }

    deleteExit(exit: InventoryExit) {
        if (confirm(`¿Eliminar registro de salida ${exit.code}?`)) {
            this.inventoryService.deleteExit(exit.id!)
                .then(() => this.fetchExits())
                .catch(err => alert('Error: ' + err.message));
        }
    }

    closeModal() {
        this.showModal.set(false);
        this.editingExit.set(null);
    }

    onSaved() {
        this.fetchExits();
    }
}
