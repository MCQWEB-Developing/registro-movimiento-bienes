import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';
import { RequestDetailModalComponent } from './index';

@Component({
  selector: 'app-director-request-list',
  standalone: true,
  imports: [CommonModule, RequestDetailModalComponent],
  template: `
    <div class="page-header">
      <h2 class="section-title">Gestión de Solicitudes</h2>
    </div>

    <div class="filters">
        <button [class.active]="filter() === 'ALL'" (click)="filter.set('ALL')">Todas</button>
        <button [class.active]="filter() === 'PENDING'" (click)="filter.set('PENDING')">Pendientes</button>
    </div>

    @if (errorMsg()) {
        <div style="background: #fee2e2; color: #b91c1c; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
            {{ errorMsg() }}
        </div>
    }

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Docente</th>
            <th>Fecha</th>
            <th>Estado</th> <!-- Derived from items -->
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (req of filteredRequests(); track req.id) {
            <tr>
              <td class="code-cell">{{ req.request_code || '---' }}</td>
              <td>
                  <div class="user-info">
                      <span class="name">{{ req.profile?.display_name || 'Desconocido' }}</span>
                      <small>{{ req.profile?.email }}</small>
                  </div>
              </td>
              <td>{{ req.created_at | date:'medium' }}</td>
              <td>
                   <span class="status-badge" [class]="getAggregateStatus(req)">
                      {{ getAggregateStatus(req) }}
                   </span>
              </td>
              <td>
                <button class="btn-action" (click)="openDetail(req)">Ver Detalles</button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="5" class="empty-cell">No hay solicitudes para mostrar.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (selectedRequest()) {
        <app-request-detail-modal
            [request]="selectedRequest()"
            (close)="closeDetail()"
            (updated)="onUpdated()"
        ></app-request-detail-modal>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .section-title { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0; }

    .filters { margin-bottom: 1.5rem; display: flex; gap: 1rem; }
    .filters button {
        padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 0.375rem; cursor: pointer;
    }
    .filters button.active { background-color: #7c3aed; color: white; border-color: #7c3aed; }

    .table-container { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background-color: #f9fafb; font-weight: 600; color: #4b5563; }
    tr:last-child td { border-bottom: none; }
    
    .code-cell { font-family: monospace; font-weight: bold; color: #6b7280; }
    .user-info { display: flex; flex-direction: column; }
    .user-info .name { font-weight: 500; color: #111827; }
    .user-info small { color: #6b7280; }

    .status-badge { padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .status-badge.PENDING { background-color: #fef3c7; color: #d97706; }
    .status-badge.PARTIAL { background-color: #dbkhda; color: #9333ea; }
    .status-badge.COMPLETED { background-color: #d1fae5; color: #059669; }

    .btn-action { background-color: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; }
    .btn-action:hover { background-color: #1d4ed8; }
    .empty-cell { text-align: center; color: #6b7280; padding: 2rem; }
  `]
})
export class DirectorRequestListComponent implements OnInit {
  private inventoryService = inject(InventoryService);

  requests = signal<any[]>([]);
  selectedRequest = signal<any>(null);
  filter = signal<'ALL' | 'PENDING'>('ALL');

  filteredRequests = computed(() => {
    const reqs = this.requests();
    if (this.filter() === 'ALL') return reqs;
    return reqs.filter(r => r.items.some((i: any) => i.status === 'PENDING'));
  });

  ngOnInit() {
    this.fetchRequests();
  }

  errorMsg = signal('');

  async fetchRequests() {
    try {
      const data = await this.inventoryService.getAllRequests();
      this.requests.set(data || []);
    } catch (error: any) {
      console.error('Error fetching requests', error);
      this.errorMsg.set('Error: ' + (error.message || JSON.stringify(error)));
    }
  }

  openDetail(req: any) {
    this.selectedRequest.set(req);
  }

  closeDetail() {
    this.selectedRequest.set(null);
  }

  onUpdated() {
    this.fetchRequests();
  }

  getAggregateStatus(req: any): string {
    const items = req.items || [];
    if (items.length === 0) return 'EMPTY';

    const allPending = items.every((i: any) => i.status === 'PENDING');
    if (allPending) return 'PENDING';

    const allProcessed = items.every((i: any) => i.status !== 'PENDING');
    if (allProcessed) return 'COMPLETED';

    return 'PARTIAL';
  }
}
