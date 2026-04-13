import { Navbar } from './shared/components/ui/navbar/navbar';
import { Component, signal } from '@angular/core';
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
  imports: [RouterOutlet, Navbar, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
showNavbar = true;

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
