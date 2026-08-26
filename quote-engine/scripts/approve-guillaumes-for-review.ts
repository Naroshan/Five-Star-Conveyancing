// Five Star Conveyancing — approve Guillaumes LLP's pending fee data
import { approveFirmForReview } from './_reviewWorkflow.js';

approveFirmForReview('566850', 'Guillaumes LLP').catch((err) => {
  console.error(err);
  process.exit(1);
});
