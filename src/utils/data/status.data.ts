import { Category } from '../../types/category';
import { statusKeys, statusTexts } from '../keys/status-keys';

export const statusData: Category[] = [
    { name: statusTexts.accepted, value: statusKeys.accepted },
    { name: statusTexts.cancelled, value: statusKeys.cancelled },
    { name: statusTexts.completed, value: statusKeys.completed },
    { name: statusTexts.conflicts, value: statusKeys.conflicts },
    { name: statusTexts.in_progress, value: statusKeys.in_progress },
    { name: statusTexts.pending, value: statusKeys.pending },
];
