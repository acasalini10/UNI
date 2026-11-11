// AI-assisted (Claude Code): deadline reminders as local notifications: on/off saved on the phone, permission asked only when turned on, and every reminder rescheduled from the student's applications not yet submitted.
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import { shortDate } from "@/format";
import { t } from "@/i18n";
import { reminderDates } from "@/reminderDates";

import { supabase } from "./supabase";

const ENABLED_KEY = "uni.deadlineReminders";
// iOS keeps at most 64 pending local notifications per app; the nearest ones win.
const IOS_LIMIT = 64;

// Reminders that arrive while the app is open still show as a banner.
Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export type ReminderPermission = "granted" | "denied";

async function storedEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ENABLED_KEY)) === "1";
  } catch {
    return false;
  }
}

async function permissionGranted(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

// The switch in Settings 13 is on only if the student turned it on and iOS still allows notifications.
export async function remindersState(): Promise<{ enabled: boolean; permission: ReminderPermission | "undetermined" }> {
  const enabled = await storedEnabled();
  const { granted, canAskAgain } = await Notifications.getPermissionsAsync();
  const permission = granted ? "granted" : canAskAgain ? "undetermined" : "denied";
  return { enabled: enabled && granted, permission };
}

// Asks iOS for permission (the system prompt appears only the first time); saves "on" only if granted.
export async function enableReminders(): Promise<ReminderPermission> {
  const { granted } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  if (!granted) return "denied";
  await AsyncStorage.setItem(ENABLED_KEY, "1");
  await syncReminders();
  return "granted";
}

export async function disableReminders(): Promise<void> {
  await AsyncStorage.setItem(ENABLED_KEY, "0");
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Sign out and delete account: another account on the same phone must not get these reminders.
export async function clearReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

async function reschedule(): Promise<void> {
  if (!(await storedEnabled()) || !(await permissionGranted())) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }
  const { data, error } = await supabase
    .from("applications")
    .select("programs!inner(program, deadline, universities!inner(name))")
    .neq("status", "submitted");
  // Offline or server error: keep what is already scheduled rather than wiping it.
  if (error || !data) return;

  const now = new Date();
  const pending = data
    .flatMap(({ programs }) =>
      programs.deadline
        ? reminderDates(programs.deadline, now).map((reminder) => ({
            ...reminder,
            program: programs.program,
            university: programs.universities.name,
            deadline: programs.deadline!,
          }))
        : [],
    )
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, IOS_LIMIT);

  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const reminder of pending) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title:
          reminder.daysBefore === 1
            ? t("reminders.titleTomorrow")
            : t("reminders.titleDays", { days: reminder.daysBefore }),
        body: t("reminders.body", {
          program: reminder.program,
          university: reminder.university,
          date: shortDate(reminder.deadline),
        }),
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.at },
    });
  }
}

// One run at a time: a launch and an add right after it would otherwise interleave cancel and schedule.
let queue: Promise<void> = Promise.resolve();

export function syncReminders(): Promise<void> {
  queue = queue.then(reschedule).catch(() => undefined);
  return queue;
}
