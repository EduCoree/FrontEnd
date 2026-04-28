import { QuizHistory } from './pages/Quizzes/quiz-history/quiz-history';
import { QuizResult } from './pages/Quizzes/quiz-result/quiz-result';
import { Categories } from './pages/centers/categories/categories';
// import { CenterEdit } from './pages/centers/center-edit/center-edit/center-edit';

import { QuestionsList } from './pages/Quizzes/questions-list/questions-list';
import { StudentQuizIntro } from './pages/Quizzes/student-quiz-intro/student-quiz-intro';
import { ActiveQuiz } from './pages/Quizzes/active-quiz/active-quiz';
import { AddQuestion } from './pages/Quizzes/add-question/add-question';
import { QuizSubmission } from './pages/Quizzes/quiz-submission/quiz-submission';
import { QuizComponent } from './pages/Quizzes/Get-Quizzez/get-quizzes/get-quizzes';
import { QuizBuilderComponent } from './pages/Quizzes/quiz-builder/quiz-builder';
import { CreateQuizComponent } from './pages/Quizzes/CreateQuiz/create-quiz/create-quiz';
import { Home } from './pages/home/home';
import { CourseWorkspaceComponent } from './pages/student/course-workspace/course-workspace.component';


import { Routes } from '@angular/router';
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
import { CourseDetailComponent } from './pages/Courses/course-detail/course-detail.component';
import { CoursesListComponent } from './pages/Courses/courses-list/courses-list.component';
import { StudentLayoutComponent } from './layouts/student-layout/student-layout.component';
import { StudentDashboardComponent } from './pages/student/student-dashboard/student-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { AdminCoursesComponent } from './pages/admin-courses/admin-courses';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
// import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { TeacherDashboardComponent } from './pages/teacher-dashboard/teacher-dashboard';
import { MyCoursesComponent } from './pages/student/my-courses/my-courses.component';
import { PaymentFailedComponent } from './pages/enroll&payment/payment-failed/payment-failed.component';
import { PaymentSuccessComponent } from './pages/enroll&payment/payment-success/payment-success.component';
// import { EnrollmentPageComponent } from './pages/enroll&payment/enrollment-page/enrollment-page.component';
import { Notification } from './pages/notification/notification';
import { ErrorPageComponent } from './pages/error-page/error-page';
import { AvailableQuizzes } from './pages/Quizzes/available-quizzes/available-quizzes';
import { StudentAgendaComponent } from './pages/student/student-agenda/student-agenda.component';
import { MyCertificatesComponent } from './pages/student/my-certificates/my-certificates.component';
import { PaymentHistoryComponent } from './pages/enroll&payment/payment-history/payment-history.component';
import { AdminPaymentsComponent } from './pages/enroll&payment/admin-payments/admin-payments.component';

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
 //Dashboard !!!! do not add guard yet
{ path: 'admin/dashboard', component: AdminDashboardComponent  },
 
{ path: 'teacher/dashboard/2', component: TeacherDashboardComponent  },
 
