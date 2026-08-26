// Five Star Conveyancing — submit Guillaumes LLP's draft data for review
import { submitFirmForReview } from './_reviewWorkflow.js';

submitFirmForReview('566850', 'Guillaumes LLP').catch((err) => {
  console.error(err);
  process.exit(1);
});
