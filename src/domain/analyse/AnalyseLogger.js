export function formatSummary(timings, totalDurationSec) {
  console.log('============================================================');
  console.log('              ⚡ Analysis Benchmark Summary ⚡');
  console.log('============================================================');
  timings.forEach(({ name, durationSec }) => {
      const percent = totalDurationSec > 0 ? ((durationSec / totalDurationSec) * 100).toFixed(1) : '0.0';
      const formattedName = name.padEnd(25, ' ');
      const formattedDuration = `${durationSec.toFixed(2)}s`.padStart(8, ' ');
      const formattedPercent = `${percent}%`.padStart(6, ' ');
      console.log(`  ${formattedName} : ${formattedDuration} (${formattedPercent})`);
  });
  console.log('------------------------------------------------------------');
  const formattedTotal = `${totalDurationSec.toFixed(2)}s`.padStart(8, ' ');
  console.log(`  ${'⏱️  Total Build Time'.padEnd(23, ' ')} : ${formattedTotal} (100.0%)`);
  console.log('============================================================\n');
}
