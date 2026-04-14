import { Navbar } from './shared/components/ui/navbar/navbar';
import { ChatWidgetComponent } from './pages/chat/components/chat-widget/chat-widget.component';
import { AuthService } from './core/services/auth';
import { Component, signal, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FlowbiteService } from './core/services/flowbite/flowbite';
import { initFlowbite } from 'flowbite';
import { Home } from './pages/home/home';
import { CreateQuizComponent } from "./pages/Quizzes/CreateQuiz/create-quiz/create-quiz";
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Sidebar } from "./shared/components/ui/sidebar/sidebar";




@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Sidebar, ChatWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
showNavbar = true;
authService = inject(AuthService);

  private hiddenRoutes = [
    '/teacher/courses/create',
    '/teacher/courses/edit',
  ];

  constructor(private flowbiteService: FlowbiteService, private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.showNavbar = !this.hiddenRoutes.some(r => e.url.startsWith(r));
      });
  }

    // constructor(private flowbiteService: FlowbiteService) {}

  ngOnInit(): void {
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
  }
}
