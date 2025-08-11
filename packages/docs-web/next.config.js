/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import nextra from "nextra";

// Set up Nextra with its configuration
const withNextra = nextra({
  defaultShowCopyCode: true,
});

// Export the final Next.js config with Nextra included
export default withNextra({
  // ... Add regular Next.js options here
});
