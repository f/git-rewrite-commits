// Example of using git-rewrite-commits programmatically

const { GitCommitRewriter } = require('./dist/index');

async function main() {
  // Initialize the rewriter with options
  const rewriter = new GitCommitRewriter({
    apiKey: process.env.OPENAI_API_KEY, // or provide directly
    model: 'gpt-3.5-turbo',
    dryRun: true, // Set to false to actually rewrite
    verbose: true,
    maxCommits: 5, // Process only first 5 commits
  });

  try {
    // Run the rewrite process
    await rewriter.rewrite();
    console.log('✅ Process completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  main();
}