// { path: 'student/dashboard/2', component: StudentDashboardComponent },
 
    
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
  
  // Auth Routes
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login')
        .then(m => m.LoginComponent)
      },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register')
        .then(m => m.RegisterComponent)
      },
      {
        path: 'review/create',
        loadComponent: () =>
          import('./pages/Quizzes/CreateQuiz/create-quiz/create-quiz')
        .then(m => m.CreateQuizComponent)
      },
      {
  path: 'teacher/dashboard',
  canActivate: [authGuard, roleGuard('Teacher')],
  loadComponent: () =>
    import('./pages/teacher/teacher-dashboard/teacher-dashboard.component')
  .then(m => m.TeacherDashboardComponent)
},
{
  path: 'teacher/courses',
  canActivate: [authGuard, roleGuard('Teacher')],
  loadComponent: () =>
    import('./pages/teacher/my-courses/my-courses.component')
  .then(m => m.MyCoursesComponent)
},
{
  path: 'teacher/courses/create',
  canActivate: [authGuard, roleGuard('Teacher')],
  loadComponent: () =>
    import('./pages/teacher/create-course/create-course.component')
        .then(m => m.CreateCourseComponent)
  },
  {
    path: 'teacher/courses/edit/:id',
    canActivate: [authGuard, roleGuard('Teacher')],
    loadComponent: () =>
      import('./pages/teacher/edit-course/edit-course.component')
        .then(m => m.EditCourseComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/teacher/course-info/course-info.component')
            .then(m => m.CourseInfoComponent),
        title: 'Edit Course — EduCore',
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./pages/teacher/teacher-sessions/teacher-sessions.component')
            .then(m => m.TeacherSessionsComponent),
        title: 'Live Sessions — EduCore',
      },
      {
        path: 'progress',
        loadComponent: () =>
          import('./pages/teacher/teacher-progress/teacher-progress.component')
            .then(m => m.TeacherProgressComponent),
        title: 'Student Progress — EduCore',
      },
    ]
  },
  {
    path: 'teacher/courses/:id/sections',
    canActivate: [authGuard, roleGuard('Teacher')],
    loadComponent: () =>
      import('./pages/teacher/course-sections/course-sections.component')
    .then(m => m.CourseSectionsComponent)
  },
  
  // Content Delivery: Lesson Manager
  {
  path: 'teacher/courses/:courseId/lessons/:lessonId',
  canActivate: [authGuard, roleGuard('Teacher')],
  loadComponent: () =>
    import('./pages/teacher/lesson-manager/lesson-manager.component')
  .then(m => m.LessonManagerComponent),
  title: 'Lesson Manager — EduCore',
},
{
  path: 'student/progress',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/student/student-progress/student-progress.component')
  .then(m => m.StudentProgressComponent),
  title: 'My Progress — EduCore',
},
// {
  //   path: 'student/certificates',
  //   canActivate: [authGuard],
  //   loadComponent: () =>
  //     import('./pages/student/my-certificates/my-certificates.component')
  //       .then(m => m.MyCertificatesComponent),
  //   title: 'My Certificates — EduCore',
  // },
  // Content Delivery: Media Page (wired)
  {
    path: 'teacher/courses/:id/media',
  canActivate: [authGuard, roleGuard('Teacher')],
  loadComponent: () =>
    import('./pages/lessons/course-media/course-media.component')
      .then(m => m.CourseMediaComponent),
      title: 'Course Media — EduCore',
    },
  {
    path: 'certificates/:certificateId',
    loadComponent: () =>
      import('./pages/public/certificate-detail/certificate-detail.component')
    .then(m => m.CertificateDetailComponent),
    title: 'Certificate — EduCore',
  },
  
  //hala
  {
    path: 'admin/teachers',
  component: AdminTeachersComponent,
  title: 'Teachers — Admin',
},
{
  path: 'admin/students',
  component: AdminStudentsComponent,
  title: 'Students — Admin',
},
{
  path: 'admin/students/:id',
  component: AdminStudentDetailComponent,
  title: 'Student Detail — Admin',
},
{
  path: 'admin/payments',
  component: AdminPaymentsComponent,
  canActivate: [adminGuard],
  title: 'Payments — Admin',
},


   








// ── Teacher Payouts  ────────────────────────────────────────────
{
  path: 'teacher/payout/dashboard',
  canActivate: [authGuard, roleGuard('Teacher')],
  loadComponent: () =>
    import('./pages/teacher/teacher-payout-dashboard/teacher-payout-dashboard')
      .then(m => m.TeacherPayoutDashboardComponent),
  title: 'Earnings Dashboard — EduCore',
},
{
  path: 'teacher/payout/earnings',
  canActivate: [authGuard, roleGuard('Teacher')],
  loadComponent: () =>
    import('./pages/teacher/teacher-earnings/teacher-earnings')
      .then(m => m.TeacherEarningsComponent),
  title: 'My Earnings — EduCore',
},
{
  path: 'teacher/payout/invoices',
  canActivate: [authGuard, roleGuard('Teacher')],
  loadComponent: () =>
    import('./pages/teacher/teacher-invoices/teacher-invoices')
      .then(m => m.TeacherInvoicesComponent),
  title: 'My Invoices — EduCore',
},
{
  path: 'teacher/payout/invoices/:id',
  canActivate: [authGuard, roleGuard('Teacher')],
  loadComponent: () =>
    import('./pages/teacher/teacher-invoice-detail/teacher-invoice-detail')
      .then(m => m.TeacherInvoiceDetailComponent),
  title: 'Invoice Detail — EduCore',
},

// ── Admin Payouts ──────────────────────────────────────────────
{
  path: 'admin/payout/dashboard',
  canActivate: [authGuard, roleGuard('Admin')],
  loadComponent: () =>
    import('./pages/admin/admin-payout-dashboard/admin-payout-dashboard')
      .then(m => m.AdminPayoutDashboardComponent),
  title: 'Payout Dashboard — Admin',
},
{
  path: 'admin/payout/invoices',
  canActivate: [authGuard, roleGuard('Admin')],
  loadComponent: () =>
    import('./pages/admin/admin-all-invoices/admin-all-invoices')
      .then(m => m.AdminAllInvoicesComponent),
  title: 'All Invoices — Admin',
},
{
  path: 'admin/payout/invoices/:id',
  canActivate: [authGuard, roleGuard('Admin')],
  loadComponent: () =>
    import('./pages/admin/admin-invoice-detail/admin-invoice-detail')
      .then(m => m.AdminInvoiceDetailComponent),
  title: 'Manage Invoice — Admin',
},
{
  path: 'admin/payout/settings',
  canActivate: [authGuard, roleGuard('Admin')],
  loadComponent: () =>
    import('./pages/admin/admin-payout-settings/admin-payout-settings')
      .then(m => m.AdminPayoutSettingsComponent),
  title: 'Payout Settings — Admin',
},
{
  path: 'admin/payout/generate',
  canActivate: [authGuard, roleGuard('Admin')],
  loadComponent: () =>
    import('./pages/admin/admin-generate-invoices/admin-generate-invoices')
      .then(m => m.AdminGenerateInvoicesComponent),
  title: 'Generate Invoices — Admin',
},










