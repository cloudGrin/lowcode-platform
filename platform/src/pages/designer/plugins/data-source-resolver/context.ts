import type { Middleware } from '../data-source-resolver/middlerware';
import TableFrame from './data-model/TableFrame';
import Param from './data-model/Param';

export class Context {
    private response: any;
    private request: any;
    tableFrame: TableFrame;
    param: Param;
    status: number;
    requestMiddleware: Middleware[];
    responseMiddleware: Middleware[];

    constructor(param: Param) {
        this.tableFrame = new TableFrame();
        this.param = param;
    }

    getResponse() {
        return this.response;
    }

    setResponse(response: any) {
        this.response = response;
    }

    getRequest() {
        return this.request;
    }
}