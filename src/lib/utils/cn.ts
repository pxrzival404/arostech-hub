/**
 * Combines class names using clsx logic without external dependencies
 * 
 * @param inputs - Class names to combine
 * @returns Combined class string
 */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs
    .filter((input): input is string => typeof input === "string" && input !== "")
    .map((input) => {
      if (input === "dark") return "dark"; // Handle dark mode if needed
      return input;
    })
    .filter(Boolean)
    .join(" ");
}
