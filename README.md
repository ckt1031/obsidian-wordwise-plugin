# Obsidian AI Plugin

Welcome to the **Obsidian AI Plugin**, a community-driven initiative designed to enhance your Obsidian experience. This plugin aims to simplify your workflow, boost productivity, and provide a seamless user experience by integrating **AI-powered prompts and commands**.

Inspired by the [Notion AI](https://www.notion.so/product/ai), this plugin is built with the intention to bring similar capabilities to the **Obsidian platform**.

**Note: This is NOT an official plugin from the OpenAI team or any AI-related company. It is a community plugin.**

## Installation

You can install the Obsidian TingPNG Plugin by following these steps:

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

- **OpenAI Base URL**: The base URL for the OpenAI API. You can change this if you want to use a different API endpoint, suitable for users who cannot access the OpenAI directly or intented to use third party services.
- **OpenAI Model**: The model to use for the AI. The default is `gpt-3.5-turbo`, which is the most stablest and suitable model. You can also use `gpt-3.5-turbo-0613` or `gpt-3.5-turbo-16k` for faster  or longer results. or even `gpt-4` (Not recommended) and `gpt-4-32k`  (Not recommended) for the most powerful model.
- **Temperature**: The higher the temperature, the crazier the text. The temperature can be any number between 0 and 1, but OpenAI recommends keeping it between 0.7 and 1.0.
- **Maxmium Tokens**: The maximum number of tokens to generate. Remember that the start token counts as one token. In general, the longer the input prompt, the more tokens you will need to use. More tokens will also increase the time and cost of the request.

## Usage

### Commands

The plugin provides the following commands:

- **AI: Improve Writing**: Improve your writing such as grammar, sentence structure, and word choice.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenAI](https://openai.com/) for providing the API.
- [Obsidian](https://obsidian.md/) for providing the platform.
