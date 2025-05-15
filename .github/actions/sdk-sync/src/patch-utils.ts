import * as core from '@actions/core';
import * as path from 'path';
import * as fs from 'fs';

/**
 * A change to be applied to a target file
 */
export interface PatchChange {
  type: string;
  sourceContext: string;
  targetContext: string;
  replacement: string;
  description: string;
}

/**
 * Extracts the specific changes from a patch/diff
 */
export function extractPatchChanges(
  patch: string,
  sourceLang: string,
  targetLang: string
): PatchChange[] {
  const changes: PatchChange[] = [];
  
  // Split the patch into hunks
  const hunks = patch
    .split(/^@@/m)
    .slice(1)
    .map(hunk => `@@${hunk}`);

  for (const hunk of hunks) {
    // Extract added lines (starting with '+')
    const addedLines = hunk
      .split('\n')
      .filter(line => line.startsWith('+') && !line.startsWith('+++'))
      .map(line => line.substring(1));
    
    // Extract removed lines (starting with '-')  
    const removedLines = hunk
      .split('\n')
      .filter(line => line.startsWith('-') && !line.startsWith('---'))
      .map(line => line.substring(1));
    
    // Extract context lines (starting with ' ')
    const contextLines = hunk
      .split('\n')
      .filter(line => line.startsWith(' '))
      .map(line => line.substring(1));
    
    // Skip hunks with no added lines
    if (addedLines.length === 0) {
      continue;
    }
    
    // Identify parameter additions
    if (isParameterAddition(addedLines, removedLines, sourceLang)) {
      const parameterName = extractParameterName(addedLines, sourceLang);
      const parameterType = extractParameterType(addedLines, sourceLang);
      
      if (parameterName) {
        changes.push({
          type: 'parameter_addition',
          sourceContext: contextLines.join('\n'),
          targetContext: '', // Will be filled in later
          replacement: '', // Will be filled in later
          description: `Add parameter '${parameterName}' of type '${parameterType || 'unknown'}'`
        });
      }
    }
    
    // Identify field additions
    if (isFieldAddition(addedLines, removedLines, sourceLang)) {
      const fieldName = extractFieldName(addedLines, sourceLang);
      const fieldType = extractFieldType(addedLines, sourceLang);
      
      if (fieldName) {
        changes.push({
          type: 'field_addition',
          sourceContext: contextLines.join('\n'),
          targetContext: '', // Will be filled in later
          replacement: '', // Will be filled in later
          description: `Add field '${fieldName}' of type '${fieldType || 'unknown'}'`
        });
      }
    }
  }
  
  return changes;
}

/**
 * Checks if the hunk represents a parameter addition
 */
function isParameterAddition(
  addedLines: string[], 
  removedLines: string[], 
  language: string
): boolean {
  // TypeScript/JavaScript parameter addition
  if (language === 'node') {
    // Look for lines with parameter in function definition
    return addedLines.some(line => 
      line.includes(':') && 
      (line.includes('interface') || line.includes('?: ') || line.includes(': '))
    );
  }
  
  // Ruby parameter addition
  if (language === 'ruby') {
    return addedLines.some(line => 
      line.includes('def ') || 
      line.includes('param') || 
      line.trim().startsWith('#') // Comment line for param
    );
  }
  
  // Python parameter addition
  if (language === 'python') {
    return addedLines.some(line => 
      line.includes('def ') || 
      line.includes(':') ||
      line.includes('Optional[')
    );
  }
  
  return false;
}

/**
 * Checks if the hunk represents a field addition
 */
function isFieldAddition(
  addedLines: string[], 
  removedLines: string[], 
  language: string
): boolean {
  // TypeScript/JavaScript field addition
  if (language === 'node') {
    // Look for lines with field in interface or class
    return addedLines.some(line => 
      line.includes(':') && 
      !line.includes('(') && 
      !line.includes('=>') &&
      !line.includes('function')
    );
  }
  
  // Ruby field addition - not common in Ruby
  if (language === 'ruby') {
    return addedLines.some(line => 
      line.includes('@') || 
      line.includes('attr_') 
    );
  }
  
  // Python field addition
  if (language === 'python') {
    return addedLines.some(line => 
      line.includes('=') || 
      line.includes(':') && !line.includes('def ')
    );
  }
  
  return false;
}

/**
 * Extracts the parameter name from added lines
 */
