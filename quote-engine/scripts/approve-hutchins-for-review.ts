// Five Star Conveyancing — approve Hutchins Law's (TP Legal Ltd) pending fee data
import { approveFirmForReview } from './_reviewWorkflow.js';

approveFirmForReview('567465', 'Hutchins Law (TP Legal Ltd)').catch((err) => {
  console.error(err);
  process.exit(1);
});
