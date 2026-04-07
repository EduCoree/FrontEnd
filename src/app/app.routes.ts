import { Categories } from './pages/centers/categories/categories';
// import { CenterEdit } from './pages/centers/center-edit/center-edit/center-edit';
import { CreateQuizComponent } from './pages/Quizzes/CreateQuiz/create-quiz/create-quiz';
import{Home} from './pages/home/home';


import { Routes } from '@angular/router';
import { authGuard }  from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { adminGuard } from './core/guards/admin-guard';
 
// Auth pages
import { LoginComponent }          from './pages/login/login';
import { RegisterComponent }       from './pages/register/register';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { ConfirmEmailComponent }   from './pages/confirm-email/confirm-email';
 
// User pages
import { ProfileComponent }        from './pages/profile/profile';
import { TeacherProfileComponent } from './pages/teacher-profile/teacher-profile';
 
// Admin pages
import { AdminTeachersComponent }      from './pages/admin-teachers/admin-teachers';
import { AdminStudentsComponent }      from './pages/admin-students/admin-students';
import { AdminStudentDetailComponent } from './pages/admin-student-detail/admin-student-detail';
import { AdminCoursesComponent } from './pages/admin-courses/admin-courses';
export const routes: Routes = [
   // ── Public ────────────────────────────────────────────────────────────────
  {
    path: '',
    component: Home,
    title: 'EduCore',
  },
  {
    path: 'teachers/:id',
    component: TeacherProfileComponent,
    title: 'Teacher Profile — EduCore',
  },
 
  // ── Guest only (redirect to home if already logged in) ────────────────────
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
    title: 'Sign In — EduCore',
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard],
    title: 'Sign Up — EduCore',
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [guestGuard],
    title: 'Reset Password — EduCore',
  },
  {
    path: 'confirm-email',
    component: ConfirmEmailComponent,
    title: 'Confirm Email — EduCore',
  },
 
  // ── Auth required ─────────────────────────────────────────────────────────
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    title: 'My Profile — EduCore',
  },
 
  // ── Admin only ────────────────────────────────────────────────────────────
  {
    path: 'admin/teachers',
    component: AdminTeachersComponent,
    canActivate: [adminGuard],
    title: 'Teachers — Admin',
  },
  {
    path: 'admin/students',
    component: AdminStudentsComponent,
    canActivate: [adminGuard],
    title: 'Students — Admin',
  },
  {
    path: 'admin/students/:id',
    component: AdminStudentDetailComponent,
    canActivate: [adminGuard],
    title: 'Student Detail — Admin',
  },
   {
    path: 'admin/courses',
    component: AdminCoursesComponent,
    canActivate: [adminGuard],
    title: 'Courses — Admin',
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
},
{
        path: 'teacher/courses/:courseId/quizzes',
         loadComponent: () =>CreateQuizComponent
  },
{
  path: 'teacher/dashboard',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/teacher/teacher-dashboard/teacher-dashboard.component')
      .then(m => m.TeacherDashboardComponent)
},
  // Teacher Routes
  {
    path: 'teacher/courses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/teacher/my-courses/my-courses.component')
        .then(m => m.MyCoursesComponent)
  },
  {
    path: 'teacher/courses/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/teacher/create-course/create-course.component')
        .then(m => m.CreateCourseComponent)
  },
  {
    path: 'teacher/courses/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/teacher/edit-course/edit-course.component')
        .then(m => m.EditCourseComponent)
  },
{
  path: 'teacher/courses/:id/sections',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/teacher/course-sections/course-sections.component')
      .then(m => m.CourseSectionsComponent)
    },




//menna



{
  path: 'centers/:centerId/categories',
  loadComponent: () =>
    import('./pages/centers/categories/categories')
      .then(m => m.Categories)
}




















//samir











//tawfik

















//badr


















//obad



















// ,
//   {
//     path: 'centers/:centerId/categories',
//     loadComponent: () =>
//       import('./pages/')
//         .then(m => m.CategoriesComponent)
//   }
];
