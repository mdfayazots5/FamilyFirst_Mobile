import {
  BookOpen, CalendarDays, Cookie, Gamepad2, Gift, IceCreamCone, MapPin,
  MonitorPlay, Popcorn, Puzzle, Trees, type LucideIcon,
} from 'lucide-react';

const icons = new Map<string, LucideIcon>([
  ['book_choice', BookOpen],
  ['game_night', Gamepad2],
  ['ice_cream', IceCreamCone],
  ['mini_outing', MapPin],
  ['movie_night', Popcorn],
  ['park_visit', Trees],
  ['screen_15m', MonitorPlay],
  ['snack_pick', Cookie],
  ['toy_purchase', Puzzle],
  ['weekend_activity', CalendarDays],
]);

export default function RewardIcon({ code }: { code?: string | null }) {
  const Icon = icons.get(code ?? '') ?? Gift;
  return <Icon size={22} strokeWidth={1.75} aria-hidden="true" />;
}
