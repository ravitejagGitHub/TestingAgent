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
        let aiResponse =
          response.choices[0]?.message?.content ?? "No unit tests generated.";
        // Extract only TypeScript code blocks from the response
        const tsBlocks = Array.from(
          aiResponse.matchAll(/```typescript([\s\S]*?)```/g)
        ).map((match) => match[1].trim());
        let testFileContent =
          tsBlocks.length > 0 ? tsBlocks.join("\n\n") : aiResponse;

        // Dynamically create the test file based on the selected file's name
        const selectedFileUri = editor.document.uri;
        const selectedFilePath = selectedFileUri.fsPath;
        const path = require("path");
        const dir = path.dirname(selectedFilePath);
        const base = path.basename(
          selectedFilePath,
          path.extname(selectedFilePath)
        );
        const testFileName = `${base}.test${path.extname(selectedFilePath)}`;
        const testFilePath = vscode.Uri.file(path.join(dir, testFileName));
        await vscode.workspace.fs.writeFile(
          testFilePath,
          Buffer.from(testFileContent, "utf8")
        );
        const doc = await vscode.workspace.openTextDocument(testFilePath);
        await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
        console.log(`Unit tests written to ${testFileName} successfully.`);
      } catch (err: any) {
        vscode.window.showErrorMessage(`Azure OpenAI error: ${err.message}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
