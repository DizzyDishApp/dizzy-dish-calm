import { Stack } from "expo-router";

/**
 * Modal group layout.
 * All screens in (modal) are presented as modal sheets.
 */
export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FAF6F1" },
        animation: "slide_from_bottom",
        presentation: "modal",
      }}
    />
  );
}
