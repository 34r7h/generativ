import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
import { createHash } from 'crypto';
import * as readline from 'readline';

interface FunctionInfo {
  arguments: Record<string, string>;
  return: string;
  test: Record<string, any>;
  result: any;
  hash: string;
  inferredReturn?: any;
  testableProperties?: string[];
}

interface FileFunctions {
  [functionName: string]: FunctionInfo;
}

interface FunctionTree {
  [filePath: string]: FileFunctions;
}

class FunctionParser {
  private functionTree: FunctionTree = {};
  private existingTree: FunctionTree = {};
  private readonly supportedExtensions = ['.ts', '.js', '.tsx', '.jsx'];
  private readonly excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next'];
  private readonly excludeFiles = ['unit_setup.ts', 'unit_tests.json'];
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async parseCodebase(rootPath: string): Promise<void> {
    console.log('🔍 Starting comprehensive codebase analysis...');
    
    await this.loadExistingFunctionTree();
    this.functionTree = {};
    
    await this.parseDirectory(rootPath, 'client');
    await this.parseDirectory(rootPath, 'server');
    await this.parseDirectory(rootPath, 'contracts');
    
    await this.removeOrphanedEntries(rootPath);
    await this.analyzeAndInfer();
    await this.runWizard();
    await this.saveFunctionTree();
    
    console.log('✅ Comprehensive codebase analysis complete!');
    console.log(`📊 Found ${Object.keys(this.functionTree).length} files with functions`);
  }

  private async loadExistingFunctionTree(): Promise<void> {
    try {
      const existingPath = join(process.cwd(), 'unit_tests.json');
      const existingContent = await readFile(existingPath, 'utf-8');
      this.existingTree = JSON.parse(existingContent);
    } catch {
      this.existingTree = {};
    }
  }

  private async parseDirectory(rootPath: string, dirName: string): Promise<void> {
    const dirPath = join(rootPath, dirName);
    
    try {
      const exists = await stat(dirPath);
      if (!exists.isDirectory()) return;
    } catch {
      return;
    }

    console.log(`📁 Parsing ${dirName} directory...`);
    await this.walkDirectory(dirPath, rootPath);
  }

  private async walkDirectory(dirPath: string, rootPath: string): Promise<void> {
    try {
      const items = await readdir(dirPath);
      
      for (const item of items) {
        const fullPath = join(dirPath, item);
        const relativePath = relative(rootPath, fullPath);
        
        try {
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            if (!this.excludeDirs.includes(item)) {
              await this.walkDirectory(fullPath, rootPath);
            }
          } else if (stats.isFile()) {
            if (this.shouldParseFile(item) && !this.excludeFiles.includes(item)) {
              await this.parseFile(fullPath, relativePath);
            }
          }
        } catch (error) {
          console.warn(`⚠️  Could not process ${fullPath}:`, error);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not read directory ${dirPath}:`, error);
    }
  }

  private shouldParseFile(filename: string): boolean {
    const ext = extname(filename);
    return this.supportedExtensions.includes(ext);
  }

  private async parseFile(filePath: string, relativePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const functions = this.extractAllFunctions(content, filePath);
      
      if (Object.keys(functions).length > 0) {
        this.functionTree[relativePath] = functions;
        console.log(`📝 Found ${Object.keys(functions).length} functions in ${relativePath}`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not read file ${filePath}:`, error);
    }
  }

