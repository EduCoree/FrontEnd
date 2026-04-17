import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiResponse, NotificationDto, NotificationListDto } from '../models/notification';
import * as signalR from '@microsoft/signalr'
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
   private baseUrl = environment.apiUrl + '/api/notifications';
   private HubUrl = environment.apiUrl + '/hubs/notifications';

   private notificationSubject = new BehaviorSubject<NotificationDto[]>([]);   //this variable will carry all the changes emitted by signal r and all the components will subscribe to it
   private unreadCountSubject= new BehaviorSubject<number>(0);       

   notifications$ = this.notificationSubject.asObservable();    // to make the components not be able to edit in it just read with pipe async or by subscribe in ts
  unreadCount$ = this.unreadCountSubject.asObservable();

  private hubConnection!:signalR.HubConnection;

  constructor(private http: HttpClient) {}

  getNotification(page=1,pageSize=10):Observable<ApiResponse<NotificationListDto>>
  {
    return this.http.get<ApiResponse<NotificationListDto>>(`${this.baseUrl}?pageNumber=${page}&pageSize=${pageSize}`);
  }
  getUnreadCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/unread-count`);
  }

    markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/read-all`, {});
  }
   markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${notificationId}/read`, {});
  }

  delete(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${notificationId}`);
  }

  startConnection(token:string):void
  {
    this.hubConnection= new signalR.HubConnectionBuilder()   // build the connection with jwt token
    .withUrl(this.HubUrl,{accessTokenFactory:()=>token})
    .withAutomaticReconnect()
    .build();

    this.hubConnection
    .start()
    .then(()=>{
      console.log("signalR connected");
      this.loadUnreadCount();    // first thing after login
    })
    .catch(err => console.error('SignalR Error:', err));


    // this function is running as long as the application is running
    this.hubConnection.on('ReceiveNotification', (notification: NotificationDto) => {
      console.log('New notification received!', notification);

       const current = this.notificationSubject.value;
      this.notificationSubject.next([notification, ...current]);  // put the new notifications at the top of all notifications

      this.unreadCountSubject.next(this.unreadCountSubject.value + 1);  
    });
  }
     stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
  loadUnreadCount(): void {
      this.getUnreadCount().subscribe(res => {
        this.unreadCountSubject.next(res.data);
      });
    }

    /*
  We return the Observable with pipe/tap instead of subscribing inside the service.
  This allows the component to subscribe and handle next/error blocks directly.
  By doing this, the component can accurately set 'isLoading = false' ONLY after 
  the async API call finishes, preventing the UI from flickering or finishing too early.
*/
loadNotifications(page: number = 1,pagesize:number=10): Observable<any> {
  return this.http.get<ApiResponse<NotificationListDto>>(
    `${this.baseUrl}?PageNumber=${page}&PageSize=${pagesize}`
  ).pipe(
    tap(res => {  
      // Logic to append or replace
      if (page === 1) {
        this.notificationSubject.next(res.data.notifications);
      } else {
        const current = this.notificationSubject.value;
        this.notificationSubject.next([...current, ...res.data.notifications]);
      }
    })
  );
}


}
