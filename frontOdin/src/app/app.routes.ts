import { Routes,RouterOutlet } from '@angular/router';
import { Radicaion } from './radicaion/radicaion';
import { GestionUsuarios } from './gestion-usuarios/gestion-usuarios';
import { GestionTramites } from './gestion-tramites/gestion-tramites';
import { ConsultaSeguimiento } from './consulta-seguimiento/consulta-seguimiento';

export const routes: Routes = [
{ path: '', redirectTo: 'radicacion', pathMatch: 'full' },
{ path: 'radicacion', component: Radicaion },
{ path: 'gestionusuarios', component: GestionUsuarios },
{ path: 'gestiontramites', component: GestionTramites },
{ path: 'consultaseguimiento', component: ConsultaSeguimiento },
];
