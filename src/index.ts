import {challenge} from "business-whatsapp";

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        try {
            // Cloudflare
            let facebook = false;
            try {
                facebook = request.cf?.asOrganization === "Facebook";
            } catch (e) {
            }

            if (facebook && request.method === 'GET') {
                return challenge(env.META_VERIFY, request);
            } else if (request.method === 'OPTIONS') {
                return HTTP_OK();
            } else {

                if (facebook) {
                    await env.MQWABA.send(await request.json(), {
                        contentType: "json",
                    });
                } else {

                    // if (request.url.includes('sdfkjghwedfkjgh')) {
                    //
                    //     const nextId = await randomHEX()
                    //     await env.MQPOSTR2.put(nextId + ".txt", await request.text());
                    //     await env.MQPOST.send({
                    //             id: nextId,
                    //             url: request.url,
                    //         } as MQMessage,
                    //         {
                    //             contentType: "json",
                    //         });
                    //
                    // }
                }

                return HTTP_CREATED();
            }
        } catch (e) {
            console.error('FATAL', e, e.stack);
        }
        // XXX atack protection
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return HTTP_UNPROCESSABLE_ENTITY();
    },
    async queue(batch: MessageBatch<MQMessage>, env: Env): Promise<void> {
        for (const msg of batch.messages) {
            try {

                // if (msg.body.url.indexOf('.express/') != -1) {
                //     await env.MQEXPRESS.send(msg.body, {
                //         contentType: "json",
                //     });
                // } else {

            } catch (e) {
                console.error("queue", batch.queue, e, e.stack);

                try {
                    await env.MQPOSTR2.delete(msg.body.id + ".txt");
                } catch (e) {
                }
            } finally {
                msg.ack();
            }
        }
    },
};

const HTTP_OK = () => new Response('200 Ok', {status: 200});
const HTTP_CREATED = () => new Response('201 Created', {status: 201});
const HTTP_UNPROCESSABLE_ENTITY = () => new Response('422 Unprocessable Content', {status: 422});

async function randomHEX(size = 16) {

    return Array.from(
        new Uint8Array(
            await crypto.subtle.digest("sha-512",
                crypto.getRandomValues(new Uint8Array(size))
            ))).map(b => b.toString(16).padStart(2, "0"))
        .join("")

}
