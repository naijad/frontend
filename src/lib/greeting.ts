/**
 * Time-of-day greeting:
 * - "Good morning" before 12pm
 * - "Good afternoon" from 12pm to 5pm
 * - "Good evening" after 5pm
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
