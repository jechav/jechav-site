# Public read, authenticated write for the Prompt Library

The Prompt Listing and individual Prompt views are publicly accessible without login. Only creating and editing Prompts requires authentication. This allows the library to serve as a shareable reference (others can browse your prompts) while keeping mutations owner-only. Authentication is a single shared password stored in an environment variable — no user account model is needed.
