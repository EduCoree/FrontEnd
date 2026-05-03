export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  entityId:number;
  metadata?:string
  createdAt: string;
}
export interface metadata{
   attemptId?:number,
    lessonId?: string;  
}

export interface NotificationListDto {
  notifications: NotificationDto[];
  unreadCount: number;
  totalCount: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}