# How to Set Up Prompts Using Files in WordWise

Here's how to set up and use prompts stored in files for WordWise.

1. **Make a folder for your prompts:** Pick a spot on your computer to keep your prompt files. For example, you could create a folder named `Prompts`. Keep this path handy; you'll need it soon. Remember, the path has to be exact (case-sensitive).
2. **Tell WordWise where your prompts are:** Go into the WordWise settings. Find and turn on the "File based custom prompts" option. Then, put the full path to the folder you made in step 1 (like `Prompts`) into the "File Path" box.  
![Obsidian Screenshot](https://i.imgur.com/Eh1rqJu.png)
3. **Create a new Markdown file:** Inside the prompts folder you just set up, create a new file. Make sure it's a Markdown file (with a `.md` extension).
4. **Add prompt details:** At the very start of this new Markdown file, add the following information between triple dashes (`---`). These details tell WordWise how to use your prompt.

## Prompt File Structure

* **Must-Have:**
  * `name`: This is the unique name for your prompt. You *need* this.
* **Optional:**
  * `disabled`: Set this to `true` to temporarily turn off the prompt. It's like unchecking a box for it.
  * `provider`: You can use this to pick a specific AI provider for this prompt.
  * `model`: Use this to specify a particular AI model ID for this prompt.
  * `systemPrompt`: You can use this to give the AI specific instructions before your main prompt. The built-in system prompt is usually best and highly optimized, so it's often better *not* to use this unless you know exactly why you need to change it.

## Example Prompt File

### Starting Details (YAML Frontmatter)

```yaml
---
name: Example # Required: This is the name your prompt will show up as.
disabled: false # Optional: Set to true to hide this prompt temporarily.
provider: OpenAI # Optional: Choose a specific AI provider.
model: gpt-4o-mini # Optional: Pick a specific AI model ID.
systemPrompt: Your system prompt here # Optional: Override the default system prompt. It's often best to leave this out unless you have a specific reason to change it.
---
```

### Example: Remove All Bold Formatting

Here's a full example of a prompt file that removes bold formatting from text.

```markdown
---
name: Remove All Bold
description: Removes the double asterisks from bolded Markdown text.
---

Remove all bold formatting from the given Markdown text. Follow these steps:

- Find all text that is bolded using double asterisks (`**`) in the input.
- Delete the double asterisks from both the start and end of the bolded text. Keep the text inside exactly as it is.
- Do not change anything else in the text. Don't rephrase sentences, change words, or alter the structure.
- Make sure removing the bold formatting doesn't mess up how the sentences flow or their grammar.
- If there's no bold text in the input, just give back the original text without any changes.
```
