## Setting Up File-Based Prompts in WordWise

This document explains how to create and use file-based prompts in WordWise.

1. **Create a Directory:** Choose a location on your system for storing your prompts. For example, `WordWise/Prompts`. Remember this path, as you'll need it later. The path is case-sensitive.
2. **Enable File-Based Prompts:** In WordWise, enable the "File based custom prompts" option. Enter the path you chose in step one (e.g., `WordWise/Prompts`) into the "File Path" field. ![](https://i.imgur.com/mevNOYg.png)
3. **Create a Markdown File:** Create a new markdown file within your chosen prompts directory.
4. **Add Prompt Properties:** Inside the new markdown file, add the following properties enclosed within triple dashes (`---`) at the beginning of the file:

   ```yaml
   ---
   name: YourPromptName  # Required: The name/identifier of your prompt.
   disabled: false       # Optional: Set to true to temporarily disable this prompt.
   provider: ProviderName # Optional: Specify a provider for this prompt.
   model: ModelID        # Optional: Specify a model ID for this prompt.
   systemPrompt: Your system prompt here # Optional: Override the default system prompt.
   ---
   ```

	- `name`: This is required and serves as the identifier for your prompt.
	- `disabled`: (Optional) Use this to temporarily disable the prompt. This corresponds to a checkbox in reading mode.
	- `provider`: (Optional) Allows you to specify a particular provider for this prompt.
	- `model`: (Optional) Allows you to specify a specific model ID for this prompt.
	- `systemPrompt`: (Optional) Use this to override any pre-defined system prompts and tailor them to your specific needs. Place your desired system prompt text after the colon.