function extractParameterName(addedLines: string[], language: string): string | null {
  if (language === 'node') {
    // Match parameter name in TypeScript interface
    for (const line of addedLines) {
      const match = line.match(/(\w+)\s*\??:/);
      if (match) {
        return match[1];
      }
    }
  }
  
  if (language === 'ruby') {
    // Match parameter name in Ruby
    for (const line of addedLines) {
      if (line.includes('@param')) {
        const match = line.match(/@param\s*\[?\s*\w+\s*\]?\s*:?(\w+)/);
        if (match) {
          return match[1];
        }
      } else {
        // Try to find it in method definition
        const match = line.match(/def\s+\w+\(.*:(\w+)/);
        if (match) {
          return match[1];
        }
      }
    }
  }
  
  if (language === 'python') {
    // Match parameter name in Python
    for (const line of addedLines) {
      const match = line.match(/(\w+)\s*:/);
      if (match) {
        return match[1];
      }
    }
  }
  
  return null;
}

/**
 * Extracts the parameter type from added lines
 */
function extractParameterType(addedLines: string[], language: string): string | null {
  if (language === 'node') {
    // Match parameter type in TypeScript interface
    for (const line of addedLines) {
      const match = line.match(/\w+\s*\??:\s*([A-Za-z<>\[\]|]+)/);
      if (match) {
        return match[1];
      }
    }
  }
  
  if (language === 'ruby') {
    // Match parameter type in Ruby
    for (const line of addedLines) {
      if (line.includes('@param')) {
        const match = line.match(/@param\s*\[\s*(\w+)\s*\]/);
        if (match) {
          return match[1];
        }
      }
    }
  }
  
  if (language === 'python') {
    // Match parameter type in Python
    for (const line of addedLines) {
      const match = line.match(/\w+\s*:\s*([A-Za-z\[\]]+)/);
      if (match) {
        return match[1];
      }
    }
  }
  
  return null;
}

/**
 * Extracts the field name from added lines
 */
function extractFieldName(addedLines: string[], language: string): string | null {
  if (language === 'node') {
    // Match field name in TypeScript interface
    for (const line of addedLines) {
      const match = line.match(/(\w+)\s*\??:/);
      if (match) {
        return match[1];
      }
    }
  }
  
  if (language === 'ruby') {
    // Match field name in Ruby
    for (const line of addedLines) {
      const match = line.match(/@(\w+)/);
      if (match) {
        return match[1];
      }
    }
  }
  
  if (language === 'python') {
    // Match field name in Python
    for (const line of addedLines) {
      // Field in a class definition
      const match = line.match(/(\w+)\s*:/);
      if (match) {
        return match[1];
      }
      
      // Assignment
      const assignMatch = line.match(/(\w+)\s*=/);
      if (assignMatch) {
        return assignMatch[1];
      }
    }
  }
  
  return null;
}

/**
 * Extracts the field type from added lines
 */
function extractFieldType(addedLines: string[], language: string): string | null {
  if (language === 'node') {
    // Match field type in TypeScript interface
    for (const line of addedLines) {
      const match = line.match(/\w+\s*\??:\s*([A-Za-z<>\[\]|]+)/);
      if (match) {
        return match[1];
      }
    }
  }
  
  if (language === 'ruby') {
    // Ruby doesn't have explicit types, return a placeholder
    return 'String';
  }
  
  if (language === 'python') {
    // Match field type in Python
    for (const line of addedLines) {
      const match = line.match(/\w+\s*:\s*([A-Za-z\[\]]+)/);
      if (match) {
        return match[1];
      }
    }
  }
  
  return null;
}

/**
 * Translate parameter changes for the target language
 */
export function translateParameterAddition(
  paramName: string,
  paramType: string | null,
  sourceLang: string,
  targetLang: string
): string {
  if (targetLang === 'ruby') {
    // Add a parameter to Ruby method
    return `# @param [String] ${paramName} Optional. Can be used to update the user's ${paramName}.
${paramName}: nil,`;
  }
  
  if (targetLang === 'python') {
    // Add a field to Python class
    return `${paramName}: Optional[str] = field(default=None)`;
  }
  
  // Default to typescript
  return `${paramName}?: string`;
}

/**
 * Find the appropriate location to insert the parameter in the target file
 */
export function findParameterInsertLocation(
  targetContent: string,
  paramName: string,
  targetLang: string
): string | null {
  if (targetLang === 'ruby') {
    // Find method that needs parameter addition (typically update_user)
    const methodRegex = /def\s+update_user\s*\(([\s\S]*?)\)/;
    const methodMatch = targetContent.match(methodRegex);
    
    if (methodMatch) {
      return methodMatch[1];
    }
  }
  
  if (targetLang === 'python') {
    // Find class definition that needs field addition
    const classRegex = /class\s+User\s*\([\s\S]*?\):\s*[\s\S]*?([\n\r])/;
    const classMatch = targetContent.match(classRegex);
    
    if (classMatch) {
      return classMatch[1];
    }
  }
  
  return null;
}

/**
 * Apply parameter changes to the target file
 */
export function applyParameterChange(
  targetContent: string,
  paramName: string,
  paramType: string | null,
  targetLang: string
): string {
  if (targetLang === 'ruby') {
    // For Ruby, add to the update_user method parameter list
    const methodSignatureRegex = /(def\s+update_user\s*\()([^)]*?)(\))/;
    const methodMatch = targetContent.match(methodSignatureRegex);
    
    if (methodMatch) {
      const existingParams = methodMatch[2];
      const newParam = `\n        ${paramName}: nil,`;
      
      // If the last character is a comma, insert before it, otherwise add comma
      if (existingParams.trim().endsWith(',')) {
        return targetContent.replace(
          methodSignatureRegex,
          `$1${existingParams}${newParam}$3`
        );
      } else if (existingParams.trim() === '') {
        return targetContent.replace(
          methodSignatureRegex,
          `$1${newParam}$3`
        );
      } else {
        return targetContent.replace(
          methodSignatureRegex,
          `$1${existingParams},${newParam}$3`
        );
      }
    }
    
    // Also add to the request body
    const requestBodyRegex = /(body:\s*\{)([\s\S]*?)(\})/;
    const bodyMatch = targetContent.match(requestBodyRegex);
    
    if (bodyMatch) {
      const existingBody = bodyMatch[2];
      const newBodyField = `\n            ${paramName}: ${paramName},`;
      
      return targetContent.replace(
        requestBodyRegex,
        `$1${existingBody}${newBodyField}$3`
      );
    }
  }
  
  if (targetLang === 'python') {
    // For Python, add to the User class fields
    // We look for the last field in the class
    const classRegex = /(class\s+User\s*\([^)]*\):\s*"""[^"]*""")/;
    const classMatch = targetContent.match(classRegex);
    
    if (classMatch) {
      const newField = `\n    ${paramName}: Optional[str] = field(default=None)`;
      
      return targetContent.replace(
        classRegex,
        `$1${newField}`
      );
    }
  }
  
  return targetContent;
}

