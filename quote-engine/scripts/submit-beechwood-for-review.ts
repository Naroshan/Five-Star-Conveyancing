// Five Star Conveyancing — submit Beechwood Solicitors' draft data for review
import { submitFirmForReview } from './_reviewWorkflow.js';

submitFirmForReview('499274', 'Beechwood Solicitors').catch((err) => {
  console.error(err);
  process.exit(1);
});