//menna







//menna





{
  path: 'centers/:centerId/categories',
  loadComponent: () =>
    import('./pages/centers/categories/categories')
      .then(m => m.Categories),
},


{
  path: 'courses/:courseId/reviews',
  loadComponent: () =>
    import('./pages/reviews/reviews')
      .then(m => m.Reviews)
}
,












//samir
{ path: 'courses', component: CoursesListComponent },
{ path: 'courses/:id', component: CourseDetailComponent },
{
  path: 'student',
  component: StudentLayoutComponent,
  canActivate: [authGuard, roleGuard('Student')],
  children: [
    { path: 'dashboard', component: StudentDashboardComponent },
    { path: 'my-courses', component: MyCoursesComponent },
    {path:'quizzes',component:AvailableQuizzes},
    {path:'quiz-history',component:QuizHistory},
    { path: 'sessions',component:StudentAgendaComponent,title: 'My Schedule — EduCore'},
    { path: 'certificates',component:MyCertificatesComponent,title: 'My Certificates — EduCore'},
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'payment-history', component: PaymentHistoryComponent },
  ]
},
{
  path: 'teacher/courses/:id/pricing',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/teacher/course-pricing/course-pricing.component')
      .then(m => m.CoursePricingComponent)
},
{ path: 'payment/success', component: PaymentSuccessComponent },
{ path: 'payment/failed',  component: PaymentFailedComponent },








//tawfik

{
  path: 'teacher/courses/:courseId/quizzes',
  canActivate: [authGuard, roleGuard('Teacher')],
  component: QuizComponent,
},
{
  path:'teacher/quizzes/:quizId/builder',
   canActivate: [authGuard, roleGuard('Teacher')],
  component: QuizBuilderComponent
},
{
  path: 'teacher/quizzes/:quizId/add-question',
   canActivate: [authGuard, roleGuard('Teacher')],
  component : AddQuestion,
},

{
  path: 'quiz/intro/:quizId',
   canActivate: [authGuard, roleGuard('Student')],
  component : StudentQuizIntro,
},

{
  path: 'quiz/:quizId/attempt/:attemptId',
   canActivate: [authGuard, roleGuard('Student')],
  component : ActiveQuiz,
},


  
{
  path: 'Quiz/:quizId/result/:attemptId',
   canActivate: [authGuard, roleGuard('Student')],
  component : QuizResult,
},


{
  path: 'notifications',
   canActivate: [authGuard, roleGuard('Student')],
  component : Notification,
},















//badr

// ── Forum ────────────────────────────────────────────────────────────────
{
  path: 'courses/:courseId/forum',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/forum/forum-posts/forum-posts')
      .then(m => m.ForumPostsComponent),
  title: 'Forum — EduCore',
},
{
  path: 'courses/:courseId/forum/:postId',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/forum/forum-post-detail/forum-post-detail')
      .then(m => m.ForumPostDetailComponent),
  title: 'Post Detail — EduCore',
},
{
  path: 'admin/forum/reports',
  canActivate: [adminGuard],
  loadComponent: () =>
    import('./pages/forum/forum-admin-reports/forum-admin-reports')
      .then(m => m.ForumAdminReportsComponent),
  title: 'Forum Reports — Admin',
},

// Content Delivery: Student Video Watch (Signed URL)
{
  path: 'student/courses/:courseId/lessons/:lessonId/watch',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/student/video-watch/video-watch.component')
      .then(m => m.StudentVideoWatchComponent),
  title: 'Watch Lesson — EduCore',
},

// NOTE: Teacher Sessions and Teacher Progress are now CHILD routes of
// teacher/courses/edit/:id — see the parent route definition above.
{
    path: 'student/courses/:courseId/lessons/:lessonId/player',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/student/lesson-player/lesson-player.component')
        .then(m => m.LessonPlayerComponent),
    title: 'Lesson Player — EduCore',
  },
  {
    path: 'student/courses/:courseId',
    canActivate: [authGuard],
    component: CourseWorkspaceComponent,
    title: 'Course Workspace — EduCore',
  },



{ path: 'error', component: ErrorPageComponent, data: { code: 404 } },
{ path: 'error/401', component: ErrorPageComponent, data: { code: 401 } },
{ path: 'error/403', component: ErrorPageComponent, data: { code: 403 } },
{ path: 'error/404', component: ErrorPageComponent, data: { code: 404 } },
{ path: 'error/500', component: ErrorPageComponent, data: { code: 500 } },
{ path: '**', component: ErrorPageComponent, data: { code: 404 } },
];
