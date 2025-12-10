import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, InventoryExit } from '../../../core/services/inventory.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-request-detail-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
            <h3>Detalle de Solicitud: {{ request().request_code }}</h3>
            <button class="close-btn" (click)="close.emit()">×</button>
        </div>
        
        <div class="info-section">
            <p><strong>Docente:</strong> {{ request().profile?.display_name }}</p>
            <p><strong>Fecha:</strong> {{ request().created_at | date:'medium' }}</p>
        </div>

        <div class="items-list">
            @for (item of request().items; track item.id) {
                <div class="item-card" [class.processed]="item.status !== 'PENDING'">
                    <div class="item-info">
                        <h4>{{ item.product_name }}</h4>
                        <small>{{ item.product_code || 'Nuevo Producto' }}</small>
                        @if (item.description) { <p class="desc">{{ item.description }}</p> }
                    </div>
                    
                    <div class="item-meta">
                        <span class="qty">Cant: {{ item.quantity_requested }}</span>
                    </div>

                    <div class="item-actions">
                        @if (item.status === 'PENDING') {
                            @if (!item.is_new_product) {
                                <button class="btn-approve" (click)="confirmExit(item)">✅ Aprobar (Salida)</button>
                            } @else {
                                <button class="btn-approve-new" (click)="approveNew(item)">✅ Aprobar (Registro)</button>
                            }
                            <button class="btn-reject" (click)="rejectItem(item)">❌ Rechazar</button>
                        } @else {
                            <span class="status-badge" [class]="item.status">
                                {{ item.status === 'APPROVED' ? 'APROBADO' : 'RECHAZADO' }}
                            </span>
                        }
                    </div>
                </div>
            }
        </div>
      </div>
    </div>

    <!-- Exit Confirmation Modal (Nested) -->
    @if (exitItem()) {
        <div class="modal-overlay nested">
            <div class="modal-content small">
                <h3>Confirmar Salida de Stock</h3>
                <p>Se generará una salida de inventario automática.</p>
                
                <div class="form-group">
                    <label>Producto:</label>
                    <input [value]="exitItem().product_name" disabled class="form-control">
                </div>
                <div class="form-group">
                    <label>Cantidad a Despachar:</label>
                    <input type="number" [(ngModel)]="exitQuantity" class="form-control">
                </div>

                <div class="actions">
                    <button class="btn-secondary" (click)="cancelExit()">Cancelar</button>
                    <button class="btn-primary" (click)="processExit()">Confirmar</button>
                </div>
            </div>
        </div>
    }
  `,
    styles: [`
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); z-index: 1000;
      display: flex; justify-content: center; align-items: center;
    }
    .modal-overlay.nested { z-index: 1100; background: rgba(0,0,0,0.7); }

    .modal-content {
      background: white; border-radius: 0.5rem; padding: 2rem;
      width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto;
    }
    .modal-content.small { max-width: 400px; }

    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    h3 { margin: 0; color: #111827; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }

    .info-section { background: #f9fafb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; }
    .info-section p { margin: 0.25rem 0; color: #4b5563; }

    .item-card {
        border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;
        display: flex; align-items: center; gap: 1rem;
    }
    .item-card.processed { background-color: #f3f4f6; opacity: 0.8; }

    .item-info { flex: 1; }
    .item-info h4 { margin: 0; color: #111827; }
    .item-info small { color: #6b7280; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
    .desc { font-size: 0.875rem; color: #6b7280; margin: 0.25rem 0; }

    .item-meta { font-weight: bold; padding: 0 1rem; }

    .item-actions { display: flex; gap: 0.5rem; }

    .btn-approve { background: #059669; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer; }
    .btn-approve-new { background: #7c3aed; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer; }
    .btn-reject { background: #dc2626; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer; }
    
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; }
    .status-badge.APPROVED { background: #d1fae5; color: #059669; }
    .status-badge.REJECTED { background: #fee2e2; color: #dc2626; }

    .form-group { margin-bottom: 1rem; }
    .form-control { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; }
    .actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
    .btn-primary { background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .btn-secondary { background: white; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
  `]
})
export class RequestDetailModalComponent {
    inventoryService = inject(InventoryService); // Service injection

    request = input.required<any>();
    close = output<void>();
    updated = output<void>();

    // Nested Modal State
    exitItem = signal<any>(null);
    exitQuantity = signal(0);

    confirmExit(item: any) {
        this.exitItem.set(item);
        this.exitQuantity.set(item.quantity_requested);
    }

    cancelExit() {
        this.exitItem.set(null);
        this.exitQuantity.set(0);
    }

    async processExit() {
        const item = this.exitItem();
        const qty = this.exitQuantity();

        if (qty <= 0) return;

        try {
            // 1. Create Exit Record
            const exitData: InventoryExit = {
                code: item.product_code,
                exit_date: new Date().toISOString().split('T')[0],
                document_type: 'SOLICITUD',
                requesting_area: 'DOCENCIA', // Or derive from Docente profile?
                description: `Despacho Solicitud ${this.request().request_code}`,
                unit: 'UNIDAD', // Needs to come from inventory lookup really, but defaulting for now or fetch
                quantity: qty,
                authorizer: 'DIRECTOR', // Currently logged in director
                receiver: this.request().profile?.display_name || 'Docente',
                reason: 'Atención de Solicitud'
            };

            await this.inventoryService.createExit(exitData);

            // 2. Mark Item as APPROVED
            await this.inventoryService.updateRequestItemStatus(item.id, 'APPROVED');

            this.cancelExit();
            this.updated.emit();
        } catch (err) {
            console.error('Error processing exit', err);
            alert('Error al procesar salida');
        }
    }

    async approveNew(item: any) {
        if (!confirm('¿Aprobar solicitud de registro de nuevo producto?')) return;

        try {
            await this.inventoryService.updateRequestItemStatus(item.id, 'APPROVED');
            this.updated.emit();
        } catch (err) {
            console.error('Error approving', err);
        }
    }

    async rejectItem(item: any) {
        if (!confirm('¿Rechazar este ítem?')) return;

        try {
            await this.inventoryService.updateRequestItemStatus(item.id, 'REJECTED');
            this.updated.emit();
        } catch (err) {
            console.error('Error rejecting', err);
        }
    }
}
