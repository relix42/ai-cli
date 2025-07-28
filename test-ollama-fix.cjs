#!/usr/bin/env node

// Specific test to verify Ollama fix
const { spawn } = require('child_process');
const path = require('path');

async function testOllamaFix() {
  console.log('🦙 Testing Ollama Fix Verification...\n');

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  // Test 1: Ollama environment variable detection
  console.log('📋 Test 1: Ollama environment variable detection');
  const ollamaResult = await runCLI(['--prompt', 'test'], 3000, {
    CHAT_CLI_PROVIDER: 'ollama',
    OLLAMA_MODEL: 'llama2'
  });
  
  console.log('Exit code:', ollamaResult.exitCode);
  console.log('Stdout:', ollamaResult.stdout.substring(0, 200));
  console.log('Stderr:', ollamaResult.stderr.substring(0, 200));
  
  if (ollamaResult.stdout.includes('Using Ollama') || 
      ollamaResult.stderr.includes('Ollama') ||
      ollamaResult.stderr.includes('localhost:11434')) {
    console.log('✅ Ollama environment variables properly detected and used');
    results.passed++;
  } else {
    console.log('❌ Ollama environment variables not properly detected');
    results.failed++;
  }

  // Test 2: No provider set - should show new helpful message
  console.log('\n📋 Test 2: No provider set - new error message');
  const noProviderResult = await runCLI(['--prompt', 'test'], 3000);
  
  console.log('Exit code:', noProviderResult.exitCode);
  console.log('Stderr:', noProviderResult.stderr.substring(0, 300));
  
  if (noProviderResult.stderr.includes('CHAT_CLI_PROVIDER=ollama') &&
      noProviderResult.stderr.includes('CHAT_CLI_PROVIDER=claude') &&
      noProviderResult.stderr.includes('GEMINI_API_KEY')) {
    console.log('✅ New comprehensive error message shown');
    results.passed++;
  } else {
    console.log('❌ Old error message still showing');
    results.failed++;
  }

  // Test 3: Claude environment variable detection
  console.log('\n📋 Test 3: Claude environment variable detection');
  const claudeResult = await runCLI(['--prompt', 'test'], 3000, {
    CHAT_CLI_PROVIDER: 'claude',
    CLAUDE_API_KEY: 'test-key'
  });
  
  console.log('Exit code:', claudeResult.exitCode);
  console.log('Stdout:', claudeResult.stdout.substring(0, 200));
  console.log('Stderr:', claudeResult.stderr.substring(0, 200));
  
  if (claudeResult.stderr.includes('Claude') || 
      claudeResult.stdout.includes('Claude') ||
      claudeResult.stderr.includes('API')) {
    console.log('✅ Claude environment variables properly detected');
    results.passed++;
  } else {
    console.log('❌ Claude environment variables not properly detected');
    results.failed++;
  }

  // Test 4: Gemini still works
  console.log('\n📋 Test 4: Gemini API key detection');
  const geminiResult = await runCLI(['--prompt', 'test'], 3000, {
    GEMINI_API_KEY: 'test-key'
  });
  
  console.log('Exit code:', geminiResult.exitCode);
  console.log('Stderr:', geminiResult.stderr.substring(0, 200));
  
  if (geminiResult.exitCode === 1 && 
      !geminiResult.stderr.includes('Please set an Auth method')) {
    console.log('✅ Gemini API key properly detected');
    results.passed++;
  } else {
    console.log('❌ Gemini API key not properly detected');
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
  console.log('🦙 Ollama Fix Verification Test Suite');
  console.log('====================================\n');

  const results = await testOllamaFix();

  // Summary
  console.log('\n📊 OLLAMA FIX TEST SUMMARY');
  console.log('===========================');
  
  const totalTests = results.passed + results.failed;
  const successRate = ((results.passed / totalTests) * 100).toFixed(1);

  console.log(`\n🎯 Results:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📊 Success Rate: ${successRate}%`);

  if (results.failed === 0) {
    console.log('\n🎉 All Ollama fix tests passed! The Ollama issue has been successfully repaired!');
  } else {
    console.log(`\n⚠️  ${results.failed} test(s) failed. The fix may need additional work.`);
  }

  console.log('\n🏁 Ollama fix verification completed!');
}

main().catch(console.error);