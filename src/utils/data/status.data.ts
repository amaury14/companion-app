import { Category } from '../../types/category';
import { statusKeys } from '../keys/status-keys';

export const statusData: Category[] = [
    { name: 'Completado', value: statusKeys.completed },
    { name: 'En Conflicto', value: statusKeys.conflicts },
    { name: 'Pendiente', value: statusKeys.pending },
    { name: 'Iniciado', value: statusKeys.started },
];
