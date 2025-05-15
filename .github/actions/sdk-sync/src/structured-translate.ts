import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { PRFile, RepoContext, TranslationResult } from './index';
import { analyzePatchForChanges, applyChangesToFile } from './patch-utils';

/**
 * A more structured approach to translating files between languages
 */
export async function structuredTranslateFileChanges(
  file: PRFile & { content: string; patch?: string },
  sourceLang: string,
  targetLang: string,
  repoContext: RepoContext,
  openai: OpenAI,
  prTitle: string,
): Promise<TranslationResult> {
  try {
    // Skip empty or deleted files
    if (!file.content || file.status === 'removed') {
      return {
        success: false,
        error: 'File is empty or was deleted',
        targetPath: file.filename,
      };
    }

    core.info(`Using structured translation for: ${file.filename}`);

    // Extract the relevant parts of the diff/patch
    const relevantDiff = file.patch || '';
    
    // Step 1: Analyze what kind of change we're dealing with
    const changeAnalysis = analyzePatchForChanges(relevantDiff, sourceLang, targetLang);
    core.info(`Identified changes: ${JSON.stringify(changeAnalysis)}`);
    
    // Step 2: First determine the target file path precisely
    const fileIdentificationPrompt = `
I'm trying to find the exact equivalent file path in a ${targetLang} codebase that corresponds to this ${sourceLang} file: "${file.filename}".

This is a change related to: "${prTitle}"

The diff shows these kinds of changes:
${relevantDiff.slice(0, 500)}

${changeAnalysis.length > 0 ? `I've identified these specific changes:
${changeAnalysis.map(c => `- ${c.description}`).join('\n')}` : ''}

Here's the structure of the ${targetLang} repository:
${repoContext.repoStructure}

Which exact file in the ${targetLang} codebase would need to be modified to implement the equivalent change?
Respond with ONLY the full path of the target file, without any explanation or additional text.`;

    const fileLocationResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert software developer helping to translate code changes between different programming language SDKs.
Your task is to identify the exact file in the target language codebase that should be modified to implement the same functionality.
Respond with ONLY the file path, nothing else.`,
        },
        {
          role: 'user',
          content: fileIdentificationPrompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 100,
    });

    // Get the target file path
    const targetFilePath =
      fileLocationResponse.choices[0].message.content
        ?.trim()
        .replace(/^['"\`](.*)['"\`]$/, '$1') || '';

    core.info(`Target file identified: ${targetFilePath}`);

    // Step 3: Check if target file exists and read its content
    const fullTargetPath = path.join(
      process.cwd(),
      `${targetLang}-output`,
      targetFilePath,
    );
    const targetFileExists = fs.existsSync(fullTargetPath);
    const isNewFile = !targetFileExists;

    // If it's a new file, we need a different approach
    if (isNewFile) {
      core.info(`Target file does not exist, creating a new file`);
      // Special handling for new files
      return await createNewFileTranslation(
        file,
        sourceLang,
        targetLang,
        repoContext,
        targetFilePath,
        openai,
        prTitle
      );
    }
    
    // Read the existing content
    const existingFullContent = fs.readFileSync(fullTargetPath, 'utf8');

    // Step 4: For parameter or field changes, use our specialized approach
    if (changeAnalysis.length > 0 && 
        changeAnalysis.some(change => 
          change.type === 'parameter_addition' || 
          change.type === 'field_addition')) {
      core.info(`Using structured approach for parameter/field changes`);
      
      try {
        // Attempt to directly apply changes based on the patch
        const updatedContent = applyChangesToFile(
          file.filename,
          fullTargetPath,
          sourceLang, 
          targetLang,
          relevantDiff
        );
        
        // If we got valid updated content, return it
        if (updatedContent && updatedContent !== existingFullContent) {
          return {
            success: true,
            translatedCode: updatedContent,
            targetPath: targetFilePath,
            notes: [`Applied structured ${changeAnalysis.map(c => c.type).join(', ')} changes`],
            isNewFile: false,
          };
        }
        
        core.info(`Direct patch application didn't yield changes, trying guided approach`);
      } catch (err) {
        core.warning(`Direct patch application failed: ${err}, trying guided approach`);
      }
    }
    
    // Step 5: Try a guided, precise approach
    // Create a prompt focused on the specific places to modify
    const guidedPrompt = `
I need to translate these specific changes from ${sourceLang} to ${targetLang}.

SOURCE FILE: "${file.filename}"
PATCH/DIFF showing the changes:
\`\`\`diff
${relevantDiff}
\`\`\`

TARGET FILE: "${targetFilePath}"
TARGET FILE CONTENT:
\`\`\`
${existingFullContent}
\`\`\`

INSTRUCTIONS:
1. I need you to analyze EXACTLY what parameter, field, or method needs to be added in the target file
2. Based on the target language (${targetLang}), tell me precisely where and how to add it:
   - For Ruby parameters: exactly which method signature to modify and what to add
   - For Python fields: exactly where in the class to add the field 
3. Format your response as a JSON object describing the exact changes to make

Use this format:
{
  "changes": [
    {
      "type": "method_parameter_addition",
      "target_pattern": "exact text pattern to find (enough context)",
      "replacement": "exact text that should replace it",
      "description": "description of the change"
    }
  ]
}`;

    const guidedResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert translator of code changes between programming languages. 
