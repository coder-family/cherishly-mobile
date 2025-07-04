import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";

export default function TabsIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/tabs/home");
  }, [router]);
  return null;
}

export function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
} 