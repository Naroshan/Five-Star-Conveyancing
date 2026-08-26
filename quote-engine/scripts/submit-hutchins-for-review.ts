// Five Star Conveyancing — submit Hutchins Law's (TP Legal Ltd) draft data for review
import { submitFirmForReview } from './_reviewWorkflow.js';

submitFirmForReview('567465', 'Hutchins Law (TP Legal Ltd)').catch((err) => {
  console.error(err);
  process.exit(1);
});
