export interface DockerComposeConfig {
    version: string;
    services: {
        [serviceName: string]: {
            build?: {
                context?: string;
                dockerfile?: string;
                args?: {
                    [key: string]: string;
                };
            };
            image?: string;
            runtime?: string;
            environment?: string[];
            ports?: string[];
            volumes?: string[];
            stdin_open?: boolean;
            tty?: boolean;
            [key: string]: any;
        };
    };
}