/**
 * Apply all identified changes to the target file
 */
export function applyChangesToFile(
  sourceFilePath: string,
  targetFilePath: string,
  sourceLang: string,
  targetLang: string,
  patch: string
): string {
  try {
    // Read the target file
    const targetContent = fs.readFileSync(targetFilePath, 'utf8');
    
    // Extract patch changes
    const changes = extractPatchChanges(patch, sourceLang, targetLang);
    
    core.info(`Extracted ${changes.length} changes from patch`);
    
    let updatedContent = targetContent;
    
    // Apply each change
    for (const change of changes) {
      core.info(`Applying change: ${change.description}`);
      
      if (change.type === 'parameter_addition') {
        const paramName = extractParameterName(patch.split('\n'), sourceLang);
        const paramType = extractParameterType(patch.split('\n'), sourceLang);
        
        if (paramName) {
          updatedContent = applyParameterChange(
            updatedContent,
            paramName,
            paramType,
            targetLang
          );
        }
      }
      
      // Handle other change types here
    }
    
    return updatedContent;
  } catch (error) {
    core.error(`Error applying changes: ${error}`);
    return '';
  }
}

/**
 * Parse a patch to determine what needs to be changed
 */
export function analyzePatchForChanges(
  patch: string,
  sourceLang: string,
  targetLang: string
): { 
  type: string;
  name: string | null;
  description: string;
}[] {
  const results = [];
  
  // Look for parameter additions in interface files
  if (patch.includes('interface') && patch.includes('?:')) {
    const lines = patch.split('\n');
    for (const line of lines) {
      if (line.startsWith('+') && line.includes('?:')) {
        const match = line.match(/\+\s*(\w+)\s*\?:/);
        if (match) {
          results.push({
            type: 'parameter_addition',
            name: match[1],
            description: `Add ${match[1]} parameter`
          });
        }
      }
    }
  }
  
  // Look for new fields in classes
  if (patch.includes('class') || patch.includes('interface')) {
    const lines = patch.split('\n');
    for (const line of lines) {
      if (line.startsWith('+') && !line.includes('function') && line.includes(':')) {
        const match = line.match(/\+\s*(\w+)\s*:/);
        if (match) {
          results.push({
            type: 'field_addition',
            name: match[1],
            description: `Add ${match[1]} field`
          });
        }
      }
    }
  }
  
  return results;
}