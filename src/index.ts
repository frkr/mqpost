import {challenge} from "business-whatsapp";

export {MQPOSTDO} from "./MQPOSTDO";

export default {
    async nextId(request: Request, env: Env, ctx: ExecutionContext): Promise<string> {
        const dao: DurableObjectStub = env.MQPOSTDO.get(env.MQPOSTDO.idFromName('MQPOSTDO'));
        return (await dao.fetch(request.url)).text();
    },
    //async scheduled(event, env, ctx)
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        try {
            if (request.method === 'GET') {
                return challenge(env.META_VERIFY, request);
            } else {
                const nextId = await this.nextId(request, env, ctx);
                await env.MQPOSTR2.put(nextId + ".txt", await request.text());
                await env.MQPOST.send(nextId, {
                    contentType: "text",
                });
                return HTTP_CREATED();
            }

        } catch (e) {
            console.error('FATAL', e, e.stack);
            return HTTP_UNPROCESSABLE_ENTITY();
        }
    },
    async queue(batch: MessageBatch<string>, env: Env): Promise<void> {
        for (const msg of batch.messages) {
            try {

                const content = await (await env.MQPOSTR2.get(msg.body + ".txt")).text();

                if (
                    content &&
                    content.indexOf("whatsapp_business_account") != -1
                ) {
                    await env.MQWABA.send(msg.body, {
                        contentType: "text",
                    });
                } else {
                    try {
                        await env.MQPOSTR2.delete(msg.body + ".txt");
                    } catch (e) {
                    }
                }
            } catch (e) {
                console.error("queue", e, e.stack);
                try {
                    await env.MQPOSTR2.delete(msg.body + ".txt");
                } catch (e) {
                }
            } finally {
                msg.ack();
            }
        }
    },
};

const HTTP_CREATED = () => new Response('201 Created', {status: 201});
const HTTP_UNPROCESSABLE_ENTITY = () => new Response('422 Unprocessable Content', {status: 422});
