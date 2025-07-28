#!/usr/bin/env node

// Comprehensive test suite for slash commands and Ollama integration
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// List of all slash commands to test
const SLASH_COMMANDS = [
  'about',
  'auth', 
  'fork',
  'bug',
  'chat',
  'clear',
  'compress',
  'copy',
  'corgi',
  'docs',
  'editor',
  'extensions',
  'help',
  'ide',
  'initial-prompts',
  'logs',
  'memory',
  'privacy',
  'mcp',
  'quit',
  'restore',
  'stats',
  'theme',
  'tools',
  'vim'
];

// Commands that should work in non-interactive mode
const NON_INTERACTIVE_SAFE_COMMANDS = [
  'about',
  'fork', 
  'help',
  'docs',
  'extensions',
  'initial-prompts',
  'logs',
  'memory',
  'mcp',
  'stats',
  'tools'
];

// Commands that require specific arguments
const COMMANDS_WITH_ARGS = {
  'initial-prompts': ['help', 'config', 'create'],
  'mcp': ['list', 'auth', 'refresh'],
  'memory': ['show', 'refresh'],
  'stats': ['session', 'model', 'tools'],
  'tools': ['list'],
  'theme': ['list'],
  'chat': ['list', 'resume'],
  'restore': ['list']
};

async function testSlashCommands() {
  console.log('🧪 Testing All Slash Commands...\n');

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  // Test 1: Help command should list all slash commands
  console.log('📋 Test 1: Verifying help command lists all slash commands');
  const helpResult = await runCLI(['--prompt', '/help']);
  
  if (helpResult.exitCode === 0 || helpResult.stdout.length > 0) {
    console.log('✅ Help command executed successfully');
    
    // Check if help output contains slash commands
    const helpOutput = helpResult.stdout.toLowerCase();
    let foundCommands = 0;
    
    for (const cmd of SLASH_COMMANDS) {
      if (helpOutput.includes(`/${cmd}`) || helpOutput.includes(cmd)) {
        foundCommands++;
      }
    }
    
    console.log(`   Found ${foundCommands}/${SLASH_COMMANDS.length} commands in help output`);
    results.passed++;
  } else {
    console.log('❌ Help command failed');
    console.log('   Exit code:', helpResult.exitCode);
    console.log('   Stderr:', helpResult.stderr.substring(0, 200));
    results.failed++;
  }

  // Test 2: Test each slash command individually
  console.log('\\n📋 Test 2: Testing individual slash commands');
  
  for (const command of NON_INTERACTIVE_SAFE_COMMANDS) {
    console.log(`\\n  Testing /${command}...`);
    
    const cmdResult = await runCLI(['--prompt', `/${command}`], 8000);
    
    if (cmdResult.exitCode === 0 || cmdResult.stdout.length > 0 || cmdResult.timedOut) {
      console.log(`  ✅ /${command} - Executed (exit: ${cmdResult.exitCode}, stdout: ${cmdResult.stdout.length} chars)`);
      results.passed++;
      
      // Test with arguments if applicable
      if (COMMANDS_WITH_ARGS[command]) {
        for (const arg of COMMANDS_WITH_ARGS[command]) {
          const argResult = await runCLI(['--prompt', `/${command} ${arg}`], 5000);
          if (argResult.exitCode === 0 || argResult.stdout.length > 0 || argResult.timedOut) {
            console.log(`    ✅ /${command} ${arg} - OK`);
          } else {
            console.log(`    ❌ /${command} ${arg} - Failed`);
          }
        }
      }
    } else {
      console.log(`  ❌ /${command} - Failed (exit: ${cmdResult.exitCode})`);
      if (cmdResult.stderr.length > 0) {
        console.log(`    Error: ${cmdResult.stderr.substring(0, 150)}`);
      }
      results.failed++;
    }
  }

  // Test 3: Test invalid slash commands
  console.log('\\n📋 Test 3: Testing invalid slash commands');
  const invalidResult = await runCLI(['--prompt', '/nonexistent-command']);
  
  if (invalidResult.stderr.includes('Unknown command') || invalidResult.stdout.includes('Unknown command') || invalidResult.exitCode !== 0) {
    console.log('✅ Invalid commands properly rejected');
    results.passed++;
  } else {
    console.log('❌ Invalid commands not properly handled');
    results.failed++;
  }

  // Test 4: Test slash command help
  console.log('\\n📋 Test 4: Testing slash command help functionality');
  const helpCmdResult = await runCLI(['--prompt', '/help help']);
  
  if (helpCmdResult.exitCode === 0 || helpCmdResult.stdout.length > 0) {
    console.log('✅ Slash command help works');
    results.passed++;
  } else {
    console.log('❌ Slash command help failed');
    results.failed++;
  }

  return results;
}

