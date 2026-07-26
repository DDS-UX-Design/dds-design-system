import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./typography-page.component').then((m) => m.TypographyPageComponent)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
