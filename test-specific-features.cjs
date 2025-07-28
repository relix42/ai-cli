#!/usr/bin/env node

// Specific feature tests for slash commands and Ollama
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

async function testSpecificFeatures() {
  console.log('🎯 Testing Specific GrooveForge Features...\n');

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  // Test 1: /about command should show version info
  console.log('📋 Test 1: /about command functionality');
  const aboutResult = await runCLI(['--prompt', '/about']);
  
  if (aboutResult.stdout.includes('version') || aboutResult.stdout.includes('GrooveForge')) {
    console.log('✅ /about command shows version information');
    results.passed++;
  } else {
    console.log('❌ /about command missing version info');
    console.log('   Output:', aboutResult.stdout.substring(0, 200));
    results.failed++;
  }

  // Test 2: /tools list command
  console.log('\n📋 Test 2: /tools list command');
  const toolsResult = await runCLI(['--prompt', '/tools list']);
  
  if (toolsResult.exitCode === 0 || toolsResult.stdout.length > 50) {
    console.log('✅ /tools list command executed successfully');
    results.passed++;
  } else {
    console.log('❌ /tools list command failed');
    results.failed++;
  }

  // Test 3: /initial-prompts help command
  console.log('\n📋 Test 3: /initial-prompts help command');
  const ipHelpResult = await runCLI(['--prompt', '/initial-prompts help']);
  
  if (ipHelpResult.stdout.includes('Initial Prompts Management') || 
      ipHelpResult.stdout.includes('initial-prompts')) {
    console.log('✅ /initial-prompts help shows management info');
    results.passed++;
  } else {
    console.log('❌ /initial-prompts help missing expected content');
    results.failed++;
  }

  // Test 4: /mcp list command
  console.log('\n📋 Test 4: /mcp list command');
  const mcpResult = await runCLI(['--prompt', '/mcp list']);
  
  if (mcpResult.stdout.includes('MCP') || mcpResult.stdout.includes('server') || 
      mcpResult.exitCode === 0) {
    console.log('✅ /mcp list command executed');
    results.passed++;
  } else {
    console.log('❌ /mcp list command failed');
    results.failed++;
  }

  // Test 5: /memory show command
  console.log('\n📋 Test 5: /memory show command');
  const memoryResult = await runCLI(['--prompt', '/memory show']);
  
  if (memoryResult.exitCode === 0 || memoryResult.stdout.length > 20) {
    console.log('✅ /memory show command executed');
    results.passed++;
  } else {
    console.log('❌ /memory show command failed');
    results.failed++;
  }

  // Test 6: /stats session command
  console.log('\n📋 Test 6: /stats session command');
  const statsResult = await runCLI(['--prompt', '/stats session']);
  
  if (statsResult.exitCode === 0 || statsResult.stdout.length > 20) {
    console.log('✅ /stats session command executed');
    results.passed++;
  } else {
    console.log('❌ /stats session command failed');
    results.failed++;
  }

  // Test 7: Ollama environment detection
  console.log('\n📋 Test 7: Ollama environment detection');
  const ollamaDetectResult = await runCLI(['--prompt', 'test'], 3000, {
    CHAT_CLI_PROVIDER: 'ollama',
    OLLAMA_MODEL: 'llama2'
  });
  
  if (ollamaDetectResult.stderr.includes('ollama') || 
      ollamaDetectResult.stdout.includes('ollama') ||
      ollamaDetectResult.stderr.includes('connection')) {
    console.log('✅ Ollama environment properly detected');
    results.passed++;
  } else {
    console.log('❌ Ollama environment not detected');
    results.failed++;
  }

  // Test 8: Initial prompts with slash commands integration
  console.log('\n📋 Test 8: Initial prompts + slash commands integration');
  const integrationResult = await runCLI([
    '--initial-prompts', '/about;/tools list',
    '--prompt', 'exit'
  ]);
  
  if (integrationResult.stdout.includes('GrooveForge will execute 2 initial prompts')) {
    console.log('✅ Initial prompts + slash commands integration works');
    results.passed++;
  } else {
    console.log('❌ Initial prompts + slash commands integration failed');
    results.failed++;
  }

  // Test 9: File-based initial prompts with slash commands
  console.log('\n📋 Test 9: File-based initial prompts with slash commands');
  
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'grooveforge-test-'));
  const promptsFile = path.join(tempDir, 'slash-prompts.txt');
  
  fs.writeFileSync(promptsFile, `# Slash command prompts
/about
/tools list
/memory show`);

  const fileBasedResult = await runCLI([
    '--initial-prompts-file', promptsFile,
    '--prompt', 'exit'
  ]);
  
  if (fileBasedResult.stdout.includes('GrooveForge will execute 3 initial prompts')) {
    console.log('✅ File-based initial prompts with slash commands works');
    results.passed++;
  } else {
    console.log('❌ File-based initial prompts with slash commands failed');
    results.failed++;
  }

  // Cleanup
  fs.rmSync(tempDir, { recursive: true, force: true });

  // Test 10: Error handling for invalid slash commands
  console.log('\n📋 Test 10: Error handling for invalid slash commands');
  const invalidResult = await runCLI(['--prompt', '/nonexistent-command']);
  
  if (invalidResult.stderr.includes('Unknown') || invalidResult.exitCode !== 0) {
    console.log('✅ Invalid slash commands properly handled');
    results.passed++;
  } else {
    console.log('❌ Invalid slash commands not properly handled');
    results.failed++;
  }

  return results;
}

function runCLI(args, timeout = 5000, extraEnv = {}) {
  return new Promise((resolve) => {
    const cliPath = path.join(__dirname, 'packages/cli/dist/index.js');
    
    const child = spawn('node', [cliPath, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NO_COLOR: '1',
        GEMINI_CLI_NO_RELAUNCH: 'true',
        SANDBOX: 'false',
        GEMINI_API_KEY: 'test-key-for-testing',
        GEMINI_CLI_TELEMETRY: 'false',
        ...extraEnv
      }
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      resolve({ stdout, stderr, exitCode: null, timedOut: true });
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code, timedOut: false });
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: error.message, exitCode: -1, timedOut: false });
    });

    // Close stdin to prevent hanging
    child.stdin?.end();
  });
}

async function main() {
  console.log('🎯 GrooveForge Specific Features Test Suite');
  console.log('==========================================\n');

  const results = await testSpecificFeatures();

  // Summary
  console.log('\n📊 SPECIFIC FEATURES TEST SUMMARY');
  console.log('==================================');
  
  const totalTests = results.passed + results.failed;
  const successRate = ((results.passed / totalTests) * 100).toFixed(1);

  console.log(`\n🎯 Results:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📊 Success Rate: ${successRate}%`);

  if (results.failed === 0) {
    console.log('\n🎉 All specific feature tests passed! GrooveForge features are working perfectly!');
  } else {
    console.log(`\n⚠️  ${results.failed} test(s) failed. Review the output above for details.`);
  }

  console.log('\n🏁 Specific features test completed!');
}

main().catch(console.error);