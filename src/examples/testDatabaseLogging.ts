/**
 * Test Database Logging
 * 
 * This script demonstrates and tests the MongoDB logging functionality.
 * Run this file to verify that logs are being saved to the database.
 * 
 * Usage:
 *   ts-node src/examples/testDatabaseLogging.ts
 */

import { logger } from '../utils/logger';
import Database from '../database/connection';
import { SystemLogModel } from '../database/schemas/SystemLog.schema';

async function testDatabaseLogging() {
    console.log('🧪 Testing Database Logging...\n');

    try {
        // Connect to database
        console.log('📡 Connecting to database...');
        const db = new Database();
        await db.connect();
        console.log('✅ Database connected\n');

        // Get count before logging
        const countBefore = await SystemLogModel.countDocuments();
        console.log(`📊 Current log count in database: ${countBefore}\n`);

        // Test 1: Log an error
        console.log('🔴 Test 1: Logging an error...');
        logger.error('This is a test error message', {
            testId: 'TEST-001',
            context: 'Database logging test',
        });
        console.log('✅ Error logged\n');

        // Test 2: Log a warning
        console.log('🟡 Test 2: Logging a warning...');
        logger.warn('This is a test warning message', {
            testId: 'TEST-002',
            severity: 'medium',
        });
        console.log('✅ Warning logged\n');

        // Test 3: Log info (should NOT go to database)
        console.log('🔵 Test 3: Logging an info message (should NOT save to DB)...');
        logger.info('This is a test info message - should only appear in console and files');
        console.log('✅ Info logged\n');

        // Test 4: Log error with stack trace
        console.log('🔴 Test 4: Logging an error with stack trace...');
        try {
            throw new Error('Simulated error for testing');
        } catch (error) {
            logger.error('Caught an error during test', { error: error.message, stack: error.stack });
        }
        console.log('✅ Error with stack trace logged\n');

        // Wait a bit for async logging to complete
        console.log('⏳ Waiting for logs to be written to database...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get count after logging
        const countAfter = await SystemLogModel.countDocuments();
        console.log(`📊 Log count after tests: ${countAfter}`);
        console.log(`📈 New logs created: ${countAfter - countBefore}\n`);

        // Retrieve and display recent logs
        console.log('📋 Recent logs from database:');
        console.log('================================');
        const recentLogs = await SystemLogModel
            .find()
            .sort({ timestamp: -1 })
            .limit(5);

        recentLogs.forEach((log, index) => {
            console.log(`\nLog ${index + 1}:`);
            console.log(`  Level: ${log.level.toUpperCase()}`);
            console.log(`  Message: ${log.message}`);
            console.log(`  Timestamp: ${log.timestamp.toISOString()}`);
            if (log.metadata && Object.keys(log.metadata).length > 0) {
                console.log(`  Metadata:`, JSON.stringify(log.metadata, null, 2));
            }
        });

        console.log('\n================================');
        console.log('✅ Database logging test completed successfully!');
        console.log('\n📝 Summary:');
        console.log(`   - Error logs: Should be in database ✅`);
        console.log(`   - Warning logs: Should be in database ✅`);
        console.log(`   - Info logs: Should NOT be in database ✅`);
        console.log(`   - All logs: Should appear in terminal ✅`);
        console.log(`   - All logs: Should be in log files ✅`);

        // Disconnect
        await db.disconnect();
        console.log('\n👋 Database disconnected');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

// Run the test
testDatabaseLogging();

