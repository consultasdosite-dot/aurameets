import { supabase } from "@/lib/supabase";

export type NotificationRecipientType =
  | "client"
  | "therapist"
  | "admin";

export type NotificationRecord = {
  id: string;
  recipient_profile_id: string;
  recipient_type: NotificationRecipientType;
  title: string;
  message: string;
  notification_type: string;
  reference_id: string | null;
  reference_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

type CreateNotificationInput = {
  recipientProfileId: string;
  recipientType: NotificationRecipientType;
  title: string;
  message: string;
  notificationType: string;
  referenceId?: string | number | null;
  referenceUrl?: string | null;
};

export async function getNotificationsByProfileId(
  profileId: string,
): Promise<NotificationRecord[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Não foi possível carregar as notificações: ${error.message}`,
    );
  }

  return (data ?? []) as NotificationRecord[];
}

export async function getUnreadNotificationsCount(
  profileId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("recipient_profile_id", profileId)
    .eq("is_read", false);

  if (error) {
    throw new Error(
      `Não foi possível contar as notificações: ${error.message}`,
    );
  }

  return count ?? 0;
}

export async function markNotificationAsRead(
  notificationId: string,
  profileId: string,
): Promise<void> {
  const readAt = new Date().toISOString();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: readAt,
    })
    .eq("id", notificationId)
    .eq("recipient_profile_id", profileId);

  if (error) {
    throw new Error(
      `Não foi possível marcar a notificação como lida: ${error.message}`,
    );
  }
}

export async function markAllNotificationsAsRead(
  profileId: string,
): Promise<void> {
  const readAt = new Date().toISOString();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: readAt,
    })
    .eq("recipient_profile_id", profileId)
    .eq("is_read", false);

  if (error) {
    throw new Error(
      `Não foi possível marcar as notificações como lidas: ${error.message}`,
    );
  }
}

export async function createNotification({
  recipientProfileId,
  recipientType,
  title,
  message,
  notificationType,
  referenceId = null,
  referenceUrl = null,
}: CreateNotificationInput): Promise<NotificationRecord> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      recipient_profile_id: recipientProfileId,
      recipient_type: recipientType,
      title,
      message,
      notification_type: notificationType,
      reference_id:
        referenceId === null || referenceId === undefined
          ? null
          : String(referenceId),
      reference_url: referenceUrl,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Não foi possível criar a notificação: ${error.message}`,
    );
  }

  return data as NotificationRecord;
}

export async function getCurrentUserNotifications(): Promise<
  NotificationRecord[]
> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    return [];
  }

  return getNotificationsByProfileId(session.user.id);
}

export async function getCurrentUserUnreadCount(): Promise<number> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    return 0;
  }

  return getUnreadNotificationsCount(session.user.id);
}