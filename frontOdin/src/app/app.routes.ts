import { Routes } from '@angular/router';
import { Loguin } from './loguin/loguin';
import { Menu } from './menu/menu';
import { Radicaion } from './radicaion/radicaion';
import { GestionUsuarios } from './gestion-usuarios/gestion-usuarios';
import { GestionTramites } from './gestion-tramites/gestion-tramites';
import { ConsultaSeguimiento } from './consulta-seguimiento/consulta-seguimiento';

export const routes: Routes = [
{ path: '', redirectTo: 'login', pathMatch: 'full' },
{ path: 'login', component: Loguin },
{
  path: 'menu',
  component: Menu,
  children: [
    { path: '', redirectTo: 'radicacion', pathMatch: 'full' },
    { path: 'radicacion', component: Radicaion },
    { path: 'gestionusuarios', component: GestionUsuarios },
    { path: 'gestiontramites', component: GestionTramites },
    { path: 'consultaseguimiento', component: ConsultaSeguimiento },
  ],
},
];
