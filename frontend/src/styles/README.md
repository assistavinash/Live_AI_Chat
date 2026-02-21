/* THEME USAGE GUIDE
 * 
 * This project uses a CSS variable-based theming system for light and dark modes.
 * 
 * FILES:
 * - src/styles/theme.css - Contains all CSS variables for colors, spacing, and transitions
 * - src/styles/auth.css - Mobile-first responsive styles for login/register pages
 * - src/pages/Login.jsx - Login page with email and password inputs
 * - src/pages/Register.jsx - Register page with firstName, lastName, email, password inputs
 * 
 * DEFAULT THEME: Light (defined in :root)
 * 
 * TO SWITCH TO DARK THEME:
 * Add data-theme="dark" attribute to <html> or <body> tag:
 * Example in JavaScript:
 *   document.documentElement.setAttribute('data-theme', 'dark');
 * 
 * CSS VARIABLES AVAILABLE (use in any CSS):
 * - Colors: --bg-primary, --bg-secondary, --text-primary, --text-secondary, etc.
 * - Spacing: --spacing-xs, --spacing-sm, --spacing-md, --spacing-lg, --spacing-xl, etc.
 * - Border Radius: --radius-sm, --radius-md, --radius-lg
 * - Transitions: --transition-fast, --transition-normal, --transition-slow
 * 
 * RESPONSIVE BREAKPOINTS:
 * - Mobile (default): 0px - 639px
 * - Tablet: 640px and above
 * - Desktop: 768px and above
 * - Large Desktop: 1024px and above
 * 
 * Each page is centered on screen and responsive to all device sizes.
 */
