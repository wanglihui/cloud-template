export class CustomerError extends Error {
    
    constructor(public code: number, public msg: string, public http_status: number = 400) {
        super(msg);
    }

    toJSON() {
        return {
            code: this.code,
            msg: this.msg,
        }
    }
}

export default class E {
    static INVALID_PARAM(params: string| string[]) {
        return new CustomerError(400, `参数${params}不合法`, 400);
    }
    static SYSTEM_ERROR() {
        return new CustomerError(500, '系统内部错误，请稍后重试', 500);
    }
    static PERMISSION_DENY(params: string|string[]) {
        return new CustomerError(403, `您没有权限访问${params},请联系管理员`, 403);
    }
    static NEED_LOGIN() {
        return new CustomerError(401, "您还没有登录", 401);
    }
    static CUSTOMER_ERROR(code: number, msg: string, httpCode?: number) {
        return new CustomerError(code, msg, httpCode);
    }
}