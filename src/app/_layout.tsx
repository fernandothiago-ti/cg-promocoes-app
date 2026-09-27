import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      {/* Esconde o cabeçalho no ecrã inicial */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* Coloca títulos bonitos no topo dos outros ecrãs */}
      <Stack.Screen name="novo" options={{ title: 'Nova Degustação' }} />
      <Stack.Screen name="agenda" options={{ title: 'Minha Agenda' }} />
    </Stack>
  );
}