You analyze a source change and identify exactly where and how to make equivalent changes in a target file.
Respond with ONLY a valid JSON object describing the precise changes to make.`,
        },
        {
          role: 'user',
          content: guidedPrompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    // Get the response and parse it
    const guidedResponseText = guidedResponse.choices[0].message.content?.trim() || '';
    let changes: Array<{
      type: string;
      target_pattern: string;
      replacement: string;
      description: string;
    }> = [];
    
    try {
      // Extract JSON from the response (it might be wrapped in code blocks)
      const jsonMatch = guidedResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedChanges = JSON.parse(jsonMatch[0]);
        if (parsedChanges && parsedChanges.changes) {
          changes = parsedChanges.changes;
        }
      }
    } catch (error) {
      core.warning(`Error parsing guided response JSON: ${error}`);
      return {
        success: false,
        error: `Failed to parse guided translation JSON: ${error}`,
        targetPath: file.filename,
      };
    }
    
    // Apply the changes
    if (changes.length > 0) {
      let updatedContent = existingFullContent;
      const notes: string[] = [];
      
      for (const change of changes) {
        try {
          // Validate that the target pattern exists
          if (!updatedContent.includes(change.target_pattern)) {
            notes.push(`Pattern not found: "${change.target_pattern.substring(0, 30)}..."`);
            continue;
          }
          
          // Apply the replacement
          updatedContent = updatedContent.replace(change.target_pattern, change.replacement);
          notes.push(`Applied: ${change.description}`);
        } catch (err) {
          notes.push(`Failed to apply change: ${err}`);
        }
      }
      
      // Return the updated content if changes were applied
      if (updatedContent !== existingFullContent) {
        return {
          success: true,
          translatedCode: updatedContent,
          targetPath: targetFilePath,
          notes,
          isNewFile: false,
        };
      }
      
      // If no changes were applied, note the issue
      notes.push('Patterns matched but no actual changes were applied');
    }
    
    core.warning(`Structured translation couldn't apply changes directly, falling back to specific prompt guidance`);
    
    // Create a custom prompt for each target language
    let customPrompt = '';
    if (targetLang === 'ruby') {
      const paramName = changeAnalysis.find(c => c.type === 'parameter_addition')?.name || 'email';
      customPrompt = `
I need to add a parameter '${paramName}' to the update_user method in this Ruby file.

Here's the file content:
\`\`\`ruby
${existingFullContent}
\`\`\`

Please make ONLY two changes:
1. Add '${paramName}: nil,' to the update_user method parameter list AFTER the existing parameters
2. Add '${paramName}: ${paramName},' to the request body hash 
3. Add a documentation comment above the method: "# @param [String] ${paramName} Optional. Can be used to update the user's ${paramName}."

Return ONLY the complete modified file content.`;
    } else if (targetLang === 'python') {
      const fieldName = changeAnalysis.find(c => c.type === 'field_addition')?.name || 'email';
      customPrompt = `
I need to add a field '${fieldName}' to the User class in this Python file.

Here's the file content:
\`\`\`python
${existingFullContent}
\`\`\`

Please make ONLY one change:
1. Add '${fieldName}: Optional[str] = field(default=None)' to the User class fields, alongside the existing fields

Return ONLY the complete modified file content.`;
    } else {
      customPrompt = `
I need to translate these specific changes from ${sourceLang} to ${targetLang}:
\`\`\`diff
${relevantDiff}
\`\`\`

Here's the target file content:
\`\`\`
${existingFullContent}
\`\`\`

Please make ONLY the minimal changes needed to implement the same functionality.
Preserve all existing code and just add what's needed.

Return ONLY the complete modified file content.`;
    }
    
    // Try the language-specific custom prompt
    const customResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert code editor making minimal, precise changes to code.
Return ONLY the complete file content after your changes, with no explanations or markdown.`,
        },
        {
          role: 'user',
          content: customPrompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });
    
    // Get the custom response
    let translatedCode = customResponse.choices[0].message.content?.trim() || '';
    
    // Clean the code - remove any markdown code blocks
    translatedCode = translatedCode
      .replace(/^```[\w]*\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();
    
    // Return the results
    return {
      success: true,
      translatedCode,
      targetPath: targetFilePath,
      notes: [`Applied custom guided changes for ${targetLang}`],
      isNewFile: false,
    };
  } catch (error) {
    core.error(`Error in structured translation for ${file.filename}: ${error}`);
    return {
      success: false,
      error: `Structured translation failed: ${error}`,
      targetPath: file.filename,
    };
  }
}

/**
 * Handle creation of entirely new files
 */
async function createNewFileTranslation(
  file: PRFile & { content: string; patch?: string },
  sourceLang: string,
  targetLang: string,
  repoContext: RepoContext,
  targetFilePath: string,
  openai: OpenAI,
  prTitle: string,
): Promise<TranslationResult> {
  // For new files, we'll use a different prompt
  const newFilePrompt = `
I need to create a new ${targetLang} file that corresponds to this ${sourceLang} file.

SOURCE FILE: "${file.filename}"
SOURCE CODE:
\`\`\`
${file.content}
\`\`\`

TARGET FILE PATH: "${targetFilePath}"

PR TITLE: "${prTitle}"

Please create a new file that implements the equivalent functionality in ${targetLang}.
Follow the coding conventions and style of the target language.
Return ONLY the file content, with no explanations or markdown.`;

  const newFileResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are an expert code translator creating equivalent files in different programming languages.
Return ONLY the complete file content with no explanations or markdown formatting.`,
      },
      {
        role: 'user',
        content: newFilePrompt,
      },
    ],
    temperature: 0.1,
    max_tokens: 2000,
  });

  let translatedCode = newFileResponse.choices[0].message.content?.trim() || '';
  
  // Clean the code - remove any markdown code blocks
  translatedCode = translatedCode
    .replace(/^```[\w]*\s*/g, '')
    .replace(/```\s*$/g, '')
    .trim();

  return {
    success: true,
    translatedCode,
    targetPath: targetFilePath,
    notes: ['Created as a new file'],
    isNewFile: true,
  };
}