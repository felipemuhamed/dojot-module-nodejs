declare module '@dojot/dojot-module' {
    class Messenger {
        public constructor(name: string, config?: any);
        public emit(subject: string, tenant: string, event: string, data: any): void;
        public on(subject: string, event: string, callback: (tenant: string, data: any) => void, callbackId?: string): string;
        public createChannel(subject: string, mode?: "r" | "w" | "rw", isGlobal?: boolean): void;
        public publish(subject: string, tenant:string, message:any): void;
        public init(): Promise<void>;
        public generateDeviceCreateEventForActiveDevices(): void;
        public unregisterCallback(subject: string, event: string, callbackId: string): void
    }

    class Auth {
        public getManagementTokent(tenant: string): void;
        public getTenants(auth: string): Promise<any>;
    }

    class Ocsp {
        public sendRequest(url:string, mycert:string, cacert:string, cn:string, clientPath:string): Promise<any>;
    }

    interface Config {
        kafka: {
            consumer: any,
            producer: any,
        },
        databroker: {
            host: string,
        },
        auth: {
            host: string,
        },
        dojot: {
            managementService: string,
            subjects: {
                tenancy: string,
                devices: string,
                deviceData: string,
            }
        }
    }

    class KafkaProducer {
        constructor(producerConfig: any);
        connect(): Promise<void>;
        produce(topic: string, message: any, key?: string, partition?: number): Promise<any>;
        disconnect(): Promise<any>;
    }
    
    class KafkaConsumer {
        constructor(consumerConfig: any);
        connect(): void;
        subscribe(topic: string): void;
        consume(maxMessages?: number): Promise<any>;
        // onMessageListener(callback: (data: any) => void): void;
        commit(): void;
        disconnect(): Promise<any>;
    }
}
