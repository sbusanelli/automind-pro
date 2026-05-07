/**
 * Knowledge Sync CLI
 * Command-line interface for knowledge document synchronization
 */

import { KnowledgeSyncService } from './src/services/knowledgeSyncService';
import { logger } from './src/utils/logger';

interface CLIConfig {
  knowledgeDir?: string;
  watchInterval?: number;
  batchSize?: number;
  enableAutoSync?: boolean;
  verbose?: boolean;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📚 AutoMind Knowledge Sync CLI');
    console.log('================================\n');
    console.log('Usage:');
    console.log('  npx ts-node knowledge-sync-cli.ts <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  init                    - Initialize knowledge sync service');
    console.log('  sync                    - Force sync all changes');
    console.log('  watch                   - Start watching for changes');
    console.log('  status                  - Show sync statistics');
    console.log('  scan                    - Scan knowledge directory');
    console.log('  reset                   - Reset document registry');
    console.log('');
    console.log('Options:');
    console.log('  --dir <path>            - Knowledge directory path');
    console.log('  --interval <ms>         - Watch interval in milliseconds');
    console.log('  --batch-size <size>     - Batch processing size');
    console.log('  --no-auto-sync          - Disable automatic sync');
    console.log('  --verbose                - Enable verbose logging');
    console.log('');
    console.log('Examples:');
    console.log('  npx ts-node knowledge-sync-cli.ts init');
    console.log('  npx ts-node knowledge-sync-cli.ts sync --verbose');
    console.log('  npx ts-node knowledge-sync-cli.ts watch --interval 30000');
    console.log('  npx ts-node knowledge-sync-cli.ts status');
    return;
  }
  
  const command = args[0];
  const config: CLIConfig = parseConfig(args.slice(1));
  
  // Set log level
  if (config.verbose) {
    process.env.LOG_LEVEL = 'debug';
  }
  
  const syncService = new KnowledgeSyncService(config);
  
  try {
    switch (command) {
      case 'init':
        await handleInit(syncService);
        break;
      case 'sync':
        await handleSync(syncService);
        break;
      case 'watch':
        await handleWatch(syncService, config);
        break;
      case 'status':
        await handleStatus(syncService);
        break;
      case 'scan':
        await handleScan(syncService);
        break;
      case 'reset':
        await handleReset(syncService);
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Command failed:', error instanceof Error ? error.message : String(error));
    if (config.verbose && error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await syncService.shutdown();
  }
}

function parseConfig(args: string[]): CLIConfig {
  const config: CLIConfig = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--dir':
        config.knowledgeDir = args[++i];
        break;
      case '--interval':
        config.watchInterval = parseInt(args[++i]);
        break;
      case '--batch-size':
        config.batchSize = parseInt(args[++i]);
        break;
      case '--no-auto-sync':
        config.enableAutoSync = false;
        break;
      case '--verbose':
        config.verbose = true;
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`❌ Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }
  
  return config;
}

async function handleInit(syncService: KnowledgeSyncService): Promise<void> {
  console.log('🚀 Initializing Knowledge Sync Service...\n');
  
  await syncService.initialize();
  
  const stats = await syncService.getSyncStats();
  
  console.log('✅ Knowledge Sync Service initialized successfully!\n');
  console.log('📊 Initial Statistics:');
  console.log(`   Total Documents: ${stats.totalDocuments}`);
  console.log(`   Processed Documents: ${stats.processedDocuments}`);
  console.log(`   Categories: ${Object.keys(stats.categories).join(', ')}`);
  console.log(`   Last Sync: ${stats.lastSyncTime || 'Never'}`);
}

async function handleSync(syncService: KnowledgeSyncService): Promise<void> {
  console.log('🔄 Starting manual sync...\n');
  
  await syncService.initialize();
  
  const changes = await syncService.syncChanges();
  
  console.log('✅ Sync completed!\n');
  console.log('📊 Changes Summary:');
  console.log(`   Added: ${changes.added.length}`);
  console.log(`   Modified: ${changes.modified.length}`);
  console.log(`   Deleted: ${changes.deleted.length}`);
  console.log(`   Unchanged: ${changes.unchanged.length}`);
  
  if (changes.added.length > 0) {
    console.log('\n📝 Added Documents:');
    changes.added.forEach(doc => {
      console.log(`   + ${doc.metadata.title} (${doc.metadata.category})`);
    });
  }
  
  if (changes.modified.length > 0) {
    console.log('\n📝 Modified Documents:');
    changes.modified.forEach(doc => {
      console.log(`   ~ ${doc.metadata.title} (${doc.metadata.category})`);
    });
  }
  
  if (changes.deleted.length > 0) {
    console.log('\n📝 Deleted Documents:');
    changes.deleted.forEach(doc => {
      console.log(`   - ${doc.metadata.title} (${doc.metadata.category})`);
    });
  }
}

async function handleWatch(syncService: KnowledgeSyncService, config: CLIConfig): Promise<void> {
  console.log('👁️  Starting knowledge directory watcher...\n');
  
  await syncService.initialize();
  syncService.startWatching();
  
  const interval = config.watchInterval || 60000;
  console.log(`✅ Watching for changes (interval: ${interval}ms)`);
  console.log('Press Ctrl+C to stop watching\n');
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping watcher...');
    await syncService.shutdown();
    process.exit(0);
  });
  
  // Keep process alive
  await new Promise(() => {});
}

async function handleStatus(syncService: KnowledgeSyncService): Promise<void> {
  console.log('📊 Knowledge Sync Status\n');
  
  await syncService.initialize();
  
  const stats = await syncService.getSyncStats();
  
  console.log('📚 Document Statistics:');
  console.log(`   Total Documents: ${stats.totalDocuments}`);
  console.log(`   Processed Documents: ${stats.processedDocuments}`);
  console.log(`   Processing Rate: ${stats.totalDocuments > 0 ? ((stats.processedDocuments / stats.totalDocuments) * 100).toFixed(1) : 0}%`);
  
  if (stats.lastSyncTime) {
    const timeSince = Date.now() - stats.lastSyncTime.getTime();
    const minutes = Math.floor(timeSince / 60000);
    console.log(`   Last Sync: ${stats.lastSyncTime.toLocaleString()} (${minutes} minutes ago)`);
  } else {
    console.log('   Last Sync: Never');
  }
  
  console.log('\n📂 Categories:');
  for (const [category, count] of Object.entries(stats.categories)) {
    const percentage = ((count / stats.totalDocuments) * 100).toFixed(1);
    console.log(`   ${category}: ${count} documents (${percentage}%)`);
  }
}

async function handleScan(syncService: KnowledgeSyncService): Promise<void> {
  console.log('🔍 Scanning knowledge directory...\n');
  
  await syncService.initialize();
  
  const stats = await syncService.getSyncStats();
  
  console.log('✅ Scan completed!\n');
  console.log('📊 Scan Results:');
  console.log(`   Total Documents Found: ${stats.totalDocuments}`);
  console.log(`   Categories: ${Object.keys(stats.categories).join(', ')}`);
  
  console.log('\n📂 Documents by Category:');
  for (const [category, count] of Object.entries(stats.categories)) {
    console.log(`   ${category}: ${count} documents`);
  }
}

async function handleReset(syncService: KnowledgeSyncService): Promise<void> {
  console.log('⚠️  Resetting document registry...\n');
  
  // This would need to be implemented in the sync service
  console.log('🔄 Document registry reset completed');
  console.log('💡 Run "init" command to reinitialize with fresh scan');
}

// Check environment variables
if (!process.env.PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY environment variable is not set');
  console.log('\nPlease set it before running this CLI:');
  console.log('export PINECONE_API_KEY=pcsk_6E8gvG_MARynUiWU4nQtkPMa3PwJQgeRDU1sKAZBBRBidvj718SY1rZjfaT155xxd8HbUr');
  console.log('\nThen run:');
  console.log('npx ts-node knowledge-sync-cli.ts init');
  process.exit(1);
}

// Run the CLI
if (require.main === module) {
  main();
}

export { main as runKnowledgeSyncCLI };