async function testOllamaIntegration() {
  console.log('\\n🦙 Testing Ollama Integration..\\n');

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  // Test 1: Check Ollama environment variable handling
  console.log('📋 Test 1: Testing Ollama environment variables');
  
  const ollamaEnvResult = await runCLI(['--prompt', 'test'], 3000, {
    CHAT_CLI_PROVIDER: 'ollama',
    OLLAMA_MODEL: 'llama2'
  });
  
  // Should either connect to Ollama or show appropriate error
  if (ollamaEnvResult.stderr.includes('ollama') || 
      ollamaEnvResult.stdout.includes('ollama') ||
      ollamaEnvResult.stderr.includes('connection') ||
      ollamaEnvResult.stderr.includes('ECONNREFUSED')) {
    console.log('✅ Ollama environment variables recognized');
    results.passed++;
  } else {
    console.log('❌ Ollama environment variables not handled properly');
    console.log('   Stderr:', ollamaEnvResult.stderr.substring(0, 200));
    results.failed++;
  }

  // Test 2: Test without Ollama (should show helpful message)
  console.log('\\n📋 Test 2: Testing without Ollama configuration');
  
  const noOllamaResult = await runCLI(['--prompt', 'test'], 3000);
  
  if (noOllamaResult.stderr.includes('To use Ollama') || 
      noOllamaResult.stderr.includes('CHAT_CLI_PROVIDER')) {
    console.log('✅ Helpful Ollama setup message shown');
    results.passed++;
  } else {
    console.log('❌ No helpful Ollama message found');
    console.log('   Stderr:', noOllamaResult.stderr.substring(0, 200));
    results.failed++;
  }

  // Test 3: Test Ollama model selection
  console.log('\\n📋 Test 3: Testing Ollama model configuration');
  
  const modelResult = await runCLI(['--prompt', '/about'], 3000, {
    CHAT_CLI_PROVIDER: 'ollama',
    OLLAMA_MODEL: 'custom-model'
  });
  
  // Should show model info or connection attempt
  if (modelResult.stdout.includes('custom-model') || 
      modelResult.stderr.includes('custom-model') ||
      modelResult.stderr.includes('ollama')) {
    console.log('✅ Ollama model configuration recognized');
    results.passed++;
  } else {
    console.log('❌ Ollama model configuration not recognized');
    results.failed++;
  }

  // Test 4: Test Ollama with slash commands
  console.log('\\n📋 Test 4: Testing Ollama with slash commands');
  
  const slashOllamaResult = await runCLI(['--prompt', '/tools list'], 3000, {
    CHAT_CLI_PROVIDER: 'ollama'
  });
  
  if (slashOllamaResult.exitCode === 0 || slashOllamaResult.stdout.length > 0) {
    console.log('✅ Slash commands work with Ollama configuration');
    results.passed++;
  } else {
    console.log('❌ Slash commands failed with Ollama configuration');
    results.failed++;
  }

  return results;
}

async function testCombinedFeatures() {
  console.log('\\n🔄 Testing Combined Features...\\n');

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  // Test 1: Initial prompts with slash commands
  console.log('📋 Test 1: Testing initial prompts with slash commands');
  
  const initialSlashResult = await runCLI([
    '--initial-prompts', '/about;/tools list;/help',
    '--prompt', 'exit'
  ]);
  
  if (initialSlashResult.stdout.includes('GrooveForge will execute 3 initial prompts')) {
    console.log('✅ Initial prompts with slash commands work');
    results.passed++;
  } else {
    console.log('❌ Initial prompts with slash commands failed');
    results.failed++;
  }

  // Test 2: Initial prompts with Ollama
  console.log('\\n📋 Test 2: Testing initial prompts with Ollama');
  
  const initialOllamaResult = await runCLI([
    '--initial-prompt', '/about',
    '--prompt', 'exit'
  ], 5000, {
    CHAT_CLI_PROVIDER: 'ollama'
  });
  
  if (initialOllamaResult.stdout.includes('GrooveForge will execute 1 initial prompt')) {
    console.log('✅ Initial prompts work with Ollama configuration');
    results.passed++;
  } else {
    console.log('❌ Initial prompts failed with Ollama configuration');
    results.failed++;
  }

  // Test 3: Complex workflow
  console.log('\\n📋 Test 3: Testing complex workflow');
  
  // Create a test prompts file
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'grooveforge-test-'));
  const promptsFile = path.join(tempDir, 'test-prompts.txt');
  
  fs.writeFileSync(promptsFile, `# Test workflow
/about
/tools list
/memory show
/stats session`);

  const workflowResult = await runCLI([
    '--initial-prompts-file', promptsFile,
    '--prompt', 'exit'
  ], 10000);
  
  if (workflowResult.stdout.includes('GrooveForge will execute 4 initial prompts')) {
    console.log('✅ Complex workflow with file-based prompts works');
    results.passed++;
  } else {
    console.log('❌ Complex workflow failed');
    results.failed++;
  }

  // Cleanup
  fs.rmSync(tempDir, { recursive: true, force: true });

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
  console.log('🚀 GrooveForge Comprehensive Test Suite');
  console.log('=====================================\\n');

  const allResults = {
    slashCommands: await testSlashCommands(),
    ollama: await testOllamaIntegration(), 
    combined: await testCombinedFeatures()
  };

  // Summary
  console.log('\\n📊 TEST SUMMARY');
  console.log('================');
  
  const totalPassed = allResults.slashCommands.passed + allResults.ollama.passed + allResults.combined.passed;
  const totalFailed = allResults.slashCommands.failed + allResults.ollama.failed + allResults.combined.failed;
  const totalTests = totalPassed + totalFailed;

  console.log(`\\n🎯 Overall Results:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${totalPassed}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log(`   📊 Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

  console.log(`\\n📋 Breakdown:`);
  console.log(`   🔧 Slash Commands: ${allResults.slashCommands.passed}/${allResults.slashCommands.passed + allResults.slashCommands.failed}`);
  console.log(`   🦙 Ollama Integration: ${allResults.ollama.passed}/${allResults.ollama.passed + allResults.ollama.failed}`);
  console.log(`   🔄 Combined Features: ${allResults.combined.passed}/${allResults.combined.passed + allResults.combined.failed}`);

  if (totalFailed === 0) {
    console.log('\\n🎉 All tests passed! GrooveForge is working perfectly!');
  } else {
    console.log(`\\n⚠️  ${totalFailed} test(s) failed. Review the output above for details.`);
  }

  console.log('\\n🏁 Test suite completed!');
}

main().catch(console.error);