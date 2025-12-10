import { Injectable, inject, Injector } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, take, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    private authService = inject(AuthService);
    private router = inject(Router);
    private injector = inject(Injector);

    canActivate(route: ActivatedRouteSnapshot) {
        const expectedRoles = route.data['roles'] as Array<string>;

        // Convert signal to observable to wait for it to be populated if needed
        // In a real app we might want a more robust "auth loaded" state
        return toObservable(this.authService.userRole, { injector: this.injector }).pipe(
            filter(role => role !== undefined), // Wait until role is determined (or null)
            take(1),
            map(role => {
                if (!role) {
                    // Not logged in or no role
                    return this.router.createUrlTree(['/login']);
                }

                if (expectedRoles.includes(role)) {
                    return true;
                } else {
                    // Role not authorized, maybe redirect to their own dashboard?
                    // For now, redirect to login or a 403 page
                    if (role === 'admin') return this.router.createUrlTree(['/admin']);
                    if (role === 'director') return this.router.createUrlTree(['/director']);
                    if (role === 'docente') return this.router.createUrlTree(['/docente']);

                    return this.router.createUrlTree(['/login']);
                }
            })
        );
    }
}
