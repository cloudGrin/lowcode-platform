import type { Context } from '../../../../context';

export function filterRatioColumnsMiddleware(config) {
    return async function filterRatioColumns(ctx: Context, next: () => void) {
      ctx.tableFrame.filterColumn();

      await next();
    };
}