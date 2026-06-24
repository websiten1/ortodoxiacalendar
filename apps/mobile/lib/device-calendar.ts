import * as Calendar from "expo-calendar";
import { Platform } from "react-native";

async function getDefaultCalendarId() {
  if (Platform.OS === "ios") {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    return defaultCalendar.id;
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.find((cal) => cal.allowsModifications) ?? calendars[0];
  if (!writable) {
    throw new Error("Niciun calendar disponibil pe acest dispozitiv.");
  }
  return writable.id;
}

export async function addEventToDeviceCalendar(params: {
  title: string;
  notes?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
}) {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permisiunea pentru calendar a fost refuzată.");
  }

  const calendarId = await getDefaultCalendarId();

  await Calendar.createEventAsync(calendarId, {
    title: params.title,
    notes: params.notes,
    location: params.location,
    startDate: params.startDate,
    endDate: params.endDate,
    timeZone: undefined
  });
}
