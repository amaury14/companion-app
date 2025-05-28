import { Category } from '../../types/category';
import { claimKeys, claimTexts } from '../keys/claim-keys';

export const claimData: Category[] = [
    { name: claimTexts.deleted, value: claimKeys.deleted },
    { name: claimTexts.open, value: claimKeys.open },
    { name: claimTexts.rejected, value: claimKeys.rejected },
    { name: claimTexts.resolved, value: claimKeys.resolved }
];
