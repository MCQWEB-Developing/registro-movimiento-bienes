import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { RealtimeChannel } from '@supabase/supabase-js';

@Component({
    selector: 'app-director-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './director-layout.component.html',
    styleUrls: ['./director-layout.component.css']
})
export class DirectorLayoutComponent implements OnInit {
    private authService = inject(AuthService);
    private inventoryService = inject(InventoryService);
    private router = inject(Router);
    private subscription: RealtimeChannel | null = null;

    // We read the centralized signal
    pendingCount = this.inventoryService.pendingRequestsCount;
    showNotifications = signal(false);

    ngOnInit() {
        // Initialize the global notification listener
        this.inventoryService.initializeNotifications();
    }

    // Removed local subscription setup as it is now in the service

    logout() {
        this.authService.logout();
    }

    toggleNotifications() {
        this.showNotifications.update(v => !v);
    }

    goToRequests() {
        this.router.navigate(['/director/requests']);
        this.showNotifications.set(false);
    }
}
