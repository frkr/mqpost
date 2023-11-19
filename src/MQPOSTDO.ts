export class MQPOSTDO {
    state: DurableObjectState;

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
    }

    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        let count: number = await this.state.storage.get('MQPOSTDO');
        if (!count) {
            count = 0;
        }
        count = count + 1;
        if (count > 100000) {
            count = 1;
        }

        await this.state.storage.put('MQPOSTDO', count);

        return new Response(count + "", {status: 200});
    }
}