  private extractAllFunctions(content: string, filePath: string): FileFunctions {
    const functions: FileFunctions = {};
    
    // Comprehensive function patterns
    const functionPatterns = [
      // Function declarations
      /function\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^{]*?)\s*\{/g,
      /function\s+(\w+)\s*\(([^)]*)\)\s*\{/g,
      
      // Arrow functions
      /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*:\s*([^{]*?)\s*=>\s*\{/g,
      /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*\{/g,
      /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*:\s*([^;]+?)\s*=>/g,
      /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g,
      
      // Method definitions
      /(\w+)\s*\(([^)]*)\)\s*:\s*([^{]*?)\s*\{/g,
      /(\w+)\s*\(([^)]*)\)\s*\{/g,
      
      // Async functions
      /async\s+function\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^{]*?)\s*\{/g,
      /async\s+function\s+(\w+)\s*\(([^)]*)\)\s*\{/g,
      /async\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^{]*?)\s*=>\s*\{/g,
      /async\s+(\w+)\s*\(([^)]*)\)\s*=>\s*\{/g,
      
      // Class methods
      /^\s*(public|private|protected)?\s*(\w+)\s*\(([^)]*)\)\s*:\s*([^{]*?)\s*\{/gm,
      /^\s*(public|private|protected)?\s*(\w+)\s*\(([^)]*)\)\s*\{/gm,
      
      // Object methods
      /(\w+)\s*:\s*function\s*\(([^)]*)\)\s*:\s*([^{]*?)\s*\{/g,
      /(\w+)\s*:\s*function\s*\(([^)]*)\)\s*\{/g,
      /(\w+)\s*:\s*\(([^)]*)\)\s*:\s*([^{]*?)\s*=>\s*\{/g,
      /(\w+)\s*:\s*\(([^)]*)\)\s*=>\s*\{/g,
      
      // Export functions
      /export\s+function\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^{]*?)\s*\{/g,
      /export\s+function\s+(\w+)\s*\(([^)]*)\)\s*\{/g,
      /export\s+const\s+(\w+)\s*=\s*\(([^)]*)\)\s*:\s*([^{]*?)\s*=>\s*\{/g,
      /export\s+const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*\{/g
    ];

    for (const pattern of functionPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        let functionName, params, returnType;
        
        // Handle different pattern groups
        if (match.length === 4) {
          [, functionName, params, returnType] = match;
        } else if (match.length === 3) {
          [, functionName, params] = match;
          returnType = 'any';
        }
        
        if (functionName && !functions[functionName] && this.isValidFunctionName(functionName)) {
          const args = this.parseParameters(params);
          const functionHash = this.generateFunctionHash(content, functionName, args, returnType);
          
          functions[functionName] = {
            arguments: args,
            return: this.normalizeReturnType(returnType),
            test: this.generatePlaceholderTestData(args),
            result: "awaiting_user_input",
            hash: functionHash,
            inferredReturn: null,
            testableProperties: []
          };
        }
      }
    }

    return functions;
  }

  private isValidFunctionName(name: string): boolean {
    const invalidNames = ['if', 'for', 'while', 'switch', 'catch', 'return', 'throw', 'try', 'else'];
    return !invalidNames.includes(name) && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
  }

  private generateFunctionHash(content: string, functionName: string, args: Record<string, string>, returnType: string): string {
    const functionSignature = `${functionName}(${Object.entries(args).map(([k, v]) => `${k}: ${v}`).join(', ')}): ${returnType}`;
    return createHash('sha256').update(functionSignature).digest('hex').substring(0, 8);
  }

  private generatePlaceholderTestData(args: Record<string, string>): Record<string, any> {
    const testData: Record<string, any> = {};
    
    for (const [name, type] of Object.entries(args)) {
      testData[name] = "awaiting_user_input";
    }
    
    return testData;
  }

  private parseParameters(params: string): Record<string, string> {
    const args: Record<string, string> = {};
    
    if (!params.trim()) return args;
    
    const paramList = params.split(',').map(p => p.trim());
    
    for (const param of paramList) {
      if (param) {
        const [name, type] = param.split(':').map(s => s.trim());
        if (name) {
          args[name] = type || 'any';
        }
      }
    }
    
    return args;
  }

  private normalizeReturnType(returnType: string): string {
    if (!returnType || returnType === 'any') return 'any';
    
    return returnType
      .replace(/\s+/g, ' ')
      .replace(/\{.*$/, '')
      .trim();
  }

  private async analyzeAndInfer(): Promise<void> {
    console.log('\n🔬 Analyzing functions and inferring missing information...');
    
    for (const [filePath, functions] of Object.entries(this.functionTree)) {
      for (const [funcName, funcInfo] of Object.entries(functions)) {
        // Infer return type if missing or 'any'
        if (funcInfo.return === 'any' || !funcInfo.return) {
          funcInfo.return = this.inferReturnType(filePath, funcName, funcInfo);
        }
        
        // Generate testable properties
        funcInfo.testableProperties = this.generateTestableProperties(funcInfo);
      }
    }
  }

  private inferReturnType(filePath: string, funcName: string, funcInfo: FunctionInfo): string {
    // Try to infer from context and patterns
    const context = this.getFunctionContext(filePath, funcInfo);
    
    if (context.includes('server') || context.includes('port')) {
      return 'void';
    }
    
    if (context.includes('get') || context.includes('fetch') || context.includes('query')) {
      return 'Promise<any>';
    }
    
    if (context.includes('set') || context.includes('update') || context.includes('save')) {
      return 'boolean';
    }
    
    if (context.includes('validate') || context.includes('check') || context.includes('is')) {
      return 'boolean';
    }
    
    if (context.includes('format') || context.includes('transform') || context.includes('convert')) {
      return 'string';
    }
    
    if (context.includes('calculate') || context.includes('compute') || context.includes('math')) {
      return 'number';
    }
    
    return 'any';
  }

  private getFunctionContext(filePath: string, funcInfo: FunctionInfo): string {
    return `${filePath} ${Object.keys(funcInfo.arguments).join(' ')} ${funcInfo.return}`.toLowerCase();
  }

  private generateTestableProperties(funcInfo: FunctionInfo): string[] {
    const properties: string[] = [];
    
    // Add common testable properties based on function context
    if (funcInfo.return === 'void') {
      properties.push('side_effects', 'state_changes', 'external_calls');
    }
    
    if (funcInfo.return === 'boolean') {
      properties.push('truthiness', 'edge_cases');
    }
    
    if (funcInfo.return === 'number') {
      properties.push('range', 'precision', 'edge_cases');
    }
    
    if (funcInfo.return === 'string') {
      properties.push('length', 'format', 'content');
    }
    
    if (funcInfo.return.includes('Promise')) {
      properties.push('async_behavior', 'timeout', 'error_handling');
    }
    
    return properties;
  }

  private async runWizard(): Promise<void> {
    console.log('\n🎯 Starting comprehensive function test wizard...\n');
    
    for (const [filePath, functions] of Object.entries(this.functionTree)) {
      console.log(`\n📁 Processing file: ${filePath}`);
      
      for (const [funcName, funcInfo] of Object.entries(functions)) {
        console.log(`\n🔧 Function: ${funcName}`);
        console.log(`   Return type: ${funcInfo.return}`);
        console.log(`   Testable properties: ${funcInfo.testableProperties?.join(', ') || 'none'}`);
        
        // Check if function has changed
        const existingFunc = this.existingTree[filePath]?.[funcName];
        if (existingFunc && existingFunc.hash !== funcInfo.hash) {
          console.log(`⚠️  Function ${funcName} has changed!`);
          const update = await this.question('Do you want to update test parameters? (y/n): ');
          if (update.toLowerCase() !== 'y') {
            funcInfo.test = existingFunc.test;
            funcInfo.result = existingFunc.result;
            continue;
          }
        }
        
        // Process test arguments
        for (const [argName, argType] of Object.entries(funcInfo.arguments)) {
          console.log(`\n📝 Argument: ${argName} (${argType})`);
          const testValue = await this.question(`Enter test value for ${argName}: `);
          funcInfo.test[argName] = this.convertValueToType(testValue, argType);
        }
        
        // Process expected result
        console.log(`\n🎯 Expected result for ${funcName} (${funcInfo.return})`);
        
        if (funcInfo.return === 'void' || funcInfo.return === 'undefined') {
          funcInfo.result = undefined;
          console.log('✅ Function returns void/undefined - no result needed');
        } else {
          const resultValue = await this.question(`Enter expected result value (or "unknown"): `);
          
          if (resultValue.toLowerCase() === 'unknown') {
            funcInfo.result = '$_unknown';
          } else {
            funcInfo.result = this.convertValueToType(resultValue, funcInfo.return);
          }
        }
        
        console.log(`✅ Function ${funcName} configured!`);
      }
    }
  }

  private convertValueToType(value: string, targetType: string): any {
    const normalizedType = targetType.toLowerCase().trim();
    
    // Handle complex types
    if (normalizedType.includes('[]')) {
      try {
        if (value.startsWith('[') && value.endsWith(']')) {
          return JSON.parse(value);
        }
        return value.split(',').map(item => this.convertValueToType(item.trim(), normalizedType.replace('[]', '')));
      } catch {
        return value.split(',').map(item => item.trim());
      }
    }
    
    // Handle union types
    if (normalizedType.includes('|')) {
      const firstType = normalizedType.split('|')[0].trim().replace(/['"]/g, '');
      return this.convertValueToType(value, firstType);
    }
    
    // Handle specific types
    switch (normalizedType) {
      case 'string':
        return value;
      case 'number':
        const num = parseFloat(value);
        return isNaN(num) ? value : num;
      case 'boolean':
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        return value;
      case 'any':
      case 'unknown':
        if (value === 'true' || value === 'false') return value === 'true';
        if (!isNaN(parseFloat(value))) return parseFloat(value);
        return value;
      default:
        try {
          if (value.startsWith('{') || value.startsWith('[')) {
            return JSON.parse(value);
          }
        } catch {
          // If not JSON, return as string
        }
        return value;
    }
  }

  private async question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      try {
        this.rl.question(prompt, (answer) => {
          resolve(answer.trim());
        });
      } catch (error) {
        // Fallback if readline fails
        resolve('default_value');
      }
    });
  }

  private async removeOrphanedEntries(rootPath: string): Promise<void> {
    console.log('🧹 Checking for orphaned entries...');
    
    const existingFiles = new Set<string>();
    await this.collectExistingFiles(rootPath, existingFiles);
    
    const orphanedFiles = Object.keys(this.functionTree).filter(
      filePath => !existingFiles.has(filePath)
    );
    
    if (orphanedFiles.length > 0) {
      console.log(`🗑️  Removing ${orphanedFiles.length} orphaned entries:`, orphanedFiles);
      for (const filePath of orphanedFiles) {
        delete this.functionTree[filePath];
      }
    }
  }

  private async collectExistingFiles(rootPath: string, existingFiles: Set<string>): Promise<void> {
    const dirs = ['client', 'server', 'contracts'];
    
    for (const dir of dirs) {
      const dirPath = join(rootPath, dir);
      
      try {
        const exists = await stat(dirPath);
        if (exists.isDirectory()) {
          await this.walkDirectoryForFiles(dirPath, rootPath, existingFiles);
        }
      } catch {
        // Directory doesn't exist, skip
      }
    }
  }

  private async walkDirectoryForFiles(dirPath: string, rootPath: string, existingFiles: Set<string>): Promise<void> {
    try {
      const items = await readdir(dirPath);
      
      for (const item of items) {
        const fullPath = join(dirPath, item);
        const relativePath = relative(rootPath, fullPath);
        
        try {
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            if (!this.excludeDirs.includes(item)) {
              await this.walkDirectoryForFiles(fullPath, rootPath, existingFiles);
            }
          } else if (stats.isFile()) {
            if (this.shouldParseFile(item) && !this.excludeFiles.includes(item)) {
              existingFiles.add(relativePath);
            }
          }
        } catch {
          // Skip files we can't access
        }
      }
    } catch {
      // Skip directories we can't access
    }
  }

  private async saveFunctionTree(): Promise<void> {
    const outputPath = join(process.cwd(), 'unit_tests.json');
    
    try {
      await writeFile(outputPath, JSON.stringify(this.functionTree, null, 2), 'utf-8');
      console.log(`💾 Function tree saved to ${outputPath}`);
    } catch (error) {
      console.error('❌ Failed to save function tree:', error);
    }
  }

  getFunctionTree(): FunctionTree {
    return this.functionTree;
  }

  close(): void {
    this.rl.close();
  }
}

// Main execution
async function main() {
  const parser = new FunctionParser();
  const rootPath = join(process.cwd(), '..');
  
  try {
    await parser.parseCodebase(rootPath);
    
    // Display comprehensive summary
    const tree = parser.getFunctionTree();
    console.log('\n📋 Comprehensive Function Tree Summary:');
    console.log('========================================');
    
    for (const [filePath, functions] of Object.entries(tree)) {
      console.log(`\n📁 ${filePath}:`);
      for (const [funcName, funcInfo] of Object.entries(functions)) {
        console.log(`  🔧 ${funcName}(${Object.entries(funcInfo.arguments).map(([k, v]) => `${k}: ${v}`).join(', ')}) -> ${funcInfo.return}`);
        console.log(`     Hash: ${funcInfo.hash}`);
        console.log(`     Testable: ${funcInfo.testableProperties?.join(', ') || 'none'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during codebase analysis:', error);
    process.exit(1);
  } finally {
    parser.close();
  }
}

// Always run main when script is executed
main();

export { FunctionParser, FunctionTree, FunctionInfo };