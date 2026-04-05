// import { CenterEdit } from './pages/centers/center-edit/center-edit/center-edit';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
   {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'centers/:id',
    loadComponent: () =>
      import('./pages/centers/center-detail/center-detail/center-detail')
        .then(m => m.CenterDetail)
  },


  {
  path: 'centers/:id/edit',
  loadComponent: () =>
    import('./pages/centers/center-edit/center-edit/center-edit')
      .then(m => m.CenterEdit)
},

{
  path: 'centers/:id/delete',
  loadComponent: () =>
    import('./pages/centers/center-delete/center-delete')
      .then(m => m.CenterDelete)
},

{
  path: 'centers/:id/logo',
  loadComponent: () =>
    import('./pages/centers/center-logo/center-logo')
      .then(m => m.CenterLogo)
}
// ,
//   {
//     path: 'centers/:centerId/categories',
//     loadComponent: () =>
//       import('./pages/')
//         .then(m => m.CategoriesComponent)
//   }
];
