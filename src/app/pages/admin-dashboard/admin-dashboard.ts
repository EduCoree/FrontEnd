import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  signal,
  computed,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminSidebarComponent } from '../../layouts/admin-sidebar/admin-sidebar';
import { DashboardService } from '../../core/services/dashboard';
import {
  AdminDashboard,
  TrendPoint,
  TopCourse,
} from '../../core/models/dashboard';
import { TranslateModule } from '@ngx-translate/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  DoughnutController,
  ArcElement,
  BarController,
  BarElement,
  Legend,
  ChartConfiguration,
} from 'chart.js';

Chart.register(
  LineController, LineElement, PointElement, LinearScale, CategoryScale,
  Filler, Tooltip, DoughnutController, ArcElement, BarController, BarElement, Legend
);

export interface EnrollmentStatusItem {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminSidebarComponent, TranslateModule],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('enrollmentChartCanvas') enrollmentChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChartCanvas') revenueChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('courseStatusChartCanvas') courseStatusChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('enrollmentStatusChartCanvas') enrollmentStatusChartCanvas!: ElementRef<HTMLCanvasElement>;

  loading = signal(true);
  kpis = signal<AdminDashboard | null>(null);
  enrollmentTrend = signal<TrendPoint[]>([]);
  revenueTrend = signal<TrendPoint[]>([]);
  topCourses = signal<TopCourse[]>([]);
  trendDays = signal<number>(30);

  enrollmentMax = signal(0);
  revenueMax = signal(0);

  enrollmentStatusData = signal<EnrollmentStatusItem[]>([
    { label: 'Certified', value: 584, color: '#2e6959' },
    { label: 'In progress', value: 323, color: '#8a6d3b' },
    { label: 'New', value: 211, color: '#466370' },
    { label: 'Dropped', value: 124, color: '#d0d8d6' },
  ]);

  activePercent = computed(() => {
    const k = this.kpis();
    if (!k || k.totalCourses === 0) return 0;
    return Math.round((k.activeCourses / k.totalCourses) * 100);
  });
  inactivePercent = computed(() => 100 - this.activePercent());

  private enrollmentChart?: Chart;
  private revenueChart?: Chart;
  private courseStatusChart?: Chart;
  private enrollmentStatusChart?: Chart;

  // Track what's ready
  private kpisReady = false;
  private enrollmentTrendReady = false;
  private revenueTrendReady = false;

  ngOnInit(): void {
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.enrollmentChart?.destroy();
    this.revenueChart?.destroy();
    this.courseStatusChart?.destroy();
    this.enrollmentStatusChart?.destroy();
  }

  loadAll(): void {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.kpis.set(data);
        this.loading.set(false);
        this.kpisReady = true;
        // Force CD so @if renders the canvases, then draw
        this.cdr.detectChanges();
        this.tryRenderAll();
      },
      error: () => this.loading.set(false),
    });

    this.loadTrends(30);

    this.dashboardService.getTopCourses().subscribe({
      next: (data) => this.topCourses.set(data),
    });
  }

  loadTrends(days: number): void {
    this.trendDays.set(days);
    this.enrollmentTrendReady = false;
    this.revenueTrendReady = false;

    this.dashboardService.getEnrollmentsTrend(days).subscribe({
      next: (data) => {
        this.enrollmentTrend.set(data);
        this.enrollmentMax.set(Math.max(...data.map((d) => d.value), 1));
        this.enrollmentTrendReady = true;
        this.tryRenderAll();
      },
    });

    this.dashboardService.getRevenueTrend(days).subscribe({
      next: (data) => {
        this.revenueTrend.set(data);
        this.revenueMax.set(Math.max(...data.map((d) => d.value), 1));
        this.revenueTrendReady = true;
        this.tryRenderAll();
      },
    });
  }

  /**
   * الدالة دي بتتأكد إن كل البيانات وصلت والـ DOM اتحط،
   * وبعدين بتعمل setTimeout صغير عشان Angular يخلص الرندر.
   */
  private tryRenderAll(): void {
    if (!this.kpisReady) return;

    setTimeout(() => {
      if (this.enrollmentTrendReady) this.renderEnrollmentChart();
      if (this.revenueTrendReady) this.renderRevenueChart();
      this.renderCourseStatusChart();
      this.renderEnrollmentStatusChart();
    }, 0);
  }

  // ── Line chart: Enrollment Trend ─────────────────────────────────────────
  private renderEnrollmentChart(): void {
    const canvas = this.enrollmentChartCanvas?.nativeElement;
    if (!canvas) return;
    this.enrollmentChart?.destroy();

    const data = this.enrollmentTrend();
    const labels = data.map((d) => this.formatDate(d.date));
    const values = data.map((d) => d.value);

    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(46,105,89,0.18)');
    gradient.addColorStop(1, 'rgba(46,105,89,0)');

    this.enrollmentChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: '#2e6959',
          borderWidth: 2,
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#2e6959',
        }],
      },
      options: this.lineChartOptions(),
    });
  }

  // ── Line chart: Revenue Trend ─────────────────────────────────────────────
  private renderRevenueChart(): void {
    const canvas = this.revenueChartCanvas?.nativeElement;
    if (!canvas) return;
    this.revenueChart?.destroy();

    const data = this.revenueTrend();
    const labels = data.map((d) => this.formatDate(d.date));
    const values = data.map((d) => d.value);

    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(138,109,59,0.18)');
    gradient.addColorStop(1, 'rgba(138,109,59,0)');

    this.revenueChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: '#8a6d3b',
          borderWidth: 2,
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#8a6d3b',
        }],
      },
      options: {
        ...this.lineChartOptions(),
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a3d34',
            titleColor: '#b2efda',
            bodyColor: '#fff',
            padding: 8,
            cornerRadius: 8,
            displayColors: false,
            callbacks: { label: (ctx: any) => `$${ctx.parsed.y}` },
          },
        },
      } as ChartConfiguration['options'],
    });
  }

  private lineChartOptions(): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a3d34',
          titleColor: '#b2efda',
          bodyColor: '#fff',
          padding: 8,
          cornerRadius: 8,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: '#acb3b2', font: { size: 10, weight: 'bold' }, maxTicksLimit: 7, maxRotation: 0 },
        },
        y: {
          grid: { color: '#f0f5f3' },
          border: { display: false, dash: [4, 4] },
          ticks: { color: '#acb3b2', font: { size: 10, weight: 'bold' }, maxTicksLimit: 5 },
        },
      },
    };
  }

  // ── Stacked Bar: Course Status ────────────────────────────────────────────
  private renderCourseStatusChart(): void {
    const canvas = this.courseStatusChartCanvas?.nativeElement;
    if (!canvas) return;
    this.courseStatusChart?.destroy();

    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
    const activeData = [35, 38, 35, 33, 37, 55, 55];
    const inactiveData = [10, 10, 8, 9, 7, 10, 10];

    this.courseStatusChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'Active', data: activeData, backgroundColor: '#2e6959', borderRadius: 4, borderSkipped: false },
          { label: 'Inactive', data: inactiveData, backgroundColor: '#b2efda', borderRadius: 4, borderSkipped: false },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#1a3d34', titleColor: '#b2efda', bodyColor: '#fff', padding: 8, cornerRadius: 8 },
        },
        scales: {
          x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { color: '#acb3b2', font: { size: 10, weight: 'bold' } } },
          y: { stacked: true, grid: { color: '#f0f5f3' }, border: { display: false }, ticks: { color: '#acb3b2', font: { size: 10, weight: 'bold' }, maxTicksLimit: 5 } },
        },
      },
    });
  }

  // ── Donut: Enrollment Status ──────────────────────────────────────────────
  private renderEnrollmentStatusChart(): void {
    const canvas = this.enrollmentStatusChartCanvas?.nativeElement;
    if (!canvas) return;
    this.enrollmentStatusChart?.destroy();

    const items = this.enrollmentStatusData();

    this.enrollmentStatusChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: items.map((i) => i.label),
        datasets: [{
          data: items.map((i) => i.value),
          backgroundColor: items.map((i) => i.color),
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#1a3d34', titleColor: '#b2efda', bodyColor: '#fff', padding: 8, cornerRadius: 8, displayColors: true },
        },
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  formatCurrency(value: number): string {
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toString();
  }

  initials(name: string): string {
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  }

  barHeight(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
  }
}