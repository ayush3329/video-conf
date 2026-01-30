const WE_MEET_COLORS = [
  '#d93025', // Red
  '#1e8e3e', // Green
  '#1a73e8', // Blue
  '#e37400', // Orange
  '#8ab4f8', // Light Blue (adjust if text is white) -> Let's use darker: #188038
  '#d01884', // Pink
  '#9334e6', // Purple
  '#008577', // Teal
  '#f09300', // Yellow/Orange
  '#607d8b', // Blue Grey
];

export const getUserColor = (username: string): string => {
  if (!username) return '#3c4043'; // Fallback grey if no name

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    // Simple hashing: sum the char codes
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the modulo operator to pick a color from the array
  // Math.abs handles negative hash results
  const index = Math.abs(hash % WE_MEET_COLORS.length);
  return WE_MEET_COLORS[index];
};

