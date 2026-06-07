import { sequence } from 'astro:middleware';
import { onRequest as appMiddleware } from './middleware/index';

export const onRequest = sequence(appMiddleware);
