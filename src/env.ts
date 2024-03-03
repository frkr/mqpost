interface Env {

    MQPOST: Queue<MQMessage>;
    MQEMAIL: Queue<MQMessage>;
    MQEXPRESS: Queue<MQMessage>;
    MQWABA: Queue<any>;
    MQPOSTR2: R2Bucket;

    META_VERIFY: string;

}

interface MQMessage {
    id: string;
    url: string;
}
