import * as vscode from "vscode";
import { AzureOpenAI } from "openai";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "ai-agent-unit-test-generator" is now active!'
  );

  const disposable = vscode.commands.registerCommand(
    "ai-raviteja-agent-unit-test-generator.generateUnitTests",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }
      const selectedText = editor.document.getText(editor.selection);
      if (!selectedText) {
        vscode.window.showErrorMessage(
          "Please select the code you want to generate unit tests for."
        );
        return;
      }

      const endpoint = "<YOUR_AZURE_OPENAI_ENDPOINT>"; // e.g., https://YOUR-RESOURCE-NAME.openai.azure.com/
      const apiKey = "<YOUR_AZURE_OPENAI_API_KEY>";
      const deployment = "<YOUR_DEPLOYMENT_NAME>"; // e.g., "gpt-35-turbo"
      const apiVersion = "2024-10-21";
      const client = new AzureOpenAI({
        endpoint,
        apiKey,
        deployment,
        apiVersion,
      });

      const prompt = `Write unit tests for the following code:\n\n${selectedText}`;
      try {
        const response = await client.chat.completions.create({
          model: deployment,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 512,
        });
        const unitTests =
          response.choices[0]?.message?.content ?? "No unit tests generated.";

        const doc = await vscode.workspace.openTextDocument({
          content: unitTests,
          language: editor.document.languageId,
        });
        await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
      } catch (err: any) {
        vscode.window.showErrorMessage(`Azure OpenAI error: ${err.message}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
