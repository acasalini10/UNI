// AI-assisted (Claude Code): start route "/" so a cold launch has a screen; it hands off to the guards in app/_layout.tsx.
import { Redirect } from "expo-router";

// The guards send this on to sign-in (signed out) or profile setup (step 1 not done).
export default function Index() {
  return <Redirect href="/programs" />;
}
