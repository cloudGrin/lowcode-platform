import type { Context } from '../../../../context';

function filterColumnsMiddleware() {
    return async function filterColumns(ctx: Context, next: () => void) {

      await next();
    };
}