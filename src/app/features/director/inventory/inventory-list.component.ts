import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, InventoryEntry } from '../../../core/services/inventory.service';
import { InventoryFormComponent } from './inventory-form.component';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, InventoryFormComponent],
  template: `
    <div class="page-header">
      <h2 class="section-title">Registro de Entrada de Productos/Materiales</h2>
      <button class="btn-primary" (click)="openCreateModal()">+ Nuevo Registro</button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>N°</th>
            <th>Código</th>
            <th>Fecha</th>
            <th>Documento</th>
            <th>Proveedor</th>
            <th>Descripción</th>
            <th>Unidad</th>
            <th>Cant.</th>
            <th>Entrega</th>
            <th>Recibe</th>
            <th>Motivo/Forma</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (entry of entries(); track entry.id; let i = $index) {
            <tr>
              <td>{{ i + 1 }}</td>
              <td class="font-mono">{{ entry.code }}</td>
              <td>{{ entry.entry_date | date:'dd/MM/yyyy' }}</td>
              <td>{{ entry.document_type }}</td>
              <td>{{ entry.provider || '-' }}</td>
              <td>{{ entry.description }}</td>
              <td>{{ entry.unit }}</td>
              <td class="text-center font-bold">{{ entry.quantity }}</td>
              <td>{{ entry.deliverer }}</td>
              <td>{{ entry.receiver }}</td>
              <td>{{ entry.entry_type }}</td>
              <td>
                <div class="actions">
                  <button class="btn-icon" title="Editar" (click)="editEntry(entry)">✏️</button>
                  <button class="btn-icon text-red" title="Eliminar" (click)="deleteEntry(entry)">🗑️</button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="12" class="text-center py-4 text-gray-500">
                No hay registros de entradas.
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (showModal()) {
        <app-inventory-form
            [entry]="editingEntry()"
            (close)="closeModal()"
            (saved)="onSaved()"
        ></app-inventory-form>
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
      background-color: #2563eb;
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
      background-color: #1d4ed8;
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
export class InventoryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  entries = signal<InventoryEntry[]>([]);

  showModal = signal(false);
  editingEntry = signal<InventoryEntry | null>(null);

  ngOnInit() {
    this.fetchEntries();
  }

  async fetchEntries() {
    try {
      const data = await this.inventoryService.getEntries();
      this.entries.set(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  }

  openCreateModal() {
    this.editingEntry.set(null);
    this.showModal.set(true);
  }

  editEntry(entry: InventoryEntry) {
    this.editingEntry.set(entry);
    this.showModal.set(true);
  }

  deleteEntry(entry: InventoryEntry) {
    if (confirm(`¿Eliminar registro ${entry.code}?`)) {
      this.inventoryService.deleteEntry(entry.id!)
        .then(() => this.fetchEntries())
        .catch(err => alert('Error: ' + err.message));
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.editingEntry.set(null);
  }

  onSaved() {
    this.fetchEntries();
  }
}
