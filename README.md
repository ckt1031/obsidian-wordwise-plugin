# Obsidian AI Plugin

Welcome to the **Obsidian AI Plugin**, a community-driven initiative designed to enhance your Obsidian experience. This plugin aims to simplify your workflow, boost productivity, and provide a seamless user experience by integrating **AI-powered prompts and commands**.

Inspired by the [Notion AI](https://www.notion.so/product/ai), this plugin is built with the intention to bring similar capabilities to the **Obsidian platform**.

**Note: This is NOT an official plugin from the OpenAI team or any AI-related company. It is a community plugin.**

## Installation

### BRAT Installation

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. Enter the plugin url `https://github.com/ckt1031/obsidian-wordwise-plugin` in the BRAT settings
3. Enable the plugin and enjoy!

### Manual Installation

You can install the Obsidian Wordwise Plugin by following these steps:

1. Download 3 files: `main.js`, `manifest.json`, `styles.css` from the [latest release](https://github.com/ckt1031/obsidian-ai-plugin/releases/latest).
2. Create a folder named "ai-plugin" in your Obsidian vault's plugins folder.
3. Once the plugin is installed, activate it by toggling the switch next to its name.

## Configuration

To configure the AI plugin, you need to provide your OpenAI API key and further options. Here's how you can do it:

1. Open the settings in Obsidian.
2. Go to the "Plugins" section and find the AI plugin.
3. **Enter your API key** from [OpenAI](https://beta.openai.com/account/api-keys) in the corresponding field.
4. The plugin is now ready to use!

There are also some additional options that you can configure:

- **OpenAI Base URL**: The web address for OpenAI. You can change it to use a different service.
- **OpenAI Model**: The AI model to use. Default is `gpt-3.5-turbo`, but `gpt-4` and `gpt-4-turbo-preview` are also options.
- **Temperature**: A value between 0 and 1 that controls the randomness of the text. Higher values make the text more random.
- **Frequency Penalty**: A value between -2.0 and 2.0. Positive values make the AI less likely to repeat itself.
- **Presence Penalty**: A value between -2.0 and 2.0. Positive values make the AI more likely to discuss new topics.
- **Maximum Tokens**: The maximum length of the generated text. Longer prompts require more tokens, which increases the time and cost of the request.

## Commands

The plugin provides the following commands:

- **Improve Writing**: Improve your writing such as grammar, sentence structure, and word choice.
- **Fix Grammar**: Fix grammar mistakes in your text.
- **Make Shorter**: Condense your text while retaining the main points, ideal for creating summaries.
- **Make Longer**: Expand on your text to provide more detail or explanation.
- **Highlight Main Point**: Highlight the only main idea in your text.
- **Paraphrase**: Rewrite your text in a different way while keeping the same meaning, perfect for avoiding repetition or enhancing understanding.
- **Simplify Text**: Simplify your text to make it easier to read.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenAI](https://openai.com/) for providing the API.
- [Obsidian](https://obsidian.md/) for providing the platform.
