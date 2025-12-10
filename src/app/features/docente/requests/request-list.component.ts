import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';
import { RequestFormComponent } from './request-form.component';

@Component({
    selector: 'app-request-list',
    standalone: true,
    imports: [CommonModule, RequestFormComponent],
    template: `
    <div class="page-header">
      <h2 class="section-title">Mis Solicitudes de Materiales</h2>
      <button class="btn-primary" (click)="openCreateModal()">+ Nueva Solicitud</button>
    </div>

    <div class="cards-grid">
      @for (req of requests(); track req.id) {
        <div class="request-card">
          <div class="card-header">
            <div class="header-content">
                <span class="code">{{ req.request_code || 'SIN CÓDIGO' }}</span>
                <span class="date">{{ req.created_at | date:'medium' }}</span>
            </div>
            <div class="header-actions">
                <span class="status" [class]="req.status">{{ getStatusLabel(req.status) }}</span>
                @if (req.status === 'PENDING') {
                    <button class="btn-icon" (click)="editRequest(req)" title="Editar">✏️</button>
                }
            </div>
          </div>
          
          <div class="card-body">
            <h4>Ítems solicitados:</h4>
            <ul>
                @for (item of req.items; track item.id) {
                    <li>
                        <strong>{{ item.product_name }}</strong> ({{ item.quantity_requested }})
                        @if (item.is_new_product) {
                            <span class="badge-new">Nuevo</span>
                        }
                    </li>
                }
            </ul>
          </div>
        </div>
      } @empty {
        <div class="empty-state">
            <p>No has realizado ninguna solicitud aún.</p>
        </div>
      }
    </div>

    @if (showModal()) {
        <app-request-form
            [requestToEdit]="editingRequest()"
            (close)="closeModal()"
            (saved)="onSaved()"
        ></app-request-form>
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

    .btn-primary {
      background-color: #7c3aed;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary:hover { background-color: #6d28d9; }

    .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .request-card {
        background: white;
        border-radius: 0.5rem;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border: 1px solid #e5e7eb;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
        font-size: 0.875rem;
    }
    
    .header-content { display: flex; flex-direction: column; gap: 0.25rem; }
    .code { font-weight: bold; color: #4b5563; font-family: monospace; font-size: 1rem; }
    
    .header-actions { display: flex; align-items: center; gap: 0.5rem; }

    .btn-icon {
        background: none; border: none; cursor: pointer; font-size: 1rem;
        padding: 0.25rem; border-radius: 4px;
    }
    .btn-icon:hover { background-color: #f3f4f6; }

    .date { color: #6b7280; }

    .status {
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        font-weight: 500;
        text-transform: uppercase;
        font-size: 0.75rem;
    }
    .status.PENDING { background-color: #fef3c7; color: #d97706; }
    .status.APPROVED { background-color: #d1fae5; color: #059669; }
    .status.REJECTED { background-color: #fee2e2; color: #dc2626; }

    .card-body h4 {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        color: #374151;
    }

    ul {
        margin: 0;
        padding-left: 1.25rem;
        color: #4b5563;
    }
    
    li {
        margin-bottom: 0.25rem;
    }

    .badge-new {
        background-color: #dbeafe;
        color: #1e40af;
        font-size: 0.7rem;
        padding: 0.1rem 0.3rem;
        border-radius: 4px;
        margin-left: 0.5rem;
    }

    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: #6b7280;
        background: white;
        border-radius: 0.5rem;
    }
  `]
})
export class RequestListComponent implements OnInit {
    private inventoryService = inject(InventoryService);
    requests = signal<any[]>([]);
    showModal = signal(false);

    editingRequest = signal<any>(null);

    ngOnInit() {
        this.fetchRequests();
    }

    async fetchRequests() {
        try {
            const data = await this.inventoryService.getUserRequests();
            this.requests.set(data || []);
        } catch (error: any) {
            console.error('Error fetching requests', error);
        }
    }

    openCreateModal() {
        this.editingRequest.set(null);
        this.showModal.set(true);
    }

    editRequest(req: any) {
        this.editingRequest.set(req);
        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
        this.editingRequest.set(null);
    }

    onSaved() {
        this.fetchRequests();
    }

    getStatusLabel(status: string) {
        const labels: any = { 'PENDING': 'Pendiente', 'APPROVED': 'Aprobado', 'REJECTED': 'Rechazado' };
        return labels[status] || status;
    }
}
