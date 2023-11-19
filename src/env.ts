interface Env {
    MQPOSTDO: DurableObjectNamespace;
    MQPOST: Queue<any>;
    MQWABA: Queue<any>;
    MQPOSTR2: R2Bucket;

    META_VERIFY: string;

}
