import { TopBar } from '@/components/layout/Screen';
import { AssistantPanel } from '@/components/layout/AssistantFab';

/** Full-page assistant route (/assistant); the floating button opens the same panel. */
export function AssistantScreen() {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white screen-in">
      <TopBar back={true} title="Assistant REZHO" />
      <AssistantPanel embedded />
    </div>
  );
}
